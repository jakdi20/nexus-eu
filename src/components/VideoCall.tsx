import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';

type CallState = 
  | 'initializing'
  | 'calling'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'failed'
  | 'ended';

interface VideoCallProps {
  roomId: string;
  myCompanyId: string;
  partnerCompanyId: string;
  isInitiator: boolean;
  onClose: () => void;
}

export default function VideoCall({ roomId, myCompanyId, partnerCompanyId, isInitiator, onClose }: VideoCallProps) {
  const { toast } = useToast();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callState, setCallState] = useState<CallState>('initializing');
  const [signalingReady, setSignalingReady] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null); // Ref for immediate access
  const offerRetryCount = useRef(0);
  const isReadyRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let initStarted = false;
    
    const init = async () => {
      if (!mounted || initStarted) return;
      initStarted = true;
      
      console.log('Initializing video call...');
      await initializeMedia();
      if (mounted) {
        setupSignaling();
      }
    };
    
    init();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [roomId]);

  // Automatic connection effect - only trigger once when ready
  useEffect(() => {
    if (!localStream || !signalingReady || isReadyRef.current) return;
    
    isReadyRef.current = true;

    const autoConnect = async () => {
      if (isInitiator) {
        console.log('Initiator: Starting call...');
        setCallState('calling');
        await startCall();
      } else {
        console.log('Callee: Waiting for offer...');
        setCallState('ringing');
      }
    };

    const timer = setTimeout(autoConnect, 1000);
    return () => clearTimeout(timer);
  }, [localStream, signalingReady, isInitiator]);

  const initializeMedia = async () => {
    try {
      console.log('Requesting media access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
      });
      
      console.log('Media access granted, tracks:', stream.getTracks().map(t => `${t.kind}: ${t.label}`));
      localStreamRef.current = stream; // Set ref immediately
      setLocalStream(stream); // Set state for UI updates
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: 'Fehler',
        description: 'Kamera oder Mikrofon konnte nicht zugegriffen werden',
        variant: 'destructive',
      });
    }
  };

  // Keep local video element in sync with stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Monitor session status for call ending (database fallback)
  useEffect(() => {
    const channel = supabase
      .channel(`video-session-status-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'video_call_sessions',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const session = payload.new as any;
          if (session?.status === 'ended') {
            console.log('Session ended via DB update');
            toast({
              title: 'Anruf beendet',
              description: 'Der Anruf wurde beendet',
            });
            cleanup();
            onClose();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, onClose, toast]);
  const setupSignaling = () => {
    console.log('Setting up signaling channel for room:', roomId);
    setSignalingReady(false);
    
    const channel = supabase
      .channel(`video-call-${roomId}`, {
        config: {
          broadcast: { self: false }
        }
      })
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        console.log('Received offer from:', payload.from);
        if (payload.from !== myCompanyId && payload.to === myCompanyId) {
          await handleOffer(payload.offer, payload.from);
        }
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        console.log('Received answer from:', payload.from);
        if (payload.from !== myCompanyId && payload.to === myCompanyId) {
          await handleAnswer(payload.answer);
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        console.log('Received ICE candidate from:', payload.from);
        if (payload.from !== myCompanyId && payload.to === myCompanyId) {
          await handleIceCandidate(payload.candidate);
        }
      })
      .on('broadcast', { event: 'callee-ready' }, async ({ payload }) => {
        console.log('Received callee-ready from:', payload.from);
        if (!isInitiator) return;
        if (payload.to !== myCompanyId) return;

        console.log('Callee is ready, starting offer');
        // Only start if we don't have a peer connection yet
        if (!peerConnectionRef.current) {
          await startCall();
        }
      })
      .on('broadcast', { event: 'call-ended' }, async ({ payload }) => {
        console.log('Received call-ended from:', payload.from);
        if (payload.from !== myCompanyId && payload.roomId === roomId) {
          toast({
            title: 'Anruf beendet',
            description: 'Der Partner hat den Anruf beendet',
          });
          cleanup();
          onClose();
        }
      })
      .subscribe((status) => {
        console.log('Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to channel');
          setSignalingReady(true);

          // Notify initiator that callee is ready once signaling is up
          if (!isInitiator) {
            console.log('Callee: signaling ready, sending callee-ready');
            channel.send({
              type: 'broadcast',
              event: 'callee-ready',
              payload: {
                from: myCompanyId,
                to: partnerCompanyId,
                roomId,
              },
            });
          }
        }
      });

    channelRef.current = channel;
  };
  const createPeerConnection = useCallback((streamToUse: MediaStream) => {
    console.log('Creating peer connection with stream:', streamToUse.id);
    
    // Check if peer connection already exists
    if (peerConnectionRef.current) {
      console.log('Peer connection already exists, closing old one first');
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        channelRef.current?.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { 
            candidate: event.candidate.toJSON(),
            from: myCompanyId,
            to: partnerCompanyId,
            roomId 
          },
        });
      } else {
        console.log('All ICE candidates have been sent');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setCallState('connected');
        offerRetryCount.current = 0; // Reset retry count on success
        toast({
          title: 'Verbunden ✓',
          description: 'Videoanruf aktiv',
        });
      } else if (pc.iceConnectionState === 'checking') {
        setCallState('connecting');
      } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        setCallState('failed');
        toast({
          title: 'Verbindung fehlgeschlagen',
          description: 'Die Verbindung konnte nicht hergestellt werden',
          variant: 'destructive',
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      const stream = event.streams[0];
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
    };

    // Add tracks from the provided stream
    console.log('Adding local tracks to peer connection:', streamToUse.getTracks().map(t => `${t.kind}: ${t.enabled}`));
    streamToUse.getTracks().forEach((track) => {
      const sender = pc.addTrack(track, streamToUse);
      console.log(`Track added: ${track.kind}, enabled: ${track.enabled}, sender: ${sender.track?.kind}`);
    });

    peerConnectionRef.current = pc;
    return pc;
  }, [myCompanyId, partnerCompanyId, roomId, toast]);

  const startCall = async () => {
    const stream = localStreamRef.current;
    
    if (!stream) {
      console.error('No local stream available in ref');
      toast({
        title: 'Fehler',
        description: 'Lokaler Stream nicht verfügbar',
        variant: 'destructive',
      });
      return;
    }

    // Prevent duplicate peer connections
    if (peerConnectionRef.current) {
      console.log('Peer connection already exists, closing it first');
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    console.log('Starting call with stream:', stream.id, 'tracks:', stream.getTracks().length);
    const pc = createPeerConnection(stream);

    try {
      console.log('Creating offer...');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      console.log('Setting local description...');
      await pc.setLocalDescription(offer);

      console.log('Sending offer...');
      await channelRef.current?.send({
        type: 'broadcast',
        event: 'offer',
        payload: { 
          offer: pc.localDescription?.toJSON(),
          from: myCompanyId,
          to: partnerCompanyId,
          roomId 
        },
      });

      // Update session status
      await supabase
        .from('video_call_sessions')
        .update({ status: 'calling', started_at: new Date().toISOString() })
        .eq('room_id', roomId);
        
      console.log('Offer sent successfully');
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: 'Fehler',
        description: 'Anruf konnte nicht gestartet werden',
        variant: 'destructive',
      });
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
    console.log('Handling offer from:', from);
    setCallState('connecting');
    
    const stream = localStreamRef.current;
    if (!stream) {
      console.error('No local stream available to handle offer');
      return;
    }
    
    // Prevent duplicate peer connections
    if (peerConnectionRef.current) {
      console.log('Peer connection already exists while handling offer, closing old one');
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    const pc = createPeerConnection(stream);

    try {
      console.log('Setting remote description (offer)...');
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Process queued ICE candidates
      console.log('Processing queued ICE candidates:', iceCandidatesQueue.current.length);
      for (const candidate of iceCandidatesQueue.current) {
        await pc.addIceCandidate(candidate);
      }
      iceCandidatesQueue.current = [];
      
      console.log('Creating answer...');
      const answer = await pc.createAnswer();
      
      console.log('Setting local description (answer)...');
      await pc.setLocalDescription(answer);

      console.log('Sending answer...');
      await channelRef.current?.send({
        type: 'broadcast',
        event: 'answer',
        payload: { 
          answer: pc.localDescription?.toJSON(),
          from: myCompanyId,
          to: from,
          roomId 
        },
      });

      console.log('Answer sent successfully');
    } catch (error) {
      console.error('Error handling offer:', error);
      setCallState('failed');
      toast({
        title: 'Fehler',
        description: 'Fehler beim Verarbeiten des Angebots',
        variant: 'destructive',
      });
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current;
    
    if (!pc) {
      console.error('No peer connection available');
      return;
    }

    try {
      console.log('Setting remote description (answer)...');
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      
      // Process queued ICE candidates
      console.log('Processing queued ICE candidates:', iceCandidatesQueue.current.length);
      for (const candidate of iceCandidatesQueue.current) {
        await pc.addIceCandidate(candidate);
      }
      iceCandidatesQueue.current = [];
      
      console.log('Answer processed successfully');
    } catch (error) {
      console.error('Error handling answer:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Verarbeiten der Antwort',
        variant: 'destructive',
      });
    }
  };

  const handleIceCandidate = async (candidateInit: RTCIceCandidateInit) => {
    const pc = peerConnectionRef.current;
    
    if (!pc) {
      console.log('No peer connection yet, queueing ICE candidate');
      iceCandidatesQueue.current.push(new RTCIceCandidate(candidateInit));
      return;
    }

    if (!pc.remoteDescription) {
      console.log('No remote description yet, queueing ICE candidate');
      iceCandidatesQueue.current.push(new RTCIceCandidate(candidateInit));
      return;
    }

    try {
      console.log('Adding ICE candidate');
      await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
      console.log('ICE candidate added successfully');
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    const stream = localStreamRef.current;
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = async () => {
    // Send broadcast event first for immediate notification
    await channelRef.current?.send({
      type: 'broadcast',
      event: 'call-ended',
      payload: { 
        from: myCompanyId,
        to: partnerCompanyId,
        roomId 
      },
    });

    // Update database
    await supabase
      .from('video_call_sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('room_id', roomId);

    cleanup();
    onClose();
  };

  const cleanup = () => {
    console.log('Cleaning up...');
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      localStreamRef.current = null;
    }
    
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    // Reset retry counter
    offerRetryCount.current = 0;
    isReadyRef.current = false;
  };

  const getStatusText = () => {
    switch (callState) {
      case 'initializing':
        return 'Wird initialisiert...';
      case 'calling':
        return 'Anruf läuft...';
      case 'ringing':
        return 'Eingehender Anruf';
      case 'connecting':
        return 'Verbindung wird hergestellt...';
      case 'connected':
        return '✓ Verbunden';
      case 'failed':
        return '✗ Verbindung fehlgeschlagen';
      case 'ended':
        return 'Beendet';
      default:
        return '';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-lg md:text-xl font-semibold">Videoanruf</h2>
            <p className="text-xs md:text-sm text-white/70 mt-1">{getStatusText()}</p>
          </div>
          <Button 
            onClick={endCall} 
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white rounded-full h-10 md:h-12 px-4 md:px-6"
          >
            <PhoneOff className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            <span className="hidden md:inline">Auflegen</span>
            <span className="md:hidden">Ende</span>
          </Button>
        </div>
      </div>

      {/* Video Area - Full Screen */}
      <div className="relative w-full h-full">
        {/* Remote Video (Full Screen) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Placeholder when no remote stream */}
        {!remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center animate-pulse mb-6">
              <Video className="h-16 w-16 text-white" />
            </div>
            <div className="text-center px-4">
              <p className="text-2xl font-semibold text-white mb-2">
                {callState === 'calling' && 'Warte auf Antwort...'}
                {callState === 'ringing' && 'Eingehender Anruf'}
                {callState === 'connecting' && 'Verbindung wird hergestellt...'}
                {callState === 'initializing' && 'Wird initialisiert...'}
              </p>
              <p className="text-sm text-white/60">
                {callState === 'calling' && 'Der Partner wurde benachrichtigt'}
                {callState === 'connecting' && 'Bitte warten...'}
              </p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {localStream && (
          <div className="absolute top-20 md:top-24 right-3 md:right-6 w-32 md:w-64 aspect-video bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-2 md:border-4 border-white/30 z-10">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 md:top-2 left-1 md:left-2 text-white text-xs md:text-sm font-medium bg-black/70 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
              Sie
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <VideoOff className="h-6 w-6 md:h-12 md:w-12 text-white/50" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 to-transparent p-4 md:p-8">
        <div className="flex items-center justify-center gap-3 md:gap-4">
          <Button
            onClick={toggleAudio}
            variant="secondary"
            size="lg"
            className={`rounded-full h-12 w-12 md:h-16 md:w-16 ${!isAudioEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'}`}
          >
            {isAudioEnabled ? (
              <Mic className="h-5 w-5 md:h-7 md:w-7 text-white" />
            ) : (
              <MicOff className="h-5 w-5 md:h-7 md:w-7 text-white" />
            )}
          </Button>
          
          <Button
            onClick={toggleVideo}
            variant="secondary"
            size="lg"
            className={`rounded-full h-12 w-12 md:h-16 md:w-16 ${!isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'}`}
          >
            {isVideoEnabled ? (
              <Video className="h-5 w-5 md:h-7 md:w-7 text-white" />
            ) : (
              <VideoOff className="h-5 w-5 md:h-7 md:w-7 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

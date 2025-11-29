import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface VideoCallProps {
  roomId: string;
  myCompanyId: string;
  partnerCompanyId: string;
  onClose: () => void;
}

export default function VideoCall({ roomId, myCompanyId, partnerCompanyId, onClose }: VideoCallProps) {
  const { toast } = useToast();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('new');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (mounted) {
        await initializeMedia();
        setupSignaling();
      }
    };
    
    init();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [roomId]);

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
      
      console.log('Media access granted');
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: 'Fehler',
        description: 'Kamera oder Mikrofon konnte nicht zugegriffen werden',
        variant: 'destructive',
      });
    }
  };

  const setupSignaling = () => {
    console.log('Setting up signaling channel for room:', roomId);
    
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
      .subscribe((status) => {
        console.log('Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to channel');
        }
      });

    channelRef.current = channel;
  };

  const createPeerConnection = useCallback(() => {
    console.log('Creating peer connection...');
    
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
      setConnectionState(pc.iceConnectionState);
      
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setIsConnected(true);
        toast({
          title: 'Verbunden',
          description: 'Videoanruf wurde erfolgreich verbunden',
        });
      } else if (pc.iceConnectionState === 'failed') {
        toast({
          title: 'Verbindung fehlgeschlagen',
          description: 'Die Verbindung konnte nicht hergestellt werden',
          variant: 'destructive',
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track');
      const stream = event.streams[0];
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
    };

    if (localStream) {
      console.log('Adding local tracks to peer connection');
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, [localStream, myCompanyId, roomId, toast]);

  const startCall = async () => {
    if (!localStream) {
      toast({
        title: 'Fehler',
        description: 'Lokaler Stream nicht verfügbar',
        variant: 'destructive',
      });
      return;
    }

    console.log('Starting call...');
    const pc = createPeerConnection();

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
        
      console.log('Call started successfully');
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
    
    const pc = createPeerConnection();

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
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const endCall = async () => {
    await supabase
      .from('video_call_sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('room_id', roomId);

    cleanup();
    onClose();
  };

  const cleanup = () => {
    console.log('Cleaning up...');
    
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        console.log('Stopped track:', track.kind);
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
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Videoanruf</h2>
          {connectionState && connectionState !== 'new' && (
            <p className="text-sm text-muted-foreground">
              Status: {connectionState === 'connected' ? '✓ Verbunden' : connectionState}
            </p>
          )}
        </div>
        <Button onClick={endCall} variant="destructive" size="sm">
          <PhoneOff className="h-4 w-4 mr-2" />
          Beenden
        </Button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
        
        {!remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
            <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
              <Video className="h-10 w-10" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">
                {isConnected ? 'Verbindung wird hergestellt...' : 'Warte auf Partner...'}
              </p>
              <p className="text-sm text-white/70 mt-1">
                {!isConnected && 'Der Partner muss den Anruf annehmen'}
              </p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-4 right-4 w-48 aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 left-1 text-white text-xs bg-black/50 px-2 py-0.5 rounded">
            Sie
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t flex items-center justify-center gap-3">
        {!isConnected && (
          <Button 
            onClick={startCall} 
            size="lg" 
            className="gap-2"
            disabled={!localStream}
          >
            <Phone className="h-5 w-5" />
            Verbinden
          </Button>
        )}
        
        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? 'secondary' : 'destructive'}
          size="lg"
          disabled={!localStream}
          className="rounded-full h-14 w-14"
        >
          {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>
        
        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? 'secondary' : 'destructive'}
          size="lg"
          disabled={!localStream}
          className="rounded-full h-14 w-14"
        >
          {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  );
}

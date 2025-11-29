import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          broadcast: { self: true }
        }
      })
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        console.log('Received offer from:', payload.from);
        if (payload.from !== myCompanyId) {
          await handleOffer(payload.offer, payload.from);
        }
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        console.log('Received answer from:', payload.from);
        if (payload.from !== myCompanyId) {
          await handleAnswer(payload.answer);
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        console.log('Received ICE candidate from:', payload.from);
        if (payload.from !== myCompanyId) {
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Videoanruf</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local Video */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                Sie
              </div>
            </div>

            {/* Remote Video */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  {isConnected ? 'Verbindung wird hergestellt...' : 'Warte auf Partner...'}
                </div>
              )}
            </div>
          </div>

            {/* Connection Status */}
            {connectionState && connectionState !== 'new' && (
              <div className="mb-4 p-2 text-center rounded bg-muted">
                <p className="text-sm">
                  Verbindungsstatus: <span className="font-semibold">{connectionState}</span>
                  {isConnected && ' ✓'}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button onClick={startCall} size="lg" className="gap-2">
                <Phone className="h-5 w-5" />
                Anruf starten
              </Button>
              <Button
                onClick={toggleVideo}
                variant={isVideoEnabled ? 'default' : 'destructive'}
                size="icon"
                disabled={!localStream}
              >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button
                onClick={toggleAudio}
                variant={isAudioEnabled ? 'default' : 'destructive'}
                size="icon"
                disabled={!localStream}
              >
                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button onClick={endCall} variant="destructive" size="lg" className="gap-2">
                <PhoneOff className="h-5 w-5" />
                Auflegen
              </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone } from 'lucide-react';

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
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    initializeMedia();
    setupSignaling();

    return () => {
      cleanup();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
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
    const channel = supabase
      .channel(`video-call:${roomId}`)
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        await handleOffer(payload.offer, payload.from);
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        await handleAnswer(payload.answer);
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        await handleIceCandidate(payload.candidate);
      })
      .subscribe();

    channelRef.current = channel;
  };

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate, roomId },
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    setPeerConnection(pc);
    return pc;
  };

  const startCall = async () => {
    setIsCalling(true);
    const pc = createPeerConnection();

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await channelRef.current?.send({
        type: 'broadcast',
        event: 'offer',
        payload: { offer, from: myCompanyId, roomId },
      });

      // Update session status
      await supabase
        .from('video_call_sessions')
        .update({ status: 'calling', started_at: new Date().toISOString() })
        .eq('room_id', roomId);
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
    if (from === myCompanyId) return;

    const pc = createPeerConnection();

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await channelRef.current?.send({
        type: 'broadcast',
        event: 'answer',
        payload: { answer, roomId },
      });

      setIsCalling(true);
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
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
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
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
                  {isCalling ? 'Verbindung wird hergestellt...' : 'Warte auf Partner...'}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isCalling ? (
              <Button onClick={startCall} size="lg" className="gap-2">
                <Phone className="h-5 w-5" />
                Anruf starten
              </Button>
            ) : (
              <>
                <Button
                  onClick={toggleVideo}
                  variant={isVideoEnabled ? 'default' : 'destructive'}
                  size="icon"
                >
                  {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
                <Button
                  onClick={toggleAudio}
                  variant={isAudioEnabled ? 'default' : 'destructive'}
                  size="icon"
                >
                  {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                <Button onClick={endCall} variant="destructive" size="lg" className="gap-2">
                  <PhoneOff className="h-5 w-5" />
                  Auflegen
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

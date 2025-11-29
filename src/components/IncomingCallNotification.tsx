import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, X, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IncomingCall {
  roomId: string;
  fromCompanyId: string;
  fromCompanyName: string;
}

interface IncomingCallNotificationProps {
  myCompanyId: string;
  onAcceptCall: (roomId: string, fromCompanyId: string) => void;
}

export default function IncomingCallNotification({ 
  myCompanyId, 
  onAcceptCall 
}: IncomingCallNotificationProps) {
  const { toast } = useToast();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create ringtone audio element with a better ringtone
    const audio = new Audio();
    // Using a pleasant ringtone sound (extended)
    audio.src = 'data:audio/wav;base64,UklGRkQFAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSAFAAB/goaIioqLi4qKiYiFg39+fHt6enp7fH1+f4GDhYeIiImIh4WEgoB+fXt6eXl5eXp7fX5/gYOFh4iJiYmIh4WEgn9+fHp5eHh4eHl6fH5/gYOFh4iJioqJiYiGhIOBf319fH19fn+BgoSGh4mJiYmIh4WDgX9+fXx8fHx9fn+BgoSFh4iIiIiHhoSCgH58e3p5eHh4eHl7fH5/gYOFhoiIiYmJiIeGhIJ/fXt6eXl5eXp7fX5/gYOFh4iJiomJiIeGhIKAfnx7enl5eXl6e31+gIKEhoeJiYqJiYiHhYOBfn18e3p6enp7fH1/gIKEhYeIiYmJiIeFg4F/fXx7enp6ent8fn+BgoSGh4iJiYmIh4WDgX9+fXx8fH1+f4GChIWHiImJiYiHhYOBf318e3p5eXl5ent9fn+BgoSGh4iJiYmIh4WEgoB+fXt6eXl5eXp7fH5/gYKEhoeIiYmJiIeFhIKAfnx7enl5eXl6e31+gIGDhYeIiImJiIeFhIKAfn18e3p6enp7fH1/gIKEhoeIiYmJiIeFg4F/fXx7enl5eXl6e31+gIGDhYaIiImJiIeFg4F/fXx7enp6ent8fn+BgoSFh4iJiYmIh4WDgX99fHt6enp6e3x+f4GChIaHiImJiYiHhYOBf318e3p6enp7fH5/gYKEhYeIiYmJiIeGhIKAfnx7enl5eXl6e31+gIGDhYeIiImJiIeFhIKAfnx7enl5eXl6e31+gIGDhYaIiImJiIeFg4F/fXx7enl5eXl6e31+gIGDhYaHiImJiYiHhYOBf318e3p5eXl5ent9fn+BgoSGh4iJiYmIh4WDgX99fHt6enp6e3x+f4GChIWHiImJiYiHhYOBf318e3p6enp7fH5/gYKEhYeIiYmJiIeGhIKAfn18e3p6enp7fX5/gYKEhYeIiImJiIeGhIKAfn18e3p6enp7fH5/gYKEhYeIiImJiIeGhIKAfnx7enl5eXl6e31+gIGDhYaIiImJiIeFhIKAfnx7enl5eXl6e31+gIGDhYaIiImJiIeFhIJ/fXt6eHd3d3d4enx9f4GDhoeJioqKiYiGhIKAfXt5d3Z2dnd4en1+gIKEhoeJioqKiYeGhIJ/fXt5d3Z2dnd4en1+gIKEhoeJioqKiYeGhIJ/fXt5d3Z2dnd4en1+gIKEhoeJioqKiYeGhIJ/fXt5d3Z2dnd4en1+gIKEhoeJioqKiYeGhIJ/fXt5d3Z2dnd4en1+gIKEhoeJioqKiYeGhIJ/fXt5d3Z2dnd4en1+gIKEhoeJioqKiYeGhIJ/';
    audio.loop = true;
    audio.volume = 0.6;
    setAudioElement(audio);

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (!myCompanyId) return;

    const channel = supabase
      .channel('global-video-calls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_call_sessions',
        },
        async (payload) => {
          const session = payload.new as any;
          
          if (!session) return;

          const isCallee = session.company_id_2 === myCompanyId;
          const isPendingOrCalling = session.status === 'pending' || session.status === 'calling';

          if (isCallee && isPendingOrCalling && !incomingCall) {
            // Fetch company name
            const { data: companyData } = await supabase
              .from('company_profiles')
              .select('company_name')
              .eq('id', session.company_id_1)
              .single();

            const newIncomingCall = {
              roomId: session.room_id,
              fromCompanyId: session.company_id_1,
              fromCompanyName: companyData?.company_name || 'Unbekannte Firma',
            };

            setIncomingCall(newIncomingCall);

            // Play ringtone
            if (audioElement) {
              audioElement.play().catch(console.error);
            }

            // Show toast notification
            toast({
              title: 'Eingehender Videoanruf',
              description: `${newIncomingCall.fromCompanyName} ruft an`,
              duration: 10000,
            });
          }

          // If call ended or accepted by someone else, clear notification
          if (session.status === 'ended' && incomingCall?.roomId === session.room_id) {
            handleDecline();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myCompanyId, audioElement, incomingCall]);

  // Auto-timeout after 30 seconds
  useEffect(() => {
    if (!incomingCall) return;

    const timeout = setTimeout(() => {
      console.log('Call timeout - auto declining');
      handleDecline();
      toast({
        title: 'Anruf verpasst',
        description: `Anruf von ${incomingCall.fromCompanyName} wurde nicht angenommen`,
        variant: 'destructive',
      });
    }, 30000);

    return () => clearTimeout(timeout);
  }, [incomingCall]);

  const handleAccept = () => {
    if (!incomingCall) return;
    
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    onAcceptCall(incomingCall.roomId, incomingCall.fromCompanyId);
    setIncomingCall(null);
  };

  const handleDecline = async () => {
    if (!incomingCall) return;

    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    await supabase
      .from('video_call_sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('room_id', incomingCall.roomId);

    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-300">
      <Card className="w-96 shadow-2xl border-2 border-primary backdrop-blur-sm bg-background/95">
        <CardContent className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center animate-pulse">
                <Video className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Eingehender Videoanruf</p>
              <p className="text-base text-muted-foreground font-medium">{incomingCall.fromCompanyName}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDecline}
              className="h-9 w-9 hover:bg-destructive/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1 h-12 border-2"
              size="lg"
            >
              <X className="h-5 w-5 mr-2" />
              Ablehnen
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Phone className="h-5 w-5 mr-2" />
              Annehmen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
    // Create ringtone audio element
    const audio = new Audio();
    // Using a web-based ringtone sound
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRA0PVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2j9Xzx3YrBSh7yvLckTsIF2e87+mjUhILSKLh8bllHAU2j9Xzx3YrBSh7yvLckTsIF2e87+mjUhILSKLh8bllHAU2j9Xzx3YrBSh7yvLckTsIF2e87+mjUhILSKLh8bllHAU2j9Xzx3YrBSh7yvLckTsIF2e87+mjUhILSKLh8bllHAU2j9Xzx3YrBSh7yvLckTsIF2e87+mjUhILSKLh8bllHAU2j9Xzx3YrBSh7yvLckTsIF2e87+mjUhILSKLh8Q==';
    audio.loop = true;
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
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
      <Card className="w-80 shadow-2xl border-2 border-primary">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Eingehender Videoanruf</p>
              <p className="text-sm text-muted-foreground">{incomingCall.fromCompanyName}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDecline}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <X className="h-4 w-4 mr-2" />
              Ablehnen
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Phone className="h-4 w-4 mr-2" />
              Annehmen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

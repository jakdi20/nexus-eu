import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import IncomingCallNotification from './IncomingCallNotification';
import VideoCall from './VideoCall';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function GlobalVideoCallManager() {
  const navigate = useNavigate();
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<{
    roomId: string;
    partnerCompanyId: string;
    isInitiator: boolean;
  } | null>(null);

  useEffect(() => {
    loadMyCompany();
  }, []);

  const loadMyCompany = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setMyCompanyId(data.id);
    }
  };

  const handleAcceptCall = (roomId: string, fromCompanyId: string) => {
    setActiveCall({
      roomId,
      partnerCompanyId: fromCompanyId,
      isInitiator: false,
    });
  };

  const handleCloseCall = () => {
    setActiveCall(null);
  };

  if (!myCompanyId) return null;

  return (
    <>
      <IncomingCallNotification
        myCompanyId={myCompanyId}
        onAcceptCall={handleAcceptCall}
      />

      {activeCall && (
        <Dialog open={!!activeCall} onOpenChange={handleCloseCall}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-hidden">
            <DialogTitle className="sr-only">Videoanruf</DialogTitle>
            <DialogDescription className="sr-only">
              Echtzeit-Videoanruf mit Ihrem Partnerunternehmen
            </DialogDescription>
            <VideoCall
              roomId={activeCall.roomId}
              myCompanyId={myCompanyId}
              partnerCompanyId={activeCall.partnerCompanyId}
              isInitiator={activeCall.isInitiator}
              onClose={handleCloseCall}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

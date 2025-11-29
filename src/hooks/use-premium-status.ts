import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePremiumStatus = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('company_profiles')
        .select('is_premium')
        .eq('user_id', session.user.id)
        .maybeSingle();

      setIsPremium(profile?.is_premium || false);
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  return { isPremium, loading, refresh: checkPremiumStatus };
};

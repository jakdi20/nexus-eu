import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null);

  useEffect(() => {
    loadMyCompanyAndUnread();
  }, []);

  useEffect(() => {
    if (!myCompanyId) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `to_company_id=eq.${myCompanyId}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `to_company_id=eq.${myCompanyId}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myCompanyId]);

  const loadMyCompanyAndUnread = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setMyCompanyId(data.id);
      await loadUnreadCount(data.id);
    }
  };

  const loadUnreadCount = async (companyId?: string) => {
    const targetId = companyId || myCompanyId;
    if (!targetId) return;

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('to_company_id', targetId)
      .eq('read', false);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  const markAsRead = async (fromCompanyId: string) => {
    if (!myCompanyId) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('from_company_id', fromCompanyId)
      .eq('to_company_id', myCompanyId)
      .eq('read', false);

    loadUnreadCount();
  };

  return { unreadCount, markAsRead, refreshUnreadCount: () => loadUnreadCount() };
};

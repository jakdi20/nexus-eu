import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Send, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  from_company_id: string;
  to_company_id: string;
  content: string;
  created_at: string;
  from_company?: { company_name: string };
  to_company?: { company_name: string };
}

interface Conversation {
  company_id: string;
  company_name: string;
  last_message: string;
  last_message_time: string;
}

export default function Messages() {
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get('partnerId');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(partnerId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMyCompany();
  }, []);

  useEffect(() => {
    if (myCompanyId) {
      loadConversations();
      if (selectedConversation) {
        loadMessages(selectedConversation);
      }
    }
  }, [myCompanyId, selectedConversation]);

  useEffect(() => {
    if (!myCompanyId || !selectedConversation) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadMessages(selectedConversation);
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myCompanyId, selectedConversation]);

  const loadMyCompany = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Firmenprofil konnte nicht geladen werden',
        variant: 'destructive',
      });
      return;
    }

    setMyCompanyId(data.id);
  };

  const loadConversations = async () => {
    if (!myCompanyId) return;

    const { data: sentMessages } = await supabase
      .from('messages')
      .select('to_company_id, to_company:company_profiles!messages_to_company_id_fkey(company_name), content, created_at')
      .eq('from_company_id', myCompanyId)
      .order('created_at', { ascending: false });

    const { data: receivedMessages } = await supabase
      .from('messages')
      .select('from_company_id, from_company:company_profiles!messages_from_company_id_fkey(company_name), content, created_at')
      .eq('to_company_id', myCompanyId)
      .order('created_at', { ascending: false });

    const conversationsMap = new Map<string, Conversation>();

    sentMessages?.forEach((msg: any) => {
      const key = msg.to_company_id;
      if (!conversationsMap.has(key) || new Date(msg.created_at) > new Date(conversationsMap.get(key)!.last_message_time)) {
        conversationsMap.set(key, {
          company_id: msg.to_company_id,
          company_name: msg.to_company?.company_name || 'Unbekannt',
          last_message: msg.content,
          last_message_time: msg.created_at,
        });
      }
    });

    receivedMessages?.forEach((msg: any) => {
      const key = msg.from_company_id;
      if (!conversationsMap.has(key) || new Date(msg.created_at) > new Date(conversationsMap.get(key)!.last_message_time)) {
        conversationsMap.set(key, {
          company_id: msg.from_company_id,
          company_name: msg.from_company?.company_name || 'Unbekannt',
          last_message: msg.content,
          last_message_time: msg.created_at,
        });
      }
    });

    const sortedConversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
    );

    setConversations(sortedConversations);
    setLoading(false);
  };

  const loadMessages = async (companyId: string) => {
    if (!myCompanyId) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        from_company:company_profiles!messages_from_company_id_fkey(company_name),
        to_company:company_profiles!messages_to_company_id_fkey(company_name)
      `)
      .or(`and(from_company_id.eq.${myCompanyId},to_company_id.eq.${companyId}),and(from_company_id.eq.${companyId},to_company_id.eq.${myCompanyId})`)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Nachrichten konnten nicht geladen werden',
        variant: 'destructive',
      });
      return;
    }

    setMessages(data);

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('from_company_id', companyId)
      .eq('to_company_id', myCompanyId)
      .eq('read', false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !myCompanyId || !selectedConversation) return;

    setSending(true);
    const { error } = await supabase.from('messages').insert({
      from_company_id: myCompanyId,
      to_company_id: selectedConversation,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Nachricht konnte nicht gesendet werden',
        variant: 'destructive',
      });
      setSending(false);
      return;
    }

    setNewMessage('');
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Nachrichten</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Konversationen</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {conversations.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">Keine Konversationen</p>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.company_id}
                      className={`p-4 cursor-pointer hover:bg-accent border-b ${
                        selectedConversation === conv.company_id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedConversation(conv.company_id)}
                    >
                      <p className="font-semibold">{conv.company_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="md:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <CardTitle>
                    {conversations.find((c) => c.company_id === selectedConversation)?.company_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-[calc(100vh-350px)]">
                  <ScrollArea className="flex-1 pr-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-4 flex ${
                          msg.from_company_id === myCompanyId ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.from_company_id === myCompanyId
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.created_at).toLocaleString('de-DE')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>

                  <div className="flex gap-2 mt-4">
                    <Input
                      placeholder="Nachricht eingeben..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Wähle eine Konversation</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

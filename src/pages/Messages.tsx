import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft, Paperclip, Video, Download, FileIcon } from 'lucide-react';
import VideoCall from '@/components/VideoCall';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Message {
  id: string;
  from_company_id: string;
  to_company_id: string;
  content: string;
  created_at: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
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
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeCall, setActiveCall] = useState<{
    roomId: string;
    partnerCompanyId: string;
    isInitiator: boolean;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!myCompanyId || !selectedConversation) return;

    const channel = supabase
      .channel(`chat-${myCompanyId}-${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('New message received:', payload);
          const newMsg = payload.new as any;
          
          // Filter in JavaScript - only process relevant messages
          const isRelevant = 
            (newMsg.from_company_id === myCompanyId && newMsg.to_company_id === selectedConversation) ||
            (newMsg.from_company_id === selectedConversation && newMsg.to_company_id === myCompanyId);
          
          if (!isRelevant) return;
          
          // Load complete message with all joins
          const { data: fullMessage } = await supabase
            .from('messages')
            .select(`
              *,
              from_company:company_profiles!messages_from_company_id_fkey(company_name),
              to_company:company_profiles!messages_to_company_id_fkey(company_name)
            `)
            .eq('id', newMsg.id)
            .single();

          if (fullMessage) {
            setMessages((prev) => {
              // Only add if not already in list
              if (prev.some(m => m.id === fullMessage.id)) {
                return prev;
              }
              return [...prev, fullMessage];
            });
          }
          
          // Reload conversations to update last message
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

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${myCompanyId}/${selectedConversation}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('chat-files').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: 'Fehler',
          description: 'Datei ist zu groß (max. 20MB)',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !myCompanyId || !selectedConversation) return;

    setSending(true);
    setUploading(!!selectedFile);

    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    let fileSize = null;

    if (selectedFile) {
      fileUrl = await uploadFile(selectedFile);
      if (!fileUrl) {
        toast({
          title: 'Fehler',
          description: 'Datei konnte nicht hochgeladen werden',
          variant: 'destructive',
        });
        setSending(false);
        setUploading(false);
        return;
      }
      fileName = selectedFile.name;
      fileType = selectedFile.type;
      fileSize = selectedFile.size;
    }

    const messageContent = newMessage.trim() || (selectedFile ? `Datei gesendet: ${selectedFile.name}` : '');
    
    // Optimistic update: Add message immediately to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      from_company_id: myCompanyId,
      to_company_id: selectedConversation,
      content: messageContent,
      created_at: new Date().toISOString(),
      file_url: fileUrl || undefined,
      file_name: fileName || undefined,
      file_type: fileType || undefined,
      file_size: fileSize || undefined,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const { data, error } = await supabase.from('messages').insert({
      from_company_id: myCompanyId,
      to_company_id: selectedConversation,
      content: messageContent,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    }).select().single();

    if (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      toast({
        title: 'Fehler',
        description: 'Nachricht konnte nicht gesendet werden',
        variant: 'destructive',
      });
      setSending(false);
      setUploading(false);
      return;
    }

    // Replace temp message with real one
    setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
    
    // Update conversations list
    loadConversations();
    
    setSending(false);
    setUploading(false);
  };

  const startVideoCall = async () => {
    if (!myCompanyId || !selectedConversation) return;

    const roomId = `${myCompanyId}-${selectedConversation}-${Date.now()}`;

    const { error } = await supabase.from('video_call_sessions').insert({
      room_id: roomId,
      company_id_1: myCompanyId,
      company_id_2: selectedConversation,
      status: 'pending',
    });

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Videoanruf konnte nicht gestartet werden',
        variant: 'destructive',
      });
      return;
    }

    setActiveCall({
      roomId,
      partnerCompanyId: selectedConversation,
      isInitiator: true,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {conversations.find((c) => c.company_id === selectedConversation)?.company_name}
                  </CardTitle>
                  <Button onClick={startVideoCall} variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Videoanruf
                  </Button>
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
                          
                          {msg.file_url && (
                            <div className="mt-2 p-2 bg-background/10 rounded flex items-center gap-2">
                              <FileIcon className="h-4 w-4" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{msg.file_name}</p>
                                {msg.file_size && (
                                  <p className="text-xs opacity-70">{formatFileSize(msg.file_size)}</p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(msg.file_url, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.created_at).toLocaleString('de-DE')}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  <div className="space-y-2 mt-4">
                    {selectedFile && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <FileIcon className="h-4 w-4" />
                        <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="icon"
                        disabled={uploading}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Nachricht eingeben..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        disabled={uploading}
                      />
                      <Button 
                        onClick={sendMessage} 
                        disabled={sending || uploading || (!newMessage.trim() && !selectedFile)}
                      >
                        {uploading ? '...' : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
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

        {/* Video Call Dialog */}
        {activeCall && myCompanyId && (
          <Dialog open={!!activeCall} onOpenChange={() => setActiveCall(null)}>
            <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0">
              <DialogTitle className="sr-only">Videoanruf</DialogTitle>
              <DialogDescription className="sr-only">
                Echtzeit-Videoanruf mit Ihrem Partnerunternehmen
              </DialogDescription>
              <VideoCall
                roomId={activeCall.roomId}
                myCompanyId={myCompanyId}
                partnerCompanyId={activeCall.partnerCompanyId}
                isInitiator={activeCall.isInitiator}
                onClose={() => setActiveCall(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

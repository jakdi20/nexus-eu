import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft, Paperclip, Video, Download, FileIcon, Languages } from 'lucide-react';
import VideoCall from '@/components/VideoCall';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useUnreadMessages } from '@/hooks/use-unread-messages';
import { useLanguage } from '@/contexts/LanguageContext';

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

function Messages() {
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get('partnerId');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markAsRead, refreshUnreadCount } = useUnreadMessages();
  const { language, t } = useLanguage();
  
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(partnerId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [translatingMessageId, setTranslatingMessageId] = useState<string | null>(null);
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
          
          const isRelevant = 
            (newMsg.from_company_id === myCompanyId && newMsg.to_company_id === selectedConversation) ||
            (newMsg.from_company_id === selectedConversation && newMsg.to_company_id === myCompanyId);
          
          if (!isRelevant) return;
          
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
              if (prev.some(m => m.id === fullMessage.id)) {
                return prev;
              }
              return [...prev, fullMessage];
            });
          }
          
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
        title: t('common.error'),
        description: language === 'de' ? 'Firmenprofil konnte nicht geladen werden' : 'Company profile could not be loaded',
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
          company_name: msg.to_company?.company_name || 'Unknown',
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
          company_name: msg.from_company?.company_name || 'Unknown',
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
        title: t('common.error'),
        description: language === 'de' ? 'Nachrichten konnten nicht geladen werden' : 'Messages could not be loaded',
        variant: 'destructive',
      });
      return;
    }

    setMessages(data);

    await markAsRead(companyId);
    refreshUnreadCount();
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
          title: t('common.error'),
          description: language === 'de' ? 'Datei ist zu groß (max. 20MB)' : 'File is too large (max. 20MB)',
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
          title: t('common.error'),
          description: language === 'de' ? 'Datei konnte nicht hochgeladen werden' : 'File could not be uploaded',
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

    const messageContent = newMessage.trim() || (selectedFile ? `${language === 'de' ? 'Datei gesendet' : 'File sent'}: ${selectedFile.name}` : '');
    
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
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      toast({
        title: t('common.error'),
        description: language === 'de' ? 'Nachricht konnte nicht gesendet werden' : 'Message could not be sent',
        variant: 'destructive',
      });
      setSending(false);
      setUploading(false);
      return;
    }

    setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
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
        title: t('common.error'),
        description: language === 'de' ? 'Videoanruf konnte nicht gestartet werden' : 'Video call could not be started',
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

  const translateMessage = async (messageId: string, text: string) => {
    if (translatedMessages[messageId]) {
      const newTranslations = { ...translatedMessages };
      delete newTranslations[messageId];
      setTranslatedMessages(newTranslations);
      return;
    }

    setTranslatingMessageId(messageId);
    
    try {
      const { data, error } = await supabase.functions.invoke('translate-message', {
        body: { 
          text, 
          targetLanguage: language 
        }
      });

      if (error) throw error;

      setTranslatedMessages(prev => ({
        ...prev,
        [messageId]: data.translatedText
      }));
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: language === 'de' ? 'Übersetzungsfehler' : 'Translation Error',
        description: language === 'de' 
          ? 'Die Nachricht konnte nicht übersetzt werden' 
          : 'Could not translate the message',
        variant: 'destructive',
      });
    } finally {
      setTranslatingMessageId(null);
    }
  };

  if (loading) {
    return (
      <div className=
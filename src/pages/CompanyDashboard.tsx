import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Edit, 
  Loader2, 
  Sparkles, 
  TrendingUp,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  Users,
  MessageCircle,
  Heart,
  Send,
  CheckCircle2,
  Upload,
  Camera
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import CompanyProfileForm from "@/components/CompanyProfileForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PremiumDialog } from "@/components/PremiumDialog";
import { useUnreadMessages } from "@/hooks/use-unread-messages";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const companySizes = ["1", "2-10", "11-50", "51-250", "250+"] as const;

const industries = [
  "Technologie & IT",
  "Produktion & Fertigung",
  "Handel & E-Commerce",
  "Dienstleistungen",
  "Gesundheit & Medizin",
  "Bauwesen & Immobilien",
  "Finanzen & Versicherungen",
  "Bildung & Forschung",
  "Logistik & Transport",
  "Lebensmittel & Getränke",
  "Energie & Umwelt",
  "Medien & Marketing",
  "Sonstiges",
];

const formSchema = z.object({
  company_name: z.string().trim().min(2).max(100),
  legal_form: z.string().trim().optional(),
  industry: z.string().min(1),
  company_size: z.enum(companySizes),
  country: z.string().trim().min(2),
  firmensitz: z.string().trim().min(2),
  founded_year: z.string().regex(/^\d{4}$/).optional().or(z.literal("")),
  website: z.string().trim().url().optional().or(z.literal("")),
  contact_email: z.string().trim().email(),
  contact_phone: z.string().trim().optional(),
  description: z.string().trim().max(500).optional(),
  offers: z.string().trim().optional(),
  seeks: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PartnerProfile {
  id: string;
  company_name: string;
  description?: string;
  industry: string;
  country: string;
  firmensitz: string;
  company_size: string;
  verification_status?: string;
  last_message_time?: string;
  message_count?: number;
}

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

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markAsRead, refreshUnreadCount } = useUnreadMessages();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Partners state
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  
  // Messages state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messagesSheetOpen, setMessagesSheetOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      legal_form: "",
      industry: "",
      company_size: "11-50",
      country: "",
      firmensitz: "",
      founded_year: "",
      website: "",
      contact_email: "",
      contact_phone: "",
      description: "",
      offers: "",
      seeks: "",
      address: "",
    },
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      loadPartners();
      loadConversations();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id && selectedConversation && messagesSheetOpen) {
      loadMessages(selectedConversation);
    }
  }, [profile?.id, selectedConversation, messagesSheetOpen]);

  const openChat = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setMessagesSheetOpen(true);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte wählen Sie eine Bilddatei aus.",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Das Bild ist zu groß. Maximal 2MB erlaubt.",
      });
      return;
    }

    setUploadingLogo(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      // Delete old logo if exists
      if (profile.logo_url) {
        const oldPath = profile.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('company-logos')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('company_profiles')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, logo_url: urlData.publicUrl });
      
      toast({
        title: "Logo hochgeladen",
        description: "Ihr Unternehmenslogo wurde erfolgreich aktualisiert.",
      });

      await loadUserData();
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Logo konnte nicht hochgeladen werden.",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Realtime messages
  useEffect(() => {
    if (!profile?.id || !selectedConversation) return;

    const channel = supabase
      .channel(`chat-${profile.id}-${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          const isRelevant = 
            (newMsg.from_company_id === profile.id && newMsg.to_company_id === selectedConversation) ||
            (newMsg.from_company_id === selectedConversation && newMsg.to_company_id === profile.id);
          
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
              if (prev.some(m => m.id === fullMessage.id)) return prev;
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
  }, [profile?.id, selectedConversation]);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profileData, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setProfile(profileData);
      
      if (profileData) {
        form.reset({
          company_name: profileData.company_name || "",
          legal_form: profileData.legal_form || "",
          industry: profileData.industry || "",
          company_size: profileData.company_size || "11-50",
          country: profileData.country || "",
          firmensitz: profileData.firmensitz || "",
          founded_year: profileData.founded_year?.toString() || "",
          website: profileData.website || "",
          contact_email: profileData.contact_email || "",
          contact_phone: profileData.contact_phone || "",
          description: profileData.description || "",
          offers: profileData.offers || "",
          seeks: profileData.seeks || "",
          address: profileData.address || "",
        });
      }
    } catch (error: any) {
      console.error("Error loading user data:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Profildaten konnten nicht geladen werden.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    if (!profile?.id) return;
    setLoadingPartners(true);

    try {
      const { data: sentMessages } = await supabase
        .from("messages")
        .select("to_company_id, created_at")
        .eq("from_company_id", profile.id)
        .order("created_at", { ascending: false });

      const { data: receivedMessages } = await supabase
        .from("messages")
        .select("from_company_id, created_at")
        .eq("to_company_id", profile.id)
        .order("created_at", { ascending: false });

      const partnerIds = new Set<string>();
      const partnerStats = new Map<string, { lastMessage: string; count: number }>();

      sentMessages?.forEach((msg) => {
        partnerIds.add(msg.to_company_id);
        const existing = partnerStats.get(msg.to_company_id);
        partnerStats.set(msg.to_company_id, {
          lastMessage: existing ? (new Date(msg.created_at) > new Date(existing.lastMessage) ? msg.created_at : existing.lastMessage) : msg.created_at,
          count: (existing?.count || 0) + 1,
        });
      });

      receivedMessages?.forEach((msg) => {
        partnerIds.add(msg.from_company_id);
        const existing = partnerStats.get(msg.from_company_id);
        partnerStats.set(msg.from_company_id, {
          lastMessage: existing ? (new Date(msg.created_at) > new Date(existing.lastMessage) ? msg.created_at : existing.lastMessage) : msg.created_at,
          count: (existing?.count || 0) + 1,
        });
      });

      if (partnerIds.size === 0) {
        setLoadingPartners(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("company_profiles")
        .select("*")
        .in("id", Array.from(partnerIds));

      const partnersWithStats = profiles?.map((profile) => {
        const stats = partnerStats.get(profile.id);
        return {
          ...profile,
          last_message_time: stats?.lastMessage,
          message_count: stats?.count,
        };
      }).sort((a, b) => {
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });

      setPartners(partnersWithStats || []);
    } catch (error) {
      console.error("Error loading partners:", error);
    } finally {
      setLoadingPartners(false);
    }
  };

  const loadConversations = async () => {
    if (!profile?.id) return;

    const { data: sentMessages } = await supabase
      .from('messages')
      .select('to_company_id, to_company:company_profiles!messages_to_company_id_fkey(company_name), content, created_at')
      .eq('from_company_id', profile.id)
      .order('created_at', { ascending: false });

    const { data: receivedMessages } = await supabase
      .from('messages')
      .select('from_company_id, from_company:company_profiles!messages_from_company_id_fkey(company_name), content, created_at')
      .eq('to_company_id', profile.id)
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
  };

  const loadMessages = async (companyId: string) => {
    if (!profile?.id) return;

    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        from_company:company_profiles!messages_from_company_id_fkey(company_name),
        to_company:company_profiles!messages_to_company_id_fkey(company_name)
      `)
      .or(`and(from_company_id.eq.${profile.id},to_company_id.eq.${companyId}),and(from_company_id.eq.${companyId},to_company_id.eq.${profile.id})`)
      .order('created_at', { ascending: true });

    setMessages(data || []);
    await markAsRead(companyId);
    refreshUnreadCount();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile?.id || !selectedConversation) return;

    setSending(true);

    const { error } = await supabase.from('messages').insert({
      from_company_id: profile.id,
      to_company_id: selectedConversation,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden.",
      });
    } else {
      setNewMessage('');
      loadConversations();
    }

    setSending(false);
  };


  const handleProfileCreated = (newProfile: any) => {
    setProfile(newProfile);
    toast({
      title: "Profil erstellt!",
      description: "Ihr Unternehmensprofil wurde erfolgreich angelegt.",
    });
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);

    try {
      const updateData = {
        company_name: values.company_name,
        legal_form: values.legal_form || null,
        industry: values.industry,
        company_size: values.company_size,
        country: values.country,
        firmensitz: values.firmensitz,
        founded_year: values.founded_year ? parseInt(values.founded_year) : null,
        website: values.website || null,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone || null,
        description: values.description || null,
        offers: values.offers || null,
        seeks: values.seeks || null,
        address: values.address || null,
      };

      const { error } = await supabase
        .from("company_profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...updateData });
      setEditDialogOpen(false);
      
      toast({
        title: "Erfolgreich gespeichert",
        description: "Ihr Profil wurde aktualisiert.",
      });

      await loadUserData();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Profil konnte nicht aktualisiert werden.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="inline-block h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-foreground">
              Willkommen bei EuroConnect!
            </h2>
            <p className="text-lg text-muted-foreground">
              Erstellen Sie Ihr Unternehmensprofil, um zu starten.
            </p>
          </div>
          <CompanyProfileForm userId={user.id} onProfileCreated={handleProfileCreated} />
        </div>
      </div>
    );
  }

  const isPremium = profile.is_premium || false;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <section>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative group">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg overflow-hidden">
                {profile.logo_url ? (
                  <img 
                    src={profile.logo_url} 
                    alt={`${profile.company_name} Logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10" />
                )}
              </div>
              <label 
                htmlFor="logo-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploadingLogo ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-foreground">{profile.company_name}</h1>
              <p className="text-muted-foreground">Mein Unternehmen</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setEditDialogOpen(true)} variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Bearbeiten
            </Button>
            <Button onClick={() => setPremiumDialogOpen(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Premium
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* Company Overview Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Unternehmensübersicht</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Basisinformationen
                  {profile.is_sponsored && (
                    <Badge variant="default" className="gap-1 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      Sponsored
                    </Badge>
                  )}
                  {profile.is_premium && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Sparkles className="h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Branche</p>
                    <p className="font-medium">{profile.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mitarbeiter</p>
                    <p className="font-medium">{profile.company_size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Standort</p>
                    <p className="font-medium">{profile.firmensitz}, {profile.country}</p>
                  </div>
                </div>
                {profile.founded_year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Gegründet</p>
                      <p className="font-medium">{profile.founded_year}</p>
                    </div>
                  </div>
                )}
              </div>

              {profile.description && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Beschreibung</p>
                  <p className="text-sm">{profile.description}</p>
                </div>
              )}

                <div className="pt-4 border-t space-y-2">
                  {profile.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.contact_email}</span>
                    </div>
                  )}
                  {profile.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.contact_phone}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        Website besuchen
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {profile.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Beschreibung</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{profile.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            {profile.offers && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Was wir anbieten</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{profile.offers}</p>
                </CardContent>
              </Card>
            )}

            {profile.seeks && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Was wir suchen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{profile.seeks}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Separator />

      {/* Messages Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Letzte Nachrichten</h2>
        </div>

        {conversations.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <MessageCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-base font-medium mb-1">Keine Nachrichten</p>
              <p className="text-sm text-muted-foreground">
                Beginnen Sie Gespräche mit Ihren Partnern
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversations.slice(0, 6).map((conv) => (
              <Card 
                key={conv.company_id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openChat(conv.company_id)}
              >
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="truncate">{conv.company_name}</span>
                    <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{conv.last_message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(conv.last_message_time).toLocaleDateString('de-DE')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {conversations.length > 6 && (
          <div className="text-center">
            <Button variant="outline" onClick={() => navigate("/messages")}>
              Alle Nachrichten ansehen ({conversations.length})
            </Button>
          </div>
        )}
      </section>

      <Separator />

      {/* Partners Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Meine Partner</h2>
          <Badge variant="secondary" className="ml-2">
            {partners.length}
          </Badge>
        </div>

        {partners.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Heart className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-base font-medium mb-1">Noch keine Partner</p>
              <p className="text-sm text-muted-foreground mb-4">
                Beginnen Sie Gespräche mit potenziellen Partnern
              </p>
              <Button onClick={() => navigate("/search")}>
                Partner suchen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partners.slice(0, 6).map((partner) => (
                <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="line-clamp-1">{partner.company_name}</span>
                      {partner.verification_status === "verified" && (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {partner.description || "Keine Beschreibung"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span className="truncate">{partner.industry}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{partner.firmensitz}, {partner.country}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => openChat(partner.id)}>
                      <MessageCircle className="mr-2 h-3 w-3" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/partner/${partner.id}`)}>
                      Profil
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {partners.length > 6 && (
              <div className="text-center">
                <Button variant="outline" onClick={() => navigate("/my-partners")}>
                  Alle Partner ansehen ({partners.length})
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Messages Sheet */}
      <Sheet open={messagesSheetOpen} onOpenChange={setMessagesSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {conversations.find((c) => c.company_id === selectedConversation)?.company_name}
            </SheetTitle>
            <SheetDescription>
              Direktnachrichten mit diesem Partner
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-180px)] mt-6">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from_company_id === profile.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2 ${
                        msg.from_company_id === profile.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="pt-4 border-t mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nachricht schreiben..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button size="icon" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie Ihre Unternehmensinformationen
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basisinformationen */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basisinformationen</h3>
                
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firmenname *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legal_form"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rechtsform</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. GmbH, AG, UG" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Land *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="z.B. Deutschland" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="firmensitz"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Firmensitz *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="z.B. Berlin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Unternehmensprofil */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Unternehmensprofil</h3>
                
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hauptbranche *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Branche wählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unternehmensgröße *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companySizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size} Mitarbeiter
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="founded_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gründungsjahr</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="z.B. 2020" maxLength={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Kontakt */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Kontakt</h3>
                
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontakt E-Mail *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="kontakt@firma.de" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <Input placeholder="+49 123 456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." type="url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Standort */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Straße, Hausnummer, PLZ Ort" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Kurzbeschreibung */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kurzbeschreibung</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="1-2 Sätze über Ihr Unternehmen..."
                        className="min-h-[80px]"
                        maxLength={500}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/500 Zeichen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Angebot & Nachfrage */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Angebot & Nachfrage</h3>
                
                <FormField
                  control={form.control}
                  name="offers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Was bieten Sie an?</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[80px]" placeholder="Beschreiben Sie Ihre Produkte und Services..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Was suchen Sie?</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[80px]" placeholder="Beschreiben Sie, was Sie suchen..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Speichern..." : "Änderungen speichern"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Premium Dialog */}
      <PremiumDialog
        open={premiumDialogOpen}
        onOpenChange={setPremiumDialogOpen}
        companyId={profile.id}
        isPremium={profile.is_premium || false}
        isSponsored={profile.is_sponsored || false}
        sponsoredUntil={profile.sponsored_until}
        onUpdate={loadUserData}
      />
    </div>
  );
};

export default CompanyDashboard;

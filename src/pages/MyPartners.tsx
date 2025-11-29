import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, MessageCircle, Building2, MapPin, TrendingUp, CheckCircle2, Loader2 } from "lucide-react";

interface PartnerProfile {
  id: string;
  company_name: string;
  company_description: string;
  industry: string[];
  country: string;
  city: string;
  company_size: string;
  cooperation_type: string[];
  offers: string;
  looking_for: string;
  website: string;
  verification_status: string;
  founded_year: number;
  last_message_time?: string;
  message_count?: number;
}

const MyPartners = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null);

  useEffect(() => {
    loadMyPartners();
  }, []);

  const loadMyPartners = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: myCompany } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!myCompany) {
        setLoading(false);
        return;
      }

      setMyCompanyId(myCompany.id);

      const { data: sentMessages } = await supabase
        .from("messages")
        .select("to_company_id, created_at")
        .eq("from_company_id", myCompany.id)
        .order("created_at", { ascending: false });

      const { data: receivedMessages } = await supabase
        .from("messages")
        .select("from_company_id, created_at")
        .eq("to_company_id", myCompany.id)
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
        setLoading(false);
        return;
      }

      const { data: profiles, error } = await supabase
        .from("company_profiles")
        .select("*")
        .in("id", Array.from(partnerIds));

      if (error) throw error;

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
      toast({
        title: t("common.error"),
        description: t("partners.loadError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startChat = (partnerId: string) => {
    navigate(`/messages?partnerId=${partnerId}`);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("messages.justNow");
    if (diffMins < 60) return t("messages.minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("messages.hoursAgo", { count: diffHours });
    if (diffDays < 7) return diffDays > 1 ? t("messages.daysAgoPlural", { count: diffDays }) : t("messages.daysAgo", { count: diffDays });
    return language === "de" ? date.toLocaleDateString("de-DE") : date.toLocaleDateString("en-US");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t("search.loadingPartners")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">{t("partners.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {partners.length === 0
                ? t("partners.noPartners")
                : `${partners.length} ${t("partners.partnersConnected")}`}
            </p>
          </div>
        </div>
      </div>

      {partners.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">{t("partners.noPartners")}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {t("partners.noPartnersDesc")}
            </p>
            <Button onClick={() => navigate("/search")}>
              {t("partners.searchPartners")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <Card
              key={partner.id}
              className="hover:shadow-glow transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors flex-1">
                    <span className="line-clamp-1">{partner.company_name}</span>
                    {partner.verification_status === "verified" && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </CardTitle>
                </div>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                  {partner.company_description || t("common.noDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{partner.industry?.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {partner.city}, {partner.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{partner.company_size} {t("common.employees")}</span>
                  </div>

                  {partner.last_message_time && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t("messages.lastMessage")}</span>
                        <span>{formatRelativeTime(partner.last_message_time)}</span>
                      </div>
                      {partner.message_count && (
                        <div className="flex items-center gap-1 mt-1">
                          <MessageCircle className="h-3 w-3" />
                          <span className="text-xs">{partner.message_count} {t("messages.messagesCount")}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {partner.cooperation_type && partner.cooperation_type.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {partner.cooperation_type.slice(0, 2).map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant="default"
                  onClick={() => startChat(partner.id)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t("common.chat")}
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => navigate(`/partner/${partner.id}`)}
                >
                  {t("common.profile")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPartners;

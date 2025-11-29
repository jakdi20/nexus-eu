import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Building2, 
  Users, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Mail,
  TrendingUp,
  Award
} from "lucide-react";

interface CompanyProfile {
  id: string;
  company_name: string;
  description: string;
  industry: string;
  country: string;
  city: string;
  company_size: string;
  partnership_types: string[];
  offers: string[];
  seeks: string[];
  website: string;
  verified: boolean;
  verification_status: string;
  team_size: number;
  founding_year: number;
  certificates: string[];
  portfolio_url: string;
  annual_revenue_range: string;
}

const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    loadMyCompany();
  }, [id]);

  const loadMyCompany = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (data) setMyCompanyId(data.id);
    }
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Fehler",
        description: "Profil konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async () => {
    if (!myCompanyId || !profile) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from("connection_requests")
        .insert({
          from_company_id: myCompanyId,
          to_company_id: profile.id,
          message: message,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Erfolgreich",
        description: "Kontaktanfrage wurde gesendet",
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending request:", error);
      toast({
        title: "Fehler",
        description: "Anfrage konnte nicht gesendet werden",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-lg">Profil nicht gefunden</p>
            <Button onClick={() => navigate("/partners")} className="mt-4">
              Zurück zur Suche
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/partners")}
          className="mb-6"
        >
          ← Zurück zur Suche
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl flex items-center gap-3">
                      {profile.company_name}
                      {profile.verification_status === "verified" && (
                        <CheckCircle2 className="h-7 w-7 text-primary" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {profile.industry}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Über das Unternehmen</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {profile.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Standort</p>
                      <p className="font-medium">{profile.city}, {profile.country}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Unternehmensgröße</p>
                      <p className="font-medium">{profile.company_size}</p>
                    </div>
                  </div>

                  {profile.team_size && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Team-Größe</p>
                        <p className="font-medium">{profile.team_size} Mitarbeiter</p>
                      </div>
                    </div>
                  )}

                  {profile.founding_year && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Gegründet</p>
                        <p className="font-medium">{profile.founding_year}</p>
                      </div>
                    </div>
                  )}

                  {profile.annual_revenue_range && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Umsatz</p>
                        <p className="font-medium">{profile.annual_revenue_range}</p>
                      </div>
                    </div>
                  )}
                </div>

                {profile.certificates && profile.certificates.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Zertifikate
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.certificates.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.partnership_types && profile.partnership_types.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Partnerschaftstypen</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.partnership_types.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.offers && profile.offers.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Bietet an</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.offers.map((offer, index) => (
                        <Badge key={index} className="text-sm px-3 py-1">
                          {offer}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.seeks && profile.seeks.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Sucht</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.seeks.map((seek, index) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                          {seek}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  {profile.website && (
                    <Button variant="outline" asChild>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Website besuchen
                      </a>
                    </Button>
                  )}
                  {profile.portfolio_url && (
                    <Button variant="outline" asChild>
                      <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Kontakt aufnehmen
                </CardTitle>
                <CardDescription>
                  Senden Sie eine Kontaktanfrage an {profile.company_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Ihre Nachricht..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  <Button
                    onClick={sendConnectionRequest}
                    disabled={sending || !message.trim()}
                    className="w-full"
                  >
                    {sending ? "Wird gesendet..." : "Anfrage senden"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetail;
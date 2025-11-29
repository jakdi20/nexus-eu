import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Building2, 
  Users, 
  Calendar, 
  ExternalLink, 
  CheckCircle2,
  TrendingUp,
  Award,
  MessageCircle
} from "lucide-react";

interface CompanyProfile {
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
  verified: boolean;
  verification_status: string;
  founded_year: number;
}

const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

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

  const startChat = () => {
    if (!profile) return;
    navigate(`/messages?partnerId=${profile.id}`);
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
                    {profile.company_description || "Keine Beschreibung verfügbar"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Branche</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.industry?.map((ind: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{ind}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Standort</p>
                      <p className="font-medium">{profile.city}, {profile.country}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Unternehmensgröße</p>
                      <p className="font-medium">{profile.company_size} Mitarbeiter</p>
                    </div>
                  </div>

                  {profile.founded_year && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Gegründet</p>
                        <p className="font-medium">{profile.founded_year}</p>
                      </div>
                    </div>
                  )}
                </div>

                {profile.cooperation_type && profile.cooperation_type.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Kooperationsarten</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.cooperation_type.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.offers && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Bietet an</h3>
                    <p className="text-muted-foreground">{profile.offers}</p>
                  </div>
                )}

                {profile.looking_for && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Sucht</h3>
                    <p className="text-muted-foreground">{profile.looking_for}</p>
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
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Kontakt aufnehmen
                </CardTitle>
                <CardDescription>
                  Starten Sie einen Chat mit {profile.company_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={startChat} 
                  className="w-full"
                  size="lg"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat starten
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetail;
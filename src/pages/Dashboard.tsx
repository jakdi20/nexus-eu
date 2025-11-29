import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Building2, Users, TrendingUp, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CompanyProfileForm from "@/components/CompanyProfileForm";
import { NotificationBell } from "@/components/NotificationBell";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculatingMatches, setCalculatingMatches] = useState(false);

  useEffect(() => {
    // Check authentication and load profile
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        setUser(session.user);

        // Load company profile
        const { data: profileData, error } = await supabase
          .from("company_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        setProfile(profileData);
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

    loadUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleProfileCreated = (newProfile: any) => {
    setProfile(newProfile);
    toast({
      title: "Profil erstellt!",
      description: "Ihr Unternehmensprofil wurde erfolgreich angelegt.",
    });
  };

  const calculateMatches = async () => {
    setCalculatingMatches(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-matches');
      
      if (error) throw error;

      toast({
        title: "Matches berechnet!",
        description: data.message || "Ihre Partner-Matches wurden erfolgreich berechnet.",
      });
    } catch (error: any) {
      console.error("Error calculating matches:", error);
      toast({
        title: "Fehler",
        description: "Matches konnten nicht berechnet werden.",
        variant: "destructive",
      });
    } finally {
      setCalculatingMatches(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EuroConnect</h1>
              <p className="text-sm text-muted-foreground">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <Button variant="default" onClick={() => navigate("/partners")}>
                <Search className="mr-2 h-4 w-4" />
                Partner finden
              </Button>
            )}
            <NotificationBell />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!profile ? (
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-foreground">
                Willkommen bei EuroConnect!
              </h2>
              <p className="text-lg text-muted-foreground">
                Erstellen Sie Ihr Unternehmensprofil, um mit dem Matching zu starten.
              </p>
            </div>
            <CompanyProfileForm userId={user.id} onProfileCreated={handleProfileCreated} />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-foreground">
                Willkommen zurück, {profile.company_name}!
              </h2>
              <p className="text-muted-foreground">
                Hier ist Ihre Übersicht über aktuelle Aktivitäten.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Potenzielle Partner</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">+12% zum Vormonat</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktive Anfragen</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">3 neue diese Woche</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Match-Score</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground">Sehr hoch</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ihr Unternehmensprofil</CardTitle>
                <CardDescription>
                  Ihre Profilinformationen werden für das Matching verwendet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unternehmen</p>
                    <p className="text-lg font-semibold">{profile.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Branche</p>
                    <p className="text-lg font-semibold">{profile.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Standort</p>
                    <p className="text-lg font-semibold">
                      {profile.city}, {profile.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Größe</p>
                    <p className="text-lg font-semibold">{profile.company_size} Mitarbeiter</p>
                  </div>
                </div>
                {profile.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Beschreibung</p>
                    <p className="mt-1 text-foreground">{profile.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partner-Matching</CardTitle>
                <CardDescription>
                  Finden Sie automatisch passende Geschäftspartner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Unser Algorithmus analysiert Ihr Profil und findet passende Partner basierend auf Branche, 
                    Standort, Angeboten und Bedürfnissen.
                  </p>
                  <Button 
                    onClick={calculateMatches} 
                    disabled={calculatingMatches}
                    className="w-full"
                  >
                    {calculatingMatches ? "Wird berechnet..." : "Matches jetzt berechnen"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nächste Schritte</CardTitle>
                <CardDescription>
                  So maximieren Sie Ihre Chancen auf erfolgreiche Partnerschaften
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Profil vervollständigen</h4>
                      <p className="text-sm text-muted-foreground">
                        Je mehr Informationen, desto besser das Matching
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Partner durchsuchen</h4>
                      <p className="text-sm text-muted-foreground">
                        Nutzen Sie unsere Suchfunktion für gezielte Ergebnisse
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Kontakt aufnehmen</h4>
                      <p className="text-sm text-muted-foreground">
                        Senden Sie Anfragen an interessante Unternehmen
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
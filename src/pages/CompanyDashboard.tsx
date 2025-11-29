import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Edit, 
  Loader2, 
  MessageSquare, 
  Eye, 
  Sparkles, 
  TrendingUp, 
  Clock,
  Target,
  Award,
  BarChart3,
  Users,
  Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CompanyProfileForm from "@/components/CompanyProfileForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyInsights } from "@/components/CompanyInsights";
import { PremiumDialog } from "@/components/PremiumDialog";
import { AnalyticsWidget } from "@/components/AnalyticsWidget";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

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

const cooperationTypes = [
  "Technology partner",
  "Sales partner",
  "Project partner",
  "Supplier",
  "Pilot customer",
  "Investment partner",
];

const formSchema = z.object({
  company_name: z.string().trim().min(2).max(100),
  slogan: z.string().trim().max(100).optional(),
  industry: z.array(z.string()).min(1),
  company_size: z.enum(companySizes),
  country: z.string().trim().min(2),
  city: z.string().trim().min(2),
  founded_year: z.string().regex(/^\d{4}$/).optional().or(z.literal("")),
  website: z.string().trim().url().optional().or(z.literal("")),
  company_description: z.string().trim().max(500).optional(),
  offers: z.string().trim().optional(),
  looking_for: z.string().trim().optional(),
  cooperation_type: z.array(z.string()).min(1),
});

type FormValues = z.infer<typeof formSchema>;

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [insightsDialogOpen, setInsightsDialogOpen] = useState(false);
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);

  // Analytics Stats
  const [partnersContacted, setPartnersContacted] = useState(0);
  const [profileVisits, setProfileVisits] = useState(0);
  const [profileVisits30Days, setProfileVisits30Days] = useState(0);
  const [receivedRequests, setReceivedRequests] = useState(0);
  const [responseRate, setResponseRate] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState<string>("-");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [visibilityScore, setVisibilityScore] = useState(0);
  const [matchQuality, setMatchQuality] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      slogan: "",
      industry: [],
      company_size: "11-50",
      country: "",
      city: "",
      founded_year: "",
      website: "",
      company_description: "",
      offers: "",
      looking_for: "",
      cooperation_type: [],
    },
  });

  useEffect(() => {
    loadUserData();
  }, []);

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
          slogan: profileData.slogan || "",
          industry: profileData.industry || [],
          company_size: profileData.company_size || "11-50",
          country: profileData.country || "",
          city: profileData.city || "",
          founded_year: profileData.founded_year?.toString() || "",
          website: profileData.website || "",
          company_description: profileData.company_description || "",
          offers: profileData.offers || "",
          looking_for: profileData.looking_for || "",
          cooperation_type: profileData.cooperation_type || [],
        });

        // Load analytics
        await loadAnalytics(profileData);
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

  const loadAnalytics = async (profileData: any) => {
    try {
      const companyId = profileData.id;

      // Partners Contacted
      const { data: messagesData } = await supabase
        .from("messages")
        .select("to_company_id")
        .eq("from_company_id", companyId);

      const { data: requestsData } = await supabase
        .from("connection_requests")
        .select("to_company_id")
        .eq("from_company_id", companyId);

      const uniquePartners = new Set([
        ...(messagesData?.map(m => m.to_company_id) || []),
        ...(requestsData?.map(r => r.to_company_id) || []),
      ]);

      setPartnersContacted(uniquePartners.size);

      // Profile Visits (7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: visits7Days } = await supabase
        .from("profile_visits")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .gte("visited_at", sevenDaysAgo.toISOString());

      setProfileVisits(visits7Days || 0);

      // Profile Visits (30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: visits30Days } = await supabase
        .from("profile_visits")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .gte("visited_at", thirtyDaysAgo.toISOString());

      setProfileVisits30Days(visits30Days || 0);

      // Received Requests
      const { count: receivedCount } = await supabase
        .from("connection_requests")
        .select("*", { count: "exact", head: true })
        .eq("to_company_id", companyId);

      setReceivedRequests(receivedCount || 0);

      // Response Rate (messages sent vs received)
      const { data: sentMessages } = await supabase
        .from("messages")
        .select("id")
        .eq("from_company_id", companyId);

      const { data: receivedMessages } = await supabase
        .from("messages")
        .select("id")
        .eq("to_company_id", companyId);

      if (receivedMessages && receivedMessages.length > 0) {
        const rate = ((sentMessages?.length || 0) / receivedMessages.length) * 100;
        setResponseRate(Math.min(100, Math.round(rate)));
      }

      // Profile Completion
      const fields = [
        profileData.company_name,
        profileData.company_description,
        profileData.industry?.length > 0,
        profileData.country,
        profileData.city,
        profileData.company_size,
        profileData.website,
        profileData.offers,
        profileData.looking_for,
        profileData.cooperation_type?.length > 0,
        profileData.founded_year,
        profileData.slogan,
      ];
      const completed = fields.filter(Boolean).length;
      setProfileCompletion(Math.round((completed / fields.length) * 100));

      // Visibility Score (based on profile completion and premium status)
      let score = profileCompletion * 0.5;
      if (profileData.is_premium) score += 25;
      if (profileData.is_sponsored) score += 25;
      setVisibilityScore(Math.round(score));

      // Match Quality (dummy for now - would need AI)
      setMatchQuality(profileData.is_premium ? 85 : 45);

      // Avg Response Time (dummy)
      setAvgResponseTime(profileData.is_premium ? "2-4h" : "-");
      
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
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
        slogan: values.slogan || null,
        industry: values.industry,
        company_size: values.company_size,
        country: values.country,
        city: values.city,
        founded_year: values.founded_year ? parseInt(values.founded_year) : null,
        website: values.website || null,
        company_description: values.company_description || null,
        offers: values.offers || null,
        looking_for: values.looking_for || null,
        cooperation_type: values.cooperation_type,
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
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground">
                Analytics Dashboard
              </h1>
              {profile.is_sponsored && (
                <Badge variant="default" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Sponsored
                </Badge>
              )}
              {isPremium && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{profile.company_name}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setEditDialogOpen(true)} 
              size="lg" 
              variant="outline"
              className="gap-2"
            >
              <Edit className="h-5 w-5" />
              Profil bearbeiten
            </Button>
            <Button onClick={() => setPremiumDialogOpen(true)} size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Premium
            </Button>
          </div>
        </div>

        {/* Profile Completion Banner */}
        {profileCompletion < 100 && (
          <Card className="mb-6 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">Profil-Vervollständigung</p>
                  <p className="text-sm text-muted-foreground">
                    Vervollständigen Sie Ihr Profil für bessere Sichtbarkeit
                  </p>
                </div>
                <div className="text-2xl font-bold text-primary">{profileCompletion}%</div>
              </div>
              <Progress value={profileCompletion} className="h-2" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Analytics Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnalyticsWidget
          title="Kontaktierte Partner"
          value={partnersContacted}
          icon={MessageSquare}
          subtitle="Gesamt"
          onClick={() => setInsightsDialogOpen(true)}
        />

        <AnalyticsWidget
          title="Profilbesuche (7 Tage)"
          value={profileVisits}
          icon={Eye}
          subtitle="Letzte Woche"
          onClick={() => setInsightsDialogOpen(true)}
        />

        <AnalyticsWidget
          title="Profilbesuche (30 Tage)"
          value={profileVisits30Days}
          icon={TrendingUp}
          subtitle="Letzter Monat"
          isPremium
          isLocked={!isPremium}
        />

        <AnalyticsWidget
          title="Erhaltene Anfragen"
          value={receivedRequests}
          icon={Mail}
          subtitle="Partneranfragen"
          isPremium
          isLocked={!isPremium}
        />

        <AnalyticsWidget
          title="Antwortrate"
          value={`${responseRate}%`}
          icon={Target}
          subtitle="Nachrichten"
          isPremium
          isLocked={!isPremium}
        />

        <AnalyticsWidget
          title="Ø Antwortzeit"
          value={avgResponseTime}
          icon={Clock}
          subtitle="Reaktionsgeschwindigkeit"
          isPremium
          isLocked={!isPremium}
        />

        <AnalyticsWidget
          title="Sichtbarkeits-Score"
          value={visibilityScore}
          icon={BarChart3}
          subtitle={`von 100 Punkten`}
          isPremium
          isLocked={!isPremium}
        />

        <AnalyticsWidget
          title="Match-Qualität"
          value={`${matchQuality}%`}
          icon={Award}
          subtitle="KI-Score"
          isPremium
          isLocked={!isPremium}
        />
      </div>

      {/* Premium Upsell if not premium */}
      {!isPremium && (
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/20 p-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Schalten Sie alle Analytics frei</h3>
                  <p className="text-muted-foreground">
                    Erhalten Sie Zugriff auf erweiterte Metriken, KI-Insights und detaillierte Reports
                  </p>
                </div>
              </div>
              <Button onClick={() => setPremiumDialogOpen(true)} size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Premium werden
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detaillierte Insights
          </CardTitle>
          <CardDescription>
            Klicken Sie auf die Widgets oben für detaillierte Analysen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground mb-4">
              Wählen Sie ein Widget aus, um detaillierte Statistiken zu sehen
            </p>
            <Button onClick={() => setInsightsDialogOpen(true)} variant="outline">
              Alle Insights anzeigen
            </Button>
          </div>
        </CardContent>
      </Card>

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
                name="slogan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slogan / Mission Statement</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Innovation für eine bessere Zukunft" {...field} />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/100 Zeichen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={() => (
                  <FormItem>
                    <FormLabel>Branche *</FormLabel>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {industries.map((industry) => (
                        <FormField
                          key={industry}
                          control={form.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(industry)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, industry])
                                      : field.onChange(field.value?.filter((value) => value !== industry));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">{industry}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" maxLength={500} />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/500 Zeichen
                    </FormDescription>
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stadt *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="z.B. Berlin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <FormField
                control={form.control}
                name="offers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Angebote</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[80px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="looking_for"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Was wir suchen</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[80px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cooperation_type"
                render={() => (
                  <FormItem>
                    <FormLabel>Kooperationsarten *</FormLabel>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {cooperationTypes.map((type) => (
                        <FormField
                          key={type}
                          control={form.control}
                          name="cooperation_type"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, type])
                                      : field.onChange(field.value?.filter((value) => value !== type));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">{type}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

      {/* Insights Dialog */}
      <Dialog open={insightsDialogOpen} onOpenChange={setInsightsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Unternehmens-Insights</DialogTitle>
            <DialogDescription>
              Detaillierte Statistiken über Ihre Partner und Profilbesuche
            </DialogDescription>
          </DialogHeader>
          <CompanyInsights companyId={profile.id} />
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

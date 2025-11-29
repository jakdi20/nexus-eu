import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, MapPin, Building2, Users, Globe, Calendar, MessageSquare, Eye, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CompanyProfileForm from "@/components/CompanyProfileForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyInsights } from "@/components/CompanyInsights";
import { PremiumDialog } from "@/components/PremiumDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

const Company = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [partnersContacted, setPartnersContacted] = useState(0);
  const [profileVisits, setProfileVisits] = useState(0);
  const [insightsDialogOpen, setInsightsDialogOpen] = useState(false);
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);

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

        // Load statistics
        await loadStatistics(profileData.id);
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

  const loadStatistics = async (companyId: string) => {
    try {
      // Count partners contacted (unique companies we sent messages or connection requests to)
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

      // Count profile visits in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: visitsData, count } = await supabase
        .from("profile_visits")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .gte("visited_at", sevenDaysAgo.toISOString());

      setProfileVisits(count || 0);
    } catch (error) {
      console.error("Error loading statistics:", error);
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-foreground mb-3">
              {profile.company_name}
            </h1>
            {profile.slogan && (
              <p className="text-xl text-muted-foreground italic mb-4">
                "{profile.slogan}"
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setPremiumDialogOpen(true)} 
              size="lg" 
              variant="outline"
              className="gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Premium
            </Button>
            <Button onClick={() => setEditDialogOpen(true)} size="lg" className="gap-2">
              <Edit className="h-5 w-5" />
              Bearbeiten
            </Button>
          </div>
        </div>

        {/* Description */}
        {profile.company_description && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-lg text-foreground leading-relaxed">
                {profile.company_description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-glow transition-all duration-200 hover:scale-[1.02]"
            onClick={() => setInsightsDialogOpen(true)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Kontaktierte Partner</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{partnersContacted}</p>
              <p className="text-xs text-primary mt-2">Klicken für Details →</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Profilbesuche (7 Tage)</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{profileVisits}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Standort</p>
              </div>
              <p className="text-lg font-semibold">{profile.city}</p>
              <p className="text-sm text-muted-foreground">{profile.country}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Mitarbeiter</p>
              </div>
              <p className="text-lg font-semibold">{profile.company_size}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Branche</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.industry?.slice(0, 2).map((ind: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {ind}
                  </Badge>
                ))}
                {profile.industry?.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.industry.length - 2}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {profile.website && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                </div>
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm font-medium text-primary hover:underline truncate block"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </CardContent>
            </Card>
          )}

          {profile.founded_year && !profile.website && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Gegründet</p>
                </div>
                <p className="text-lg font-semibold">{profile.founded_year}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {profile.offers && (
            <Card>
              <CardHeader>
                <CardTitle>Produkte & Angebote</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{profile.offers}</p>
              </CardContent>
            </Card>
          )}

          {profile.looking_for && (
            <Card>
              <CardHeader>
                <CardTitle>Was wir suchen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{profile.looking_for}</p>
              </CardContent>
            </Card>
          )}

          {profile.industry && profile.industry.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Alle Branchen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.industry.map((ind: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{ind}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {profile.cooperation_type && profile.cooperation_type.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Kooperationsarten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.cooperation_type.map((type: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm">{type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="company_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Größe *</FormLabel>
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
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Land *</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} placeholder="Komma-getrennt" />
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
                    <FormLabel>Gesucht</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Komma-getrennt" />
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
                    <FormLabel>Kooperationsart *</FormLabel>
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

              <div className="flex justify-end gap-3 pt-4">
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

export default Company;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Edit, 
  Loader2, 
  Sparkles, 
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [insightsDialogOpen, setInsightsDialogOpen] = useState(false);
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);


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
      setIsEditing(false);
      
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
                {profile.company_name}
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
            <p className="text-muted-foreground">{profile.industry}</p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <Button 
                  onClick={() => setIsEditing(true)} 
                  size="lg" 
                  variant="outline"
                  className="gap-2"
                >
                  <Edit className="h-5 w-5" />
                  Bearbeiten
                </Button>
                <Button onClick={() => setPremiumDialogOpen(true)} size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Premium
                </Button>
              </>
            ) : (
              <>
                <Button 
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    loadUserData();
                  }} 
                  size="lg" 
                  variant="outline"
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={form.handleSubmit(onSubmit)}
                  size="lg"
                  disabled={saving}
                >
                  {saving ? "Speichern..." : "Speichern"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Company Profile Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basisinformationen */}
          <Card>
            <CardHeader>
              <CardTitle>Basisinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firmenname *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isEditing} />
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
                      <Input placeholder="z.B. GmbH, AG, UG" {...field} disabled={!isEditing} />
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
                        <Input {...field} placeholder="z.B. Deutschland" disabled={!isEditing} />
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
                        <Input {...field} placeholder="z.B. Berlin" disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Unternehmensprofil */}
          <Card>
            <CardHeader>
              <CardTitle>Unternehmensprofil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hauptbranche *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
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
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
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
                        <Input {...field} placeholder="z.B. 2020" maxLength={4} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Kontakt */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kontakt E-Mail *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="kontakt@firma.de" {...field} disabled={!isEditing} />
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
                        <Input placeholder="+49 123 456789" {...field} disabled={!isEditing} />
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
                        <Input {...field} placeholder="https://..." type="url" disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Straße, Hausnummer, PLZ Ort" {...field} disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Kurzbeschreibung */}
          <Card>
            <CardHeader>
              <CardTitle>Über uns</CardTitle>
            </CardHeader>
            <CardContent>
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
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/500 Zeichen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Angebot & Nachfrage */}
          <Card>
            <CardHeader>
              <CardTitle>Angebot & Nachfrage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="offers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Was bieten Sie an?</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[80px]" placeholder="Beschreiben Sie Ihre Produkte und Services..." disabled={!isEditing} />
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
                      <Textarea {...field} className="min-h-[80px]" placeholder="Beschreiben Sie, was Sie suchen..." disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>

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

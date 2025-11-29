import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";

const companySizes = ["1-10", "11-50", "51-250", "251-1000", "1000+"] as const;
const partnershipTypes = [
  { id: "supplier", label: "Lieferant" },
  { id: "buyer", label: "Abnehmer" },
  { id: "cooperation", label: "Kooperationspartner" },
  { id: "service_provider", label: "Dienstleister" },
  { id: "service_seeker", label: "Dienstleistungssuchender" },
] as const;

const formSchema = z.object({
  company_name: z.string().min(2, "Name muss mindestens 2 Zeichen haben").max(100),
  description: z.string().max(1000).optional(),
  website: z.string().url("Bitte geben Sie eine gültige URL ein").optional().or(z.literal("")),
  country: z.string().min(2, "Bitte Land auswählen"),
  city: z.string().min(2, "Stadt ist erforderlich"),
  industry: z.string().min(2, "Branche ist erforderlich"),
  company_size: z.enum(companySizes),
  offers: z.string().optional(),
  seeks: z.string().optional(),
  partnership_types: z.array(z.string()).min(1, "Mindestens eine Art auswählen"),
  team_size: z.string().optional(),
  founding_year: z.string().optional(),
  portfolio_url: z.string().url("Bitte geben Sie eine gültige URL ein").optional().or(z.literal("")),
  certificates: z.string().optional(),
  annual_revenue_range: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      description: "",
      website: "",
      country: "",
      city: "",
      industry: "",
      company_size: "11-50",
      offers: "",
      seeks: "",
      partnership_types: [],
      team_size: "",
      founding_year: "",
      portfolio_url: "",
      certificates: "",
      annual_revenue_range: "",
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;

      if (profileData) {
        setProfile(profileData);
        
        // Populate form with existing data
        form.reset({
          company_name: profileData.company_name || "",
          description: profileData.description || "",
          website: profileData.website || "",
          country: profileData.country || "",
          city: profileData.city || "",
          industry: profileData.industry || "",
          company_size: profileData.company_size || "11-50",
          offers: profileData.offers?.join(", ") || "",
          seeks: profileData.seeks?.join(", ") || "",
          partnership_types: profileData.partnership_types || [],
          team_size: profileData.team_size?.toString() || "",
          founding_year: profileData.founding_year?.toString() || "",
          portfolio_url: profileData.portfolio_url || "",
          certificates: profileData.certificates?.join(", ") || "",
          annual_revenue_range: profileData.annual_revenue_range || "",
        });
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Profil konnte nicht geladen werden.",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);

    try {
      const updateData = {
        company_name: values.company_name,
        description: values.description || null,
        website: values.website || null,
        country: values.country,
        city: values.city,
        industry: values.industry,
        company_size: values.company_size,
        offers: values.offers ? values.offers.split(",").map(s => s.trim()).filter(Boolean) : [],
        seeks: values.seeks ? values.seeks.split(",").map(s => s.trim()).filter(Boolean) : [],
        partnership_types: values.partnership_types as ("supplier" | "buyer" | "cooperation" | "service_provider" | "service_seeker")[],
        team_size: values.team_size ? parseInt(values.team_size) : null,
        founding_year: values.founding_year ? parseInt(values.founding_year) : null,
        portfolio_url: values.portfolio_url || null,
        certificates: values.certificates ? values.certificates.split(",").map(s => s.trim()).filter(Boolean) : [],
        annual_revenue_range: values.annual_revenue_range || null,
      };

      const { error } = await supabase
        .from("company_profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Erfolgreich gespeichert",
        description: "Ihr Profil wurde aktualisiert.",
      });
      
      navigate("/dashboard");
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="inline-block h-8 w-8 animate-spin text-primary" />
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
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Profil bearbeiten</h1>
                <p className="text-sm text-muted-foreground">{profile?.company_name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>Unternehmensprofil bearbeiten</CardTitle>
              <CardDescription>
                Aktualisieren Sie Ihre Informationen für bessere Matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Firmenname *</FormLabel>
                        <FormControl>
                          <Input placeholder="Beispiel GmbH" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unternehmensbeschreibung</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Beschreiben Sie Ihr Unternehmen und Ihre Aktivitäten..."
                            className="min-h-[100px]"
                            {...field}
                          />
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
                          <Input placeholder="https://www.beispiel.de" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Land *</FormLabel>
                          <FormControl>
                            <Input placeholder="Deutschland" {...field} />
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
                            <Input placeholder="Berlin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branche *</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. Maschinenbau" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unternehmensgröße *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Größe wählen" />
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
                  </div>

                  <FormField
                    control={form.control}
                    name="partnership_types"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Art der Partnerschaft *</FormLabel>
                          <FormDescription>
                            Wählen Sie alle zutreffenden Optionen
                          </FormDescription>
                        </div>
                        <div className="space-y-3">
                          {partnershipTypes.map((type) => (
                            <FormField
                              key={type.id}
                              control={form.control}
                              name="partnership_types"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(type.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, type.id])
                                          : field.onChange(field.value?.filter((value) => value !== type.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{type.label}</FormLabel>
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
                    name="offers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Was bieten Sie an?</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. CNC-Fräsen, Logistik, Beratung (durch Komma trennen)" {...field} />
                        </FormControl>
                        <FormDescription>Trennen Sie mehrere Angebote durch Kommas</FormDescription>
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
                          <Input placeholder="z.B. Rohmaterialien, Vertriebspartner (durch Komma trennen)" {...field} />
                        </FormControl>
                        <FormDescription>Trennen Sie mehrere Anforderungen durch Kommas</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="team_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team-Größe</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="z.B. 25" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="founding_year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gründungsjahr</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="z.B. 2010" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="portfolio_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.beispiel.de/portfolio" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="certificates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zertifikate</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. ISO 9001, DIN EN, CE (durch Komma trennen)" {...field} />
                        </FormControl>
                        <FormDescription>Trennen Sie mehrere Zertifikate durch Kommas</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="annual_revenue_range"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jährlicher Umsatz</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Umsatzbereich wählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-100k">0 - 100.000 €</SelectItem>
                            <SelectItem value="100k-500k">100.000 - 500.000 €</SelectItem>
                            <SelectItem value="500k-1m">500.000 - 1 Mio. €</SelectItem>
                            <SelectItem value="1m-5m">1 Mio. - 5 Mio. €</SelectItem>
                            <SelectItem value="5m-10m">5 Mio. - 10 Mio. €</SelectItem>
                            <SelectItem value="10m+">10 Mio. € +</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
                      Abbrechen
                    </Button>
                    <Button type="submit" className="flex-1" disabled={saving}>
                      {saving ? "Wird gespeichert..." : "Änderungen speichern"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, MapPin, Building2, Users, Globe, Calendar, Award, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CompanyProfileForm from "@/components/CompanyProfileForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const companySizes = ["1-10", "11-50", "51-250", "251-1000", "1000+"] as const;
const partnershipTypes = [
  { id: "supplier", label: "Lieferant" },
  { id: "buyer", label: "Abnehmer" },
  { id: "cooperation", label: "Kooperationspartner" },
  { id: "service_provider", label: "Dienstleister" },
  { id: "service_seeker", label: "Dienstleistungssuchender" },
] as const;

const formSchema = z.object({
  company_name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  country: z.string().min(2),
  city: z.string().min(2),
  industry: z.string().min(2),
  company_size: z.enum(companySizes),
  offers: z.string().optional(),
  seeks: z.string().optional(),
  partnership_types: z.array(z.string()).min(1),
  team_size: z.string().optional(),
  founding_year: z.string().optional(),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  certificates: z.string().optional(),
  annual_revenue_range: z.string().optional(),
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {profile.company_name}
            </h1>
            <p className="text-muted-foreground">Ihr Unternehmensprofil</p>
          </div>
          <Button onClick={() => setEditDialogOpen(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Bearbeiten
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Branche</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.industry}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standort</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.city}</div>
            <p className="text-xs text-muted-foreground">{profile.country}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Größe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.company_size}</div>
            <p className="text-xs text-muted-foreground">Mitarbeiter</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Über das Unternehmen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.description && (
                <p className="text-foreground leading-relaxed">{profile.description}</p>
              )}
              
              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                {profile.founding_year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Gegründet</p>
                      <p className="font-medium">{profile.founding_year}</p>
                    </div>
                  </div>
                )}
                {profile.team_size && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Team</p>
                      <p className="font-medium">{profile.team_size} Mitarbeiter</p>
                    </div>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
                {profile.annual_revenue_range && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Umsatzbereich</p>
                      <p className="font-medium">{profile.annual_revenue_range}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {profile.offers && profile.offers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Was wir anbieten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.offers.map((offer: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{offer}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.seeks && profile.seeks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Was wir suchen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.seeks.map((seek: string, idx: number) => (
                    <Badge key={idx} variant="outline">{seek}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {profile.partnership_types && profile.partnership_types.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Partnerschaftsarten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.partnership_types.map((type: string, idx: number) => {
                    const typeLabel = partnershipTypes.find(pt => pt.id === type)?.label || type;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">{typeLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.certificates && profile.certificates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Zertifikate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.certificates.map((cert: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm">{cert}</span>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branche *</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                name="partnership_types"
                render={() => (
                  <FormItem>
                    <FormLabel>Partnerschaftsarten *</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
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
                              <FormLabel className="font-normal text-sm">{type.label}</FormLabel>
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
                    <FormLabel>Angebote</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Durch Komma trennen" />
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
                    <FormLabel>Gesucht</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Durch Komma trennen" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
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
                  name="team_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team-Größe</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
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
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
    </div>
  );
};

export default Company;

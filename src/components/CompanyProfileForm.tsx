import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

const companySizes = ["1", "2-10", "11-50", "51-250", "250+"] as const;

const industries = [
  "Technology & IT",
  "Manufacturing & Production",
  "Retail & E-Commerce",
  "Services",
  "Healthcare & Medicine",
  "Construction & Real Estate",
  "Finance & Insurance",
  "Education & Research",
  "Logistics & Transportation",
  "Food & Beverages",
  "Energy & Environment",
  "Media & Marketing",
  "Other",
];

const formSchema = z.object({
  company_name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen haben").max(100),
  legal_form: z.string().trim().optional(),
  industry: z.string().min(1, "Branche ist erforderlich"),
  company_size: z.enum(companySizes, { required_error: "Bitte Größe auswählen" }),
  country: z.string().trim().min(2, "Land ist erforderlich"),
  firmensitz: z.string().trim().min(2, "Firmensitz ist erforderlich"),
  founded_year: z.string().regex(/^\d{4}$/, "Bitte gültiges Jahr eingeben").optional().or(z.literal("")),
  website: z.string().trim().url("Bitte gültige URL eingeben").optional().or(z.literal("")),
  contact_email: z.string().trim().email("Bitte gültige E-Mail eingeben"),
  contact_phone: z.string().trim().optional(),
  description: z.string().trim().max(500, "Maximal 500 Zeichen").optional(),
  offers: z.string().trim().optional(),
  seeks: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CompanyProfileFormProps {
  userId: string;
  onProfileCreated: (profile: any) => void;
}

const CompanyProfileForm = ({ userId, onProfileCreated }: CompanyProfileFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      const profileData = {
        user_id: userId,
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

      const { data, error } = await supabase
        .from("company_profiles")
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;

      onProfileCreated(data);
    } catch (error: any) {
      console.error("Error creating profile:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Profil konnte nicht erstellt werden.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-elevated">
      <CardHeader>
        <CardTitle>Unternehmensprofil erstellen</CardTitle>
        <CardDescription>
          Füllen Sie die Felder aus, um passende Partner zu finden
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                      <Input placeholder="z.B. Mustermann GmbH" {...field} />
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

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Land *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Deutschland" {...field} />
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
                        <Input placeholder="z.B. Berlin" {...field} />
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

              <div className="grid gap-4 md:grid-cols-2">
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
                        <Input type="number" placeholder="z.B. 2010" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Kontakt / Kommunikation */}
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

              <div className="grid gap-4 md:grid-cols-2">
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
                        <Input placeholder="https://www.beispiel.de" {...field} />
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
                      placeholder="1-2 Sätze über Ihr Unternehmen (max. 500 Zeichen)..."
                      className="min-h-[80px]"
                      maxLength={500}
                      {...field}
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
                      <Textarea 
                        placeholder="Beschreiben Sie Ihre Produkte und Services..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
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
                      <Textarea 
                        placeholder="Beschreiben Sie, was Sie suchen (Partner, Lieferanten, etc.)..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird erstellt..." : "Profil erstellen"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CompanyProfileForm;

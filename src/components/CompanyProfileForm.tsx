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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

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
  company_name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen haben").max(100),
  slogan: z.string().trim().max(100, "Maximal 100 Zeichen").optional(),
  industry: z.array(z.string()).min(1, "Mindestens eine Branche auswählen"),
  company_size: z.enum(companySizes, { required_error: "Bitte Größe auswählen" }),
  country: z.string().trim().min(2, "Land ist erforderlich"),
  city: z.string().trim().min(2, "Stadt ist erforderlich"),
  founded_year: z.string().regex(/^\d{4}$/, "Bitte gültiges Jahr eingeben").optional().or(z.literal("")),
  website: z.string().trim().url("Bitte gültige URL eingeben").optional().or(z.literal("")),
  company_description: z.string().trim().max(500, "Maximal 500 Zeichen").optional(),
  offers: z.string().trim().optional(),
  looking_for: z.string().trim().optional(),
  cooperation_type: z.array(z.string()).min(1, "Mindestens eine Art auswählen"),
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

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      const profileData = {
        user_id: userId,
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
                  <FormDescription>
                    Wählen Sie alle zutreffenden Branchen
                  </FormDescription>
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

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="company_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unternehmensgröße *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div className="grid gap-6 md:grid-cols-2">
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
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stadt *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Berlin" {...field} />
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
                    <Input placeholder="https://www.beispiel.de" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unternehmensbeschreibung</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreiben Sie Ihr Unternehmen (max. 500 Zeichen)..."
                      className="min-h-[100px]"
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

            <FormField
              control={form.control}
              name="offers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Was bieten Sie an?</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. CNC-Bearbeitung, Beratung, Software-Entwicklung" {...field} />
                  </FormControl>
                  <FormDescription>Komma-getrennte Tags</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="looking_for"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Was suchen Sie?</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Lieferanten, Vertriebspartner, Technologie-Partner" {...field} />
                  </FormControl>
                  <FormDescription>Komma-getrennte Tags</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cooperation_type"
              render={() => (
                <FormItem>
                  <FormLabel>Art der Kooperation *</FormLabel>
                  <FormDescription>
                    Wählen Sie alle zutreffenden Optionen
                  </FormDescription>
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

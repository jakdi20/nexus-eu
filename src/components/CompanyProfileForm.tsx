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
      description: "",
      website: "",
      country: "",
      city: "",
      industry: "",
      company_size: "11-50",
      offers: "",
      seeks: "",
      partnership_types: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      const profileData = {
        user_id: userId,
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
          Füllen Sie alle Felder aus, um mit dem Matching zu starten
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
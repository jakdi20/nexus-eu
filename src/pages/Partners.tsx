import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Building2, TrendingUp, CheckCircle2 } from "lucide-react";

interface CompanyProfile {
  id: string;
  company_name: string;
  description: string;
  industry: string;
  country: string;
  city: string;
  company_size: string;
  partnership_types: string[];
  offers: string[];
  seeks: string[];
  website: string;
  verified: boolean;
  verification_status: string;
  team_size: number;
  founding_year: number;
}

const Partners = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  useEffect(() => {
    checkAuth();
    loadProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchTerm, industryFilter, sizeFilter, countryFilter, profiles]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("company_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast({
        title: "Fehler",
        description: "Profile konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = [...profiles];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (industryFilter !== "all") {
      filtered = filtered.filter((p) => p.industry === industryFilter);
    }

    if (sizeFilter !== "all") {
      filtered = filtered.filter((p) => p.company_size === sizeFilter);
    }

    if (countryFilter !== "all") {
      filtered = filtered.filter((p) => p.country === countryFilter);
    }

    setFilteredProfiles(filtered);
  };

  const uniqueIndustries = Array.from(new Set(profiles.map((p) => p.industry)));
  const uniqueCountries = Array.from(new Set(profiles.map((p) => p.country)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Partner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            ← Zurück zum Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Partner finden
          </h1>
          <p className="text-muted-foreground">
            Entdecken Sie {profiles.length} potenzielle Geschäftspartner
          </p>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Suche & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Suche nach Unternehmen, Branche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Branche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Branchen</SelectItem>
                  {uniqueIndustries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Land" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Länder</SelectItem>
                  {uniqueCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card
              key={profile.id}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/partner/${profile.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                      {profile.company_name}
                      {profile.verification_status === "verified" && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {profile.description?.slice(0, 100)}
                      {profile.description && profile.description.length > 100 ? "..." : ""}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{profile.industry}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {profile.city}, {profile.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>{profile.company_size}</span>
                  </div>
                  {profile.partnership_types && profile.partnership_types.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.partnership_types.slice(0, 3).map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Profil ansehen
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg">
                Keine Partner gefunden. Versuchen Sie andere Filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Partners;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Building2, TrendingUp, CheckCircle2, Loader2, Users } from "lucide-react";

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

  const uniqueIndustries = Array.from(new Set(profiles.map((p) => p.industry))).sort();
  const uniqueCountries = Array.from(new Set(profiles.map((p) => p.country))).sort();
  const uniqueSizes = Array.from(new Set(profiles.map((p) => p.company_size))).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Lade Partner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Alle Partner
            </h1>
            <p className="text-muted-foreground mt-1">
              {profiles.length} Unternehmen in unserem Netzwerk
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Suche & Filter
          </CardTitle>
          <CardDescription>
            Durchsuchen Sie alle Partner oder nutzen Sie die KI-Suche für intelligente Empfehlungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Suche nach Unternehmen, Branche, Beschreibung..."
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
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Unternehmensgröße" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Größen</SelectItem>
                    {uniqueSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} Mitarbeiter
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {(searchTerm || industryFilter !== "all" || sizeFilter !== "all" || countryFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setIndustryFilter("all");
                      setSizeFilter("all");
                      setCountryFilter("all");
                    }}
                  >
                    Filter zurücksetzen
                  </Button>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                {filteredProfiles.length} {filteredProfiles.length === 1 ? "Ergebnis" : "Ergebnisse"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <Card
            key={profile.id}
            className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => navigate(`/partner/${profile.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors flex-1">
                  <span className="line-clamp-1">{profile.company_name}</span>
                  {profile.verification_status === "verified" && (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </CardTitle>
              </div>
              <CardDescription className="line-clamp-2 min-h-[40px]">
                {profile.description || "Keine Beschreibung verfügbar"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{profile.industry}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {profile.city}, {profile.country}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{profile.company_size} Mitarbeiter</span>
                </div>
                {profile.partnership_types && profile.partnership_types.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.partnership_types.slice(0, 2).map((type, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {profile.partnership_types.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.partnership_types.length - 2}
                      </Badge>
                    )}
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
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Keine Partner gefunden</p>
            <p className="text-sm text-muted-foreground mb-4">
              Versuchen Sie andere Filter oder passen Sie Ihre Suche an
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setIndustryFilter("all");
                setSizeFilter("all");
                setCountryFilter("all");
              }}
            >
              Filter zurücksetzen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Partners;

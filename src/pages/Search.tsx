import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search as SearchIcon, 
  MapPin, 
  Building2, 
  TrendingUp, 
  CheckCircle2,
  Sparkles,
  Loader2
} from "lucide-react";
import AIRecommendations from "@/components/AIRecommendations";

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
}

interface AISearchResult {
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
  verification_status: string;
  ai_score: number;
  ai_reason: string;
}

const Search = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  
  // AI Search
  const [aiQuery, setAiQuery] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState<AISearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    checkAuth();
    loadProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchTerm, industryFilter, countryFilter, profiles]);

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

    if (countryFilter !== "all") {
      filtered = filtered.filter((p) => p.country === countryFilter);
    }

    setFilteredProfiles(filtered);
  };

  const handleAISearch = async () => {
    if (!aiQuery.trim()) {
      toast({
        title: "Eingabe erforderlich",
        description: "Bitte geben Sie eine Suchanfrage ein",
        variant: "destructive",
      });
      return;
    }

    setAiSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-partner-search', {
        body: { query: aiQuery }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAiResults(data.results || []);

      if (data.results?.length === 0) {
        toast({
          title: "Keine Ergebnisse",
          description: "Versuchen Sie eine andere Suchanfrage",
        });
      } else {
        toast({
          title: "Suche abgeschlossen",
          description: `${data.results.length} passende Unternehmen gefunden`,
        });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Fehler bei der Suche",
        description: error.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    } finally {
      setAiSearching(false);
    }
  };

  const uniqueIndustries = Array.from(new Set(profiles.map((p) => p.industry)));
  const uniqueCountries = Array.from(new Set(profiles.map((p) => p.country)));

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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-glow">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Partner suchen
            </h1>
            <p className="text-muted-foreground mt-1">
              KI-gestützte Suche und alle Partner
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-8 shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            KI-Suche
          </CardTitle>
          <CardDescription>
            Beschreiben Sie einfach, was Sie suchen - z.B. "CNC-Fräsdienstleister in Bayern" oder "Bio-zertifizierte Lebensmittellieferanten"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Was suchen Sie? Beschreiben Sie Ihren idealen Partner..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !aiSearching && handleAISearch()}
              disabled={aiSearching}
              className="flex-1 text-lg h-14"
            />
            <Button
              onClick={handleAISearch}
              disabled={aiSearching || !aiQuery.trim()}
              size="lg"
              className="px-8"
            >
              {aiSearching ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Suche...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Suchen
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Results */}
      {hasSearched && aiResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">KI-Suchergebnisse</h2>
          <div className="grid gap-4">
            {aiResults.map((company) => (
              <Card
                key={company.id}
                className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/partner/${company.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {company.company_name}
                        </CardTitle>
                        {company.verification_status === 'verified' && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                        <Badge className="ml-auto" variant={company.ai_score >= 80 ? "default" : "secondary"}>
                          {company.ai_score}% Match
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-primary mb-3 bg-primary/10 rounded-lg px-3 py-2">
                        <Sparkles className="h-4 w-4" />
                        <p className="italic">{company.ai_reason}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 mb-4">{company.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{company.industry}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{company.city}, {company.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{company.company_size}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations (only if no search) */}
      {!hasSearched && <AIRecommendations />}

      {/* Filter Section */}
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Suche nach Unternehmen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

      {/* All Partners */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Alle Partner ({filteredProfiles.length})</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <Card
            key={profile.id}
            className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => navigate(`/partner/${profile.id}`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                {profile.company_name}
                {profile.verification_status === "verified" && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {profile.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{profile.industry}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.city}, {profile.country}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>{profile.company_size}</span>
                </div>
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
  );
};

export default Search;

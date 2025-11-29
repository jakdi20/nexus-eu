import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremiumStatus } from "@/hooks/use-premium-status";
import { PremiumGate } from "@/components/PremiumGate";
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
  company_description: string;
  industry: string[];
  country: string;
  city: string;
  company_size: string;
  cooperation_type: string[];
  offers: string;
  looking_for: string;
  website: string;
  verified: boolean;
  verification_status: string;
  founded_year: number;
  is_sponsored: boolean;
  sponsored_until: string;
}

interface AISearchResult {
  id: string;
  company_name: string;
  company_description: string;
  industry: string[];
  country: string;
  city: string;
  company_size: string;
  cooperation_type: string[];
  offers: string;
  looking_for: string;
  verification_status: string;
  ai_score: number;
  ai_reason: string;
}

const Search = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
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
        title: t("common.error"),
        description: t("company.loadError"),
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
          p.company_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.industry?.some(ind => ind.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (industryFilter !== "all") {
      filtered = filtered.filter((p) => p.industry?.includes(industryFilter));
    }

    if (countryFilter !== "all") {
      filtered = filtered.filter((p) => p.country === countryFilter);
    }

    // Sort: sponsored first, then regular
    filtered.sort((a, b) => {
      const aSponsored = a.is_sponsored && a.sponsored_until && new Date(a.sponsored_until) > new Date();
      const bSponsored = b.is_sponsored && b.sponsored_until && new Date(b.sponsored_until) > new Date();
      
      if (aSponsored && !bSponsored) return -1;
      if (!aSponsored && bSponsored) return 1;
      return 0;
    });

    setFilteredProfiles(filtered);
  };

  const handleAISearch = async () => {
    if (!isPremium) {
      toast({
        title: t("monetization.upgradeRequired"),
        description: t("monetization.upgradeToUnlock"),
        variant: "destructive",
      });
      return;
    }

    if (!aiQuery.trim()) {
      toast({
        title: t("search.inputRequired"),
        description: t("search.enterQuery"),
        variant: "destructive",
      });
      return;
    }

    setAiSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-partner-search', {
        body: { query: aiQuery, language }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAiResults(data.results || []);

      if (data.results?.length === 0) {
        toast({
          title: t("common.noResults"),
          description: t("search.tryAgain"),
        });
      } else {
        toast({
          title: t("search.searchComplete"),
          description: `${data.results.length} ${t("search.companiesFound")}`,
        });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: t("search.searchError"),
        description: error.message || t("search.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setAiSearching(false);
    }
  };

  const uniqueIndustries = Array.from(
    new Set(profiles.flatMap((p) => p.industry || []))
  ).sort();
  const uniqueCountries = Array.from(new Set(profiles.map((p) => p.country))).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t("search.loadingPartners")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t("search.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("search.aiSupported")}
            </p>
          </div>
        </div>
      </div>

      <PremiumGate 
        isPremium={isPremium} 
        feature={t("monetization.premiumFeature1")}
        className="mb-8"
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {t("search.aiSearch")}
            </CardTitle>
            <CardDescription>
              {t("search.aiPlaceholder")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder={t("search.placeholder")}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !aiSearching && handleAISearch()}
                disabled={aiSearching || !isPremium}
                className="flex-1 text-lg h-14"
              />
              <Button
                onClick={handleAISearch}
                disabled={aiSearching || !aiQuery.trim() || !isPremium}
                size="lg"
                className="px-8"
              >
                {aiSearching ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("search.searching")}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {t("common.search")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PremiumGate>

      {/* AI Results */}
      {hasSearched && aiResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t("search.aiResults")}</h2>
          <div className="grid gap-4">
            {aiResults.map((company) => (
              <Card
                key={company.id}
                className="hover:shadow-glow transition-all duration-300 cursor-pointer group"
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
                          {company.ai_score}% {t("search.match")}
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
                  <p className="text-muted-foreground line-clamp-2 mb-4">{company.company_description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{company.industry?.join(", ")}</span>
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
      {!hasSearched && (
        <PremiumGate 
          isPremium={isPremium} 
          feature={t("monetization.premiumFeature2")}
          className="mb-8"
        >
          <AIRecommendations />
        </PremiumGate>
      )}

      {/* Filter Section */}
      <Card className="mb-8 shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            {t("common.filter")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder={t("search.searchCompanies")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("company.industry")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("company.allIndustries")}</SelectItem>
                {uniqueIndustries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("company.country")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("company.allCountries")}</SelectItem>
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
        <h2 className="text-2xl font-bold">{t("search.allPartners")} ({filteredProfiles.length})</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => {
          const isSponsored = profile.is_sponsored && profile.sponsored_until && new Date(profile.sponsored_until) > new Date();
          
          return (
            <Card
              key={profile.id}
              className={`hover:shadow-glow transition-all duration-300 cursor-pointer group ${
                isSponsored ? 'border-primary border-2' : ''
              }`}
              onClick={() => navigate(`/partner/${profile.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                    {profile.company_name}
                    {profile.verification_status === "verified" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </CardTitle>
                  {isSponsored && (
                    <Badge variant="default" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {t("monetization.sponsored")}
                    </Badge>
                  )}
                </div>
              <CardDescription className="line-clamp-2">
                {profile.company_description || t("common.noDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{profile.industry?.join(", ")}</span>
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
                {t("common.viewProfile")}
              </Button>
            </CardFooter>
          </Card>
        );
        })}
      </div>

      {filteredProfiles.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground text-lg">
              {t("search.noResults")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Search;

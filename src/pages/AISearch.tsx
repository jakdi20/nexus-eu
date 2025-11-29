import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Search, 
  Loader2, 
  MapPin, 
  Building2,
  TrendingUp,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

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

const AISearch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AISearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Eingabe erforderlich",
        description: "Bitte geben Sie eine Suchanfrage ein",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-partner-search', {
        body: { query }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results || []);

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
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !searching) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-glow">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                KI-Partnersuche
              </h1>
              <p className="text-muted-foreground mt-1">
                Beschreiben Sie einfach, was Sie suchen
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-8 shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Intelligente Suche
            </CardTitle>
            <CardDescription>
              Nutzen Sie natürliche Sprache, z.B. "Ich suche einen Lieferanten für CNC-Teile in Deutschland" 
              oder "Vertriebspartner für Bio-Lebensmittel in Frankreich gesucht"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Was suchen Sie? Beschreiben Sie Ihren idealen Partner..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={searching}
                className="flex-1 text-lg h-14"
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !query.trim()}
                size="lg"
                className="px-8"
              >
                {searching ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Suche läuft...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Suchen
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <p className="text-sm text-muted-foreground w-full mb-2">Beispiele:</p>
              {[
                "CNC-Fräsdienstleister in Bayern",
                "Bio-zertifizierte Lebensmittellieferanten",
                "Logistikpartner für Exportgeschäft",
                "IT-Dienstleister für Cloud-Migration"
              ].map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(example)}
                  disabled={searching}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {searching && (
          <Card className="text-center py-12">
            <CardContent>
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">KI analysiert Ihre Anfrage...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Durchsuche Unternehmensdatenbank und bewerte Übereinstimmungen
              </p>
            </CardContent>
          </Card>
        )}

        {!searching && hasSearched && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {results.length} Ergebnisse gefunden
              </h2>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Sortiert nach KI-Match-Score
              </Badge>
            </div>

            <div className="grid gap-4">
              {results.map((company) => (
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
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                          <Badge 
                            className="ml-auto"
                            variant={company.ai_score >= 80 ? "default" : "secondary"}
                          >
                            {company.ai_score}% Match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-primary mb-3 bg-primary/10 rounded-lg px-3 py-2">
                          <Sparkles className="h-4 w-4 flex-shrink-0" />
                          <p className="italic">{company.ai_reason}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground line-clamp-2">
                        {company.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{company.industry}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{company.city}, {company.country}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{company.company_size}</span>
                        </div>
                      </div>

                      {company.offers && company.offers.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Bietet an:</p>
                          <div className="flex flex-wrap gap-2">
                            {company.offers.slice(0, 4).map((offer, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {offer}
                              </Badge>
                            ))}
                            {company.offers.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{company.offers.length - 4} mehr
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!searching && hasSearched && results.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Keine passenden Unternehmen gefunden</p>
              <p className="text-sm text-muted-foreground">
                Versuchen Sie eine andere Suchanfrage oder passen Sie Ihre Kriterien an
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AISearch;
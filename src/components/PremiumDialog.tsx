import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, TrendingUp, Search, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  isPremium: boolean;
  isSponsored: boolean;
  sponsoredUntil: string | null;
  onUpdate: () => void;
}

export const PremiumDialog = ({
  open,
  onOpenChange,
  companyId,
  isPremium,
  isSponsored,
  sponsoredUntil,
  onUpdate,
}: PremiumDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (type: "premium" | "sponsored") => {
    setLoading(true);
    try {
      const amount = type === "premium" ? 49.99 : 99.99;
      
      const updates: any = {};
      if (type === "premium") {
        updates.is_premium = true;
      } else {
        updates.is_sponsored = true;
        const sponsoredDate = new Date();
        sponsoredDate.setMonth(sponsoredDate.getMonth() + 1);
        updates.sponsored_until = sponsoredDate.toISOString();
      }

      const { error: profileError } = await supabase
        .from("company_profiles")
        .update(updates)
        .eq("id", companyId);

      if (profileError) throw profileError;

      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          company_id: companyId,
          type: type,
          amount: amount,
          status: "completed",
          expires_at: type === "sponsored" ? updates.sponsored_until : null,
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Erfolgreich!",
        description: `${type === "premium" ? "Premium" : "Sponsored"} Paket wurde aktiviert.`,
      });

      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error purchasing:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Kauf konnte nicht abgeschlossen werden.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">Erweitern Sie Ihre Reichweite</DialogTitle>
          <DialogDescription className="text-lg">
            Wählen Sie das passende Paket für Ihr Unternehmen
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {/* Premium Package */}
          <Card className="relative border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Premium
                </Badge>
                {isPremium && (
                  <Badge variant="default">Aktiv</Badge>
                )}
              </div>
              <CardTitle className="text-2xl">Premium Features</CardTitle>
              <CardDescription>Erweiterte Funktionen für mehr Erfolg</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-3xl font-bold">
                49,99€
                <span className="text-lg font-normal text-muted-foreground">/Monat</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">KI-gestützte Partnersuche</p>
                    <p className="text-sm text-muted-foreground">
                      Intelligente Algorithmen finden die perfekten Partner für Ihr Unternehmen
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Erweiterte Suchfilter</p>
                    <p className="text-sm text-muted-foreground">
                      Finden Sie gezielt die richtigen Kooperationspartner mit detaillierten Filtern
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Detaillierte Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Insights über Profilbesuche, Partneranfragen und Erfolgsmetriken
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Prioritäts-Support</p>
                    <p className="text-sm text-muted-foreground">
                      Bevorzugte Bearbeitung Ihrer Anfragen durch unser Support-Team
                    </p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => handlePurchase("premium")}
                disabled={isPremium || loading}
              >
                {isPremium ? "Bereits aktiv" : "Premium aktivieren"}
              </Button>
            </CardContent>
          </Card>

          {/* Sponsored Package */}
          <Card className="relative border-2 border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Sponsored
                </Badge>
                {isSponsored && (
                  <Badge variant="default">
                    Aktiv bis {new Date(sponsoredUntil!).toLocaleDateString('de-DE')}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">Sponsored Listing</CardTitle>
              <CardDescription>Maximale Sichtbarkeit für Ihr Unternehmen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-3xl font-bold">
                99,99€
                <span className="text-lg font-normal text-muted-foreground">/Monat</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Top-Platzierung in Suchergebnissen</p>
                    <p className="text-sm text-muted-foreground">
                      Ihr Profil erscheint ganz oben in allen relevanten Suchergebnissen
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Hervorgehobenes Profil-Badge</p>
                    <p className="text-sm text-muted-foreground">
                      Spezielles "Sponsored"-Badge für erhöhte Aufmerksamkeit und Vertrauen
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Homepage-Feature</p>
                    <p className="text-sm text-muted-foreground">
                      Prominente Darstellung auf der Startseite für maximale Reichweite
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Alle Premium-Features inklusive</p>
                    <p className="text-sm text-muted-foreground">
                      KI-Suche, erweiterte Filter, Analytics und Prioritäts-Support
                    </p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                variant="secondary"
                onClick={() => handlePurchase("sponsored")}
                disabled={isSponsored || loading}
              >
                {isSponsored ? "Bereits aktiv" : "Sponsored werden"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Tipp:</strong> Beide Pakete sind monatlich kündbar und werden automatisch verlängert.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

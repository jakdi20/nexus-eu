import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MonetizationCardProps {
  companyId: string;
  isPremium: boolean;
  isSponsored: boolean;
  sponsoredUntil?: string;
  onUpdate: () => void;
}

export const MonetizationCard = ({ 
  companyId, 
  isPremium, 
  isSponsored, 
  sponsoredUntil,
  onUpdate 
}: MonetizationCardProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handlePremiumUpgrade = async () => {
    setProcessing(true);
    try {
      // Simulate payment
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update company profile
      const { error: updateError } = await supabase
        .from("company_profiles")
        .update({ is_premium: true })
        .eq("id", companyId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          company_id: companyId,
          type: "premium",
          amount: 49.00,
          status: "completed",
        });

      if (transactionError) throw transactionError;

      toast({
        title: t("monetization.paymentSuccess"),
        description: t("monetization.premiumActivated"),
      });

      setPremiumDialogOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error("Premium upgrade error:", error);
      toast({
        variant: "destructive",
        title: t("monetization.paymentError"),
        description: error.message,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAdPurchase = async () => {
    setProcessing(true);
    try {
      // Simulate payment
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const sponsoredUntilDate = new Date();
      sponsoredUntilDate.setDate(sponsoredUntilDate.getDate() + 30);

      // Update company profile
      const { error: updateError } = await supabase
        .from("company_profiles")
        .update({ 
          is_sponsored: true,
          sponsored_until: sponsoredUntilDate.toISOString(),
        })
        .eq("id", companyId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          company_id: companyId,
          type: "sponsored",
          amount: 99.00,
          status: "completed",
          expires_at: sponsoredUntilDate.toISOString(),
        });

      if (transactionError) throw transactionError;

      toast({
        title: t("monetization.paymentSuccess"),
        description: t("monetization.adActivated"),
      });

      setAdDialogOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error("Ad purchase error:", error);
      toast({
        variant: "destructive",
        title: t("monetization.paymentError"),
        description: error.message,
      });
    } finally {
      setProcessing(false);
    }
  };

  const isSponsoredActive = isSponsored && sponsoredUntil && new Date(sponsoredUntil) > new Date();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("monetization.premium")} & {t("monetization.sponsored")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("monetization.premium")}</p>
              <p className="text-sm text-muted-foreground">{t("monetization.premiumPrice")}</p>
            </div>
            {isPremium ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                {t("monetization.premium")}
              </Badge>
            ) : (
              <Button onClick={() => setPremiumDialogOpen(true)} size="sm">
                {t("monetization.upgradePremium")}
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("monetization.sponsored")}</p>
              <p className="text-sm text-muted-foreground">{t("monetization.adPrice")}</p>
            </div>
            {isSponsoredActive ? (
              <Badge variant="default" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {t("monetization.sponsored")}
              </Badge>
            ) : (
              <Button onClick={() => setAdDialogOpen(true)} size="sm">
                {t("monetization.purchaseAd")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Premium Dialog */}
      <Dialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("monetization.premiumTitle")}</DialogTitle>
            <DialogDescription>{t("monetization.premiumDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t("monetization.premiumFeatures")}</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">{t("monetization.premiumFeature1")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">{t("monetization.premiumFeature2")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">{t("monetization.premiumFeature3")}</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t">
              <p className="text-2xl font-bold mb-4">{t("monetization.premiumPrice")}</p>
              <Button 
                onClick={handlePremiumUpgrade} 
                disabled={processing}
                className="w-full"
              >
                {processing ? t("common.loading") : t("monetization.simulatePayment")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad Dialog */}
      <Dialog open={adDialogOpen} onOpenChange={setAdDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("monetization.adTitle")}</DialogTitle>
            <DialogDescription>{t("monetization.adDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t("monetization.adFeatures")}</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">{t("monetization.adFeature1")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">{t("monetization.adFeature2")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">{t("monetization.adFeature3")}</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t">
              <p className="text-2xl font-bold mb-4">{t("monetization.adPrice")}</p>
              <Button 
                onClick={handleAdPurchase} 
                disabled={processing}
                className="w-full"
              >
                {processing ? t("common.loading") : t("monetization.simulatePayment")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
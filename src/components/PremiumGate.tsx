import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface PremiumGateProps {
  children: ReactNode;
  isPremium: boolean;
  feature: string;
  className?: string;
}

export const PremiumGate = ({ children, isPremium, feature, className }: PremiumGateProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className || ''}`}>
      <div className="opacity-30 pointer-events-none grayscale blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="max-w-md border-2 border-primary shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle>{t('monetization.upgradeRequired')}</CardTitle>
            <CardDescription className="text-base">
              {t('monetization.upgradeToUnlock')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">Premium-Feature:</p>
              <p className="font-semibold">{feature}</p>
            </div>
            <Button 
              onClick={() => navigate('/company')} 
              className="w-full"
              size="lg"
            >
              {t('monetization.upgradePremium')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

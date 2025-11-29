import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface AnalyticsWidgetProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isPremium?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
}

export const AnalyticsWidget = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  isPremium = false,
  isLocked = false,
  onClick,
}: AnalyticsWidgetProps) => {
  return (
    <Card 
      className={`relative ${onClick ? 'cursor-pointer hover:shadow-glow transition-all duration-200 hover:scale-[1.02]' : ''} ${isLocked ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      {isLocked && (
        <div className="absolute top-3 right-3 z-10">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      {isPremium && !isLocked && (
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="text-xs">Premium</Badge>
        </div>
      )}
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs. letzte Periode
            </div>
          )}
          {onClick && !isLocked && (
            <p className="text-xs text-primary mt-2">Klicken für Details →</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

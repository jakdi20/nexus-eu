import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, TrendingUp, MapPin, Building2, Loader2, CheckCircle2 } from 'lucide-react';

interface Recommendation {
  company_id: string;
  company_name: string;
  reason: string;
  match_score: number;
  industry: string;
  city: string;
  country: string;
  company_size: string;
  partnership_types: string[];
  verified: boolean;
}

export default function AIRecommendations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('ai-partner-recommendations');

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setRecommendations(data?.recommendations || []);
    } catch (err: any) {
      console.error('Error loading recommendations:', err);
      setError(err.message || 'Error loading recommendations');
      
      if (err.message?.includes('Rate limit')) {
        toast({
          title: 'Rate Limit Reached',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      } else if (err.message?.includes('Payment required')) {
        toast({
          title: 'Credits Required',
          description: 'Please add credits to your workspace.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Could not load AI recommendations.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-8 border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Recommendations</CardTitle>
          </div>
          <CardDescription>
            Our AI analyzes your profile for personalized partner suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">AI is analyzing matching partners...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <Card className="mb-8 border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadRecommendations} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 border-primary/20 shadow-lg bg-gradient-to-br from-card to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle>AI Recommendations for You</CardTitle>
          </div>
          <Button onClick={loadRecommendations} variant="ghost" size="sm">
            Refresh
          </Button>
        </div>
        <CardDescription>
          Based on your profile and activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <Card
              key={rec.company_id}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50"
              onClick={() => navigate(`/partner/${rec.company_id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <Badge 
                        className="text-xs bg-gradient-to-r from-primary to-primary/60"
                      >
                        {rec.match_score}% Match
                      </Badge>
                    </div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors flex items-center gap-2">
                      {rec.company_name}
                      {rec.verified && (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {rec.reason}
                </p>
                
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{rec.industry}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{rec.city}, {rec.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 flex-shrink-0" />
                    <span>{rec.company_size}</span>
                  </div>
                </div>

                {rec.partnership_types && rec.partnership_types.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {rec.partnership_types.slice(0, 2).map((type, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

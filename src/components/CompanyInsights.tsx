import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MapPin, TrendingUp, Users, Calendar } from "lucide-react";

interface CompanyInsightsProps {
  companyId: string;
}

interface VisitByDay {
  date: string;
  visits: number;
}

interface PartnerByLocation {
  location: string;
  count: number;
}

export const CompanyInsights = ({ companyId }: CompanyInsightsProps) => {
  const [loading, setLoading] = useState(true);
  const [visitsByDay, setVisitsByDay] = useState<VisitByDay[]>([]);
  const [partnersByCountry, setPartnersByCountry] = useState<PartnerByLocation[]>([]);
  const [partnersByCity, setPartnersByCity] = useState<PartnerByLocation[]>([]);
  const [totalPartners, setTotalPartners] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

  useEffect(() => {
    loadInsights();
  }, [companyId]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      // Get visits by day for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: visitsData } = await supabase
        .from("profile_visits")
        .select("visited_at, visitor_country, visitor_city")
        .eq("company_id", companyId)
        .gte("visited_at", thirtyDaysAgo.toISOString())
        .order("visited_at", { ascending: true });

      // Process visits by day
      const visitsByDayMap = new Map<string, number>();
      const countryMap = new Map<string, number>();
      const cityMap = new Map<string, number>();

      visitsData?.forEach((visit) => {
        const date = new Date(visit.visited_at).toLocaleDateString('de-DE', { 
          day: '2-digit', 
          month: '2-digit' 
        });
        visitsByDayMap.set(date, (visitsByDayMap.get(date) || 0) + 1);

        if (visit.visitor_country) {
          countryMap.set(visit.visitor_country, (countryMap.get(visit.visitor_country) || 0) + 1);
        }

        if (visit.visitor_city) {
          cityMap.set(visit.visitor_city, (cityMap.get(visit.visitor_city) || 0) + 1);
        }
      });

      setVisitsByDay(
        Array.from(visitsByDayMap.entries())
          .map(([date, visits]) => ({ date, visits }))
      );

      setTotalVisits(visitsData?.length || 0);

      // Get contacted partners with their locations
      const { data: messagesData } = await supabase
        .from("messages")
        .select("to_company_id, company_profiles!messages_to_company_id_fkey(country, city)")
        .eq("from_company_id", companyId);

      const { data: requestsData } = await supabase
        .from("connection_requests")
        .select("to_company_id, company_profiles!connection_requests_to_company_id_fkey(country, city)")
        .eq("from_company_id", companyId);

      const partnersCountryMap = new Map<string, number>();
      const partnersCityMap = new Map<string, number>();

      const processPartnerLocation = (data: any[]) => {
        data?.forEach((item) => {
          const profile = item.company_profiles;
          if (profile?.country) {
            partnersCountryMap.set(profile.country, (partnersCountryMap.get(profile.country) || 0) + 1);
          }
          if (profile?.city) {
            partnersCityMap.set(profile.city, (partnersCityMap.get(profile.city) || 0) + 1);
          }
        });
      };

      processPartnerLocation(messagesData || []);
      processPartnerLocation(requestsData || []);

      const uniquePartners = new Set([
        ...(messagesData?.map(m => m.to_company_id) || []),
        ...(requestsData?.map(r => r.to_company_id) || []),
      ]);

      setTotalPartners(uniquePartners.size);

      setPartnersByCountry(
        Array.from(partnersCountryMap.entries())
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
      );

      setPartnersByCity(
        Array.from(partnersCityMap.entries())
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
      );
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Gesamt Kontakte</p>
                <p className="text-4xl font-bold text-foreground">{totalPartners}</p>
              </div>
              <Users className="h-12 w-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Profilbesuche (30 Tage)</p>
                <p className="text-4xl font-bold text-foreground">{totalVisits}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visits by Day Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Profilbesuche pro Tag</CardTitle>
          </div>
          <CardDescription>Letzte 30 Tage</CardDescription>
        </CardHeader>
        <CardContent>
          {visitsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Besuche"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Keine Daten verfügbar
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partners by Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Partner nach Land</CardTitle>
            </div>
            <CardDescription>Woher kommen Ihre Kontakte?</CardDescription>
          </CardHeader>
          <CardContent>
            {partnersByCountry.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={partnersByCountry} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    dataKey="location" 
                    type="category" 
                    width={100}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Partner" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Keine Partner-Daten verfügbar
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Partner nach Stadt</CardTitle>
            </div>
            <CardDescription>Top Städte Ihrer Kontakte</CardDescription>
          </CardHeader>
          <CardContent>
            {partnersByCity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={partnersByCity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ location, percent }) => `${location} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="count"
                  >
                    {partnersByCity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Keine Stadt-Daten verfügbar
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

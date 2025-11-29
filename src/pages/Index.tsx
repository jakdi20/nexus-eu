import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Globe, TrendingUp, Users, Search, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNEgxNHYtMjFoMjJ2MjF6bTAtNWgtMnYyaC0ydi0ySDIwdjJoLTJ2LTJoLTJ2LTJoMnYtMmgydjJoMTJ2LTJoMnYyaDJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
        
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4" />
              <span>Stärken Sie den europäischen Binnenmarkt</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Europäische KMUs
              <span className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                intelligent vernetzt
              </span>
            </h1>
            
            <p className="mb-10 text-lg text-white/90 md:text-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Beschreiben Sie einfach in natürlicher Sprache, was Sie suchen - unsere KI findet die perfekten Geschäftspartner in ganz Europa. Schnell, präzise und intelligent.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link to="/auth">
                <Button size="lg" className="group bg-white text-primary hover:bg-white/90 shadow-elevated">
                  Jetzt kostenlos starten
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
                Mehr erfahren
              </Button>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "15K+", label: "Unternehmen" },
              { value: "28", label: "EU-Länder" },
              { value: "50K+", label: "Verbindungen" },
              { value: "95%", label: "Match-Rate" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
              Ihr Weg zu neuen <span className="bg-gradient-primary bg-clip-text text-transparent">Partnerschaften</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Intelligente Technologie trifft auf europäische Zusammenarbeit
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "KI-Partnersuche",
                description: "Beschreiben Sie in natürlicher Sprache, was Sie suchen. Unsere KI versteht Ihre Anfrage und findet die besten Matches.",
              },
              {
                icon: <Building2 className="h-8 w-8" />,
                title: "Verifizierte Unternehmen",
                description: "Alle Profile werden geprüft für maximale Sicherheit und Vertrauenswürdigkeit in Ihrer Geschäftsanbahnung.",
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Europaweit vernetzt",
                description: "Zugang zu KMUs aus allen 27 EU-Mitgliedsstaaten plus UK, Norwegen und der Schweiz.",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Vielseitige Partnerschaften",
                description: "Ob Lieferant, Abnehmer oder Kooperationspartner – finden Sie die richtige Art der Zusammenarbeit.",
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Wachstum fördern",
                description: "Erschließen Sie neue Märkte und stärken Sie Ihre Position im europäischen Binnenmarkt.",
              },
              {
                icon: <Search className="h-8 w-8" />,
                title: "Intelligente Suche",
                description: "Stellen Sie Fragen wie 'Ich suche CNC-Fräser in Bayern' - die KI findet automatisch passende Partner.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border bg-gradient-card p-8 shadow-sm transition-all hover:shadow-elevated"
              >
                <div className="mb-4 inline-flex rounded-xl bg-gradient-primary p-3 text-white shadow-glow transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-primary py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0MEgxNHYtMjFoMjJ2MjF6bTAtNWgtMnYyaC0ydi0yaC0xMnYyaC0ydi0yaC0ydi0yaDJ2LTJoMnYyaDEydi0yaDJ2MmgydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
            Bereit für europäische Zusammenarbeit?
          </h2>
          <p className="mb-8 text-lg text-white/90 md:text-xl">
            Werden Sie Teil des führenden B2B-Netzwerks für europäische KMUs
          </p>
          <Link to="/auth">
            <Button size="lg" className="group bg-white text-primary hover:bg-white/90 shadow-elevated">
              Kostenloses Unternehmensprofil erstellen
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 EuroConnect. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
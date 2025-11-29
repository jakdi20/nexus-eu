import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Building2, 
  Search, 
  Sparkles, 
  MessageCircle, 
  Video, 
  Heart,
  Bell,
  Shield,
  Globe,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  Network
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Sparkles className="h-10 w-10" />,
      title: "KI-Partnersuche in natürlicher Sprache",
      description: "Beschreiben Sie einfach, was Sie suchen - ohne komplizierte Filter. Zum Beispiel: 'Ich suche einen Lieferanten für Metallteile in Bayern' oder 'Wer kann mir bei der Expansion nach Italien helfen?'",
      details: [
        "Versteht natürliche Sprache und Kontext",
        "Findet Unternehmen basierend auf Bedürfnissen",
        "Berücksichtigt Branche, Standort und Kooperationstyp",
        "Sofortige, präzise Ergebnisse"
      ],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Network className="h-10 w-10" />,
      title: "Intelligentes Matching-System",
      description: "Unser KI-Algorithmus analysiert Ihr Unternehmensprofil und findet automatisch die besten Partner für Sie - basierend auf komplementären Angeboten, Branchen und Zielen.",
      details: [
        "Automatische Partner-Empfehlungen",
        "Match-Score von 0-100%",
        "Detaillierte Begründungen für jeden Match",
        "Kontinuierliche Aktualisierung"
      ],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Building2 className="h-10 w-10" />,
      title: "Umfassendes Unternehmensprofil",
      description: "Erstellen Sie ein aussagekräftiges Profil, das Ihre Stärken, Angebote und Bedürfnisse klar kommuniziert. Zeigen Sie, was Sie bieten und was Sie suchen.",
      details: [
        "Branchenauswahl (mehrfach möglich)",
        "Angebote und Bedürfnisse als Tags",
        "Unternehmensgröße und Standort",
        "Beschreibung bis 500 Zeichen",
        "Kooperationstypen definieren"
      ],
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <MessageCircle className="h-10 w-10" />,
      title: "Direktnachrichten-System",
      description: "Kommunizieren Sie direkt mit potenziellen Partnern. Tauschen Sie Nachrichten aus, teilen Sie Dokumente und bauen Sie Beziehungen auf.",
      details: [
        "Echtzeit-Nachrichten",
        "Dateianhänge möglich",
        "Ungelesene Nachrichten auf einen Blick",
        "Konversationsverlauf gespeichert"
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Video className="h-10 w-10" />,
      title: "Integrierte Videoanrufe",
      description: "Lernen Sie potenzielle Partner persönlich kennen - direkt in der Plattform. Starten Sie Videogespräche mit einem Klick.",
      details: [
        "Ein-Klick-Videoanrufe",
        "Eingehende Anrufe mit Benachrichtigung",
        "Keine zusätzliche Software nötig",
        "Sichere, verschlüsselte Verbindung"
      ],
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: <Heart className="h-10 w-10" />,
      title: "Partner-Verwaltung",
      description: "Behalten Sie den Überblick über Ihre Geschäftsbeziehungen. Verwalten Sie aktive Partnerschaften und offene Anfragen zentral.",
      details: [
        "Übersicht aller Verbindungen",
        "Eingehende und ausgehende Anfragen",
        "Status-Tracking (ausstehend, akzeptiert)",
        "Schneller Zugriff auf Partner-Profile"
      ],
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: <Bell className="h-10 w-10" />,
      title: "Intelligente Benachrichtigungen",
      description: "Verpassen Sie keine wichtigen Updates. Erhalten Sie Benachrichtigungen über neue Matches, Nachrichten und Verbindungsanfragen.",
      details: [
        "Echtzeit-Benachrichtigungen",
        "Neue Matches und Partner-Empfehlungen",
        "Eingehende Nachrichten und Anfragen",
        "Eingehende Videoanrufe"
      ],
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Verifizierte Unternehmensprofile",
      description: "Vertrauen Sie auf geprüfte Profile. Alle Unternehmen durchlaufen einen Verifikationsprozess für maximale Sicherheit.",
      details: [
        "Manuelle Prüfung aller Profile",
        "Verifikations-Badge für geprüfte Unternehmen",
        "Transparente Unternehmensinformationen",
        "Schutz vor Fake-Profilen"
      ],
      gradient: "from-cyan-500 to-teal-500"
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: "Europaweit vernetzt",
      description: "Erreichen Sie KMUs in allen EU-Mitgliedsstaaten sowie UK, Norwegen und der Schweiz. Expandieren Sie grenzüberschreitend.",
      details: [
        "Alle 27 EU-Länder abgedeckt",
        "Plus UK, Norwegen, Schweiz",
        "Mehrsprachige Plattform",
        "Lokale und internationale Partner"
      ],
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Vielseitige Kooperationstypen",
      description: "Definieren Sie, welche Art von Partnerschaft Sie suchen - von Technologiepartnern über Lieferanten bis zu Pilotcustomern.",
      details: [
        "Technologie-Partner",
        "Vertriebs-Partner",
        "Projekt-Partner",
        "Lieferant/Abnehmer",
        "Pilotcustomer"
      ],
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: <TrendingUp className="h-10 w-10" />,
      title: "Wachstum fördern",
      description: "Nutzen Sie die Plattform, um neue Märkte zu erschließen, Ihre Reichweite zu erhöhen und Ihr Geschäft nachhaltig auszubauen.",
      details: [
        "Neue Märkte erschließen",
        "Umsatz steigern",
        "Netzwerk ausbauen",
        "Innovationen durch Kooperationen"
      ],
      gradient: "from-green-500 to-lime-500"
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Schnell & Effizient",
      description: "Sparen Sie Zeit bei der Partnersuche. Was früher Wochen dauerte, erledigen Sie jetzt in Minuten - dank KI und intelligenter Automatisierung.",
      details: [
        "Sofortige Suchergebnisse",
        "Automatische Empfehlungen",
        "Effiziente Kommunikation",
        "Zeitsparende Prozesse"
      ],
      gradient: "from-yellow-500 to-amber-500"
    }
  ];

  const stats = [
    { value: "15K+", label: "Registrierte Unternehmen" },
    { value: "28", label: "Europäische Länder" },
    { value: "50K+", label: "Erfolgreiche Verbindungen" },
    { value: "95%", label: "Zufriedene Nutzer" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-foreground">EuroConnect</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost">Zurück</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-primary text-white hover:opacity-90">
                  Jetzt starten
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0MEgxNHYtMjFoMjJ2MjF6bTAtNWgtMnYyaC0ydi0yaC0xMnYyaC0ydi0yaC0ydi0yaDJ2LTJoMnYyaDEydi0yaDJ2MmgydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
            Alle Funktionen im Überblick
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/90 md:text-xl">
            Entdecken Sie, wie EuroConnect Ihre Geschäftsentwicklung in Europa revolutioniert
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:gap-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group rounded-3xl border border-border bg-gradient-card p-8 md:p-12 shadow-sm transition-all hover:shadow-elevated ${
                  index % 2 === 0 ? 'lg:ml-0' : 'lg:ml-auto lg:max-w-5xl'
                }`}
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                  <div className={`inline-flex shrink-0 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 text-white shadow-glow transition-transform group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
                      {feature.title}
                    </h3>
                    <p className="mb-6 text-lg text-muted-foreground">
                      {feature.description}
                    </p>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      {feature.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="text-sm text-foreground">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
              So funktioniert's
            </h2>
            <p className="text-lg text-muted-foreground">
              In wenigen Schritten zum perfekten Geschäftspartner
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Profil erstellen",
                description: "Registrieren Sie sich kostenlos und erstellen Sie Ihr Unternehmensprofil mit allen wichtigen Informationen."
              },
              {
                step: "2",
                title: "Partner finden",
                description: "Beschreiben Sie in natürlicher Sprache, was Sie suchen, oder lassen Sie sich automatisch Matches vorschlagen."
              },
              {
                step: "3",
                title: "Verbindung aufbauen",
                description: "Senden Sie Verbindungsanfragen, chatten Sie mit Partnern und vereinbaren Sie Videoanrufe."
              }
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-2xl font-bold text-white shadow-glow">
                  {item.step}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {i < 2 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full bg-gradient-to-r from-primary to-transparent md:block" />
                )}
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
            Bereit loszulegen?
          </h2>
          <p className="mb-8 text-lg text-white/90 md:text-xl">
            Erstellen Sie jetzt kostenlos Ihr Unternehmensprofil und finden Sie die perfekten Partner
          </p>
          <Link to="/auth">
            <Button size="lg" className="group bg-white text-primary hover:bg-white/90 shadow-elevated">
              Jetzt kostenlos starten
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

export default Features;

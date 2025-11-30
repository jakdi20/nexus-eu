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
import euroConnectLogo from "@/assets/euroconnect-logo.png";

const Features = () => {
  const features = [
    {
      icon: <Sparkles className="h-10 w-10" />,
      title: "AI Partner Search in Natural Language",
      description: "Simply describe what you're looking for - no complicated filters needed. For example: 'Looking for metal parts supplier in Bavaria' or 'Who can help me expand to Italy?'",
      details: [
        "Understands natural language and context",
        "Finds companies based on your needs",
        "Considers industry, location, and partnership type",
        "Instant, precise results"
      ],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Network className="h-10 w-10" />,
      title: "Intelligent Matching System",
      description: "Our AI algorithm analyzes your company profile and automatically finds the best partners for you - based on complementary offerings, industries, and goals.",
      details: [
        "Automatic partner recommendations",
        "Match score from 0-100%",
        "Detailed reasons for each match",
        "Continuous updates"
      ],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Building2 className="h-10 w-10" />,
      title: "Comprehensive Company Profile",
      description: "Create a meaningful profile that clearly communicates your strengths, offerings, and needs. Show what you offer and what you're looking for.",
      details: [
        "Industry selection (multiple possible)",
        "Offerings and needs as tags",
        "Company size and location",
        "Description up to 500 characters",
        "Define partnership types"
      ],
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <MessageCircle className="h-10 w-10" />,
      title: "Direct Messaging System",
      description: "Communicate directly with potential partners. Exchange messages, share documents, and build relationships.",
      details: [
        "Real-time messaging",
        "File attachments supported",
        "Unread messages at a glance",
        "Conversation history saved"
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Video className="h-10 w-10" />,
      title: "Integrated Video Calls",
      description: "Get to know potential partners personally - directly on the platform. Start video conversations with one click.",
      details: [
        "One-click video calls",
        "Incoming calls with notification",
        "No additional software needed",
        "Secure, encrypted connection"
      ],
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: <Heart className="h-10 w-10" />,
      title: "Partner Management",
      description: "Keep track of your business relationships. Manage active partnerships and open requests centrally.",
      details: [
        "Overview of all connections",
        "Incoming and outgoing requests",
        "Status tracking (pending, accepted)",
        "Quick access to partner profiles"
      ],
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: <Bell className="h-10 w-10" />,
      title: "Smart Notifications",
      description: "Never miss important updates. Receive notifications about new matches, messages, and connection requests.",
      details: [
        "Real-time notifications",
        "New matches and partner recommendations",
        "Incoming messages and requests",
        "Incoming video calls"
      ],
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Verified Company Profiles",
      description: "Trust verified profiles. All companies go through a verification process for maximum security.",
      details: [
        "Manual review of all profiles",
        "Verification badge for approved companies",
        "Transparent company information",
        "Protection against fake profiles"
      ],
      gradient: "from-cyan-500 to-teal-500"
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: "Pan-European Network",
      description: "Reach SMEs in all EU member states as well as UK, Norway, and Switzerland. Expand cross-border.",
      details: [
        "All 27 EU countries covered",
        "Plus UK, Norway, Switzerland",
        "Multilingual platform",
        "Local and international partners"
      ],
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Diverse Partnership Types",
      description: "Define what type of partnership you're looking for - from technology partners to suppliers to pilot customers.",
      details: [
        "Technology partners",
        "Distribution partners",
        "Project partners",
        "Supplier/Customer",
        "Pilot customers"
      ],
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: <TrendingUp className="h-10 w-10" />,
      title: "Drive Growth",
      description: "Use the platform to access new markets, increase your reach, and sustainably grow your business.",
      details: [
        "Access new markets",
        "Increase revenue",
        "Expand network",
        "Innovation through partnerships"
      ],
      gradient: "from-green-500 to-lime-500"
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Fast & Efficient",
      description: "Save time in partner search. What used to take weeks, you now complete in minutes - thanks to AI and smart automation.",
      details: [
        "Instant search results",
        "Automatic recommendations",
        "Efficient communication",
        "Time-saving processes"
      ],
      gradient: "from-yellow-500 to-amber-500"
    }
  ];

  const stats = [
    { value: "15K+", label: "Registered Companies" },
    { value: "28", label: "European Countries" },
    { value: "50K+", label: "Successful Connections" },
    { value: "95%", label: "Satisfied Users" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={euroConnectLogo} alt="EuroConnect" className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost">Back</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-primary text-white hover:opacity-90">
                  Get Started
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
            All Features at a Glance
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/90 md:text-xl">
            Discover how EuroConnect revolutionizes your business development in Europe
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
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Find the perfect business partner in just a few steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create Profile",
                description: "Register for free and create your company profile with all important information."
              },
              {
                step: "2",
                title: "Find Partners",
                description: "Describe in natural language what you're looking for, or get automatic match suggestions."
              },
              {
                step: "3",
                title: "Build Connections",
                description: "Send connection requests, chat with partners, and schedule video calls."
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
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-lg text-white/90 md:text-xl">
            Create your company profile for free now and find the perfect partners
          </p>
          <Link to="/auth">
            <Button size="lg" className="group bg-white text-primary hover:bg-white/90 shadow-elevated">
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 EuroConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Features;

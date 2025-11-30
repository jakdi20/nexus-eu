import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Globe, TrendingUp, Users, Search, Sparkles, MessageSquare, Video, CheckCircle2, Star, Zap, Shield, MessageCircle, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import euroConnectLogo from "@/assets/euroconnect-logo.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/company");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="relative z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <img src={euroConnectLogo} alt="EuroConnect" className="h-10 w-auto" />
            </div>
            <Link to="/auth">
              <Button variant="default" className="shadow-sm">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNEgxNHYtMjFoMjJ2MjF6bTAtNWgtMnYyaC0ydi0ySDIwdjJoLTJ2LTJoLTJ2LTJoMnYtMmgydjJoMTJ2LTJoMnYyaDJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
        
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4" />
              <span>Powering the European Single Market</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Connect European SMEs
              <span className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                with AI Intelligence
              </span>
            </h1>
            
            <p className="mb-10 text-lg text-white/90 md:text-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Simply describe what you're looking for in natural language - our AI finds the perfect business partners across Europe. Fast, precise, and intelligent.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link to="/auth">
                <Button size="lg" className="group bg-white text-primary hover:bg-white/90 shadow-elevated">
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
                  Learn More
                </Button>
              </Link>
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
              { value: "15K+", label: "Companies" },
              { value: "28", label: "EU Countries" },
              { value: "50K+", label: "Connections" },
              { value: "95%", label: "Match Rate" },
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
              Everything you need to <span className="bg-gradient-primary bg-clip-text text-transparent">grow your business</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed for European SMEs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "AI-Powered Search",
                description: "Describe what you're looking for in natural language. Our AI understands your needs and finds the best matches instantly.",
              },
              {
                icon: <MessageSquare className="h-8 w-8" />,
                title: "Real-Time Messaging",
                description: "Connect with partners instantly. Secure messaging with file sharing, read receipts, and notification system.",
              },
              {
                icon: <Video className="h-8 w-8" />,
                title: "Video Calls",
                description: "Built-in video conferencing. Meet partners face-to-face without leaving the platform.",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Verified Companies",
                description: "All profiles are verified for maximum security and trustworthiness in your business connections.",
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Pan-European Network",
                description: "Access to SMEs across all 27 EU member states plus UK, Norway, and Switzerland.",
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Smart Recommendations",
                description: "AI-powered partner suggestions based on your profile, industry, and business goals.",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Partnership Types",
                description: "Find suppliers, buyers, or cooperation partners – discover the right type of collaboration.",
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: "Premium Visibility",
                description: "Boost your profile with premium features. Get 3x more visibility and priority placement.",
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Instant Notifications",
                description: "Never miss an opportunity. Real-time alerts for messages, connection requests, and matches.",
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

      {/* Dashboard Preview Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
              Your <span className="bg-gradient-primary bg-clip-text text-transparent">command center</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Real screenshots from the actual platform
            </p>
          </div>

          <div className="space-y-12">
            {/* AI Search Preview - Full Width */}
            <div className="max-w-5xl mx-auto">
              <div className="mb-6 text-center">
                <Badge className="mb-3 bg-gradient-primary text-white">AI-Powered Search</Badge>
                <h3 className="text-2xl font-bold mb-2">Ask in Natural Language</h3>
                <p className="text-muted-foreground">Describe what you're looking for and let AI find the perfect matches</p>
              </div>
              <Card className="overflow-hidden shadow-2xl border-2">
                <div className="bg-gradient-card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-foreground">AI Search</div>
                      <div className="text-sm text-muted-foreground">Natural language query</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-lg p-6 mb-6 border border-border shadow-sm">
                    <div className="flex gap-4">
                      <div className="flex-1 bg-muted/30 rounded-lg px-5 py-4 text-base text-muted-foreground border border-border/50 flex items-center">
                        "Looking for plastic injection molding suppliers in Bavaria with ISO certification"
                      </div>
                      <Button size="lg" className="gap-2 shadow-md px-8">
                        <Sparkles className="h-5 w-5" />
                        Search
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: "BayerPlast GmbH", score: 95, reason: "Perfect match: ISO 9001 certified, specializes in precision molding, based in Munich" },
                      { name: "Alpine Polymers", score: 88, reason: "Strong fit: Large production capacity, automotive grade quality, Augsburg location" },
                      { name: "Süd Kunststoffe", score: 82, reason: "Good match: 20+ years experience, full quality certifications, competitive pricing" }
                    ].map((result, i) => (
                      <div key={i} className="bg-background rounded-xl p-5 border border-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-md">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-1">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold text-base group-hover:text-primary transition-colors">{result.name}</span>
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                          <Badge variant={result.score >= 90 ? "default" : "secondary"} className="gap-1 px-3 py-1">
                            <Sparkles className="h-3.5 w-3.5" />
                            {result.score}% Match
                          </Badge>
                        </div>
                        <div className="flex items-start gap-2 text-sm bg-primary/5 rounded-lg px-4 py-3 border border-primary/10">
                          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground italic leading-relaxed">{result.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Two Column Features */}
            <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
              {/* Messages Preview */}
              <div>
                <div className="mb-6">
                  <Badge className="mb-3 bg-accent/10 text-accent">Messaging Hub</Badge>
                  <h3 className="text-2xl font-bold mb-2">Real-Time Communication</h3>
                  <p className="text-muted-foreground">Secure messaging with video calls and file sharing</p>
                </div>
                <Card className="overflow-hidden shadow-xl">
                  <div className="bg-gradient-card">
                    <div className="border-b border-border p-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        <span>Messages</span>
                        <Badge className="ml-auto bg-primary">3</Badge>
                      </div>
                    </div>
                    <div className="p-4 space-y-2 bg-background/50">
                      {[
                        { name: "TechCorp Solutions", msg: "When can we schedule a demo?", time: "2m", unread: 2, video: true },
                        { name: "Nordic Innovations", msg: "Contract proposal attached", time: "15m", unread: 1, video: false },
                        { name: "Mediterranean Trade Co", msg: "Thank you for the samples!", time: "1h", unread: 0, video: true },
                        { name: "Baltic Manufacturing", msg: "Pricing looks good, let's proceed", time: "2h", unread: 0, video: false },
                      ].map((conv, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${conv.unread ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'} hover:border-primary/40 transition-all cursor-pointer group`}>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-medium truncate ${conv.unread ? 'text-foreground' : 'text-foreground/80'}`}>
                                  {conv.name}
                                </span>
                                {conv.unread > 0 && (
                                  <Badge className="h-5 px-2 text-xs bg-primary">{conv.unread}</Badge>
                                )}
                              </div>
                              <p className={`text-xs truncate ${conv.unread ? 'text-foreground/80 font-medium' : 'text-muted-foreground'}`}>
                                {conv.msg}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-muted-foreground">{conv.time}</span>
                              {conv.video && (
                                <Video className="h-3.5 w-3.5 text-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Dashboard Stats */}
              <div>
                <div className="mb-6">
                  <Badge className="mb-3 bg-green-500/10 text-green-600">Analytics Dashboard</Badge>
                  <h3 className="text-2xl font-bold mb-2">Track Your Growth</h3>
                  <p className="text-muted-foreground">Real-time insights into your profile performance</p>
                </div>
                <Card className="overflow-hidden shadow-xl">
                  <div className="bg-gradient-card p-6 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Profile Views</span>
                        </div>
                        <div className="text-2xl font-bold text-primary">1,847</div>
                        <div className="text-xs text-green-600 mt-1">↑ 23% this month</div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Connections</span>
                        </div>
                        <div className="text-2xl font-bold text-primary">42</div>
                        <div className="text-xs text-green-600 mt-1">↑ 12% this week</div>
                      </div>
                    </div>

                    {/* Visitor Countries */}
                    <div className="bg-background/50 rounded-lg p-4 border border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Visitor Origins</span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { country: "Germany", flag: "🇩🇪", percent: 48 },
                          { country: "France", flag: "🇫🇷", percent: 28 },
                          { country: "Italy", flag: "🇮🇹", percent: 14 },
                          { country: "Others", flag: "🌍", percent: 10 },
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="flex items-center gap-1.5">
                                <span className="text-base">{item.flag}</span>
                                <span className="text-muted-foreground">{item.country}</span>
                              </span>
                              <span className="font-medium">{item.percent}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-primary transition-all duration-500" 
                                style={{ width: `${item.percent}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-background/50 rounded-lg p-4 border border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Recent Activity</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { action: "Profile viewed", company: "Alpine Tech", time: "5m ago" },
                          { action: "New connection", company: "Baltic Trade", time: "23m ago" },
                          { action: "Message received", company: "Nordic Solutions", time: "1h ago" },
                        ].map((activity, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                            <div className="flex-1">
                              <span className="text-foreground font-medium">{activity.action}</span>
                              <span className="text-muted-foreground"> from {activity.company}</span>
                            </div>
                            <span className="text-muted-foreground">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
              Simple, <span className="bg-gradient-primary bg-clip-text text-transparent">transparent pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your business needs
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 bg-gradient-card border-border">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">Free</span>
                </div>
                <p className="text-muted-foreground">Perfect for getting started</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Basic company profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">AI partner search</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Send connection requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Messaging & video calls</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Up to 10 connections</span>
                </li>
              </ul>
              <Link to="/auth" className="block">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </Card>

            {/* Premium Plan */}
            <Card className="p-8 bg-gradient-primary text-white border-primary shadow-elevated relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-primary">Most Popular</Badge>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">€49</span>
                  <span className="text-white/80">/month</span>
                </div>
                <p className="text-white/90">For growing businesses</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Everything in Starter</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Premium badge on profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unlimited connections</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">3x more profile visibility</span>
                </li>
              </ul>
              <Link to="/auth" className="block">
                <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                  Start Premium
                </Button>
              </Link>
            </Card>

            {/* Sponsored Plan */}
            <Card className="p-8 bg-gradient-card border-border">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Sponsored</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">€99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">Maximum visibility</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Everything in Premium</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Sponsored badge</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Top placement in searches</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Featured on homepage</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">10x more visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Dedicated account manager</span>
                </li>
              </ul>
              <Link to="/auth" className="block">
                <Button className="w-full">
                  Get Sponsored
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-primary py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0MEgxNHYtMjFoMjJ2MjF6bTAtNWgtMnYyaC0ydi0yaC0xMnYyaC0ydi0yaC0ydi0yaDJ2LTJoMnYyaDEydi0yaDJ2MmgydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
            Ready to grow your business?
          </h2>
          <p className="mb-8 text-lg text-white/90 md:text-xl">
            Join Europe's leading B2B network for SMEs today
          </p>
          <Link to="/auth">
            <Button size="lg" className="group bg-white text-primary hover:bg-white/90 shadow-elevated">
              Create Your Free Profile
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

export default Index;
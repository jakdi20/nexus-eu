import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Globe, TrendingUp, Users, Search, Sparkles, MessageSquare, Video, CheckCircle2, Star, Zap, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
              Everything you need to manage partnerships in one place
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-8 bg-gradient-card">
              <div className="mb-6">
                <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">Dashboard</Badge>
                <h3 className="text-2xl font-bold mb-2">Company Overview</h3>
                <p className="text-muted-foreground">Track your profile performance, visitor analytics, and partnership opportunities at a glance.</p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profile Views</span>
                  <span className="text-2xl font-bold text-primary">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Connection Requests</span>
                  <span className="text-2xl font-bold text-primary">42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Conversations</span>
                  <span className="text-2xl font-bold text-primary">18</span>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card">
              <div className="mb-6">
                <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">AI Search</Badge>
                <h3 className="text-2xl font-bold mb-2">Smart Partner Discovery</h3>
                <p className="text-muted-foreground">Ask questions in natural language and get instant, relevant results powered by AI.</p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Search className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Your search:</p>
                    <p className="text-sm text-muted-foreground italic">"Looking for CNC machining suppliers in Southern Germany"</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Found 23 matching companies</span>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card">
              <div className="mb-6">
                <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20">Messaging</Badge>
                <h3 className="text-2xl font-bold mb-2">Real-Time Communication</h3>
                <p className="text-muted-foreground">Secure messaging with file sharing, video calls, and instant notifications.</p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-6 space-y-3">
                {[
                  { name: "TechCorp GmbH", message: "Looking forward to our partnership!", time: "2m ago", unread: true },
                  { name: "Alpine Solutions", message: "Sample sent via courier", time: "1h ago", unread: false },
                  { name: "Baltic Industries", message: "Can we schedule a call?", time: "3h ago", unread: false },
                ].map((conv, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-accent/5 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{conv.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {conv.unread && <Badge className="h-5 w-5 rounded-full bg-primary p-0 flex items-center justify-center text-[10px]">1</Badge>}
                      <span className="text-xs text-muted-foreground">{conv.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card">
              <div className="mb-6">
                <Badge className="mb-4 bg-green-500/10 text-green-600 hover:bg-green-500/20">Analytics</Badge>
                <h3 className="text-2xl font-bold mb-2">Performance Insights</h3>
                <p className="text-muted-foreground">Understand who's viewing your profile and where your opportunities are coming from.</p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Germany</span>
                      <span className="font-medium">48%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-primary w-[48%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">France</span>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-primary w-[28%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Other</span>
                      <span className="font-medium">24%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-primary w-[24%]" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
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
import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2, Search, MessageCircle, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/company", label: "Mein Unternehmen", icon: Building2 },
    { path: "/search", label: "Partner suchen", icon: Search },
    { path: "/messages", label: "Nachrichten", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-foreground">EuroConnect</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    onClick={() => navigate(item.path)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="hidden md:flex">
                <LogOut className="h-5 w-5" />
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "default" : "ghost"}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start gap-2 w-full"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="justify-start gap-2 w-full text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Abmelden
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;

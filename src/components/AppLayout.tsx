import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2, Search, MessageCircle, LogOut, Menu, X, Users, Languages, Moon, Sun } from "lucide-react";
import euroConnectLogo from "@/assets/euroconnect-logo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
interface AppLayoutProps {
  children: ReactNode;
}
const AppLayout = ({
  children
}: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    unreadCount
  } = useUnreadMessages();
  const {
    language,
    setLanguage,
    t
  } = useLanguage();
  const {
    theme,
    setTheme
  } = useTheme();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: language === "de" ? "Abgemeldet" : "Signed Out",
      description: language === "de" ? "Sie wurden erfolgreich abgemeldet." : "You have been successfully signed out."
    });
    navigate("/");
  };
  const isActive = (path: string) => location.pathname === path;
  const navItems = [{
    path: "/company",
    label: t("nav.company"),
    icon: Building2
  }, {
    path: "/search",
    label: t("nav.search"),
    icon: Search
  }, {
    path: "/messages",
    label: t("nav.messages"),
    icon: MessageCircle
  }];
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => navigate("/company")} className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
              <img alt="EuroConnect" className="h-16 md:h-20 w-auto bg-transparent" src="/lovable-uploads/4a7f5935-7bf9-4b6b-8e09-538bdc1adfdd.png" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map(item => {
              const Icon = item.icon;
              const showBadge = item.path === "/messages" && unreadCount > 0;
              return <Button key={item.path} variant={isActive(item.path) ? "default" : "ghost"} onClick={() => navigate(item.path)} className="gap-2 relative">
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {showBadge && <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>}
                  </Button>;
            })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Languages className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("de")} className={language === "de" ? "bg-muted" : ""}>
                    🇩🇪 Deutsch
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-muted" : ""}>
                    🇬🇧 English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="hidden md:flex">
                <LogOut className="h-5 w-5" />
              </Button>
              
              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && <nav className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-2">
                {navItems.map(item => {
              const Icon = item.icon;
              const showBadge = item.path === "/messages" && unreadCount > 0;
              return <Button key={item.path} variant={isActive(item.path) ? "default" : "ghost"} onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }} className="justify-start gap-2 w-full relative">
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {showBadge && <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] flex items-center justify-center p-0 text-xs">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>}
                    </Button>;
            })}
                <Button variant="ghost" onClick={handleSignOut} className="justify-start gap-2 w-full text-destructive hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                  {t("nav.signOut")}
                </Button>
              </div>
            </nav>}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>;
};
export default AppLayout;
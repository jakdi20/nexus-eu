import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UnreadMessagesProvider } from "@/contexts/UnreadMessagesContext";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Auth from "./pages/Auth";
import CompanyDashboard from "./pages/CompanyDashboard";
import Search from "./pages/Search";
import MyPartners from "./pages/MyPartners";
import PartnerDetail from "./pages/PartnerDetail";
import Messages from "./pages/Messages";
import ImportCompanies from "./pages/ImportCompanies";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import GlobalVideoCallManager from "./components/GlobalVideoCallManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <UnreadMessagesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <GlobalVideoCallManager />
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/company" element={<AppLayout><CompanyDashboard /></AppLayout>} />
              <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
              <Route path="/my-partners" element={<AppLayout><MyPartners /></AppLayout>} />
              <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
              <Route path="/partner/:id" element={<AppLayout><PartnerDetail /></AppLayout>} />
              <Route path="/import-companies" element={<AppLayout><ImportCompanies /></AppLayout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </UnreadMessagesProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

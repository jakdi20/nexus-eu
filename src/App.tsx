import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Company from "./pages/Company";
import Search from "./pages/Search";
import PartnerDetail from "./pages/PartnerDetail";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import GlobalVideoCallManager from "./components/GlobalVideoCallManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GlobalVideoCallManager />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/company" element={<AppLayout><Company /></AppLayout>} />
          <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
          <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
          <Route path="/partner/:id" element={<AppLayout><PartnerDetail /></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

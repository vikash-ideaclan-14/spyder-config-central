import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppProvider } from "@/context/AppContext";
import AuthGuard from "@/components/AuthGuard";
import { queryClient } from "@/lib/queryClient";

// Pages
import Dashboard from "./pages/Dashboard";
import ConfigPage from "./pages/ConfigPage";
import AdPage from "./pages/AdPage";
import BatchPage from "./pages/BatchPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import GroupPage from "./pages/GroupPage";
import LanderPage from "./pages/LanderPage";
import MiscellaneousPage from "./pages/MiscellaneousPage";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthGuard>
            <Routes>
              {/* App Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/configs" element={<ConfigPage />} />
              <Route path="/ads" element={<AdPage />} />
              <Route path="/batches" element={<BatchPage />} /> 
              <Route path="/groups" element={<GroupPage />} />
              <Route path="/landers" element={<LanderPage />} />
              <Route path="/miscellaneous" element={<MiscellaneousPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthGuard>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StudentProvider } from "@/contexts/StudentContext";
import Index from "./pages/Index";
import SettingsPage from "./pages/Settings";
import ReviewSymbols from "./pages/ReviewSymbols";
import SessionDetail from "./pages/SessionDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StudentProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/review-symbols" element={<ReviewSymbols />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </StudentProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Language wrapper to provide context
const LanguageRoutes = () => {
  return (
    <LanguageProvider>
      <Routes>
        {/* Default redirect to Bangla */}
        <Route path="/" element={<Navigate to="/bn" replace />} />
        
        {/* Bangla routes */}
        <Route path="/bn" element={<Home />} />
        <Route path="/bn/*" element={<Home />} />
        
        {/* English routes */}
        <Route path="/en" element={<Home />} />
        <Route path="/en/*" element={<Home />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

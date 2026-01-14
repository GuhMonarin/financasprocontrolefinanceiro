import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import Budgets from "./pages/Budgets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <SubscriptionProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

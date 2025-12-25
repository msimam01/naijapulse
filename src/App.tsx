import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import CreatePoll from "./pages/CreatePoll";
import PollView from "./pages/PollView";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import AllPolls from "./pages/AllPolls";
import CategoryPage from "./pages/CategoryPage";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CreatePoll />} />
              <Route path="/poll/:id" element={<PollView />} />
              <Route path="/polls" element={<AllPolls />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/install" element={<Install />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

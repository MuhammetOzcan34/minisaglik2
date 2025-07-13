
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import DashboardOverview from "./components/DashboardOverview";
import NutritionPage from "./pages/NutritionPage";
import RoutinePage from "./pages/RoutinePage";
import SeizuresPage from "./pages/SeizuresPage";
import MedicationsPage from "./pages/MedicationsPage";
import TemperaturePage from "./pages/TemperaturePage";
import CalendarPage from "./pages/CalendarPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="nutrition" element={<NutritionPage />} />
            <Route path="routine" element={<RoutinePage />} />
            <Route path="seizures" element={<SeizuresPage />} />
            <Route path="medications" element={<MedicationsPage />} />
            <Route path="temperature" element={<TemperaturePage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

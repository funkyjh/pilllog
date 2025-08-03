import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MobileLayout from "@/components/layout/mobile-layout";
import UploadPage from "@/pages/upload";
import MedicationsPage from "@/pages/medications";
import SymptomsPage from "@/pages/symptoms";
import MedicationDetailPage from "@/pages/medication-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MobileLayout>
      <Switch>
        <Route path="/" component={UploadPage} />
        <Route path="/medications" component={MedicationsPage} />
        <Route path="/medications/:id" component={MedicationDetailPage} />
        <Route path="/symptoms" component={SymptomsPage} />
        <Route component={NotFound} />
      </Switch>
    </MobileLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

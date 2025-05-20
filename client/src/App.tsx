import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CustomersPage from "@/pages/customers-page";
import UsersPage from "@/pages/users-page";
import ServicesPage from "@/pages/services-page";
import PaymentMethodsPage from "@/pages/payment-methods-page";
import ServiceTypesPage from "@/pages/service-types-page";
import ServiceProvidersPage from "@/pages/service-providers-page";
import SalesPage from "@/pages/sales-page";
import FinancePage from "@/pages/finance-page-updated";
import CostTypesPage from "@/pages/cost-types-page";
import ReportsPage from "@/pages/reports-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";

// Componente que envolve as rotas protegidas com o layout 
const ProtectedApp = ({ children }: { children: React.ReactNode }) => {
  return <AppLayout>{children}</AppLayout>;
};

// Componentes específicos para cada rota
const ProtectedHome = () => {
  return (
    <ProtectedApp>
      <HomePage />
    </ProtectedApp>
  );
};

const ProtectedCustomers = () => {
  return (
    <ProtectedApp>
      <CustomersPage />
    </ProtectedApp>
  );
};

const ProtectedUsers = () => {
  return (
    <ProtectedApp>
      <UsersPage />
    </ProtectedApp>
  );
};

const ProtectedServices = () => {
  // Adiciona log para depuração
  console.log("Renderizando ProtectedServices");
  console.log("ServicesPage:", ServicesPage);
  // Fim dos logs de depuração
  
  return (
    <ProtectedApp>
      <ServicesPage />
    </ProtectedApp>
  );
};

const ProtectedPaymentMethods = () => {
  console.log("Renderizando ProtectedPaymentMethods");
  return (
    <ProtectedApp>
      <PaymentMethodsPage />
    </ProtectedApp>
  );
};

const ProtectedServiceTypes = () => {
  console.log("Renderizando ProtectedServiceTypes");
  return (
    <ProtectedApp>
      <ServiceTypesPage />
    </ProtectedApp>
  );
};

const ProtectedServiceProviders = () => {
  console.log("Renderizando ProtectedServiceProviders");
  return (
    <ProtectedApp>
      <ServiceProvidersPage />
    </ProtectedApp>
  );
};

const ProtectedSales = () => {
  console.log("Renderizando ProtectedSales");
  return (
    <ProtectedApp>
      <SalesPage />
    </ProtectedApp>
  );
};

const ProtectedFinance = () => {
  console.log("Renderizando ProtectedFinance");
  return (
    <ProtectedApp>
      <FinancePage />
    </ProtectedApp>
  );
};

const ProtectedCostTypes = () => {
  console.log("Renderizando ProtectedCostTypes");
  return (
    <ProtectedApp>
      <CostTypesPage />
    </ProtectedApp>
  );
};

const ProtectedReports = () => {
  console.log("Renderizando ProtectedReports");
  return (
    <ProtectedApp>
      <ReportsPage />
    </ProtectedApp>
  );
};

function Router() {
  console.log("Renderizando Router");
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={ProtectedHome} />
      <ProtectedRoute path="/customers" component={ProtectedCustomers} />
      <ProtectedRoute path="/users" component={ProtectedUsers} />
      <ProtectedRoute path="/services" component={ProtectedServices} />
      <ProtectedRoute path="/payment-methods" component={ProtectedPaymentMethods} />
      <ProtectedRoute path="/service-types" component={ProtectedServiceTypes} />
      <ProtectedRoute path="/service-providers" component={ProtectedServiceProviders} />
      <ProtectedRoute path="/sales" component={ProtectedSales} />
      <ProtectedRoute path="/finance" component={ProtectedFinance} />
      <ProtectedRoute path="/cost-types" component={ProtectedCostTypes} />
      <ProtectedRoute path="/reports" component={ProtectedReports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

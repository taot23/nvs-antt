import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  
  console.log(`ProtectedRoute para ${path}: isLoading=${isLoading}, user=${user ? 'sim' : 'não'}`);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    console.log(`Redirecionando de ${path} para /auth porque não há usuário autenticado`);
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Aqui tentamos renderizar o componente da rota
  console.log(`Renderizando componente para ${path}`);
  return <Route path={path} component={Component} />;
}

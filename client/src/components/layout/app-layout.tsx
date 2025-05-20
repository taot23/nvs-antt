import { ReactNode, useState } from 'react';
import { Sidebar } from './sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { 
  User, 
  ShieldCheck, 
  UserCog, 
  UserCheck, 
  DollarSign, 
  Users 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const { user, logoutMutation } = useAuth();
  
  // Função para obter o ícone correto com base no perfil do usuário
  const getUserRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <ShieldCheck className="mr-2 h-4 w-4" />;
      case 'operacional':
        return <UserCog className="mr-2 h-4 w-4" />;
      case 'vendedor':
        return <UserCheck className="mr-2 h-4 w-4" />;
      case 'financeiro':
        return <DollarSign className="mr-2 h-4 w-4" />;
      case 'supervisor':
        return <Users className="mr-2 h-4 w-4" />;
      default:
        return <User className="mr-2 h-4 w-4" />;
    }
  };
  
  // Função para obter a variação da badge com base no perfil
  const getRoleBadgeVariant = () => {
    switch (user?.role) {
      case 'admin':
        return 'destructive';
      case 'operacional':
        return 'default';
      case 'vendedor':
        return 'secondary';
      case 'financeiro':
        return 'success';
      case 'supervisor':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      {/* Sidebar importada do componente separado */}
      <Sidebar />
      
      <div className="flex flex-col flex-1">
        {/* Indicador de usuário logado com menu dropdown */}
        {user && (
          <div className="flex justify-end p-2 bg-background/90 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <Badge 
                    variant={getRoleBadgeVariant() as any}
                    className="flex items-center py-1.5 px-3 hover:opacity-90 transition-opacity"
                  >
                    {getUserRoleIcon()}
                    <span className="font-medium">
                      {user.username} ({user.role})
                    </span>
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center text-destructive focus:text-destructive" 
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do Sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        {/* Conteúdo principal - se ajusta automaticamente com padding responsivo 
            Com espaço adicional no topo para o botão de menu mobile */}
        <main className={`flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 ${isMobile ? 'pt-16' : 'pt-4'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { differenceInDays, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  CreditCard,
  Calendar,
  Clock,
  AlertCircle,
  Activity,
  BarChart3,
  Lock,
  CircleDollarSign
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/hooks/use-auth";
import { DateRangePicker } from "./date-range-picker";
import { SellerPicker } from "./seller-picker";
import { StatsCard } from "./stats-card";
import { SalesAreaChart, PerformanceBarChart, StatusPieChart } from "./charts";
import { ActivityTable, ActivityItem } from "./activity-table";
import { InsightsCard, Insight } from "./insights-card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function MainDashboard() {
  // Obter informações do usuário para controle de acesso
  const { user } = useAuth();
  const userRole = user?.role || "";
  
  // Estado para o intervalo de datas
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Estado para acompanhar a aba ativa
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Verificar permissões de acesso baseadas no perfil do usuário
  const hasFinancialAccess = ["admin", "financeiro"].includes(userRole);
  const isVendedor = userRole === "vendedor";
  const isSupervisorOrOperacional = ["supervisor", "operacional"].includes(userRole);
  
  // Se o usuário não tiver acesso à aba financeira e estiver nela, redirecionar para outra aba
  if (activeTab === "financial" && !hasFinancialAccess) {
    setActiveTab("sales");
  }

  // Estado para armazenar o vendedor selecionado
  const [selectedSellerId, setSelectedSellerId] = useState<number | undefined>(undefined);
  
  // Buscar dados do dashboard com base no intervalo de datas e vendedor selecionados
  const {
    financialOverview,
    sellerPerformance,
    salesSummary,
    recentActivities,
    insights,
    salesBySeller,
    isLoading,
  } = useDashboardData(dateRange, selectedSellerId);

  // Preparar dados para gráficos
  const salesChartData = useMemo(() => {
    if (!salesSummary || !salesSummary.byDate) return [];
    
    return salesSummary.byDate.map((item) => ({
      date: format(new Date(item.date), "dd/MM/yy", { locale: ptBR }),
      value: item.amount,
    }));
  }, [salesSummary]);

  // Preparar dados para gráfico de desempenho dos vendedores
  const sellerChartData = useMemo(() => {
    if (!sellerPerformance) return [];
    
    return sellerPerformance.map((seller) => ({
      name: seller.sellerName,
      value: seller.amount,
    }));
  }, [sellerPerformance]);

  // Preparar dados para gráfico de status
  const statusChartData = useMemo(() => {
    if (!salesSummary || !salesSummary.byStatus) return [];
    
    const statusTranslations: Record<string, string> = {
      'completed': 'Concluído',
      'in_progress': 'Em Andamento',
      'pending': 'Pendente',
      'canceled': 'Cancelado',
    };
    
    return Object.entries(salesSummary.byStatus).map(([status, count]) => ({
      name: statusTranslations[status] || status,
      value: count,
    }));
  }, [salesSummary]);

  // Preparar dados para tabela de atividades recentes
  const activitiesData = useMemo(() => {
    if (!recentActivities) return [];
    
    return recentActivities.map((activity): ActivityItem => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      status: activity.status,
      date: activity.date,
      amount: activity.amount,
      user: activity.user,
    }));
  }, [recentActivities]);

  // Calcular diferença entre datas para exibição
  const dateDiff = useMemo(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) return "";
    
    const days = differenceInDays(dateRange.to, dateRange.from);
    if (days === 0) return "hoje";
    if (days === 1) return "último dia";
    if (days === 7) return "última semana";
    if (days === 30) return "últimos 30 dias";
    if (days === 90) return "últimos 90 dias";
    return `últimos ${days} dias`;
  }, [dateRange]);

  // Função para renderizar a aba de visão geral para supervisor e operacional
  const renderSupervisorOverviewTab = () => (
    <div className="space-y-6">
      {/* Cards de estatísticas limitados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Vendas"
          value={salesSummary?.total ?? 0}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          description={`${dateDiff}`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Valor Total"
          value={financialOverview 
            ? `R$ ${financialOverview.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : "R$ 0,00"
          }
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          description={`${dateDiff}`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Vendas Concluídas"
          value={salesSummary?.completed ?? 0}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          description={salesSummary 
            ? `${((salesSummary.completed / salesSummary.total) * 100).toFixed(1)}% do total`
            : "0% do total"
          }
          isLoading={isLoading}
        />
        <StatsCard
          title="Vendas em Andamento"
          value={salesSummary?.inProgress ?? 0}
          icon={<Activity className="h-5 w-5 text-amber-600" />}
          description={salesSummary 
            ? `${((salesSummary.inProgress / salesSummary.total) * 100).toFixed(1)}% do total`
            : "0% do total"
          }
          isLoading={isLoading}
        />
      </div>

      {/* Gráficos e tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SalesAreaChart 
            data={salesChartData} 
            isLoading={isLoading}
            className="h-[350px]"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PerformanceBarChart 
              data={sellerChartData} 
              isLoading={isLoading}
            />
            <StatusPieChart 
              data={statusChartData} 
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className="lg:col-span-1">
          <InsightsCard
            title="Insights"
            description="Análises baseadas nos dados"
            insights={insights as Insight[]}
            isLoading={isLoading}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );

  // Função para determinar qual visualização de visão geral mostrar com base no perfil
  const renderOverviewTab = () => {
    if (isVendedor) {
      return renderVendedorOverview();
    } else if (isSupervisorOrOperacional) {
      return renderSupervisorOverviewTab();
    } else {
      return renderAdminOverviewTab();
    }
  };

  // Função para renderizar a aba de visão geral para admin e financeiro
  const renderAdminOverviewTab = () => (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Vendas"
          value={salesSummary?.total ?? 0}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          description={`${dateDiff}`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Valor Total"
          value={financialOverview 
            ? `R$ ${financialOverview.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : "R$ 0,00"
          }
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          description={`${dateDiff}`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Valor Pago"
          value={financialOverview
            ? `R$ ${financialOverview.paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : "R$ 0,00"
          }
          icon={<CreditCard className="h-5 w-5 text-emerald-600" />}
          description={`${financialOverview?.paidInstallments ?? 0} parcelas`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Valor Pendente"
          value={financialOverview
            ? `R$ ${financialOverview.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : "R$ 0,00"
          }
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          description={`${financialOverview?.pendingInstallments ?? 0} parcelas`}
          isLoading={isLoading}
        />
      </div>

      {/* Gráficos e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SalesAreaChart 
            data={salesChartData} 
            isLoading={isLoading}
            className="h-[350px]"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PerformanceBarChart 
              data={sellerChartData} 
              isLoading={isLoading}
            />
            <StatusPieChart 
              data={statusChartData} 
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className="lg:col-span-1">
          <InsightsCard
            title="Insights"
            description="Análises baseadas nos dados"
            insights={insights as Insight[]}
            isLoading={isLoading}
            className="h-full"
          />
        </div>
      </div>

      {/* Atividades Recentes */}
      <ActivityTable
        title="Atividades Recentes"
        description="Últimas ações e eventos no sistema"
        data={activitiesData}
        isLoading={isLoading}
      />
    </div>
  );

  // Função para renderizar a aba de vendas
  const renderSalesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Vendas"
          value={salesSummary?.total ?? 0}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          description={`${dateDiff}`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Vendas Concluídas"
          value={salesSummary?.completed ?? 0}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          description={salesSummary 
            ? `${((salesSummary.completed / salesSummary.total) * 100).toFixed(1)}% do total`
            : "0% do total"
          }
          isLoading={isLoading}
        />
        <StatsCard
          title="Vendas em Andamento"
          value={salesSummary?.inProgress ?? 0}
          icon={<Activity className="h-5 w-5 text-amber-600" />}
          description={salesSummary 
            ? `${((salesSummary.inProgress / salesSummary.total) * 100).toFixed(1)}% do total`
            : "0% do total"
          }
          isLoading={isLoading}
        />
        <StatsCard
          title="Vendas Canceladas"
          value={salesSummary?.canceled ?? 0}
          icon={<AlertCircle className="h-5 w-5 text-red-600" />}
          description={salesSummary 
            ? `${((salesSummary.canceled / salesSummary.total) * 100).toFixed(1)}% do total`
            : "0% do total"
          }
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesAreaChart 
          data={salesChartData} 
          isLoading={isLoading}
        />
        <StatusPieChart 
          data={statusChartData} 
          isLoading={isLoading}
        />
      </div>

      <PerformanceBarChart 
        data={sellerChartData} 
        isLoading={isLoading}
      />
    </div>
  );

  // Função para renderizar a aba financeira
  const renderFinancialTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Valor Total"
          value={financialOverview 
            ? `R$ ${parseFloat(financialOverview.totalAmount.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : "R$ 0,00"
          }
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          description={`${dateDiff}`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Valor Pago"
          value={financialOverview
            ? `R$ ${parseFloat(financialOverview.paidAmount.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : "R$ 0,00"
          }
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          description={financialOverview && financialOverview.totalAmount > 0
            ? `${((financialOverview.paidAmount / financialOverview.totalAmount) * 100).toFixed(1)}% do total`
            : "0% do total"
          }
          isLoading={isLoading}
        />
        <StatsCard
          title="Valor Pendente"
          value={financialOverview
            ? `R$ ${parseFloat(financialOverview.pendingAmount.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : "R$ 0,00"
          }
          icon={<TrendingDown className="h-5 w-5 text-amber-600" />}
          description={financialOverview && financialOverview.totalAmount > 0
            ? `${((financialOverview.pendingAmount / financialOverview.totalAmount) * 100).toFixed(1)}% do total`
            : "0% do total"
          }
          isLoading={isLoading}
        />
        <StatsCard
          title="Custos Operacionais"
          value={financialOverview
            ? `R$ ${parseFloat(financialOverview.operationalCosts?.toString() || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : "R$ 0,00"
          }
          icon={<CircleDollarSign className="h-5 w-5 text-purple-600" />}
          description={financialOverview && financialOverview.totalAmount > 0
            ? `${((financialOverview.operationalCosts / financialOverview.totalAmount) * 100).toFixed(1)}% do total`
            : "0% do total"
          }
          isLoading={isLoading}
        />
        <StatsCard
          title="Resultado Líquido"
          value={financialOverview
            ? `R$ ${(parseFloat(financialOverview.paidAmount.toString()) - parseFloat(financialOverview.operationalCosts?.toString() || '0')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : "R$ 0,00"
          }
          icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
          description={`Receita paga menos custos`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Parcelas Pendentes"
          value={financialOverview?.pendingInstallments ?? 0}
          icon={<Clock className="h-5 w-5 text-red-600" />}
          description={`de ${financialOverview?.totalInstallments ?? 0} parcelas`}
          isLoading={isLoading}
        />
      </div>

      {/* Gráficos financeiros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Desempenho por Vendedor</h3>
          <PerformanceBarChart 
            data={sellerChartData} 
            isLoading={isLoading}
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Evolução de Vendas</h3>
          <SalesAreaChart 
            data={salesChartData} 
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Insights financeiros */}
      <InsightsCard
        title="Insights Financeiros"
        description="Análises baseadas nos dados financeiros"
        insights={insights as Insight[]}
        isLoading={isLoading}
      />
    </div>
  );

  // Renderizar mensagem de acesso negado para a aba financeira
  const renderFinancialAccessDenied = () => (
    <Alert variant="destructive" className="my-6">
      <AlertTitle className="flex items-center gap-2">
        <Lock className="h-4 w-4" /> Acesso Restrito
      </AlertTitle>
      <AlertDescription>
        Você não tem permissão para acessar os dados financeiros. Esta funcionalidade está disponível apenas para administradores e equipe financeira.
      </AlertDescription>
    </Alert>
  );

  // Personalizar visualização de dashboard para vendedor (sem mostrar dados de outros vendedores)
  const renderVendedorOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Minhas Vendas"
          value={salesSummary?.total ?? 0}
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          description={`${dateDiff}`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Vendas Concluídas"
          value={salesSummary?.completed ?? 0}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          description={salesSummary 
            ? `${((salesSummary.completed / salesSummary.total) * 100).toFixed(1)}% do total`
            : "0% do total"
          }
          isLoading={isLoading}
        />
        <StatsCard
          title="Valor Total"
          value={sellerPerformance && sellerPerformance.length > 0
            ? `R$ ${sellerPerformance[0].amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : "R$ 0,00"
          }
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          description={`${dateDiff}`}
          isLoading={isLoading}
        />
        <StatsCard
          title="Vendas em Andamento"
          value={salesSummary?.inProgress ?? 0}
          icon={<Activity className="h-5 w-5 text-amber-600" />}
          description={salesSummary 
            ? `${((salesSummary.inProgress / salesSummary.total) * 100).toFixed(1)}% do total`
            : "0% do total"
          }
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesAreaChart 
            data={salesChartData} 
            isLoading={isLoading}
            className="h-[350px]"
          />
        </div>
        <div className="lg:col-span-1">
          <StatusPieChart 
            data={statusChartData} 
            isLoading={isLoading}
          />
        </div>
      </div>

      <ActivityTable
        title="Minhas Atividades Recentes"
        description="Suas últimas vendas e ações no sistema"
        data={activitiesData}
        isLoading={isLoading}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {isVendedor 
              ? "Visão geral da sua performance de vendas" 
              : "Visão geral da performance do negócio"
            }
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Seletor de vendedor para perfis não-vendedor */}
          {!isVendedor && (
            <SellerPicker 
              sellers={salesBySeller}
              isLoading={isLoading}
              onChange={setSelectedSellerId}
              selectedSellerId={selectedSellerId}
            />
          )}
          <DateRangePicker onChange={setDateRange} />
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="sales">
            <ShoppingBag className="h-4 w-4 mr-2" /> Vendas
          </TabsTrigger>
          {hasFinancialAccess && (
            <TabsTrigger value="financial">
              <DollarSign className="h-4 w-4 mr-2" /> Financeiro
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverviewTab()}
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-4">
          {renderSalesTab()}
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-4">
          {hasFinancialAccess ? renderFinancialTab() : renderFinancialAccessDenied()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
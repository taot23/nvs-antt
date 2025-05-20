import { useAuth } from "@/hooks/use-auth";
import { ReportList } from "@/components/reports/report-list";
import { ReportExecution } from "@/components/reports/report-execution";
import { RecentExecutions } from "@/components/reports/recent-executions";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AreaChart, LineChart, BarChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedExecutionId, setSelectedExecutionId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"reports" | "dashboard">("reports");

  // Interfaces para tipagem
  interface FinancialOverview {
    totalRevenue: string;
    pendingRevenue: string;
    paidRevenue: string;
    totalCost: string;
    profit: string;
    margin: number;
  }

  interface SellerPerformance {
    sellerId: number;
    sellerName: string;
    totalSales: number;
    totalAmount: string;
    returnRate: number;
    completionRate: number;
  }

  interface SalesSummary {
    totalSales: number;
    totalAmount: string;
    averageAmount: string;
    completedSales: number;
    pendingSales: number;
    returnedSales: number;
  }

  // Buscar resumo financeiro para o dashboard
  const { data: financialSummary } = useQuery<FinancialOverview>({
    queryKey: ["/api/analytics/financial-overview"],
    enabled: activeTab === "dashboard",
  });

  // Buscar desempenho dos vendedores para o dashboard
  const { data: sellerPerformance } = useQuery<SellerPerformance[]>({
    queryKey: ["/api/analytics/seller-performance"],
    enabled: activeTab === "dashboard",
  });

  // Buscar resumo de vendas para o dashboard
  const { data: salesSummary } = useQuery<SalesSummary>({
    queryKey: ["/api/analytics/sales-summary"],
    enabled: activeTab === "dashboard",
  });

  // Função para executar um relatório
  const handleExecuteReport = (reportId: number) => {
    setSelectedReportId(reportId);
    setSelectedExecutionId(null);
  };

  // Função para visualizar a execução de um relatório
  const handleViewExecution = (executionId: number) => {
    setSelectedExecutionId(executionId);
    setSelectedReportId(null);
  };

  // Função para voltar à lista de relatórios
  const handleBackToList = () => {
    setSelectedReportId(null);
    setSelectedExecutionId(null);
  };

  // Renderizar dashboard de análise
  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card de Visão Geral Financeira */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AreaChart className="mr-2 h-5 w-5" /> Visão Financeira
              </CardTitle>
              <CardDescription>
                Resumo financeiro do período (últimos 30 dias)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {financialSummary ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Receita Total</p>
                      <p className="text-2xl font-bold">
                        R$ {Number(financialSummary.totalRevenue).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Receita Paga</p>
                      <p className="text-xl font-medium">
                        R$ {Number(financialSummary.paidRevenue).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Custos</p>
                      <p className="text-xl font-medium">
                        R$ {Number(financialSummary.totalCost).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lucro</p>
                      <p className={`text-xl font-medium ${Number(financialSummary.profit) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        R$ {Number(financialSummary.profit).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                    <p className={`text-xl font-medium ${financialSummary.margin < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {financialSummary.margin.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground text-sm">Carregando dados...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Resumo de Vendas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart className="mr-2 h-5 w-5" /> Resumo de Vendas
              </CardTitle>
              <CardDescription>
                Status das vendas (últimos 30 dias)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salesSummary ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Vendas</p>
                      <p className="text-2xl font-bold">{salesSummary.totalSales}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Média por Venda</p>
                      <p className="text-xl font-medium">
                        R$ {Number(salesSummary.averageAmount).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Concluídas</p>
                      <p className="text-xl font-medium text-green-500">
                        {salesSummary.completedSales}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                      <p className="text-xl font-medium text-yellow-500">
                        {salesSummary.pendingSales}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Devolvidas</p>
                      <p className="text-xl font-medium text-red-500">
                        {salesSummary.returnedSales}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground text-sm">Carregando dados...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Performance de Vendedores */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <LineChart className="mr-2 h-5 w-5" /> Desempenho de Vendedores
              </CardTitle>
              <CardDescription>
                Performance da equipe comercial
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sellerPerformance && sellerPerformance.length > 0 ? (
                <div className="space-y-4">
                  {sellerPerformance.slice(0, 3).map((seller) => (
                    <div key={seller.sellerId} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{seller.sellerName}</p>
                        <p className="text-sm">
                          R$ {Number(seller.totalAmount).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{seller.totalSales} vendas</span>
                        <span>
                          {seller.completionRate.toFixed(0)}% conc. / {seller.returnRate.toFixed(0)}% dev.
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${seller.completionRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground text-sm">
                    {sellerPerformance && sellerPerformance.length === 0 
                      ? "Nenhum dado disponível" 
                      : "Carregando dados..."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Seção para mensagens importantes e dicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>
                Informações baseadas nos dados de vendas recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesSummary ? (
                  <>
                    <div className="rounded-lg border p-4">
                      <h4 className="text-sm font-medium">Análise de Margem</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {financialSummary && financialSummary.margin > 20 
                          ? "A margem de lucro está saudável, acima dos 20% desejados."
                          : financialSummary && financialSummary.margin > 0
                          ? "A margem de lucro está positiva, mas abaixo do ideal de 20%."
                          : "Atenção: a margem de lucro está negativa ou muito baixa."}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="text-sm font-medium">Conversão de Vendas</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {salesSummary.completedSales > salesSummary.pendingSales
                          ? "A taxa de conversão está saudável, com mais vendas concluídas que pendentes."
                          : "Atenção: há muitas vendas pendentes, o que pode afetar o fluxo de caixa."}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="text-sm font-medium">Dicas de Ação</h4>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1 ml-4 list-disc">
                        {salesSummary.returnedSales > salesSummary.totalSales * 0.1 && (
                          <li>Reduzir a taxa de devolução de vendas que está acima de 10%.</li>
                        )}
                        {financialSummary && Number(financialSummary.pendingRevenue) > Number(financialSummary.paidRevenue) && (
                          <li>Intensificar cobrança de pagamentos pendentes.</li>
                        )}
                        {sellerPerformance && sellerPerformance.some((s) => s.completionRate < 70) && (
                          <li>Verificar vendedores com baixa taxa de conclusão de vendas.</li>
                        )}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground text-sm">Carregando dados...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Execuções Recentes de Relatórios */}
          <RecentExecutions onViewExecution={handleViewExecution} limit={5} />
        </div>
      </div>
    );
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {selectedReportId || selectedExecutionId ? "Relatório" : "Relatórios e Análises"}
        </h1>
      </div>

      {!selectedReportId && !selectedExecutionId ? (
        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as "reports" | "dashboard")}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>
          <TabsContent value="reports" className="mt-4">
            <ReportList
              onExecuteReport={handleExecuteReport}
              onViewExecution={handleViewExecution}
            />
          </TabsContent>
          <TabsContent value="dashboard" className="mt-4">
            {renderDashboard()}
          </TabsContent>
        </Tabs>
      ) : (
        <ReportExecution
          reportId={selectedReportId || undefined}
          executionId={selectedExecutionId || undefined}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
}
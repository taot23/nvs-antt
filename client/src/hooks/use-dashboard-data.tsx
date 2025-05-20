import { useQueries } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { getQueryFn } from "@/lib/queryClient";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Insight } from "@/components/dashboard/insights-card";

export interface FinancialOverview {
  totalSales: number;
  totalInstallments: number;
  paidInstallments: number;
  pendingInstallments: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  operationalCosts: number;
  profit?: number;
  margin?: number;
  trend?: number;
}

export interface SalesBySeller {
  sellerId: number;
  sellerName: string;
  count: number;
  amount: number;
}

export interface SalesSummary {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  canceled: number;
  byStatus: { [key: string]: number };
  byDate: Array<{ date: string; count: number; amount: number }>;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  status: string;
  date: string;
  amount?: number;
  user?: string;
}

export function useDashboardData(dateRange?: DateRange, sellerId?: number) {
  // Transformar o intervalo de datas para parâmetros de consulta
  const startDate = dateRange?.from 
    ? format(dateRange.from, "yyyy-MM-dd") 
    : format(subDays(new Date(), 30), "yyyy-MM-dd");
  
  const endDate = dateRange?.to 
    ? format(dateRange.to, "yyyy-MM-dd") 
    : format(new Date(), "yyyy-MM-dd");
  
  // Adicionar o filtro de vendedor se fornecido
  const sellerParam = sellerId ? `&sellerId=${sellerId}` : '';
  const queryParams = `?startDate=${startDate}&endDate=${endDate}${sellerParam}`;

  // Usar useQueries para buscar vários endpoints simultaneamente
  const results = useQueries({
    queries: [
      {
        queryKey: ["/api/dashboard/financial", startDate, endDate, sellerId],
        queryFn: () => fetch(`/api/dashboard/financial${queryParams}`).then(res => {
          if (!res.ok) throw new Error("Falha ao buscar dados financeiros");
          return res.json();
        }),
        select: (data: any) => data as FinancialOverview,
      },
      {
        queryKey: ["/api/dashboard/sales", startDate, endDate, sellerId],
        queryFn: () => fetch(`/api/dashboard/sales${queryParams}`).then(res => {
          if (!res.ok) throw new Error("Falha ao buscar dados de vendas");
          return res.json();
        }),
        select: (data: any) => data as SalesSummary,
      },
      {
        queryKey: ["/api/dashboard/sellers", startDate, endDate],
        queryFn: () => fetch(`/api/dashboard/sellers${queryParams.replace(sellerParam, '')}`).then(res => {
          if (!res.ok) throw new Error("Falha ao buscar dados de vendedores");
          return res.json();
        }),
        select: (data: any) => data as SalesBySeller[],
      },
      {
        queryKey: ["/api/dashboard/activities", startDate, endDate, sellerId],
        queryFn: () => fetch(`/api/dashboard/activities${queryParams}`).then(res => {
          if (!res.ok) throw new Error("Falha ao buscar atividades recentes");
          return res.json();
        }),
        select: (data: any) => data as RecentActivity[],
      },
    ],
  });

  // Extrair resultados individuais
  const [
    { data: financialOverview, isLoading: isFinancialLoading },
    { data: salesSummary, isLoading: isSalesLoading },
    { data: sellerPerformance, isLoading: isSellersLoading },
    { data: recentActivities, isLoading: isActivitiesLoading },
  ] = results;

  // Verificar se ainda está carregando algum dos dados
  const isLoading = isFinancialLoading || isSalesLoading || isSellersLoading || isActivitiesLoading;
  
  // Renomear sellerPerformance para salesBySeller para manter a compatibilidade
  const salesBySeller = sellerPerformance;

  // Gerar insights baseados nos dados
  const insights = generateInsights(financialOverview, salesSummary, sellerPerformance);

  return {
    financialOverview,
    salesSummary,
    sellerPerformance,
    salesBySeller,
    recentActivities,
    insights,
    isLoading,
  };
}

function generateInsights(
  financialOverview?: FinancialOverview,
  salesSummary?: SalesSummary,
  sellerPerformance?: SalesBySeller[]
): Insight[] {
  const insights: Insight[] = [];

  // Insights financeiros
  if (financialOverview) {
    // Tendência de vendas
    if (financialOverview.trend) {
      const trend = financialOverview.trend;
      const trendType = trend > 0 ? "positive" : trend < 0 ? "negative" : "neutral";
      const trendDesc = trend > 0 
        ? "crescimento em relação ao período anterior" 
        : trend < 0 
          ? "queda em relação ao período anterior" 
          : "sem alteração em relação ao período anterior";

      insights.push({
        id: "trend",
        title: "Tendência de Vendas",
        description: `${Math.abs(trend).toFixed(1)}% de ${trendDesc}`,
        type: trendType,
        trend: {
          direction: trend > 0 ? "up" : trend < 0 ? "down" : "stable",
          value: Math.abs(trend),
        },
      });
    }

    // Status de pagamento
    const paidPercentage = (financialOverview.paidAmount / financialOverview.totalAmount) * 100;
    insights.push({
      id: "payment_status",
      title: "Status de Pagamentos",
      description: `${paidPercentage.toFixed(1)}% do valor total já foi recebido`,
      type: paidPercentage > 75 ? "positive" : paidPercentage > 50 ? "neutral" : "warning",
    });

    // Parcelas pendentes
    const pendingPercentage = (financialOverview.pendingInstallments / financialOverview.totalInstallments) * 100;
    if (pendingPercentage > 30) {
      insights.push({
        id: "pending_installments",
        title: "Parcelas Pendentes",
        description: `${financialOverview.pendingInstallments} parcelas (${pendingPercentage.toFixed(1)}%) ainda pendentes`,
        type: "warning",
      });
    }
  }

  // Insights de vendas
  if (salesSummary) {
    // Status das vendas
    const completionRate = (salesSummary.completed / salesSummary.total) * 100;
    insights.push({
      id: "completion_rate",
      title: "Taxa de Conclusão",
      description: `${completionRate.toFixed(1)}% das vendas foram concluídas`,
      type: completionRate > 75 ? "positive" : completionRate > 50 ? "neutral" : "warning",
    });

    // Vendas canceladas
    const cancelRate = (salesSummary.canceled / salesSummary.total) * 100;
    if (cancelRate > 10) {
      insights.push({
        id: "cancel_rate",
        title: "Taxa de Cancelamento",
        description: `${cancelRate.toFixed(1)}% das vendas foram canceladas`,
        type: "negative",
      });
    }
  }

  // Insights de desempenho dos vendedores
  if (sellerPerformance && sellerPerformance.length > 0) {
    // Vendedor com melhor desempenho
    const topSeller = [...sellerPerformance].sort((a, b) => b.amount - a.amount)[0];
    insights.push({
      id: "top_seller",
      title: "Melhor Vendedor",
      description: `${topSeller.sellerName} com ${topSeller.count} vendas totalizando R$ ${topSeller.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      type: "positive",
    });
  }

  return insights;
}
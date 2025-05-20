import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Plus, Search, FileText, Download, SortAsc, SortDesc, Eye, CornerDownRight, CheckCircle2, XCircle, AlertTriangle, SendHorizontal, CornerUpLeft, DollarSign, RefreshCw, ClipboardList, ArrowLeft, DatabaseBackup, Database, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ChevronDown, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useDebounce } from "@/hooks/useDebounce";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { debounce } from "lodash-es";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { DateRange } from "react-day-picker";
import SaleDialog from "@/components/sales/sale-dialog";
import SaleDetailsDialog from "@/components/sales/sale-details-dialog";
import SaleReturnDialog from "@/components/sales/sale-return-dialog";
import SaleOperationDialog from "@/components/sales/sale-operation-dialog";
import SaleHistoryDialog from "@/components/sales/sale-history-dialog";
// Reenvio removido
import DevolveButton from "@/components/sales/devolve-button";
import { PopulateSalesButton } from "@/components/admin/populate-sales-button";
import PaginatedSalesTable from "@/components/paginated-sales-table";
import { DateRangePicker } from "@/components/date-range-picker";

// Tipos
type Sale = {
  id: number;
  orderNumber: string;
  date: string;
  customerId: number;
  customerName?: string; // Preenchido pelo frontend
  paymentMethodId: number;
  paymentMethodName?: string; // Preenchido pelo frontend
  sellerId: number;
  sellerName?: string; // Preenchido pelo frontend
  serviceTypeId?: number | null; // Tipo de execução do serviço
  serviceTypeName?: string | null; // Nome do tipo de execução (preenchido pelo frontend)
  serviceProviderId?: number | null; // Prestador parceiro (para SINDICATO)
  serviceProviderName?: string | null; // Nome do prestador (preenchido pelo frontend)
  totalAmount: string;
  status: string;
  executionStatus: string;
  financialStatus: string;
  notes: string | null;
  returnReason: string | null;
  responsibleOperationalId: number | null;
  responsibleFinancialId: number | null;
  createdAt: string;
  updatedAt: string;
};

type SortField = 'orderNumber' | 'date' | 'customerName' | 'sellerName' | 'totalAmount' | 'status';
type SortDirection = 'asc' | 'desc';

// Função para obter a descrição do status
function getStatusLabel(status: string) {
  switch (status) {
    case 'pending': return 'Pendente';
    case 'in_progress': return 'Em Andamento';
    case 'returned': return 'Devolvida';
    case 'completed': return 'Concluída';
    case 'canceled': return 'Cancelada';
    case 'corrected': return 'Corrigida Aguardando Operacional';
    default: return status;
  }
}

// Função para obter a cor do status
function getStatusVariant(status: string) {
  switch (status) {
    case 'pending': return 'warning';
    case 'in_progress': return 'secondary';
    case 'returned': return 'destructive';
    case 'completed': return 'success';
    case 'canceled': return 'outline';
    case 'corrected': return 'primary';
    default: return 'default';
  }
}

// Função para obter classes CSS para a linha da tabela
function getStatusRowClass(status: string) {
  // Garantir que sempre retornamos uma string válida
  if (!status) return '';
  
  switch (status) {
    case 'corrected': return 'status-row-corrected'; // Amarelo bem suave para "corrigido"
    case 'completed': return 'status-row-completed'; // Verde bem suave para "concluído"
    case 'in_progress': return 'status-row-in_progress'; // Laranja bem suave para "em andamento"
    case 'returned': return 'status-row-returned'; // Vermelho bem suave para "devolvida"
    default: return '';
  }
}

// Função para obter classes CSS para o card mobile
function getStatusCardClass(status: string) {
  // Garantir que sempre retornamos uma string válida
  if (!status) return '';
  
  switch (status) {
    case 'corrected': return 'status-card-corrected'; // Amarelo bem suave para "corrigido"
    case 'completed': return 'status-card-completed'; // Verde bem suave para "concluído"
    case 'in_progress': return 'status-card-in_progress'; // Laranja bem suave para "em andamento"
    case 'returned': return 'status-card-returned'; // Vermelho bem suave para "devolvida"
    default: return '';
  }
}

// ABORDAGEM FINAL: Função para aplicar estilos inline diretamente
function getStatusStyle(status: string) {
  // CORES MAIS INTENSAS USANDO RGB PARA MÁXIMA COMPATIBILIDADE
  switch (status) {
    case 'corrected': 
      return { 
        backgroundColor: 'rgba(250, 240, 137, 0.3)', 
        border: '2px solid rgba(250, 240, 137, 0.6)',
        borderLeft: '5px solid rgba(250, 240, 137, 0.8)'
      }; // Amarelo mais intenso
    case 'completed': 
      return { 
        backgroundColor: 'rgba(134, 239, 172, 0.3)', 
        border: '2px solid rgba(134, 239, 172, 0.6)',
        borderLeft: '5px solid rgba(134, 239, 172, 0.8)'
      }; // Verde mais intenso
    case 'in_progress': 
      return { 
        backgroundColor: 'rgba(255, 159, 64, 0.3)', 
        border: '2px solid rgba(255, 159, 64, 0.6)',
        borderLeft: '5px solid rgba(255, 159, 64, 0.8)'
      }; // Laranja mais intenso
    case 'returned': 
      return { 
        backgroundColor: 'rgba(252, 165, 165, 0.3)', 
        border: '2px solid rgba(252, 165, 165, 0.6)',
        borderLeft: '5px solid rgba(252, 165, 165, 0.8)'
      }; // Vermelho mais intenso
    default: 
      return {};
  }
}

// Componente principal
export default function SalesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { lastEvent, isConnected, reconnect } = useWebSocket();
  // Monitoramento de performance
  const performanceMonitor = usePerformanceMonitor();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estados
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showCreateVendaDialog, setShowCreateVendaDialog] = useState(false); // Estado específico para criar venda
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearSalesDialogOpen, setClearSalesDialogOpen] = useState(false); // Estado para diálogo de limpar vendas
  const [operationDialogOpen, setOperationDialogOpen] = useState(false); // Estado para diálogo de operação de vendas
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false); // Estado para diálogo de histórico de vendas
  const [pdfExportDialogOpen, setPdfExportDialogOpen] = useState(false); // Estado para diálogo de exportação PDF
  const [excelExportDialogOpen, setExcelExportDialogOpen] = useState(false); // Estado para diálogo de exportação Excel
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined); // Estado para filtro de intervalo de datas
  const [selectedSellerId, setSelectedSellerId] = useState<string>("all"); // Estado para filtro de vendedor
  
  // Configuração para staleTime e gcTime globais para reduzir chamadas de API
  const staleTime = 5 * 60 * 1000; // 5 minutos 
  const gcTime = 30 * 60 * 1000; // 30 minutos (gcTime substitui cacheTime na v5 do TanStack Query)
  const localStorageCacheTime = 60 * 60 * 1000; // 1 hora para cache do localStorage
  
  // Função para obter dados do cache local
  const getFromLocalCache = (key: string) => {
    try {
      const cachedData = localStorage.getItem(`cache_${key}`);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > localStorageCacheTime;
        
        if (!isExpired) {
          console.log(`Usando dados em cache para ${key}`);
          return data;
        } else {
          console.log(`Cache expirado para ${key}`);
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.error('Erro ao ler cache:', error);
    }
    return null;
  };
  
  // Função para salvar dados no cache local
  const saveToLocalCache = (key: string, data: any) => {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  };
  
  // Estados para paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15); // Número de registros por página
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Função para lidar com a mudança no filtro de vendedor
  const handleSellerFilterChange = (value: string) => {
    setSelectedSellerId(value);
    setPage(1); // Voltar para a primeira página quando mudar o filtro
    // Atualiza as queries para refletir o novo filtro
    queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
  };
  
  // Função para lidar com a mudança no filtro de datas
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1); // Voltar para a primeira página quando mudar o filtro
    // Atualiza as queries para refletir o novo intervalo de datas
    queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
  };

  // Para o perfil vendedor, carregamos apenas suas próprias vendas, agora com paginação
  const { data: salesData = { data: [], total: 0, page: 1, totalPages: 1 }, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/sales", user?.role === "vendedor" ? user?.id : "all", page, limit, statusFilter, searchTerm, sortField, sortDirection, dateRange?.from?.toISOString(), dateRange?.to?.toISOString(), selectedSellerId],
    queryFn: async ({ queryKey }) => {
      // Preparar a URL com os parâmetros de paginação e filtros
      const baseUrl = "/api/sales";
      const queryParams = new URLSearchParams();
      
      // Adicionar parâmetros de paginação
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      
      // Adicionar parâmetros de ordenação
      if (sortField) queryParams.append("sortField", sortField);
      if (sortDirection) queryParams.append("sortDirection", sortDirection);
      
      // Adicionar filtros
      if (statusFilter) queryParams.append("status", statusFilter);
      if (searchTerm) queryParams.append("searchTerm", searchTerm);
      
      // Adicionar filtros de intervalo de datas
      if (dateRange?.from) {
        queryParams.append("startDate", dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        queryParams.append("endDate", dateRange.to.toISOString().split('T')[0]);
      }
      
      // Aplicar filtro de vendedor específico
      if (selectedSellerId && selectedSellerId !== 'all') {
        queryParams.append("sellerId", selectedSellerId);
      }
      // Ou se for vendedor, só pode ver suas próprias vendas
      else if (user?.role === "vendedor") {
        console.log("Carregando vendas específicas para o vendedor:", user.id);
        queryParams.append("sellerId", user.id.toString());
      }
      
      // Construir a URL final
      const url = `${baseUrl}?${queryParams.toString()}`;
      console.log("URL de consulta paginada:", url);
      
      // Dados críticos, não usamos cache local para vendas
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error("Erro ao carregar vendas");
      }
      
      const data = await response.json();
      
      // Atualizar estados da paginação
      setTotalPages(data.totalPages);
      setTotalRecords(data.total);
      
      // Retornar o objeto completo com dados e metadados
      return data;
    },
    staleTime: 30000, // 30 segundos, dados de vendas são mais críticos
    refetchOnWindowFocus: true, // Atualize quando o usuário volta para a janela
  });
  
  // Extrair sales do salesData para manter compatibilidade com o restante do código
  const sales = salesData.data || [];

  // Os demais recursos podem usar uma abordagem otimizada com cache
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      // Verificar se temos dados em cache
      const cachedData = getFromLocalCache('customers');
      if (cachedData) return cachedData;
      
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error("Erro ao carregar clientes");
      }
      const data = await response.json();
      
      // Salvar no cache
      saveToLocalCache('customers', data);
      return data;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      // Verificar se temos dados em cache
      const cachedData = getFromLocalCache('users');
      if (cachedData) return cachedData;
      
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Erro ao carregar usuários");
      }
      const data = await response.json();
      
      // Salvar no cache
      saveToLocalCache('users', data);
      return data;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["/api/payment-methods"],
    queryFn: async () => {
      // Verificar se temos dados em cache
      const cachedData = getFromLocalCache('payment-methods');
      if (cachedData) return cachedData;
      
      const response = await fetch("/api/payment-methods");
      if (!response.ok) {
        throw new Error("Erro ao carregar formas de pagamento");
      }
      const data = await response.json();
      
      // Salvar no cache
      saveToLocalCache('payment-methods', data);
      return data;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
  });
  
  // Carregar tipos de serviço e prestadores de serviço com cache
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["/api/service-types"],
    queryFn: async () => {
      // Verificar se temos dados em cache
      const cachedData = getFromLocalCache('service-types');
      if (cachedData) return cachedData;
      
      const response = await fetch("/api/service-types");
      if (!response.ok) {
        throw new Error("Erro ao carregar tipos de serviço");
      }
      const data = await response.json();
      
      // Salvar no cache
      saveToLocalCache('service-types', data);
      return data;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
  });
  
  const { data: serviceProviders = [] } = useQuery({
    queryKey: ["/api/service-providers"],
    queryFn: async () => {
      // Verificar se temos dados em cache
      const cachedData = getFromLocalCache('service-providers');
      if (cachedData) return cachedData;
      
      const response = await fetch("/api/service-providers");
      if (!response.ok) {
        throw new Error("Erro ao carregar prestadores de serviço");
      }
      const data = await response.json();
      
      // Salvar no cache
      saveToLocalCache('service-providers', data);
      return data;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
  });
  
  // Preparar dados enriquecidos
  const enrichedSales = sales.map((sale: Sale) => {
    const customer = customers.find((c: any) => c.id === sale.customerId);
    const seller = users.find((u: any) => u.id === sale.sellerId);
    const paymentMethod = paymentMethods.find((p: any) => p.id === sale.paymentMethodId);
    const serviceType = serviceTypes.find((t: any) => t.id === sale.serviceTypeId);
    const serviceProvider = serviceProviders.find((p: any) => p.id === sale.serviceProviderId);
    
    return {
      ...sale,
      customerName: customer?.name || `Cliente #${sale.customerId}`,
      sellerName: seller?.username || `Vendedor #${sale.sellerId}`,
      paymentMethodName: paymentMethod?.name || `Forma de Pagamento #${sale.paymentMethodId}`,
      serviceTypeName: serviceType?.name || null,
      serviceProviderName: serviceProvider?.name || null
    };
  });
  
  // Mutation para excluir uma venda
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao excluir venda");
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Venda excluída",
        description: "A venda foi excluída com sucesso",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir venda",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation para iniciar execução
  const startExecutionMutation = useMutation({
    mutationFn: async (id: number) => {
      // Ao invés de chamar diretamente a API, vamos abrir o diálogo de operação
      // para garantir que o usuário pode selecionar o tipo de execução e prestador parceiro
      
      // Selecionar a venda atual
      const sale = sales.find((sale: Sale) => sale.id === id);
      if (!sale) {
        throw new Error("Venda não encontrada");
      }
      
      // Definir como selecionada e abrir diálogo de operação
      setSelectedSale(sale);
      setOperationDialogOpen(true);
      
      // Retornar um resultado vazio - o diálogo se encarregará do restante
      return { success: true };
    },
    onSuccess: () => {
      // Apenas invalidar a consulta - não mostrar mensagem de sucesso
      // pois o processo será concluído no diálogo de operação
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao iniciar execução",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation para completar execução
  const completeExecutionMutation = useMutation({
    mutationFn: async (id: number) => {
      // Ao invés de chamar diretamente a API, vamos abrir o diálogo de operação
      // para garantir que o usuário tenha acesso a todas as opções
      
      // Selecionar a venda atual
      const sale = sales.find((sale: Sale) => sale.id === id);
      if (!sale) {
        throw new Error("Venda não encontrada");
      }
      
      // Definir como selecionada e abrir diálogo de operação
      setSelectedSale(sale);
      setOperationDialogOpen(true);
      
      // Retornar um resultado vazio - o diálogo se encarregará do restante
      return { success: true };
    },
    onSuccess: () => {
      // Apenas invalidar a consulta - não mostrar mensagem de sucesso
      // pois o processo será concluído no diálogo de operação
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao concluir execução",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation para limpar todas as vendas
  const clearAllSalesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/clear-sales`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao limpar vendas");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Vendas removidas",
        description: `Foram removidas ${data.count} vendas do sistema`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao limpar vendas",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation para reenviar venda corrigida
  const resendSaleMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Iniciando mutation para reenviar diretamente venda:", id);
      // Usar apiRequest ao invés de fetch diretamente
      const response = await apiRequest("POST", `/api/sales/${id}/resend`, {
        notes: "Venda corrigida e reenviada via botão rápido"
      });
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Venda reenviada",
        description: "A venda corrigida foi reenviada com sucesso para o setor operacional",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao reenviar venda",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para marcar como paga
  const markAsPaidMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/sales/${id}/mark-paid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao marcar venda como paga");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Pagamento confirmado",
        description: "A venda foi marcada como paga com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao confirmar pagamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Efeito para escutar atualizações via WebSocket
  useEffect(() => {
    if (lastEvent?.type === 'sales_update') {
      console.log('Recebida atualização de vendas via WebSocket (lastEvent)');
      
      // Atualizar automaticamente os dados
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      
      // Mostrar notificação
      toast({
        title: "Atualização de vendas",
        description: "As vendas foram atualizadas",
      });
    }
  }, [lastEvent, queryClient, toast]);
  
  // Adicionar ouvinte para o evento personalizado de sales-update
  useEffect(() => {
    // Função para lidar com o evento personalizado
    const handleSalesUpdateEvent = (event: Event) => {
      console.log('Recebido evento personalizado sales-update');
      
      // Atualizar os dados
      refetch();
      
      // Mostrar notificação
      toast({
        title: "Atualização de vendas",
        description: "As vendas foram atualizadas via evento personalizado",
      });
    };
    
    // Adicionar o ouvinte de eventos
    window.addEventListener('sales-update', handleSalesUpdateEvent);
    
    // Remover o ouvinte quando o componente for desmontado
    return () => {
      window.removeEventListener('sales-update', handleSalesUpdateEvent);
    };
  }, [refetch, toast]);
  
  // NOVA ABORDAGEM COM EFEITO DIRETO NO DOM
  useLayoutEffect(() => {
    // Função que aplica cores diretamente no DOM
    const applyColorsToTable = () => {
      console.log('Aplicando cores diretamente ao DOM...');
      
      // Para cada status, definimos cores específicas com cores mais intensas
      const colorMap = {
        'corrected': 'rgba(250, 240, 137, 0.25)',  // Amarelo mais visível
        'completed': 'rgba(134, 239, 172, 0.25)',  // Verde mais visível
        'in_progress': 'rgba(255, 159, 64, 0.3)',  // Laranja mais visível
        'returned': 'rgba(252, 165, 165, 0.25)'    // Vermelho mais visível
      };
      
      // Para cada linha com data-status
      const rowsWithStatus = document.querySelectorAll('tr[data-status]');
      console.log(`Encontradas ${rowsWithStatus.length} linhas com atributo data-status`);
      
      rowsWithStatus.forEach(row => {
        const status = row.getAttribute('data-status');
        console.log(`Processando linha com status: ${status}`);
        
        if (status && status in colorMap) {
          // Aplicar cor em todas as células da linha
          const cells = row.querySelectorAll('td');
          console.log(`Aplicando cor ${colorMap[status as keyof typeof colorMap]} em ${cells.length} células`);
          
          cells.forEach(cell => {
            (cell as HTMLElement).style.backgroundColor = colorMap[status as keyof typeof colorMap];
            // Garantir que a cor seja aplicada com !important
            (cell as HTMLElement).setAttribute('style', 
              `background-color: ${colorMap[status as keyof typeof colorMap]} !important`);
          });
        }
      });
      
      // Para cards no mobile
      const cardsWithStatus = document.querySelectorAll('div[data-status]');
      console.log(`Encontrados ${cardsWithStatus.length} cards com atributo data-status`);
      
      cardsWithStatus.forEach(card => {
        const status = card.getAttribute('data-status');
        console.log(`Processando card com status: ${status}`);
        
        if (status && status in colorMap) {
          console.log(`Aplicando cor ${colorMap[status as keyof typeof colorMap]} ao card`);
          // Aplicar diretamente no elemento com !important
          (card as HTMLElement).setAttribute('style', 
            `background-color: ${colorMap[status as keyof typeof colorMap]} !important`);
        }
      });
    };
    
    // Aplicar cores imediatamente após a renderização
    applyColorsToTable();
    
    // Programar várias tentativas com intervalos diferentes para garantir a aplicação
    const timerIds: ReturnType<typeof setTimeout>[] = [];
    // Tentar após 100ms, 300ms, 500ms, 1s e 2s para maior cobertura de cenários
    [100, 300, 500, 1000, 2000].forEach(delay => {
      const timerId = setTimeout(applyColorsToTable, delay);
      timerIds.push(timerId);
    });
    
    // Também adicionar observador de mutação para recolorir quando o DOM for modificado
    const observer = new MutationObserver((mutations) => {
      console.log('DOM modificado, reaplicando cores...');
      applyColorsToTable();
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => {
      // Limpar todos os timers
      timerIds.forEach(id => clearTimeout(id));
      // Desconectar o observer
      observer.disconnect();
    };
  }, [sales, statusFilter, searchTerm]);
  
  // Função para forçar a atualização dos dados
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Primeiro tentar reconectar o WebSocket se não estiver conectado
      if (!isConnected) {
        console.log('WebSocket não conectado. Tentando reconectar...');
        reconnect();
      }
      
      // Então atualizar os dados
      await refetch();
      toast({
        title: "Dados atualizados",
        description: "Os dados de vendas foram atualizados",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handlers
  const handleOpenCreateDialog = () => {
    console.log("Botão Nova Venda clicado");
    // Limpar a venda selecionada e abrir o diálogo de criação
    setSelectedSale(null);
    // Usar o novo estado específico
    setShowCreateVendaDialog(true);
    
    // Logs para diagnóstico
    console.log("Abrindo diálogo de nova venda usando showCreateVendaDialog");
  };
  
  const handleEdit = (sale: Sale) => {
    console.log("Botão Editar Venda clicado para venda:", sale.id);
    // Primeiro selecionamos a venda
    setSelectedSale(sale);
    // Usar um setTimeout para garantir que o estado seja atualizado
    setTimeout(() => {
      // Então abrir o diálogo
      setDialogOpen(true);
      console.log("Estado do diálogo após editar:", true);
    }, 0);
  };
  
  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsDialogOpen(true);
  };
  
  const handleDeleteClick = (sale: Sale) => {
    setSelectedSale(sale);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (selectedSale) {
      deleteMutation.mutate(selectedSale.id);
    }
  };
  
  const handleReturnClick = (sale: Sale) => {
    setSelectedSale(sale);
    setReturnDialogOpen(true);
  };
  
  const handleStartExecution = (sale: Sale) => {
    // Novo fluxo: abrir tela de tratativa ao invés de executar diretamente
    if (user?.role === "operacional" || user?.role === "admin" || user?.role === "supervisor") {
      setSelectedSale(sale);
      setOperationDialogOpen(true);
    } else {
      // Manter o comportamento anterior para outros casos
      startExecutionMutation.mutate(sale.id);
    }
  };
  
  const handleCompleteExecution = (sale: Sale) => {
    // Novo fluxo: abrir tela de tratativa para vendas em andamento também
    if (user?.role === "operacional" || user?.role === "admin" || user?.role === "supervisor") {
      setSelectedSale(sale);
      setOperationDialogOpen(true);
    } else {
      // Manter o comportamento anterior para outros casos
      completeExecutionMutation.mutate(sale.id);
    }
  };
  
  const handleMarkAsPaid = (sale: Sale) => {
    markAsPaidMutation.mutate(sale.id);
  };
  
  // Handler para visualizar histórico de status da venda
  const handleViewHistory = (sale: Sale) => {
    setSelectedSale(sale);
    setHistoryDialogOpen(true);
  };
  
  // Mutation para reenvio direto (usado por usuários não vendedores)
  const handleDirectResend = (saleId: number) => {
    console.log("Chamando mutation direta para reenvio (perfil não vendedor)");
    resendSaleMutation.mutate(saleId);
  };
  
  // Handler para limpar todas as vendas
  const handleClearAllSales = () => {
    setClearSalesDialogOpen(true);
  };
  
  const handleConfirmClearAllSales = () => {
    clearAllSalesMutation.mutate();
    setClearSalesDialogOpen(false);
  };
  
  // Função para aplicar debounce na pesquisa
  const debouncedSearchTerm = useDebounce(internalSearchTerm, 300);
  
  // Efeito para atualizar o termo de pesquisa após o debounce
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  
  // Função para atualizar o termo de pesquisa interno (sem delay)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm("");
    setInternalSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Função para buscar todas as vendas (sem filtros)
  const fetchAllSales = async () => {
    try {
      // Configurar parâmetros para buscar todas as vendas
      const queryParams = new URLSearchParams();
      
      // Vendedor só pode ver suas próprias vendas mesmo sem filtros
      if (user?.role === "vendedor") {
        queryParams.append("sellerId", user.id.toString());
      }
      
      // Solicitar um limite maior para obter mais registros
      queryParams.append("limit", "1000"); // Limitado a 1000 registros
      
      const url = `/api/sales?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Erro ao carregar todas as vendas");
      }
      
      const data = await response.json();
      
      // Enriquecer os dados com nomes
      return data.data.map((sale: Sale) => {
        const customer = customers.find((c: any) => c.id === sale.customerId);
        const seller = users.find((u: any) => u.id === sale.sellerId);
        const paymentMethod = paymentMethods.find((p: any) => p.id === sale.paymentMethodId);
        
        return {
          ...sale,
          customerName: customer?.name || `Cliente #${sale.customerId}`,
          sellerName: seller?.username || `Vendedor #${sale.sellerId}`,
          paymentMethodName: paymentMethod?.name || `Forma de Pagamento #${sale.paymentMethodId}`,
        };
      });
    } catch (error) {
      console.error("Erro ao buscar todas as vendas:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível carregar todas as vendas",
        variant: "destructive",
      });
      return [];
    }
  };
  
  // Função para buscar todas as vendas com os filtros atuais (mas sem paginação)
  const fetchAllFilteredSales = async () => {
    try {
      // Mostrar feedback visual
      toast({
        title: "Exportando vendas filtradas",
        description: "Buscando todas as vendas com os filtros atuais...",
      });
      
      // Configurar parâmetros para buscar todas as vendas com os filtros atuais
      const queryParams = new URLSearchParams();
      
      // Vendedor só pode ver suas próprias vendas
      if (user?.role === "vendedor") {
        queryParams.append("sellerId", user.id.toString());
      }
      
      // Aplicar os mesmos filtros que estão sendo usados na visualização atual
      if (statusFilter) queryParams.append("status", statusFilter);
      if (searchTerm) queryParams.append("searchTerm", searchTerm);
      
      // Adicionar filtros de intervalo de datas
      if (dateRange?.from) {
        queryParams.append("startDate", dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        queryParams.append("endDate", dateRange.to.toISOString().split('T')[0]);
      }
      
      // Adicionar parâmetros de ordenação
      if (sortField) queryParams.append("sortField", sortField);
      if (sortDirection) queryParams.append("sortDirection", sortDirection);
      
      // Solicitar limite maior para obter todos os registros do filtro
      queryParams.append("limit", "1000"); // Limitado a 1000 registros filtrados
      
      const url = `/api/sales?${queryParams.toString()}`;
      console.log("Buscando todas as vendas filtradas:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Erro ao carregar vendas filtradas");
      }
      
      const data = await response.json();
      
      // Enriquecer os dados com nomes
      return data.data.map((sale: Sale) => {
        const customer = customers.find((c: any) => c.id === sale.customerId);
        const seller = users.find((u: any) => u.id === sale.sellerId);
        const paymentMethod = paymentMethods.find((p: any) => p.id === sale.paymentMethodId);
        
        return {
          ...sale,
          customerName: customer?.name || `Cliente #${sale.customerId}`,
          sellerName: seller?.username || `Vendedor #${sale.sellerId}`,
          paymentMethodName: paymentMethod?.name || `Forma de Pagamento #${sale.paymentMethodId}`,
        };
      });
    } catch (error) {
      console.error("Erro ao buscar vendas filtradas:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível carregar todas as vendas filtradas",
        variant: "destructive",
      });
      return [];
    }
  };
  
  // Abrir diálogo para exportação Excel
  const openExcelExportDialog = () => {
    setExcelExportDialogOpen(true);
  };

  // Exportação para Excel (todos os dados com os filtros atuais)
  const exportFilteredToExcel = async () => {
    // Buscar todos os dados que correspondem aos filtros atuais
    const allFilteredSales = await fetchAllFilteredSales();
    
    if (allFilteredSales.length === 0) {
      return; // Mensagem de erro já mostrada em fetchAllFilteredSales
    }
    
    const exportData = allFilteredSales.map((sale: Sale) => ({
      'Nº OS': sale.orderNumber,
      'Data': format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR }),
      'Cliente': sale.customerName,
      'Vendedor': sale.sellerName,
      'Valor Total': `R$ ${parseFloat(sale.totalAmount).toFixed(2).replace('.', ',')}`,
      'Status': getStatusLabel(sale.status),
      'Pago': sale.financialStatus === 'paid' ? 'Sim' : 'Não',
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas Filtradas");
    XLSX.writeFile(workbook, `vendas-filtradas-${format(new Date(), 'dd-MM-yyyy', { locale: ptBR })}.xlsx`);
    
    toast({
      title: "Exportação concluída",
      description: `${allFilteredSales.length} vendas filtradas exportadas com sucesso`,
    });
    
    setExcelExportDialogOpen(false);
  };

  // Exportação de todas as vendas para Excel
  const exportAllToExcel = async () => {
    // Mostrar feedback visual
    toast({
      title: "Exportando vendas",
      description: "Buscando todas as vendas para exportação...",
    });

    // Buscar todas as vendas
    const allSales = await fetchAllSales();
    
    if (allSales.length === 0) {
      return; // Mensagem de erro já mostrada em fetchAllSales
    }

    const exportData = allSales.map((sale: Sale) => ({
      'Nº OS': sale.orderNumber,
      'Data': format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR }),
      'Cliente': sale.customerName,
      'Vendedor': sale.sellerName,
      'Valor Total': `R$ ${parseFloat(sale.totalAmount).toFixed(2).replace('.', ',')}`,
      'Status': getStatusLabel(sale.status),
      'Pago': sale.financialStatus === 'paid' ? 'Sim' : 'Não',
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Todas as Vendas");
    XLSX.writeFile(workbook, `todas-as-vendas-${format(new Date(), 'dd-MM-yyyy', { locale: ptBR })}.xlsx`);
    
    toast({
      title: "Exportação concluída",
      description: `${allSales.length} vendas exportadas com sucesso`,
    });
    
    setExcelExportDialogOpen(false);
  };
  
  // Abrir diálogo para exportação PDF
  const openPdfExportDialog = () => {
    setPdfExportDialogOpen(true);
  };

  // Exportação para PDF (todos os dados com os filtros atuais)
  const exportFilteredToPDF = async () => {
    // Buscar todos os dados que correspondem aos filtros atuais
    const allFilteredSales = await fetchAllFilteredSales();
    
    if (allFilteredSales.length === 0) {
      return; // Mensagem de erro já mostrada em fetchAllFilteredSales
    }
    
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Vendas", 14, 22);
    
    // Data do relatório
    doc.setFontSize(11);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 30);
    
    // Informação sobre os dados
    doc.setFontSize(11);
    doc.text(`Total de vendas filtradas: ${allFilteredSales.length}`, 14, 38);
    doc.text("Dados: Vendas com filtros aplicados", 14, 46);
    
    // Filtro aplicado
    let startY = 54;
    if (statusFilter) {
      doc.text(`Filtro de status: ${getStatusLabel(statusFilter)}`, 14, startY);
      startY += 8;
    }
    
    // Filtro de datas
    if (dateRange?.from || dateRange?.to) {
      let dateFilterText = "Filtro de datas: ";
      
      if (dateRange?.from) {
        dateFilterText += `De ${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })}`;
      } else {
        dateFilterText += "Desde o início";
      }
      
      if (dateRange?.to) {
        dateFilterText += ` até ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`;
      } else {
        dateFilterText += " até hoje";
      }
      
      doc.text(dateFilterText, 14, startY);
      startY += 8;
    }
    
    // Filtro de pesquisa
    if (searchTerm) {
      doc.text(`Termo pesquisado: "${searchTerm}"`, 14, startY);
      startY += 8;
    }
    
    // Dados para a tabela
    const tableData = allFilteredSales.map((sale: Sale) => [
      sale.orderNumber,
      format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR }),
      sale.customerName,
      sale.sellerName,
      `R$ ${parseFloat(sale.totalAmount).toFixed(2).replace('.', ',')}`,
      getStatusLabel(sale.status),
    ]);
    
    // Criar tabela
    autoTable(doc, {
      startY: startY,
      head: [['Nº OS', 'Data', 'Cliente', 'Vendedor', 'Valor Total', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [75, 75, 75] },
    });
    
    doc.save(`vendas-filtradas-${format(new Date(), 'dd-MM-yyyy', { locale: ptBR })}.pdf`);
    
    toast({
      title: "Exportação concluída",
      description: `${allFilteredSales.length} vendas filtradas exportadas com sucesso`,
    });
    
    setPdfExportDialogOpen(false);
  };

  // Exportação de todas as vendas para PDF
  const exportAllToPDF = async () => {
    // Mostrar feedback visual
    toast({
      title: "Exportando vendas",
      description: "Buscando todas as vendas para exportação...",
    });

    // Buscar todas as vendas
    const allSales = await fetchAllSales();
    
    if (allSales.length === 0) {
      return; // Mensagem de erro já mostrada em fetchAllSales
    }

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Relatório Completo de Vendas", 14, 22);
    
    // Data do relatório e informações
    doc.setFontSize(11);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 30);
    doc.text(`Total de vendas: ${allSales.length}`, 14, 38);
    doc.text("Dados: Todas as vendas (sem filtros)", 14, 46);
    
    // Dados para a tabela
    const tableData = allSales.map((sale: Sale) => [
      sale.orderNumber,
      format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR }),
      sale.customerName,
      sale.sellerName,
      `R$ ${parseFloat(sale.totalAmount).toFixed(2).replace('.', ',')}`,
      getStatusLabel(sale.status),
    ]);
    
    // Criar tabela
    autoTable(doc, {
      startY: 54,
      head: [['Nº OS', 'Data', 'Cliente', 'Vendedor', 'Valor Total', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [75, 75, 75] },
    });
    
    doc.save(`todas-as-vendas-${format(new Date(), 'dd-MM-yyyy', { locale: ptBR })}.pdf`);
    
    toast({
      title: "Exportação concluída",
      description: `${allSales.length} vendas exportadas com sucesso`,
    });
    
    setPdfExportDialogOpen(false);
  };
  
  // Usuário atual e log simples
  console.log("Renderizando SalesPage para usuário:", user?.role);
  
  // A filtragem e ordenação agora é feita no servidor através da API paginada
  // Os parâmetros: statusFilter, searchTerm, sortField e sortDirection
  // são enviados diretamente para o servidor através dos parâmetros de query
  const filteredSales = enrichedSales;
  
  // Renderização para dispositivos móveis
  if (isMobile) {
    return (
      <div className="container py-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Vendas</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Atualizar dados"
              className={`h-8 w-8 ${isConnected ? "border-green-500" : ""}`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            
            <Button size="sm" onClick={handleOpenCreateDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Nova
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Exportar dados</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openPdfExportDialog}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openExcelExportDialog}>
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Buscar venda..."
              className="pl-8 pr-10"
              value={internalSearchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 px-2.5"
                onClick={clearSearch}
              >
                <span className="sr-only">Limpar</span>
                &times;
              </Button>
            )}
          </div>
          
          {/* Filtro por intervalo de datas (versão mobile) */}
          <DateRangePicker
            value={dateRange}
            onValueChange={handleDateRangeChange}
            className="w-full"
          />
          
          {/* Filtro de vendedor (versão mobile) */}
          <Select
            value={selectedSellerId}
            onValueChange={handleSellerFilterChange}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por vendedor" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os vendedores</SelectItem>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Menu dropdown para filtro de status em mobile */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>
                    {!statusFilter 
                      ? "Todas" 
                      : statusFilter === "pending" 
                        ? "Pendentes" 
                        : statusFilter === "in_progress" 
                          ? "Em Andamento" 
                          : statusFilter === "completed" 
                            ? "Concluídas" 
                            : statusFilter === "returned" 
                              ? "Devolvidas" 
                              : statusFilter === "corrected" 
                                ? "Corrigidas" 
                                : "Filtrar por status"}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("")}>
                  <span className={!statusFilter ? "font-bold" : ""}>Todas</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  <span className={statusFilter === "pending" ? "font-bold" : ""}>Pendentes</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
                  <span className={statusFilter === "in_progress" ? "font-bold" : ""}>Em Andamento</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  <span className={statusFilter === "completed" ? "font-bold" : ""}>Concluídas</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("returned")}>
                  <span className={statusFilter === "returned" ? "font-bold" : ""}>Devolvidas</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("corrected")}>
                  <span className={statusFilter === "corrected" ? "font-bold" : ""}>Corrigidas</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid gap-4">
          {isLoading ? (
            <div className="text-center py-10">Carregando vendas...</div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">Erro ao carregar vendas</div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-10">
              {searchTerm || statusFilter
                ? "Nenhuma venda encontrada para sua busca"
                : "Nenhuma venda cadastrada ainda"}
            </div>
          ) : (
            filteredSales.map((sale: Sale) => {
              return (
                <Card 
                  key={sale.id} 
                  className="overflow-hidden"
                  data-status={sale.status}
                  style={getStatusStyle(sale.status)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base flex items-center">
                          OS: {sale.orderNumber}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR })}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(sale.status) as any}>
                        {getStatusLabel(sale.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0 pb-2 grid gap-1">
                    <div className="text-sm">
                      <span className="text-muted-foreground text-xs">Cliente:</span>{" "}
                      {sale.customerName}
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-muted-foreground text-xs">Vendedor:</span>{" "}
                      {sale.sellerName}
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-muted-foreground text-xs">Valor:</span>{" "}
                      <span className="font-semibold">
                        R$ {parseFloat(sale.totalAmount).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    
                    {sale.returnReason && (
                      <div className="text-sm mt-1 text-destructive">
                        <span className="text-xs font-semibold">Motivo da devolução:</span>{" "}
                        {sale.returnReason}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-2 pt-0 flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-8 px-2 flex-grow"
                      onClick={() => handleViewDetails(sale)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Detalhes
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 flex-grow"
                      onClick={() => handleViewHistory(sale)}
                    >
                      <ClipboardList className="h-3.5 w-3.5 mr-1" />
                      Histórico
                    </Button>
                    
                    {/* Botões de ação com base no status e permissões */}
                    {/* Botão de editar visível para admin ou para vendedor quando a venda estiver devolvida */}
                    {/* Botão de editar com regra: apenas vendas com status "pendente" */}
                    {/* BOTÃO DE EDIÇÃO REMOVIDO POR SOLICITAÇÃO DO CLIENTE (30/04/2025) */}
                    
                    {/* Botão para operacionais iniciarem execução */}
                    {(user?.role === "admin" || user?.role === "operacional") && 
                      (sale.status === "pending" || sale.status === "corrected") && (
                      <Button
                        size="sm"
                        variant={sale.status === "corrected" ? "default" : "outline"}
                        className={`h-8 px-2 flex-grow ${sale.status === "corrected" ? "bg-primary hover:bg-primary/90" : ""}`}
                        onClick={() => handleStartExecution(sale)}
                      >
                        <CornerDownRight className="h-3.5 w-3.5 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    
                    {/* Botão para operacionais concluírem execução */}
                    {(user?.role === "admin" || user?.role === "operacional") && 
                      sale.status === "in_progress" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 flex-grow"
                        onClick={() => handleCompleteExecution(sale)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Concluir
                      </Button>
                    )}
                    
                    {/* Botão para operacionais devolverem a venda */}
                    {(user?.role === "admin" || user?.role === "operacional") && 
                      (sale.status === "pending" || sale.status === "in_progress") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 flex-grow text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => handleReturnClick(sale)}
                      >
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        Devolver
                      </Button>
                    )}
                    
                    {/* Funcionalidade de reenvio removida */}
                    
                    {/* Botão para operacional/admin devolver venda corrigida */}
                    {(user?.role === "admin" || user?.role === "operacional") && 
                      sale.status === "corrected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 flex-grow text-amber-500 border-amber-200 hover:bg-amber-50"
                        onClick={() => {
                          // Abrir um diálogo semelhante ao DevolveButton, 
                          // mas vamos usar o diálogo de retorno existente com o componente já pronto
                          setSelectedSale(sale);
                          setReturnDialogOpen(true);
                        }}
                      >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        Devolver
                      </Button>
                    )}
                    
                    {/* Botão para financeiro marcar como paga */}
                    {(user?.role === "admin" || user?.role === "financeiro") && 
                      sale.status === "completed" && 
                      sale.financialStatus !== "paid" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-2 flex-grow"
                        onClick={() => handleMarkAsPaid(sale)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Confirmar Pagamento
                      </Button>
                    )}
                    
                    {/* Botão de exclusão (apenas admin) */}
                    {user?.role === "admin" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 px-2 flex-grow"
                        onClick={() => handleDeleteClick(sale)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Excluir
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  }
  
  // Renderização para desktop
  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendas</h1>
          <p className="text-muted-foreground">
            Gerencie as vendas da sua empresa
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Atualizar dados"
            className={isConnected ? "border-green-500" : ""}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Venda
          </Button>
        </div>
      </div>
      
      {/* Barra de ferramentas */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Buscar venda..."
            className="pl-8 pr-10"
            value={internalSearchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 px-2.5"
              onClick={clearSearch}
            >
              <span className="sr-only">Limpar</span>
              &times;
            </Button>
          )}
        </div>
        
        {/* Filtro de vendedor (versão desktop) */}
        <div className="w-full sm:w-64">
          <Select
            value={selectedSellerId}
            onValueChange={handleSellerFilterChange}
          >
            <SelectTrigger>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por vendedor" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os vendedores</SelectItem>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-3">
          {/* Filtro por intervalo de datas */}
          <div className="flex-shrink-0">
            <DateRangePicker
              value={dateRange}
              onValueChange={handleDateRangeChange}
            />
          </div>
          
          {/* Menu dropdown para filtros de status */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[150px] justify-between">
                  <span>
                    {!statusFilter 
                      ? "Todas" 
                      : statusFilter === "pending" 
                        ? "Pendentes" 
                        : statusFilter === "in_progress" 
                          ? "Em Andamento" 
                          : statusFilter === "completed" 
                            ? "Concluídas" 
                            : statusFilter === "returned" 
                              ? "Devolvidas" 
                              : statusFilter === "corrected" 
                                ? "Corrigidas" 
                                : "Filtrar por status"}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("")}>
                  <span className={!statusFilter ? "font-bold" : ""}>Todas</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  <span className={statusFilter === "pending" ? "font-bold" : ""}>Pendentes</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
                  <span className={statusFilter === "in_progress" ? "font-bold" : ""}>Em Andamento</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  <span className={statusFilter === "completed" ? "font-bold" : ""}>Concluídas</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("returned")}>
                  <span className={statusFilter === "returned" ? "font-bold" : ""}>Devolvidas</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("corrected")}>
                  <span className={statusFilter === "corrected" ? "font-bold" : ""}>Corrigidas</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={openPdfExportDialog}>
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={openExcelExportDialog}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            
            {/* Botões de administração */}
            {(user?.role === "admin") && (
              <>
                <PopulateSalesButton />
                <Button 
                  variant="destructive" 
                  onClick={handleClearAllSales}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Vendas
                </Button>
              </>
            )}
            
            {/* Operacional pode limpar vendas mas não popular */}
            {(user?.role === "operacional") && (
              <Button 
                variant="destructive" 
                onClick={handleClearAllSales}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Vendas
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabela Paginada - Nova implementação mais eficiente */}
      <PaginatedSalesTable
        data={filteredSales}
        isLoading={isLoading}
        error={error as Error}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={toggleSort}
        currentPage={page}
        totalPages={totalPages}
        pageSize={limit}
        totalItems={salesData?.total || 0}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setLimit(newSize);
          setPage(1); // Voltar para a primeira página ao alterar o tamanho
        }}
        onViewDetails={handleViewDetails}
        onViewHistory={handleViewHistory}
        onEdit={() => {
          console.log("Função de edição desativada por solicitação do cliente");
        }}
        onStartExecution={handleStartExecution}
        onCompleteExecution={handleCompleteExecution}
        onReturnClick={handleReturnClick}
        onMarkAsPaid={handleMarkAsPaid}
        onDeleteClick={handleDeleteClick}
        user={user}
        DevolveButton={DevolveButton}
      />
      
      {/* Diálogo apenas para edição de vendas existentes */}
      {dialogOpen && selectedSale && (
        <SaleDialog
          open={dialogOpen}
          onClose={() => {
            console.log("Fechando diálogo de edição de venda");
            setDialogOpen(false);
          }}
          sale={selectedSale}
          saleId={selectedSale.id}
          onSaveSuccess={() => {
            console.log("Venda atualizada com sucesso");
            toast({
              title: "Venda atualizada",
              description: "A venda foi atualizada com sucesso",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
            setDialogOpen(false);
          }}
        />
      )}
      
      {/* Diálogo de detalhes */}
      <SaleDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        saleId={selectedSale?.id}
      />
      
      {/* Diálogo de devolução */}
      <SaleReturnDialog
        open={returnDialogOpen}
        onClose={() => setReturnDialogOpen(false)}
        saleId={selectedSale?.id}
        onReturnSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
          setReturnDialogOpen(false);
        }}
      />
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a venda com número de OS{" "}
              <span className="font-semibold">{selectedSale?.orderNumber}</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo de confirmação para limpar todas as vendas */}
      <AlertDialog open={clearSalesDialogOpen} onOpenChange={setClearSalesDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ ATENÇÃO: Ação Irreversível!</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">
                Esta ação <strong>não pode ser desfeita</strong>. Todas as vendas, itens e históricos serão 
                <strong className="text-destructive"> permanentemente excluídos</strong> do sistema.
              </p>
              <p className="mb-2">
                Use esta opção apenas em ambiente de testes ou quando precisar limpar completamente os dados.
              </p>
              <p className="font-semibold">
                Tem certeza que deseja continuar?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmClearAllSales}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, Limpar Todas as Vendas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Novo diálogo dedicado para criação de vendas */}
      {showCreateVendaDialog && (
        <SaleDialog 
          open={showCreateVendaDialog} 
          onClose={() => {
            console.log("Fechando diálogo de criação de venda");
            setShowCreateVendaDialog(false);
          }}
          sale={null}
          onSaveSuccess={() => {
            setShowCreateVendaDialog(false);
            toast({
              title: "Venda criada",
              description: "A venda foi criada com sucesso",
            });
            refetch();
          }}
        />
      )}
      
      {/* Diálogo de operação da venda para operacionais */}
      <SaleOperationDialog
        open={operationDialogOpen}
        onClose={() => setOperationDialogOpen(false)}
        saleId={selectedSale?.id}
      />
      
      {/* Diálogo de histórico de vendas */}
      <SaleHistoryDialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        saleId={selectedSale?.id}
      />
      
      {/* Diálogo de exportação PDF */}
      <AlertDialog open={pdfExportDialogOpen} onOpenChange={setPdfExportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exportar para PDF</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha o tipo de exportação que deseja realizar:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {/* Layout mobile: botões em coluna */}
          <div className="flex flex-col space-y-3 mt-3">
            <Button 
              onClick={exportFilteredToPDF}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2"
            >
              <div className="text-center w-full">
                <div>Vendas com filtros aplicados</div>
                {statusFilter && <div className="text-xs mt-1">Status: {getStatusLabel(statusFilter)}</div>}
                {searchTerm && <div className="text-xs mt-1">Busca: "{searchTerm}"</div>}
              </div>
            </Button>
            
            <Button 
              onClick={exportAllToPDF}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-2"
            >
              <div className="text-center w-full">
                <div>Todas as vendas</div>
                <div className="text-xs mt-1">(sem filtros)</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => setPdfExportDialogOpen(false)}
              variant="outline"
              className="w-full mt-2"
            >
              Cancelar
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo de exportação Excel */}
      <AlertDialog open={excelExportDialogOpen} onOpenChange={setExcelExportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exportar para Excel</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha o tipo de exportação que deseja realizar:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {/* Layout mobile: botões em coluna */}
          <div className="flex flex-col space-y-3 mt-3">
            <Button 
              onClick={exportFilteredToExcel}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2"
            >
              <div className="text-center w-full">
                <div>Vendas com filtros aplicados</div>
                {statusFilter && <div className="text-xs mt-1">Status: {getStatusLabel(statusFilter)}</div>}
                {searchTerm && <div className="text-xs mt-1">Busca: "{searchTerm}"</div>}
              </div>
            </Button>
            
            <Button 
              onClick={exportAllToExcel}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-2"
            >
              <div className="text-center w-full">
                <div>Todas as vendas</div>
                <div className="text-xs mt-1">(sem filtros)</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => setExcelExportDialogOpen(false)}
              variant="outline"
              className="w-full mt-2"
            >
              Cancelar
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Funcionalidade de reenvio de vendas removida */}
    </div>
  );
}
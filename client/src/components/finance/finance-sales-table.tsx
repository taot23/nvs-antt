import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStatusLabel } from "@/lib/status-utils";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Loader2, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  InfoIcon,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDown01,
  ArrowUp01,
  Calendar,
  Hash,
  User,
  MoreHorizontal,
  ArrowDown,
  ArrowUp,
  CircleDollarSign
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Sale } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

// Versão adaptada da tabela para uso no módulo financeiro
interface FinanceSalesTableProps {
  status: string;
  searchTerm: string;
  onViewFinancials: (saleId: number) => void;
  usesFinancialStatus?: boolean; // Indica se deve usar financialStatus ao invés de status
  dateRange?: { from?: Date, to?: Date }; // Intervalo de datas para filtrar
}

// Tipo para definir a estrutura do retorno da API
interface SalesResponse {
  data: (Sale & { 
    customerName?: string, 
    sellerName?: string, 
    paymentMethodName?: string,
    financialSummary?: {
      totalPaid: number,
      totalCosts: number,
      netResult: number
    }
  })[];
  total: number;
  page: number;
  totalPages: number;
}

export default function FinanceSalesTable({ 
  status, 
  searchTerm, 
  onViewFinancials,
  usesFinancialStatus = false, // Por padrão, continuamos usando o status operacional
  dateRange
}: FinanceSalesTableProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Função para alternar ordenação
  const toggleSort = (field: string) => {
    if (sortField === field) {
      // Se já estiver ordenando por este campo, inverte a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Se for um novo campo, ordena ascendente por padrão
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Busca os dados de vendas com paginação
  const { data: salesData, isLoading, error } = useQuery<SalesResponse>({
    queryKey: ['/api/sales', page, limit, status, searchTerm, usesFinancialStatus, dateRange, sortField, sortDirection],
    queryFn: async () => {
      const url = new URL('/api/sales', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      
      // Adicionar parâmetros de ordenação
      url.searchParams.append('sortField', sortField);
      url.searchParams.append('sortDirection', sortDirection);
      
      // Dependendo do flag, usa status ou financialStatus (exceto quando for "all")
      if (usesFinancialStatus) {
        // Quando estamos no modo financeiro, sempre enviamos financialStatus
        // mesmo sendo 'all', para que a API retorne os dados do resumo financeiro
        url.searchParams.append('financialStatus', status);
      } else {
        if (status !== 'all') {
          url.searchParams.append('status', status);
        }
      }
      
      if (searchTerm) url.searchParams.append('searchTerm', searchTerm);
      
      // Adicionar filtros de data se disponíveis
      if (dateRange?.from) {
        url.searchParams.append('startDate', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        url.searchParams.append('endDate', dateRange.to.toISOString());
      }
      
      console.log(`Buscando vendas com ${usesFinancialStatus ? 'financialStatus' : 'status'}: ${status}, termo: ${searchTerm || 'nenhum'}, url: ${url.toString()}`);
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Erro ao carregar vendas');
      }
      return response.json();
    },
    retry: 1,
  });

  const sales = salesData?.data || [];
  const totalPages = salesData?.totalPages || 1;
  const totalItems = salesData?.total || 0;

  // Reset para a página 1 quando alteramos os filtros
  useEffect(() => {
    setPage(1);
  }, [status, searchTerm, dateRange]);

  // Função para retornar o estilo do badge com base no status
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'returned':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Renderizar skeletons durante o carregamento
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between space-x-2">
                  <Skeleton className="h-10 w-[10%]" />
                  <Skeleton className="h-10 w-[25%]" />
                  <Skeleton className="h-10 w-[15%]" />
                  <Skeleton className="h-10 w-[15%]" />
                  <Skeleton className="h-10 w-[20%]" />
                  <Skeleton className="h-10 w-[15%]" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 py-8">
          <div className="text-center text-destructive flex flex-col items-center justify-center">
            <InfoIcon className="h-12 w-12 text-destructive mb-2" />
            <p className="font-semibold text-lg">Erro ao carregar vendas</p>
            <p className="text-muted-foreground">Por favor, tente novamente mais tarde.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sales.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 py-10">
          <div className="text-center flex flex-col items-center justify-center">
            <InfoIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-semibold text-lg">Nenhuma venda encontrada</p>
            <p className="text-muted-foreground mt-1">Não foram encontradas vendas com os filtros atuais.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-2 sm:p-4">
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table className="w-full finance-table">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead 
                    className="w-[80px] cursor-pointer whitespace-nowrap" 
                    onClick={() => toggleSort('orderNumber')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Nº OS</span>
                      {sortField === 'orderNumber' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUpAZ className="h-4 w-4" />
                        ) : (
                          <ArrowDownAZ className="h-4 w-4" />
                        )
                      ) : (
                        <div className="w-4" />
                      )}
                    </div>
                  </TableHead>
                <TableHead 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort('sellerId')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Vendedor</span>
                    {sortField === 'sellerId' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUpAZ className="h-4 w-4" />
                      ) : (
                        <ArrowDownAZ className="h-4 w-4" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort('customerName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Cliente</span>
                    {sortField === 'customerName' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUpAZ className="h-4 w-4" />
                      ) : (
                        <ArrowDownAZ className="h-4 w-4" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Data</span>
                    {sortField === 'date' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUpAZ className="h-4 w-4" />
                      ) : (
                        <ArrowDownAZ className="h-4 w-4" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort('totalAmount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Valor Total</span>
                    {sortField === 'totalAmount' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp01 className="h-4 w-4" />
                      ) : (
                        <ArrowDown01 className="h-4 w-4" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}
                  </div>
                </TableHead>

                {/* Quando usar status financeiro, mostrar colunas financeiras */}
                {usesFinancialStatus && (
                  <>
                    <TableHead 
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => toggleSort('totalPaid')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Valor Pago</span>
                        {sortField === 'totalPaid' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp01 className="h-4 w-4" />
                          ) : (
                            <ArrowDown01 className="h-4 w-4" />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => toggleSort('totalCosts')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Custos</span>
                        {sortField === 'totalCosts' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp01 className="h-4 w-4" />
                          ) : (
                            <ArrowDown01 className="h-4 w-4" />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => toggleSort('netResult')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Resultado</span>
                        {sortField === 'netResult' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp01 className="h-4 w-4" />
                          ) : (
                            <ArrowDown01 className="h-4 w-4" />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                      </div>
                    </TableHead>
                  </>
                )}
                
                <TableHead 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort(usesFinancialStatus ? 'financialStatus' : 'status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {sortField === (usesFinancialStatus ? 'financialStatus' : 'status') ? (
                      sortDirection === 'asc' ? (
                        <ArrowUpAZ className="h-4 w-4" />
                      ) : (
                        <ArrowDownAZ className="h-4 w-4" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody style={{ width: '100%' }}>
              {sales.map((sale) => (
                <TableRow key={sale.id} data-status={usesFinancialStatus ? sale.financialStatus : sale.status}>
                  <TableCell className="font-medium whitespace-nowrap">{sale.orderNumber}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[120px] truncate">
                    <span title={sale.sellerName || `Vendedor #${sale.sellerId}`}>
                      {sale.sellerName || `Vendedor #${sale.sellerId}`}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap max-w-[150px] truncate">
                    <span title={sale.customerName || `Cliente #${sale.customerId}`}>
                      {sale.customerName || `Cliente #${sale.customerId}`}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(sale.date)}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{formatCurrency(sale.totalAmount)}</TableCell>
                  
                  {/* Colunas financeiras para desktop */}
                  {usesFinancialStatus && (
                    <>
                      {/* Versão para desktop - colunas separadas */}
                      <TableCell className="font-medium whitespace-nowrap">
                        <span className="text-green-600">
                          {sale.financialSummary ? formatCurrency(sale.financialSummary.totalPaid) : formatCurrency(0)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        <span className="text-red-600">
                          {sale.financialSummary ? formatCurrency(sale.financialSummary.totalCosts) : formatCurrency(0)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        <div className="flex items-center">
                          {sale.financialSummary ? (
                            <>
                              <span className={sale.financialSummary.netResult >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(sale.financialSummary.netResult)}
                              </span>
                              {sale.financialSummary.netResult >= 0 ? (
                                <ArrowUp className="h-3 w-3 ml-1 text-green-600" />
                              ) : (
                                <ArrowDown className="h-3 w-3 ml-1 text-red-600" />
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground italic">Sem dados</span>
                          )}
                        </div>
                      </TableCell>
                    </>
                  )}
                  
                  <TableCell className="whitespace-nowrap">
                    {usesFinancialStatus && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-semibold ${getStatusBadgeStyle(sale.financialStatus || 'pending')}`}
                      >
                        {getStatusLabel(sale.financialStatus || 'pending')}
                      </Badge>
                    )}
                    {!usesFinancialStatus && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-semibold ${getStatusBadgeStyle(sale.status)}`}
                      >
                        {getStatusLabel(sale.status)}
                      </Badge>
                    )}
                    
                    {/* Versão resumida para mobile - resumo financeiro */}
                    {usesFinancialStatus && (
                      <div className="flex flex-col gap-1 text-xs mt-2 hidden">
                        {sale.financialSummary ? (
                          <>
                            <div className="flex items-center">
                              <span className="text-muted-foreground mr-1">Pago:</span>
                              <span className="text-green-600 font-medium">
                                {formatCurrency(sale.financialSummary.totalPaid)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-muted-foreground mr-1">Custos:</span>
                              <span className="text-red-600 font-medium">
                                {formatCurrency(sale.financialSummary.totalCosts)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-muted-foreground mr-1">Resultado:</span>
                              <span className={sale.financialSummary.netResult >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {formatCurrency(sale.financialSummary.netResult)}
                                {sale.financialSummary.netResult >= 0 ? (
                                  <ArrowUp className="h-3 w-3 ml-1 inline text-green-600" />
                                ) : (
                                  <ArrowDown className="h-3 w-3 ml-1 inline text-red-600" />
                                )}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-muted-foreground italic">Sem dados financeiros</div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="default" 
                        size="sm" 
                        onClick={() => onViewFinancials(sale.id)}
                      >
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        <span className="whitespace-nowrap">Financeiro</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
        
        {/* Paginação */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Select 
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1); // Resetar para a primeira página
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="10 por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="25">25 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
                <SelectItem value="100">100 por página</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Mostrando {sales.length} de {totalItems} registro(s)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="mx-2 text-sm">
              Página {page} de {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
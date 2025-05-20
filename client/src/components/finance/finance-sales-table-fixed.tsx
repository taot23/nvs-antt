import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStatusLabel } from "@/lib/status-utils";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  InfoIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Sale } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface FinanceSalesTableProps {
  status: string;
  searchTerm: string;
  onViewFinancials: (saleId: number) => void;
  usesFinancialStatus?: boolean;
  dateRange?: { from?: Date, to?: Date };
}

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

export default function FinanceSalesTableFixed({ 
  status, 
  searchTerm, 
  onViewFinancials,
  usesFinancialStatus = false,
  dateRange
}: FinanceSalesTableProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const { data: salesData, isLoading, error } = useQuery<SalesResponse>({
    queryKey: ['/api/sales', page, limit, status, searchTerm, usesFinancialStatus, dateRange, sortField, sortDirection],
    queryFn: async () => {
      const url = new URL('/api/sales', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      
      url.searchParams.append('sortField', sortField);
      url.searchParams.append('sortDirection', sortDirection);
      
      if (usesFinancialStatus) {
        url.searchParams.append('financialStatus', status);
      } else {
        if (status !== 'all') {
          url.searchParams.append('status', status);
        }
      }
      
      if (searchTerm) url.searchParams.append('searchTerm', searchTerm);
      
      if (dateRange?.from) {
        url.searchParams.append('startDate', dateRange.from.toISOString().split('T')[0]);
        console.log('Filtro de data inicial aplicado:', dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        url.searchParams.append('endDate', dateRange.to.toISOString().split('T')[0]);
        console.log('Filtro de data final aplicado:', dateRange.to.toISOString().split('T')[0]);
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

  useEffect(() => {
    setPage(1);
  }, [status, searchTerm, dateRange]);

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
      <CardContent className="p-6">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full border-collapse border rounded-lg overflow-hidden" style={{ borderSpacing: 0 }}>
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left" style={{ width: '80px' }}>
                  Nº OS
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left" style={{ width: '120px' }}>
                  Vendedor
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left" style={{ width: '120px' }}>
                  Cliente
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left" style={{ width: '120px' }}>
                  Data
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left" style={{ width: '120px' }}>
                  Valor Total
                </th>
                
                {usesFinancialStatus && (
                  <>
                    <th className="border border-gray-300 px-4 py-2 text-left" style={{ width: '120px' }}>
                      Valor Pago
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left" style={{ width: '120px' }}>
                      Custos
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left" style={{ width: '120px' }}>
                      Resultado
                    </th>
                  </>
                )}
                
                <th className="border border-gray-300 px-4 py-2 text-left" style={{ width: '120px' }}>
                  Status
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center" style={{ width: '100px' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    {sale.orderNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span title={sale.sellerName || `Vendedor #${sale.sellerId}`}>
                      {sale.sellerName || `Vendedor #${sale.sellerId}`}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span title={sale.customerName || `Cliente #${sale.customerId}`}>
                      {sale.customerName || `Cliente #${sale.customerId}`}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDate(sale.date)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  
                  {usesFinancialStatus && (
                    <>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className="text-green-600">
                          {sale.financialSummary ? formatCurrency(sale.financialSummary.totalPaid) : formatCurrency(0)}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className="text-red-600">
                          {sale.financialSummary ? formatCurrency(sale.financialSummary.totalCosts) : formatCurrency(0)}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
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
                      </td>
                    </>
                  )}
                  
                  <td className="border border-gray-300 px-4 py-2">
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
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <Button
                      variant="default" 
                      size="sm" 
                      onClick={() => onViewFinancials(sale.id)}
                    >
                      <DollarSign className="h-3.5 w-3.5 mr-1" />
                      <span>Financeiro</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-2">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1); 
              }}
            >
              <option value="5">5 por página</option>
              <option value="10">10 por página</option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
            </select>
            <span className="text-sm text-gray-500">
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
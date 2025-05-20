import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  SortAsc,
  SortDesc,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { getStatusLabel } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import { FinanceSale, SafeUser } from "./finance-types";

interface SimpleFinanceTableProps {
  data: FinanceSale[];
  isLoading: boolean;
  error: Error | null;
  sortField: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onViewFinancials: (saleId: number) => void;
  user: SafeUser | null;
  usesFinancialStatus?: boolean;
}

const SimpleFinanceTable: React.FC<SimpleFinanceTableProps> = ({
  data,
  isLoading,
  error,
  sortField,
  sortDirection,
  onSort,
  onViewFinancials,
  user,
  usesFinancialStatus = false,
}) => {
  // Alternar a ordem de classificação
  const toggleSort = (field: string) => {
    onSort(field);
  };

  // Badge para status
  const StatusBadge = ({ status }: { status: string }) => {
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

    return (
      <Badge variant="outline" className={`text-xs font-semibold ${getStatusBadgeStyle(status)}`}>
        {getStatusLabel(status)}
      </Badge>
    );
  };

  return (
    <div className="w-full overflow-x-auto border rounded-md">
      <div className="min-w-full">
        <Table id="finance-table" className="w-full table-fixed">
          <TableCaption>
            {isLoading ? (
              "Carregando dados..."
            ) : error ? (
              <span className="text-red-500">Erro ao carregar: {error.message}</span>
            ) : data.length === 0 ? (
              "Nenhuma venda encontrada"
            ) : (
              `Total de ${data.length} vendas`
            )}
          </TableCaption>
          
          <TableHeader>
            <TableRow>
              <TableHead className="w-[8%] cursor-pointer" onClick={() => toggleSort('orderNumber')}>
                <div className="flex items-center">
                  Nº OS
                  {sortField === 'orderNumber' && (
                    sortDirection === 'asc' 
                      ? <SortAsc className="ml-1 h-4 w-4" /> 
                      : <SortDesc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[10%] cursor-pointer" onClick={() => toggleSort('date')}>
                <div className="flex items-center">
                  Data
                  {sortField === 'date' && (
                    sortDirection === 'asc' 
                      ? <SortAsc className="ml-1 h-4 w-4" /> 
                      : <SortDesc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[12%] cursor-pointer" onClick={() => toggleSort('sellerId')}>
                <div className="flex items-center">
                  Vendedor
                  {sortField === 'sellerId' && (
                    sortDirection === 'asc' 
                      ? <SortAsc className="ml-1 h-4 w-4" /> 
                      : <SortDesc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[15%] cursor-pointer" onClick={() => toggleSort('customerName')}>
                <div className="flex items-center">
                  Cliente
                  {sortField === 'customerName' && (
                    sortDirection === 'asc' 
                      ? <SortAsc className="ml-1 h-4 w-4" /> 
                      : <SortDesc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[10%] cursor-pointer" onClick={() => toggleSort('totalAmount')}>
                <div className="flex items-center">
                  Valor Total
                  {sortField === 'totalAmount' && (
                    sortDirection === 'asc' 
                      ? <SortAsc className="ml-1 h-4 w-4" /> 
                      : <SortDesc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>

              {usesFinancialStatus && (
                <>
                  <TableHead className="w-[9%] cursor-pointer" onClick={() => toggleSort('totalPaid')}>
                    <div className="flex items-center">
                      Valor Pago
                      {sortField === 'totalPaid' && (
                        sortDirection === 'asc' 
                          ? <SortAsc className="ml-1 h-4 w-4" /> 
                          : <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[9%] cursor-pointer" onClick={() => toggleSort('totalToReceive')}>
                    <div className="flex items-center">
                      A Receber
                      {sortField === 'totalToReceive' && (
                        sortDirection === 'asc' 
                          ? <SortAsc className="ml-1 h-4 w-4" /> 
                          : <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[8%] cursor-pointer" onClick={() => toggleSort('totalCosts')}>
                    <div className="flex items-center">
                      Custos
                      {sortField === 'totalCosts' && (
                        sortDirection === 'asc' 
                          ? <SortAsc className="ml-1 h-4 w-4" /> 
                          : <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[9%] cursor-pointer" onClick={() => toggleSort('netResult')}>
                    <div className="flex items-center">
                      Resultado
                      {sortField === 'netResult' && (
                        sortDirection === 'asc' 
                          ? <SortAsc className="ml-1 h-4 w-4" /> 
                          : <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                </>
              )}
              
              <TableHead className="w-[8%] cursor-pointer" onClick={() => toggleSort(usesFinancialStatus ? 'financialStatus' : 'status')}>
                <div className="flex items-center">
                  Status
                  {sortField === (usesFinancialStatus ? 'financialStatus' : 'status') && (
                    sortDirection === 'asc' 
                      ? <SortAsc className="ml-1 h-4 w-4" /> 
                      : <SortDesc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right w-[8%]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell 
                  colSpan={usesFinancialStatus ? 10 : 7} 
                  className="text-center py-8"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell 
                  colSpan={usesFinancialStatus ? 10 : 7} 
                  className="text-center py-8 text-red-500"
                >
                  Erro ao carregar vendas: {error.message}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={usesFinancialStatus ? 10 : 7} 
                  className="text-center py-8"
                >
                  Nenhuma venda encontrada
                </TableCell>
              </TableRow>
            ) : (
              data.map(sale => (
                <TableRow key={sale.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {sale.orderNumber}
                  </TableCell>
                  <TableCell>
                    {formatDate(sale.date || sale.createdAt)}
                  </TableCell>
                  <TableCell>
                    <span title={sale.sellerName || `Vendedor #${sale.sellerId}`}>
                      {sale.sellerName || `Vendedor #${sale.sellerId}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span title={sale.customerName || `Cliente #${sale.customerId}`}>
                      {sale.customerName || `Cliente #${sale.customerId}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    {`R$ ${parseFloat(sale.totalAmount).toFixed(2).replace('.', ',')}`}
                  </TableCell>
                  
                  {usesFinancialStatus && (
                    <>
                      <TableCell>
                        <span className="text-green-600">
                          {sale.financialSummary ? `R$ ${parseFloat(sale.financialSummary.totalPaid.toString()).toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-blue-600 font-medium">
                          {sale.financialSummary ? `R$ ${parseFloat(sale.financialSummary.totalToReceive.toString()).toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600">
                          {sale.financialSummary ? `R$ ${parseFloat(sale.financialSummary.totalCosts.toString()).toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {sale.financialSummary ? (
                            <>
                              <span className={sale.financialSummary.netResult >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {`R$ ${Math.abs(parseFloat(sale.financialSummary.netResult.toString())).toFixed(2).replace('.', ',')}`}
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
                  
                  <TableCell>
                    {usesFinancialStatus ? (
                      <StatusBadge status={sale.financialStatus || 'pending'} />
                    ) : (
                      <StatusBadge status={sale.status} />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline" 
                      size="icon"
                      onClick={() => onViewFinancials(sale.id)}
                      className={cn(
                        "h-8 w-8 rounded-full",
                        !user || (user.role !== 'admin' && user.role !== 'financeiro') 
                          ? "bg-gray-100 text-gray-400 hover:text-gray-500 cursor-not-allowed" 
                          : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                      )}
                      disabled={!user || (user.role !== 'admin' && user.role !== 'financeiro')}
                      title="Gerenciar financeiro"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SimpleFinanceTable;
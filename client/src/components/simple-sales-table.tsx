import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import ReenvioButton from "./sales/reenvio-button";
import DevolveButton from "./sales/devolve-button";

// Função para formatar datas sem problema de timezone
const formatDateWithoutTimezone = (date: string | Date): string => {
  if (!date) return '';
  
  // Para datas no formato ISO (YYYY-MM-DD)
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Extrair ano, mês e dia diretamente da string para evitar problemas de timezone
    const [year, month, day] = date.split('-').map(Number);
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }
  
  // Se a data incluir hora (formato ISO completo), precisamos ajustar o timezone
  if (typeof date === 'string' && date.includes('T')) {
    const parts = date.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
  }
  
  // Para objetos Date ou outros formatos de string
  return format(typeof date === 'string' ? new Date(date) : date, 'dd/MM/yyyy');
};
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
  Eye,
  ClipboardList,
  Edit,
  Trash2,
  CornerDownRight,
  CheckCircle2,
  AlertTriangle,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { getStatusLabel, getStatusVariant } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { Sale } from "@shared/schema";

interface SimpleSalesTableProps {
  data: Sale[];
  isLoading: boolean;
  error: Error | null;
  sortField: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onViewDetails: (sale: Sale) => void;
  onViewHistory: (sale: Sale) => void;
  onEdit: (sale: Sale) => void;
  onStartExecution: (sale: Sale) => void;
  onCompleteExecution: (sale: Sale) => void;
  onReturnClick: (sale: Sale) => void;
  onMarkAsPaid: (sale: Sale) => void;
  onDeleteClick: (sale: Sale) => void;
  user: { id: number; username: string; role: string } | null;
}

const SimpleSalesTable: React.FC<SimpleSalesTableProps> = ({
  data,
  isLoading,
  error,
  sortField,
  sortDirection,
  onSort,
  onViewDetails,
  onViewHistory,
  onEdit,
  onStartExecution,
  onCompleteExecution,
  onReturnClick,
  onMarkAsPaid,
  onDeleteClick,
  user,
}) => {
  
  // Badge para status
  const StatusBadge = ({ status }: { status: string }) => (
    <Badge variant={getStatusVariant(status) as any}>
      {getStatusLabel(status)}
    </Badge>
  );
  
  // Badge para pagamento
  const PaidBadge = () => (
    <Badge variant="outline" className="text-green-600 border-green-600">
      Pago
    </Badge>
  );
  
  // Componente para exibir o tipo de serviço
  const ServiceType = ({ sale }: { sale: Sale }) => (
    <div className="flex items-center gap-1">
      {sale.serviceTypeId ? (
        <span className="text-xs font-medium inline-flex items-center">
          <CornerDownRight className="h-3.5 w-3.5 mr-1 text-primary" />
          {sale.serviceTypeName || "Tipo não identificado"}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Não definido</span>
      )}
    </div>
  );

  // Alternar a ordem de classificação
  const toggleSort = (field: string) => {
    onSort(field);
  };

  // Estilos baseados no status
  const getRowStyle = (status: string) => {
    return cn(
      status === "completed" && "bg-green-100 border-green-300 border",
      status === "in_progress" && "bg-orange-100 border-orange-300 border",
      status === "returned" && "bg-red-100 border-red-300 border",
      status === "corrected" && "bg-yellow-100 border-yellow-300 border"
    );
  };

  const getFirstCellStyle = (status: string) => {
    return cn(
      "font-medium",
      status === "completed" && "bg-green-100 border-l-4 border-l-green-500",
      status === "in_progress" && "bg-orange-100 border-l-4 border-l-orange-500",
      status === "returned" && "bg-red-100 border-l-4 border-l-red-500",
      status === "corrected" && "bg-yellow-100 border-l-4 border-l-yellow-500"
    );
  };

  const getCellStyle = (status: string) => {
    return cn(
      status === "completed" && "bg-green-100",
      status === "in_progress" && "bg-orange-100",
      status === "returned" && "bg-red-100",
      status === "corrected" && "bg-yellow-100"
    );
  };

  return (
    <Table>
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
          <TableHead className="w-[100px] cursor-pointer" onClick={() => toggleSort('orderNumber')}>
            <div className="flex items-center">
              Nº OS
              {sortField === 'orderNumber' && (
                sortDirection === 'asc' 
                  ? <SortAsc className="ml-1 h-4 w-4" /> 
                  : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => toggleSort('date')}>
            <div className="flex items-center">
              Data
              {sortField === 'date' && (
                sortDirection === 'asc' 
                  ? <SortAsc className="ml-1 h-4 w-4" /> 
                  : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => toggleSort('customerName')}>
            <div className="flex items-center">
              Cliente
              {sortField === 'customerName' && (
                sortDirection === 'asc' 
                  ? <SortAsc className="ml-1 h-4 w-4" /> 
                  : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => toggleSort('sellerName')}>
            <div className="flex items-center">
              Vendedor
              {sortField === 'sellerName' && (
                sortDirection === 'asc' 
                  ? <SortAsc className="ml-1 h-4 w-4" /> 
                  : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => toggleSort('totalAmount')}>
            <div className="flex items-center">
              Valor Total
              {sortField === 'totalAmount' && (
                sortDirection === 'asc' 
                  ? <SortAsc className="ml-1 h-4 w-4" /> 
                  : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
            <div className="flex items-center">
              Status
              {sortField === 'status' && (
                sortDirection === 'asc' 
                  ? <SortAsc className="ml-1 h-4 w-4" /> 
                  : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </div>
          </TableHead>
          {/* Coluna para tipo de execução - mostrar apenas para operacional, financeiro e admin */}
          {(user?.role === "operacional" || user?.role === "financeiro" || user?.role === "admin") && (
            <TableHead>Tipo de Execução</TableHead>
          )}
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell 
              colSpan={(user?.role === "operacional" || user?.role === "financeiro" || user?.role === "admin") ? 8 : 7} 
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
              colSpan={(user?.role === "operacional" || user?.role === "financeiro" || user?.role === "admin") ? 8 : 7} 
              className="text-center py-8 text-red-500"
            >
              Erro ao carregar vendas: {error.message}
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell 
              colSpan={(user?.role === "operacional" || user?.role === "financeiro" || user?.role === "admin") ? 8 : 7} 
              className="text-center py-8"
            >
              Nenhuma venda encontrada
            </TableCell>
          </TableRow>
        ) : (
          data.map(sale => (
            <TableRow key={sale.id} className={getRowStyle(sale.status)}>
              <TableCell className={getFirstCellStyle(sale.status)}>
                {sale.orderNumber}
              </TableCell>
              <TableCell className={getCellStyle(sale.status)}>
                {formatDateWithoutTimezone(sale.date || sale.createdAt)}
              </TableCell>
              <TableCell className={getCellStyle(sale.status)}>
                {sale.customerName}
              </TableCell>
              <TableCell className={getCellStyle(sale.status)}>
                {sale.sellerName}
              </TableCell>
              <TableCell className={getCellStyle(sale.status)}>
                {`R$ ${parseFloat(sale.totalAmount).toFixed(2).replace('.', ',')}`}
              </TableCell>
              <TableCell className={getCellStyle(sale.status)}>
                <div className="flex flex-col gap-1">
                  <StatusBadge status={sale.status} />
                  {sale.financialStatus === 'paid' && <PaidBadge />}
                </div>
              </TableCell>
              {/* Célula para tipo de execução - mostrar apenas para operacional, financeiro e admin */}
              {(user?.role === "operacional" || user?.role === "financeiro" || user?.role === "admin") && (
                <TableCell className={getCellStyle(sale.status)}>
                  <ServiceType sale={sale} />
                </TableCell>
              )}
              <TableCell className={cn("text-right", getCellStyle(sale.status))}>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(sale)}
                    className="h-8 w-8"
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewHistory(sale)}
                    className="h-8 w-8"
                    title="Ver histórico de status"
                  >
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                  
                  {/* BOTÃO DE EDIÇÃO REMOVIDO POR SOLICITAÇÃO DO CLIENTE (30/04/2025) */}
                  
                  {/* Permissão para iniciar execução (operacional/admin) */}
                  {(user?.role === "admin" || user?.role === "operacional") && 
                    (sale.status === "pending" || sale.status === "corrected") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onStartExecution(sale)}
                      className="h-8 w-8"
                      title="Iniciar execução"
                    >
                      <CornerDownRight className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Permissão para concluir execução (operacional/admin) */}
                  {(user?.role === "admin" || user?.role === "operacional") && 
                    sale.status === "in_progress" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCompleteExecution(sale)}
                      className="h-8 w-8"
                      title="Concluir execução"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Permissão para devolver a venda (operacional/admin) */}
                  {(user?.role === "admin" || user?.role === "operacional") && 
                    (sale.status === "pending" || sale.status === "in_progress") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onReturnClick(sale)}
                      className="h-8 w-8 text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                      title="Devolver para correção"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Botão de reenvio para vendas com status "returned" */}
                  {(user?.role === "admin" || 
                    user?.role === "supervisor" || 
                    (user?.role === "vendedor" && sale.sellerId === user?.id)) && 
                    sale.status === "returned" && (
                    <ReenvioButton sale={sale} />
                  )}
                  
                  {/* Botão de devolução para vendas com status "corrected" */}
                  {(user?.role === "admin" || user?.role === "operacional") && 
                    sale.status === "corrected" && (
                    <DevolveButton sale={sale} />
                  )}
                  
                  {/* Permissão para marcar como paga (financeiro/admin) - apenas em páginas financeiras */}
                  {(user?.role === "admin" || user?.role === "financeiro") && 
                    sale.status === "completed" && 
                    sale.financialStatus !== "paid" && 
                    // Verificar se estamos na interface financeira através da URL
                    (
                      window.location.pathname.includes('/finance') || 
                      window.location.pathname.includes('/financeiro')
                    ) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMarkAsPaid(sale)}
                      className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50"
                      title="Confirmar pagamento"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Permissão para excluir (apenas admin) */}
                  {user?.role === "admin" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteClick(sale)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default SimpleSalesTable;
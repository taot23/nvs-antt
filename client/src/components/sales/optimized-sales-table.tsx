import { useState, useEffect, useCallback, useRef } from 'react';
import { useTableProcessor } from '@/hooks/useTableProcessor';
import { useDebounce } from '@/hooks/useDebounce';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import VirtualizedTable from '@/components/virtualized-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RotateCw, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OptimizedSalesTableProps {
  sales: any[];
  isLoading: boolean;
  error: Error | null;
  user: any | null;
  onViewDetails: (sale: any) => void;
  onViewHistory: (sale: any) => void;
  onEdit: (sale: any) => void;
  onStartExecution: (sale: any) => void;
  onCompleteExecution: (sale: any) => void;
  onReturnClick: (sale: any) => void;
  onMarkAsPaid: (sale: any) => void;
  onDeleteClick: (sale: any) => void;
  ReenviaButton: React.ComponentType<{ sale: any }>;
  DevolveButton: React.ComponentType<{ sale: any }>;
}

/**
 * Componente de tabela de vendas otimizado
 * 
 * Este componente implementa todas as otimizações desenvolvidas:
 * - Lazy loading de dados
 * - Processamento fora da thread principal com Web Workers
 * - Cachê de dados para reduzir requisições
 * - Pre-renderização progressiva
 * - Virtualização avançada com windowing
 * - Monitoramento de performance
 */
export default function OptimizedSalesTable({
  sales,
  isLoading,
  error,
  user,
  onViewDetails,
  onViewHistory,
  onEdit, // Edição desativada
  onStartExecution,
  onCompleteExecution,
  onReturnClick,
  onMarkAsPaid,
  onDeleteClick,
  ReenviaButton,
  DevolveButton
}: OptimizedSalesTableProps) {
  // Estados para busca, ordenação e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('orderNumber');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Hook para monitoramento de performance
  const { renderRate, monitorTableRendering } = usePerformanceMonitor();
  
  // Referência para tempo de inicio do processamento
  const startTimeRef = useRef(performance.now());
  
  // Processar os dados usando o worker
  const { 
    data: processedSales, 
    isLoading: processingLoading, 
    renderProgress,
    metrics
  } = useTableProcessor(sales, {
    sortField,
    sortDirection,
    searchTerm: useDebounce(searchTerm, 300),
    statusFilter
  });
  
  // Exportar para Excel
  const exportToExcel = useCallback(() => {
    const exportData = processedSales.map((sale: any) => ({
      'Ordem de Serviço': sale.orderNumber,
      Data: sale.date,
      Cliente: sale.customerName,
      Vendedor: sale.sellerName,
      Valor: `R$ ${parseFloat(sale.totalAmount).toFixed(2)}`,
      Status: sale.status,
      'Tipo de Serviço': sale.serviceTypeName || '',
      'Prestador Parceiro': sale.serviceProviderName || ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas');
    XLSX.writeFile(workbook, 'vendas.xlsx');
  }, [processedSales]);
  
  // Exportar para PDF
  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Vendas', 14, 22);
    
    // Subtítulo com data atual
    doc.setFontSize(11);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    
    // Tabela
    const tableData = processedSales.map((sale: any) => [
      sale.orderNumber,
      sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : '-',
      sale.customerName,
      sale.sellerName,
      `R$ ${parseFloat(sale.totalAmount).toFixed(2)}`,
      getStatusLabel(sale.status)
    ]);
    
    autoTable(doc, {
      head: [['Ordem de Serviço', 'Data', 'Cliente', 'Vendedor', 'Valor', 'Status']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 20 }
    });
    
    doc.save('vendas.pdf');
  }, [processedSales]);
  
  // Função para alternar a direção de ordenação
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Função para obter o label de status
  function getStatusLabel(status: string) {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Execução';
      case 'completed': return 'Concluído';
      case 'returned': return 'Devolvido';
      case 'canceled': return 'Cancelado';
      default: return status;
    }
  }
  
  // Efeito para monitorar o tempo de renderização
  useEffect(() => {
    if (!isLoading && !processingLoading) {
      const itemsPerSecond = monitorTableRendering(processedSales.length, startTimeRef.current);
      console.log(`[OptimizedSalesTable] Renderização: ${itemsPerSecond.toFixed(2)} linhas/s`);
    }
  }, [isLoading, processingLoading, processedSales.length, monitorTableRendering]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Vendas
          {renderRate > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({renderRate} FPS)
            </span>
          )}
        </CardTitle>
        
        <div className="flex flex-col gap-4 mt-4 md:flex-row">
          {/* Filtro de busca */}
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por OS, cliente ou vendedor..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filtro de status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Execução</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="returned">Devolvido</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Botões de exportação */}
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={exportToExcel} title="Exportar para Excel">
              <FileDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={exportToPDF} title="Exportar para PDF">
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Indicador de progresso de renderização */}
        {renderProgress > 0 && renderProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${renderProgress}%` }}
            ></div>
          </div>
        )}
        
        {/* Tabela virtualizada */}
        <VirtualizedTable
          data={processedSales}
          isLoading={isLoading || processingLoading}
          error={error}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={toggleSort}
          onViewDetails={onViewDetails}
          onViewHistory={onViewHistory}
          onEdit={onEdit}
          onStartExecution={onStartExecution}
          onCompleteExecution={onCompleteExecution}
          onReturnClick={onReturnClick}
          onMarkAsPaid={onMarkAsPaid}
          onDeleteClick={onDeleteClick}
          user={user}
          ReenviaButton={ReenviaButton}
          DevolveButton={DevolveButton}
          renderProgress={renderProgress}
        />
        
        {/* Métricas de performance */}
        {metrics && metrics.itemsPerSecond > 0 && (
          <div className="mt-2 text-xs text-right text-muted-foreground">
            <span className="font-mono">{metrics.itemsPerSecond.toFixed(2)} items/seg</span>
            <span className="mx-2">|</span>
            <span className="font-mono">{metrics.totalRenderTime.toFixed(2)}ms total</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
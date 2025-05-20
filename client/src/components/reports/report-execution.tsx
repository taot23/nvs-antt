import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  ArrowLeft, 
  FileDown, 
  FileSpreadsheet, 
  FileText, 
  User, 
  Calendar, 
  Timer, 
  AlertCircle,
  Check,
  File,
  BarChart3,
  PieChart,
  LineChart,
  Percent,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Tag
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Interfaces para tipagem
interface ReportData {
  id: number;
  name: string;
  description?: string;
  query: string;
  parameters?: string;
  permissions: string;
  createdBy: number;
  createdAt: string;
}

interface ReportExecutionData {
  id: number;
  report_id?: number;
  reportId?: number;
  user_id?: number;
  userId?: number;
  parameters: Record<string, string>;
  results: any[];
  execution_time?: number;
  status: string;
  error_message?: string;
  created_at: string;
  report_name?: string;
  name?: string;
  description?: string;
  username?: string;
}

interface ReportExecutionProps {
  reportId?: number;
  executionId?: number;
  onBack: () => void;
}

export function ReportExecution({
  reportId,
  executionId,
  onBack,
}: ReportExecutionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"data" | "params" | "info" | "dashboard">("data");
  const [columns, setColumns] = useState<any[]>([]);
  const exportDataRef = useRef<any[]>([]);
  const [dashboardData, setDashboardData] = useState<{
    summaries: Array<{label: string, value: string | number, icon: React.ReactNode, color: string}>,
    chartData: any,
    hasFinancialData: boolean,
    timeData: boolean,
    statusData: boolean,
    trends: Array<{
      label: string, 
      trend: 'up' | 'down' | 'stable', 
      percentage?: number,
      description: string
    }>,
    topItems?: Array<{name: string, value: number | string}>,
    insights: Array<string>
  }>({
    summaries: [],
    chartData: null,
    hasFinancialData: false,
    timeData: false,
    statusData: false,
    trends: [],
    topItems: [],
    insights: []
  });
  
  // Estado para armazenar o cabeçalho do relatório para exportação
  const [reportHeader, setReportHeader] = useState({
    title: "",
    date: new Date(),
    parameters: {} as Record<string, string>,
  });

  // Buscar relatório por ID (para executar um novo relatório)
  const { 
    data: report, 
    isLoading: isLoadingReport,
    error: reportError,
  } = useQuery<ReportData>({
    queryKey: ["/api/reports", reportId],
    enabled: !!reportId && !executionId,
  });

  // Buscar execução específica (para visualizar resultados existentes)
  const { 
    data: execution, 
    isLoading: isLoadingExecution,
    error: executionError
  } = useQuery<ReportExecutionData>({
    queryKey: ["/api/report-executions", executionId],
    enabled: !!executionId && !!user, // Executar somente se usuário estiver autenticado
    retry: 3,
    retryDelay: 1000,
  });

  // Preparar os dados para exibição quando a execução for carregada
  useEffect(() => {
    if (execution && execution.results) {
      try {
        // Garantir que os resultados sejam um array
        const resultsArray = Array.isArray(execution.results) 
          ? execution.results 
          : typeof execution.results === 'string'
            ? JSON.parse(execution.results)
            : [];
            
        if (resultsArray.length > 0) {
          console.log("Processando resultados do relatório:", resultsArray.length, "registros");
          
          // Processar dados para o dashboard se houver dados
          prepareReportDashboard(resultsArray, execution.report_name || execution.name || "");
          
          // Construir as colunas dinamicamente com base nos resultados
          const sampleRow = resultsArray[0];
          
          // Garantir que temos uma linha de amostra válida
          if (sampleRow && typeof sampleRow === 'object') {
            // Mapear nomes de colunas em inglês para português
            const columnTranslations: Record<string, string> = {
              // Traduções comuns para campos de relatórios
              'status': 'Status',
              'quantity': 'Quantidade',
              'quantidade': 'Quantidade',
              'amount': 'Valor',
              'total': 'Total',
              'date': 'Data',
              'price': 'Preço',
              'value': 'Valor',
              'name': 'Nome',
              'description': 'Descrição',
              'seller': 'Vendedor',
              'customer': 'Cliente',
              'service': 'Serviço',
              'created_at': 'Data de Criação',
              'updated_at': 'Data de Atualização',
              'order_number': 'Número do Pedido',
              'id': 'ID',
              'user': 'Usuário',
              'payment_method': 'Método de Pagamento',
              'installments': 'Parcelas',
              'installment_value': 'Valor da Parcela',
              'due_date': 'Data de Vencimento',
              'payment_date': 'Data de Pagamento',
              'notes': 'Observações',
              'valor_medio': 'Valor Médio',
              'valor_total': 'Valor Total',
              'completed': 'Concluído',
              'pending': 'Pendente',
              'in_progress': 'Em Progresso'
            };
            
            const newColumns = Object.keys(sampleRow).map(key => ({
              accessorKey: key,
              // Verificar se temos uma tradução para este campo, senão usar formatação padrão
              header: columnTranslations[key.toLowerCase()] || 
                     key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              cell: ({ row }: any) => {
                const value = row.getValue(key);
                
                // Formatar valores de data
                if (value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}(T.*)?$/)) {
                  try {
                    const date = new Date(value);
                    return format(date, "dd/MM/yyyy", { locale: ptBR });
                  } catch (e) {
                    return value;
                  }
                }
                
                // Formatar valores numéricos
                if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
                  // Se parecer um valor monetário
                  if (key.includes('valor') || key.includes('price') || key.includes('amount') || key.includes('total')) {
                    try {
                      return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    } catch (e) {
                      return value;
                    }
                  }
                }
                
                // Traduzir valores status comuns
                if (typeof value === 'string') {
                  // Traduzir estados de status
                  const statusTranslations: Record<string, string> = {
                    'pending': 'Pendente',
                    'in_progress': 'Em Andamento',
                    'completed': 'Concluído',
                    'canceled': 'Cancelado',
                    'success': 'Sucesso',
                    'error': 'Erro',
                    'waiting': 'Aguardando',
                    'approved': 'Aprovado',
                    'rejected': 'Rejeitado',
                    'paid': 'Pago',
                    'unpaid': 'Não Pago',
                    'overdue': 'Atrasado',
                    'active': 'Ativo',
                    'inactive': 'Inativo',
                    'delivery': 'Entrega'
                  };
                  
                  if (statusTranslations[value.toLowerCase()]) {
                    return statusTranslations[value.toLowerCase()];
                  }
                }
                
                return value;
              }
            }));
            
            setColumns(newColumns);
            
            // Armazenar dados para exportação
            exportDataRef.current = resultsArray;
            
            // Configurar o cabeçalho do relatório para exportação
            setReportHeader({
              title: execution.name || execution.report_name || "Relatório",
              date: new Date(execution.created_at),
              parameters: execution.parameters || {},
            });
          }
        }
      } catch (error) {
        console.error("Erro ao processar resultados:", error);
        toast({
          title: "Erro ao processar resultados",
          description: "Ocorreu um erro ao processar os resultados do relatório.",
          variant: "destructive",
        });
      }
    }
  }, [execution]);

  // Preparar dados para exportação (formatar valores)
  const prepareDataForExport = () => {
    if (!exportDataRef.current || exportDataRef.current.length === 0) return [];
    
    // Criar cópia profunda dos dados para não modificar os originais
    const preparedData = JSON.parse(JSON.stringify(exportDataRef.current));
    
    // Formatar os dados para melhor visualização na exportação
    return preparedData.map((row: Record<string, any>) => {
      const formattedRow: Record<string, any> = {};
      
      // Percorrer cada coluna
      Object.entries(row).forEach(([key, value]) => {
        // Tratar valores nulos ou undefined
        if (value === null || value === undefined) {
          formattedRow[key] = '';
          return;
        }
        
        // Verificar se é uma data ISO
        if (typeof value === 'string' && 
            /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/.test(value)) {
          try {
            formattedRow[key] = format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ptBR });
          } catch (e) {
            formattedRow[key] = value;
          }
          return;
        }
        
        // Verificar se é um número que pode ser um valor monetário
        if ((typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) && 
            (key.toLowerCase().includes('valor') || 
            key.toLowerCase().includes('preco') || 
            key.toLowerCase().includes('total') || 
            key.toLowerCase().includes('amount'))) {
          try {
            const numValue = typeof value === 'string' ? Number(value) : value;
            formattedRow[key] = numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          } catch (e) {
            formattedRow[key] = value;
          }
          return;
        }
        
        // Traduzir valores de status para o português
        if (typeof value === 'string') {
          const statusTranslations: Record<string, string> = {
            'pending': 'Pendente',
            'in_progress': 'Em Andamento',
            'completed': 'Concluído',
            'canceled': 'Cancelado',
            'success': 'Sucesso',
            'error': 'Erro',
            'waiting': 'Aguardando',
            'approved': 'Aprovado',
            'rejected': 'Rejeitado',
            'paid': 'Pago',
            'unpaid': 'Não Pago',
            'overdue': 'Atrasado',
            'active': 'Ativo',
            'inactive': 'Inativo',
            'delivery': 'Entrega'
          };
          
          if (statusTranslations[value.toLowerCase()]) {
            formattedRow[key] = statusTranslations[value.toLowerCase()];
            return;
          }
        }
        
        // Passar valor normal
        formattedRow[key] = value;
      });
      
      return formattedRow;
    });
  };

  // Exportar para Excel
  const exportToExcel = () => {
    try {
      if (!exportDataRef.current.length) {
        toast({
          title: "Erro ao exportar",
          description: "Não há dados para exportar.",
          variant: "destructive",
        });
        return;
      }
      
      const reportTitle = reportHeader.title;
      const dateStr = format(reportHeader.date, "dd/MM/yyyy HH:mm", { locale: ptBR });
      
      // Formatar dados
      const formattedData = prepareDataForExport();
      
      // Criar nova planilha
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      
      // Ajustar largura das colunas
      const columnWidths = Object.keys(formattedData[0]).reduce((acc, key) => {
        const maxLength = Math.max(
          key.length,
          ...formattedData.map((row: Record<string, any>) => String(row[key]).length)
        );
        acc[key] = Math.min(maxLength + 2, 50); // Limitar a 50 caracteres
        return acc;
      }, {} as Record<string, number>);
      
      ws['!cols'] = Object.values(columnWidths).map(width => ({ width }));
      
      // Adicionar metadados
      wb.Props = {
        Title: reportTitle,
        Author: user?.username || "Sistema",
        CreatedDate: new Date()
      };
      
      // Adicionar planilha ao workbook
      XLSX.utils.book_append_sheet(wb, ws, "Dados");
      
      // Adicionar informações do relatório em uma nova aba
      const infoWorksheet = XLSX.utils.json_to_sheet([{
        "Nome do Relatório": reportTitle,
        "Descrição": reportDescription || "Sem descrição",
        "Data de Geração": dateStr,
        "Gerado por": user?.username || "Sistema",
        "Total de Registros": exportDataRef.current.length
      }]);
      
      // Adicionar parâmetros em uma nova aba, se houver
      if (Object.keys(reportHeader.parameters).length > 0) {
        const paramData = Object.entries(reportHeader.parameters).map(([key, value]) => ({
          "Parâmetro": key,
          "Valor": value
        }));
        const paramWorksheet = XLSX.utils.json_to_sheet(paramData);
        XLSX.utils.book_append_sheet(wb, paramWorksheet, "Parâmetros");
      }
      
      XLSX.utils.book_append_sheet(wb, infoWorksheet, "Informações");
      
      // Salvar arquivo
      const fileName = `${reportTitle.replace(/\s+/g, '_')}_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "Excel exportado com sucesso",
        description: `O arquivo ${fileName} foi baixado.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar para Excel. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Exportar para PDF
  const exportToPdf = () => {
    try {
      if (!exportDataRef.current.length) {
        toast({
          title: "Erro ao exportar",
          description: "Não há dados para exportar.",
          variant: "destructive",
        });
        return;
      }
      
      const reportTitle = reportHeader.title;
      const dateStr = format(reportHeader.date, "dd/MM/yyyy HH:mm", { locale: ptBR });
      
      // Obter dados formatados para exibição no PDF
      const formattedData = prepareDataForExport();
      
      // Criar documento PDF com orientação paisagem para mais dados
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Adicionar cabeçalho com título
      doc.setFontSize(18);
      doc.setTextColor(50, 50, 100);
      doc.text(reportTitle, 14, 15);
      
      // Adicionar descrição se existir
      if (reportDescription) {
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        // Limitar descrição para evitar que saia da página
        const maxDescLength = 150;
        const desc = reportDescription.length > maxDescLength 
          ? reportDescription.substring(0, maxDescLength) + '...' 
          : reportDescription;
        doc.text(desc, 14, 22);
      }
      
      // Adicionar linha horizontal
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 25, doc.internal.pageSize.width - 14, 25);
      
      // Adicionar metadados
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 30);
      doc.text(`Usuário: ${user?.username || "Sistema"}`, 14, 35);
      doc.text(`Total de Registros: ${exportDataRef.current.length}`, 14, 40);
      
      // Adicionar parâmetros se existirem
      let paramY = 40;
      if (Object.keys(reportHeader.parameters).length > 0) {
        paramY += 5;
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 100);
        doc.text("Parâmetros Utilizados:", 14, paramY);
        paramY += 5;
        
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        
        const paramList = Object.entries(reportHeader.parameters)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' | ');
        
        doc.text(paramList, 14, paramY);
        paramY += 5;
      }
      
      // Extrair as colunas para exibição
      const pdfColumns = columns.map(col => ({
        header: col.header,
        dataKey: col.accessorKey as string
      }));
      
      // Preparar dados para exibição
      // Garantir que todas as propriedades dos dados formatados sejam strings
      const pdfData = formattedData.map((row: Record<string, any>) => {
        const newRow: Record<string, string> = {};
        Object.entries(row).forEach(([key, value]) => {
          // Converter todos os valores para string
          newRow[key] = value === null || value === undefined 
            ? '' 
            : typeof value === 'object' 
              ? JSON.stringify(value) 
              : String(value);
        });
        return newRow;
      });
      
      // Adicionar tabela com dados formatados
      autoTable(doc, {
        startY: paramY + 5,
        columns: pdfColumns,
        body: pdfData,
        headStyles: {
          fillColor: [60, 90, 150],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 250]
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        margin: { top: paramY + 5, right: 14, bottom: 20, left: 14 },
        didDrawPage: (data) => {
          // Adicionar rodapé com numeração de página em cada página
          // @ts-ignore - o tipo interno da biblioteca não está atualizado
          const pageInfo = doc.internal.getCurrentPageInfo();
          const pageNumber = pageInfo ? pageInfo.pageNumber : 1;
          const totalPages = `Página ${pageNumber}`;
          
          // Adicionar rodapé com data e número da página
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
          
          // Adicionar empresa e data à esquerda
          doc.text(
            `Sistema de Gerenciamento - ${format(new Date(), 'dd/MM/yyyy')}`,
            14,
            doc.internal.pageSize.height - 10
          );
          
          // Adicionar numeração de página centralizada
          doc.text(
            totalPages,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
          
          // Adicionar username à direita
          doc.text(
            `Gerado por: ${user?.username || "Sistema"}`,
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
          );
        }
      });
      
      // Salvar arquivo
      const fileName = `${reportTitle.replace(/\s+/g, '_')}_${format(new Date(), "yyyy-MM-dd_HH-mm")}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF exportado com sucesso",
        description: `O arquivo ${fileName} foi baixado.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao exportar para PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar para PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para preparar dados do dashboard baseado nos resultados do relatório
  const prepareReportDashboard = (data: any[], reportName: string) => {
    if (!data || data.length === 0) return;
    
    try {
      const summaries: Array<{label: string, value: string | number, icon: React.ReactNode, color: string}> = [];
      const trends: Array<{label: string, trend: 'up' | 'down' | 'stable', percentage?: number, description: string}> = [];
      const insights: Array<string> = [];
      const topItems: Array<{name: string, value: number | string}> = [];
      let hasFinancialData = false;
      let timeData = false;
      let statusData = false;
      let chartData = null;
      
      // Mapear campos importantes nos dados
      const sampleRow = data[0];
      const fields = Object.keys(sampleRow);
      
      // Mapear possíveis campos relevantes
      const fieldMap = {
        financial: fields.filter(f => 
          f.toLowerCase().includes('valor') || 
          f.toLowerCase().includes('amount') || 
          f.toLowerCase().includes('price') ||
          f.toLowerCase().includes('total') || 
          f.toLowerCase().includes('preco')
        ),
        date: fields.filter(f => 
          f.toLowerCase().includes('data') || 
          f.toLowerCase().includes('date') || 
          f.toLowerCase().includes('created') ||
          f.toLowerCase().includes('due') || 
          f.toLowerCase().includes('payment') ||
          f.toLowerCase().includes('vencimento')
        ),
        status: fields.filter(f => 
          f.toLowerCase().includes('status') || 
          f.toLowerCase().includes('situacao')
        ),
        customer: fields.filter(f => 
          f.toLowerCase().includes('cliente') || 
          f.toLowerCase().includes('customer') || 
          f.toLowerCase().includes('nome')
        ),
        quantity: fields.filter(f => 
          f.toLowerCase().includes('quantidade') || 
          f.toLowerCase().includes('quantity') || 
          f.toLowerCase().includes('qtd') ||
          f.toLowerCase().includes('count')
        ),
        service: fields.filter(f => 
          f.toLowerCase().includes('servico') || 
          f.toLowerCase().includes('service') || 
          f.toLowerCase().includes('produto') ||
          f.toLowerCase().includes('product')
        ),
        installment: fields.filter(f => 
          f.toLowerCase().includes('parcela') || 
          f.toLowerCase().includes('installment') || 
          f.toLowerCase().includes('numero_parcela')
        )
      };
      
      // 1. ANÁLISE FINANCEIRA
      if (fieldMap.financial.length > 0) {
        hasFinancialData = true;
        const primaryFinancialField = fieldMap.financial[0];
        
        // Calcular o valor total
        const total = data.reduce((sum, item) => {
          const valStr = String(item[primaryFinancialField]);
          const value = parseFloat(valStr.replace ? valStr.replace(/[^0-9.-]+/g, '') : valStr);
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
        
        // Adicionar sumário financeiro
        summaries.push({
          label: 'Valor Total',
          value: `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          icon: <CreditCard className="h-5 w-5 text-white" />,
          color: 'bg-blue-100 text-blue-700 border-blue-200'
        });
        
        // Calcular valor médio
        const average = total / data.length;
        summaries.push({
          label: 'Valor Médio',
          value: `R$ ${average.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          icon: <DollarSign className="h-5 w-5 text-white" />,
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        });
        
        // Encontrar maior e menor valor
        const sortedValues = [...data].sort((a, b) => {
          const valueAStr = String(a[primaryFinancialField]);
          const valueBStr = String(b[primaryFinancialField]);
          const valueA = parseFloat(valueAStr.replace ? valueAStr.replace(/[^0-9.-]+/g, '') : valueAStr);
          const valueB = parseFloat(valueBStr.replace ? valueBStr.replace(/[^0-9.-]+/g, '') : valueBStr);
          return valueB - valueA; // Ordem decrescente
        });
        
        if (sortedValues.length > 0) {
          // Adicionar maior valor como sumário
          const maxValueStr = String(sortedValues[0][primaryFinancialField]);
          const maxValue = parseFloat(maxValueStr.replace ? maxValueStr.replace(/[^0-9.-]+/g, '') : maxValueStr);
          if (!isNaN(maxValue)) {
            summaries.push({
              label: 'Maior Valor',
              value: `R$ ${maxValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              icon: <TrendingUp className="h-5 w-5 text-white" />,
              color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
            });
          }
          
          // Adicionar insight sobre concentração financeira
          const top20Percent = Math.ceil(data.length * 0.2);
          if (top20Percent > 0) {
            const top20Sum = sortedValues.slice(0, top20Percent).reduce((sum, item) => {
              const valStr = String(item[primaryFinancialField]);
              const value = parseFloat(valStr.replace ? valStr.replace(/[^0-9.-]+/g, '') : valStr);
              return sum + (isNaN(value) ? 0 : value);
            }, 0);
            
            const percentageOfTotal = (top20Sum / total * 100).toFixed(1);
            insights.push(`Os ${top20Percent} maiores registros representam ${percentageOfTotal}% do valor total.`);
          }
        }
        
        // Adicionar trends com base em dados financeiros
        if (fieldMap.date.length > 0 && fieldMap.financial.length > 0) {
          try {
            const dateField = fieldMap.date[0];
            const financialField = fieldMap.financial[0];
            
            // Ordenar dados por data
            const chronologicalData = [...data]
              .map(item => ({
                date: new Date(item[dateField]),
                value: parseFloat(String(item[financialField]).replace(/[^0-9.-]+/g, '')),
                original: item
              }))
              .filter(item => !isNaN(item.date.getTime()) && !isNaN(item.value))
              .sort((a, b) => a.date.getTime() - b.date.getTime());
            
            if (chronologicalData.length >= 2) {
              const first = chronologicalData[0].value;
              const last = chronologicalData[chronologicalData.length - 1].value;
              
              const change = last - first;
              const percentChange = (change / Math.abs(first) * 100);
              
              if (Math.abs(percentChange) > 1) {
                trends.push({
                  label: 'Tendência de Valor',
                  trend: percentChange > 0 ? 'up' : 'down',
                  percentage: Math.abs(percentChange),
                  description: percentChange > 0 
                    ? `Aumento de ${Math.abs(percentChange).toFixed(1)}% no período analisado`
                    : `Redução de ${Math.abs(percentChange).toFixed(1)}% no período analisado`
                });
              } else {
                trends.push({
                  label: 'Tendência de Valor',
                  trend: 'stable',
                  description: 'Valores estáveis no período analisado'
                });
              }
            }
          } catch (error) {
            console.error("Erro ao calcular tendências:", error);
          }
        }
      }
      
      // 2. ANÁLISE TEMPORAL
      if (fieldMap.date.length > 0) {
        timeData = true;
        const dateField = fieldMap.date[0];
        
        try {
          // Filtrar datas válidas
          const validDates = data
            .map(row => new Date(row[dateField]))
            .filter(d => !isNaN(d.getTime()));
          
          if (validDates.length > 0) {
            // Ordenar datas e obter período
            validDates.sort((a, b) => a.getTime() - b.getTime());
            const oldestDate = validDates[0];
            const newestDate = validDates[validDates.length - 1];
            
            // Adicionar período como sumário
            summaries.push({
              label: 'Período',
              value: `${format(oldestDate, 'dd/MM/yy', { locale: ptBR })} - ${format(newestDate, 'dd/MM/yy', { locale: ptBR })}`,
              icon: <Calendar className="h-5 w-5 text-white" />,
              color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
            });
            
            // Calcular dias cobertos
            const daysDifference = differenceInDays(newestDate, oldestDate);
            
            // Adicionar insight sobre frequência temporal
            if (daysDifference > 0) {
              const recordsPerDay = (validDates.length / daysDifference).toFixed(1);
              insights.push(`Média de ${recordsPerDay} registros por dia no período analisado.`);
              
              // Identificar picos temporais
              const dateCount: Record<string, number> = {};
              validDates.forEach(date => {
                const dayKey = format(date, 'dd/MM/yyyy');
                dateCount[dayKey] = (dateCount[dayKey] || 0) + 1;
              });
              
              const maxDateEntries = Object.entries(dateCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 1);
                
              if (maxDateEntries.length > 0) {
                insights.push(`Data com maior atividade: ${maxDateEntries[0][0]} com ${maxDateEntries[0][1]} registros.`);
              }
            }
          }
        } catch (error) {
          console.error("Erro ao processar datas:", error);
        }
      }
      
      // 3. ANÁLISE DE STATUS
      if (fieldMap.status.length > 0) {
        statusData = true;
        const statusField = fieldMap.status[0];
        
        // Contar ocorrências de cada status
        const statusCounts: Record<string, number> = {};
        data.forEach(item => {
          const status = String(item[statusField]);
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        // Traduzir status comuns
        const statusTranslations: Record<string, string> = {
          'pending': 'Pendente',
          'in_progress': 'Em Andamento',
          'completed': 'Concluído',
          'canceled': 'Cancelado',
          'success': 'Sucesso',
          'error': 'Erro',
          'waiting': 'Aguardando',
          'approved': 'Aprovado',
          'rejected': 'Rejeitado',
          'paid': 'Pago',
          'unpaid': 'Não Pago',
          'overdue': 'Atrasado',
          'active': 'Ativo',
          'inactive': 'Inativo',
          'delivery': 'Entrega'
        };
      } else if (reportName.toLowerCase().includes("vendas")) {
        // Para relatórios de vendas, mostrar média e maior valor
        let totalValue = 0;
        let maxValue = 0;
        
        // Encontrar coluna de valor
        const valueColumn = Object.keys(data[0]).find(key => 
          key.toLowerCase().includes('valor') || 
          key.toLowerCase().includes('total') || 
          key.toLowerCase().includes('amount')
        );
        
        if (valueColumn) {
          // Calcular valor total, valor médio e valor máximo
          data.forEach(row => {
            const val = row[valueColumn];
            if (val && !isNaN(Number(val))) {
              const numVal = Number(val);
              totalValue += numVal;
              maxValue = Math.max(maxValue, numVal);
            }
          });
          
          const avgValue = totalValue / data.length;
          
          summaries.push({
            label: "Valor Total",
            value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: <Percent className="h-4 w-4 text-green-500" />,
            color: "bg-green-50"
          });
          
          summaries.push({
            label: "Valor Médio",
            value: `R$ ${avgValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: <LineChart className="h-4 w-4 text-purple-500" />,
            color: "bg-purple-50"
          });
        }
      }
      
      // Atualizar o estado do dashboard
      setDashboardData({
        summaries,
        chartData,
        hasFinancialData,
        timeData,
        statusData,
        trends,
        topItems,
        insights
      });
      
    } catch (error) {
      console.error("Erro ao preparar dados do dashboard:", error);
    }
  };
  
  // Verificar se está carregando
  const isLoading = isLoadingReport || isLoadingExecution;
  
  // Verificar se houve erro
  const hasError = reportError || executionError;

  useEffect(() => {
    if (executionError) {
      console.error("Erro ao carregar execução:", executionError);
      toast({
        title: "Erro ao carregar relatório",
        description: "Ocorreu um erro ao carregar os dados do relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [executionError, toast]);
  
  // Informações do relatório
  const reportName = execution?.name || execution?.report_name || report?.name || "Relatório";
  const reportDescription = execution?.description || report?.description || "";

  // Renderizar conteúdo da aba de dados
  const renderDataTab = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }
    
    if (hasError) {
      return (
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Erro ao carregar relatório</h3>
          </div>
          <p className="mt-2 text-sm">
            Ocorreu um erro ao carregar os dados do relatório.
          </p>
          <div className="mt-4 bg-red-100 p-3 rounded-md text-sm">
            <p className="font-medium">Detalhes do erro:</p>
            <p className="mt-1">
              {executionError ? 
                `Erro na execução: ${executionError instanceof Error ? executionError.message : 'Erro desconhecido'}` : 
                reportError ? 
                `Erro no relatório: ${reportError instanceof Error ? reportError.message : 'Erro desconhecido'}` : 
                'Ocorreu um erro inesperado. Tente novamente mais tarde.'}
            </p>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para lista de relatórios
            </Button>
          </div>
        </div>
      );
    }
    
    // Verificar se há resultados
    if (!execution?.results || execution.results.length === 0) {
      return (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Nenhum resultado encontrado</h3>
          </div>
          <p className="mt-2 text-sm">
            Não foram encontrados registros para os critérios selecionados.
          </p>
          <div className="mt-4 bg-yellow-100 p-3 rounded-md text-sm">
            <p className="font-medium">Sugestões:</p>
            <ul className="mt-1 list-disc pl-5 space-y-1">
              <li>Verifique se os parâmetros de filtro estão corretos</li>
              <li>Tente ampliar o período de datas, se aplicável</li>
              <li>Verifique se existem dados correspondentes no sistema</li>
            </ul>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para lista de relatórios
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-md mb-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-medium">Resultados da consulta</h3>
              <p className="text-xs text-muted-foreground">
                {execution.results.length} registros encontrados
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToExcel} 
                className="h-8"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                Exportar Excel
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToPdf}
                className="h-8"
              >
                <File className="h-3.5 w-3.5 mr-1" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={execution.results}
          showPagination={true}
          searchable={true}
          searchPlaceholder="Buscar nos resultados..."
        />
      </div>
    );
  };

  // Renderizar conteúdo da aba de parâmetros
  const renderParamsTab = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      );
    }
    
    const parameters = execution?.parameters || {};
    const hasParameters = Object.keys(parameters).length > 0;
    
    if (!hasParameters) {
      return (
        <div className="bg-blue-50 p-4 rounded-md text-blue-800">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <h3 className="font-medium">Relatório sem parâmetros</h3>
          </div>
          <p className="mt-2 text-sm">
            Este relatório foi executado sem nenhum parâmetro de filtro.
          </p>
          <p className="mt-2 text-sm">
            Isso significa que os resultados representam todos os dados disponíveis 
            no período padrão (geralmente últimos 30 dias ou conforme definido no relatório).
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-800">Parâmetros utilizados na consulta</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(parameters).map(([key, value]) => (
            <Card key={key} className="border-blue-100">
              <CardHeader className="pb-2 bg-blue-50/50">
                <CardTitle className="text-sm text-blue-700">{key}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-medium">{value as string}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar conteúdo da aba de dashboard
  const renderDashboardTab = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }
    
    if (hasError) {
      return (
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Erro ao gerar dashboard</h3>
          </div>
          <p className="mt-2 text-sm">
            Ocorreu um erro ao processar os dados para visualização.
          </p>
        </div>
      );
    }
    
    if (!dashboardData.summaries.length) {
      return (
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Dados insuficientes</h3>
          </div>
          <p className="mt-2 text-sm">
            Não foi possível gerar um dashboard para este relatório com os dados disponíveis.
            Verifique se o relatório retornou resultados válidos.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Dashboard - {reportName}</CardTitle>
            <CardDescription>
              Visão consolidada dos dados do relatório
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Cartões de indicadores chave */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {dashboardData.summaries.map((summary, index) => (
                <Card key={index} className={`border ${summary.color}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{summary.label}</p>
                        <p className="text-2xl font-bold mt-1">{summary.value}</p>
                      </div>
                      <div className={`p-2 rounded-full ${summary.color}`}>
                        {summary.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Seção de tendências */}
            {dashboardData.trends && dashboardData.trends.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Tendências</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.trends.map((trend, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{trend.label}</p>
                            <p className="text-sm mt-1 text-muted-foreground">{trend.description}</p>
                          </div>
                          <div className={`p-2 rounded-full ${
                            trend.trend === 'up' 
                              ? 'bg-green-100 text-green-700' 
                              : trend.trend === 'down' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-blue-100 text-blue-700'
                          }`}>
                            {trend.trend === 'up' && <TrendingUp className="h-5 w-5" />}
                            {trend.trend === 'down' && <TrendingDown className="h-5 w-5" />}
                            {trend.trend === 'stable' && <ArrowLeft className="h-5 w-5" />}
                          </div>
                        </div>
                        {trend.percentage && (
                          <div className="mt-2">
                            <Badge variant="outline" className={
                              trend.trend === 'up' 
                                ? 'border-green-200 text-green-700 bg-green-50' 
                                : trend.trend === 'down' 
                                  ? 'border-red-200 text-red-700 bg-red-50' 
                                  : 'border-blue-200 text-blue-700 bg-blue-50'
                            }>
                              {trend.percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Seção de itens principais */}
            {dashboardData.topItems && dashboardData.topItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Itens em Destaque</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {dashboardData.topItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-700 font-medium">{index + 1}</span>
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="secondary">{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Seção de insights */}
            {dashboardData.insights && dashboardData.insights.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Insights</h3>
                <Card className="border-blue-100 bg-blue-50/40">
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {dashboardData.insights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                            <span className="text-blue-800 text-xs font-bold">{index+1}</span>
                          </span>
                          <p className="text-sm text-blue-900">{insight}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Visualização de dados financeiros */}
            {dashboardData.hasFinancialData && (
              <div className="mt-8 p-6 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Análise visual</h3>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">As visualizações detalhadas estarão disponíveis em breve.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Para mais detalhes, consulte os dados na aba "Dados".
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <p className="text-xs text-muted-foreground">
              O dashboard apresenta uma visão geral e análise inteligente dos dados do relatório. 
              Insights são baseados na análise automática dos resultados.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  // Renderizar conteúdo da aba de informações
  const renderInfoTab = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Data de Execução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base">
                {execution?.created_at 
                  ? format(new Date(execution.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) 
                  : "Não disponível"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <User className="h-4 w-4 mr-2" />
                Executado por
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base">{execution?.username || "Não disponível"}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Timer className="h-4 w-4 mr-2" />
                Tempo de Execução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base">
                {execution?.execution_time 
                  ? `${execution.execution_time.toFixed(2)} segundos` 
                  : "Não disponível"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                {execution?.status === "success" ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-700">Concluído com sucesso</p>
                      <p className="text-xs text-green-600">
                        Relatório gerado e pronto para visualização
                      </p>
                    </div>
                  </div>
                ) : execution?.status === "error" ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-700">Erro na execução</p>
                      <p className="text-xs text-red-600">
                        Ocorreu um problema ao gerar o relatório
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Timer className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-700">Processando</p>
                      <p className="text-xs text-blue-600">
                        Relatório em geração
                      </p>
                    </div>
                  </div>
                )}
                
                {execution?.error_message && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md">
                    <p className="font-medium mb-1">Mensagem de erro:</p>
                    <p className="text-sm">{execution.error_message}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Lista
        </Button>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">{reportName}</h1>
        {reportDescription && (
          <p className="text-muted-foreground mt-1">{reportDescription}</p>
        )}
      </div>
      
      <Tabs defaultValue="data" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="params">Parâmetros</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
        </TabsList>
        <TabsContent value="data" className="mt-4">
          {renderDataTab()}
        </TabsContent>
        <TabsContent value="dashboard" className="mt-4">
          {renderDashboardTab()}
        </TabsContent>
        <TabsContent value="params" className="mt-4">
          {renderParamsTab()}
        </TabsContent>
        <TabsContent value="info" className="mt-4">
          {renderInfoTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
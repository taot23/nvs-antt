// Utilitários para exportação direta
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para dados financeiros
export interface FinanceExportData {
  orderNumber: string;
  sellerName: string;
  customerName: string;
  date: string;
  totalAmount: string;
  status: string;
  totalPaid?: string;
  totalCosts?: string;
  netResult?: string;
}

// Função para preparar dados para exportação
export function prepareFinanceDataForExport(data: any[]): FinanceExportData[] {
  return data.map(sale => {
    const baseData = {
      orderNumber: sale.orderNumber || '',
      sellerName: sale.sellerName || `Vendedor #${sale.sellerId}`,
      customerName: sale.customerName || `Cliente #${sale.customerId}`,
      date: sale.date ? format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
      totalAmount: formatCurrency(sale.totalAmount || 0),
      status: getFinancialStatusLabel(sale.financialStatus || 'pending')
    };

    // Adicionar campos financeiros extras se disponíveis
    if (sale.financialSummary) {
      return {
        ...baseData,
        totalPaid: formatCurrency(sale.financialSummary.totalPaid || 0),
        totalCosts: formatCurrency(sale.financialSummary.totalCosts || 0),
        netResult: formatCurrency(sale.financialSummary.netResult || 0)
      };
    }

    return baseData;
  });
}

// Função para formatar valores monetários
export function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return numValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}

// Função para obter label do status financeiro
export function getFinancialStatusLabel(status: string): string {
  switch (status) {
    case 'all': return 'Todos';
    case 'pending': return 'Aguardando Pagamento';
    case 'in_progress': return 'Em Execução';
    case 'completed': return 'Executado';
    case 'paid': return 'Pago';
    default: return status;
  }
}

// Esta função exporta para Excel usando a biblioteca xlsx
// É uma versão simplificada e direta para garantir o funcionamento
export async function exportFinanceToExcel(
  data: FinanceExportData[],
  hasFinancialData: boolean = false
): Promise<string> {
  // Importar diretamente para evitar problemas
  const XLSX = await import('xlsx');
  
  // Definir cabeçalhos
  let headers = [
    'Nº OS', 
    'Vendedor', 
    'Cliente', 
    'Data', 
    'Valor Total', 
    'Status'
  ];
  
  // Adicionar colunas financeiras se necessário
  if (hasFinancialData) {
    headers.push('Valor Pago', 'Custos', 'Resultado');
  }
  
  // Preparar dados para o formato que o Excel espera
  const excelData = data.map(row => {
    const baseRow: any = {
      'Nº OS': row.orderNumber,
      'Vendedor': row.sellerName,
      'Cliente': row.customerName,
      'Data': row.date,
      'Valor Total': row.totalAmount,
      'Status': row.status
    };
    
    // Adicionar campos financeiros se houver
    if (hasFinancialData) {
      baseRow['Valor Pago'] = row.totalPaid || 'R$ 0,00';
      baseRow['Custos'] = row.totalCosts || 'R$ 0,00';
      baseRow['Resultado'] = row.netResult || 'R$ 0,00';
    }
    
    return baseRow;
  });
  
  // Criar planilha
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Financeiro');
  
  // Definir larguras das colunas
  const wscols = headers.map(h => ({ wch: 15 })); // largura padrão
  wscols[0] = { wch: 10 }; // Nº OS
  wscols[1] = { wch: 20 }; // Vendedor
  wscols[2] = { wch: 20 }; // Cliente
  
  worksheet['!cols'] = wscols;
  
  // Gerar nome do arquivo único
  const fileName = `financeiro_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
  
  // Salvar arquivo
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
}

// Esta função exporta para PDF usando a biblioteca jspdf
// É uma versão simplificada e direta para garantir o funcionamento
export async function exportFinanceToPDF(
  data: FinanceExportData[],
  hasFinancialData: boolean = false
): Promise<string> {
  // Importar diretamente para evitar problemas
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.default;
  const autoTable = (await import('jspdf-autotable')).default;
  
  // Criar documento em orientação paisagem
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // Adicionar título
  doc.setFontSize(16);
  doc.text('Relatório Financeiro', 14, 15);
  doc.setFontSize(12);
  doc.text(`Data de Geração: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 23);
  
  // Definir cabeçalhos da tabela
  let headers = ['Nº OS', 'Vendedor', 'Cliente', 'Data', 'Valor Total', 'Status'];
  
  // Adicionar colunas financeiras se necessário
  if (hasFinancialData) {
    headers.push('Valor Pago', 'Custos', 'Resultado');
  }
  
  // Preparar dados para o formato que o autoTable espera
  const tableData = data.map(row => {
    const baseRow = [
      row.orderNumber,
      row.sellerName,
      row.customerName,
      row.date,
      row.totalAmount,
      row.status
    ];
    
    // Adicionar campos financeiros se houver
    if (hasFinancialData && row.totalPaid) {
      baseRow.push(row.totalPaid, row.totalCosts || 'R$ 0,00', row.netResult || 'R$ 0,00');
    }
    
    return baseRow;
  });
  
  // Criar tabela
  autoTable(doc, {
    startY: 30,
    head: [headers],
    body: tableData,
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 30 },
    styles: { 
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak',
      cellWidth: 'auto'
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Nº OS
      3: { cellWidth: 25 }, // Data
      4: { cellWidth: 30 }, // Valor Total
      5: { cellWidth: 30 }, // Status
    }
  });
  
  // Gerar nome do arquivo único
  const fileName = `relatorio_financeiro_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
  
  // Salvar arquivo
  doc.save(fileName);
  
  return fileName;
}
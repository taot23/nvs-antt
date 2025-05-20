/**
 * Exportação simples - sem nenhuma complexidade ou dependências do DOM
 */

// Função para exportar para Excel (versão ultra simplificada)
export async function simpleExportToExcel(data: any[]): Promise<string> {
  try {
    // Importação dinâmica
    const XLSX = await import('xlsx');

    // Garantir que temos dados válidos
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Dados inválidos para exportação');
    }

    // Mapear apenas os dados relevantes
    const cleanData = data.map(sale => ({
      'Nº OS': sale.orderNumber || '',
      'Vendedor': sale.sellerName || `ID: ${sale.sellerId || ''}`,
      'Cliente': sale.customerName || `ID: ${sale.customerId || ''}`,
      'Data': formatDate(sale.date || sale.createdAt),
      'Valor Total': formatCurrency(sale.totalAmount),
      'Status': formatStatus(sale.financialStatus || sale.status)
    }));

    // Criar workbook diretamente dos dados
    const ws = XLSX.utils.json_to_sheet(cleanData);
    
    // Definir larguras das colunas
    const colWidths = [
      { wch: 15 },  // Nº OS
      { wch: 25 },  // Vendedor
      { wch: 25 },  // Cliente
      { wch: 15 },  // Data
      { wch: 15 },  // Valor Total
      { wch: 20 }   // Status
    ];
    ws['!cols'] = colWidths;
    
    // Criar workbook e adicionar planilha
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    
    // Nome do arquivo
    const fileName = `relatorio_${new Date().getTime()}.xlsx`;
    
    // Salvar arquivo
    XLSX.writeFile(wb, fileName);
    
    return fileName;
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw error;
  }
}

// Função para exportar para PDF (versão ultra simplificada)
export async function simpleExportToPDF(data: any[]): Promise<string> {
  try {
    // Importações dinâmicas
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    const autoTable = (await import('jspdf-autotable')).default;

    // Garantir que temos dados válidos
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Dados inválidos para exportação');
    }

    // Preparar cabeçalhos
    const headers = ['Nº OS', 'Vendedor', 'Cliente', 'Data', 'Valor Total', 'Status'];
    
    // Preparar dados simplificados
    const rows = data.map(sale => [
      sale.orderNumber || '',
      sale.sellerName || `ID: ${sale.sellerId || ''}`,
      sale.customerName || `ID: ${sale.customerId || ''}`,
      formatDate(sale.date || sale.createdAt),
      formatCurrency(sale.totalAmount),
      formatStatus(sale.financialStatus || sale.status)
    ]);

    // Criar documento PDF (paisagem)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Adicionar título
    doc.setFontSize(16);
    doc.text('Relatório Financeiro', 14, 15);
    
    // Adicionar data de geração
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 22);

    // Adicionar tabela
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 25,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });

    // Nome do arquivo
    const fileName = `relatorio_${new Date().getTime()}.pdf`;
    
    // Salvar arquivo
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Erro ao exportar para PDF:', error);
    throw error;
  }
}

// Funções auxiliares simplificadas
function formatDate(dateStr: any): string {
  try {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
}

function formatCurrency(value: any): string {
  try {
    if (!value) return 'R$ 0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  } catch (error) {
    console.error('Erro ao formatar valor:', error);
    return 'R$ 0,00';
  }
}

function formatStatus(status: string): string {
  try {
    switch (status) {
      case 'pending': return 'Aguardando Pagamento';
      case 'in_progress': return 'Em Execução';
      case 'completed': return 'Executado';
      case 'paid': return 'Pago';
      default: return status || '';
    }
  } catch (error) {
    console.error('Erro ao formatar status:', error);
    return status || '';
  }
}
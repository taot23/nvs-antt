/**
 * Exportação Direta - Nova Implementação
 * 
 * Este módulo realiza a exportação diretamente da API sem depender do DOM
 * Garante que todas as colunas sejam incluídas no relatório
 */
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Função para exportar para Excel
export async function exportToExcel(): Promise<void> {
  try {
    console.log('Iniciando exportação para Excel - método direto...');
    
    // Buscar dados da API
    const data = await fetchDataFromAPI();
    
    if (data.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }
    
    // Preparar dados para o Excel
    const excelData = data.map(sale => ({
      'Nº OS': sale.orderNumber || '',
      'Vendedor': sale.sellerName || '',
      'Cliente': sale.customerName || '',
      'Data': formatDate(sale.date),
      'Valor Total': formatCurrency(parseFloat(sale.totalAmount) || 0),
      'Valor Pago': formatCurrency(parseFloat(sale.paidAmount) || 0),
      'Custos': formatCurrency(parseFloat(sale.operationalCostsTotal) || 0),
      'Resultado': formatCurrency((parseFloat(sale.paidAmount) || 0) - (parseFloat(sale.operationalCostsTotal) || 0)),
      'Status': getStatusLabel(sale.financialStatus || sale.status)
    }));
    
    // Calcular totais
    let totalValorTotal = 0;
    let totalValorPago = 0;
    let totalCustos = 0;
    let totalResultado = 0;
    
    data.forEach(sale => {
      totalValorTotal += parseFloat(sale.totalAmount) || 0;
      totalValorPago += parseFloat(sale.paidAmount) || 0;
      totalCustos += parseFloat(sale.operationalCostsTotal) || 0;
      totalResultado += (parseFloat(sale.paidAmount) || 0) - (parseFloat(sale.operationalCostsTotal) || 0);
    });
    
    // Adicionar linha de totais
    excelData.push({
      'Nº OS': `Total de ${data.length} vendas`,
      'Vendedor': '',
      'Cliente': '',
      'Data': '',
      'Valor Total': formatCurrency(totalValorTotal),
      'Valor Pago': formatCurrency(totalValorPago),
      'Custos': formatCurrency(totalCustos),
      'Resultado': formatCurrency(totalResultado),
      'Status': ''
    });
    
    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Ajustar largura das colunas
    const wscols = [
      { wch: 10 },  // Nº OS
      { wch: 20 },  // Vendedor
      { wch: 25 },  // Cliente  
      { wch: 15 },  // Data
      { wch: 15 },  // Valor Total
      { wch: 15 },  // Valor Pago
      { wch: 15 },  // Custos
      { wch: 15 },  // Resultado
      { wch: 20 }   // Status
    ];
    ws['!cols'] = wscols;
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório Financeiro');
    
    // Gerar arquivo e baixar
    XLSX.writeFile(wb, 'relatorio_financeiro.xlsx');
    
    console.log('Exportação para Excel concluída com sucesso!');
  } catch (error) {
    console.error('Erro na exportação para Excel:', error);
    alert(`Erro ao exportar para Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// Função para exportar para PDF
export async function exportToPDF(): Promise<void> {
  try {
    console.log('Iniciando exportação para PDF - método direto...');
    
    // Buscar dados da API
    const data = await fetchDataFromAPI();
    
    if (data.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }
    
    // Preparar cabeçalhos e dados para o PDF
    const headers = ['Nº OS', 'Vendedor', 'Cliente', 'Data', 'Valor Total', 'Valor Pago', 'Custos', 'Resultado', 'Status'];
    
    // Converter para formato de array para o PDF
    const pdfData = data.map(sale => [
      sale.orderNumber || '',
      sale.sellerName || '',
      sale.customerName || '',
      formatDate(sale.date),
      formatCurrency(parseFloat(sale.totalAmount) || 0),
      formatCurrency(parseFloat(sale.paidAmount) || 0),
      formatCurrency(parseFloat(sale.operationalCostsTotal) || 0),
      formatCurrency((parseFloat(sale.paidAmount) || 0) - (parseFloat(sale.operationalCostsTotal) || 0)),
      getStatusLabel(sale.financialStatus || sale.status)
    ]);
    
    // Calcular totais
    let totalValorTotal = 0;
    let totalValorPago = 0;
    let totalCustos = 0;
    let totalResultado = 0;
    
    data.forEach(sale => {
      totalValorTotal += parseFloat(sale.totalAmount) || 0;
      totalValorPago += parseFloat(sale.paidAmount) || 0;
      totalCustos += parseFloat(sale.operationalCostsTotal) || 0;
      totalResultado += (parseFloat(sale.paidAmount) || 0) - (parseFloat(sale.operationalCostsTotal) || 0);
    });
    
    // Adicionar linha de totais
    pdfData.push([
      `Total de ${data.length} vendas`,
      '',
      '',
      '',
      formatCurrency(totalValorTotal),
      formatCurrency(totalValorPago),
      formatCurrency(totalCustos),
      formatCurrency(totalResultado),
      ''
    ]);
    
    // Criar documento PDF (paisagem)
    const doc = new jsPDF('landscape');
    
    // Adicionar título
    doc.setFontSize(18);
    doc.text('Relatório Financeiro', 14, 22);
    
    // Adicionar data de geração
    doc.setFontSize(11);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, 14, 30);
    
    // Adicionar status do filtro
    let statusFiltro = 'Todos';
    try {
      const tabAtiva = document.querySelector('[role="tab"][data-state="active"]');
      if (tabAtiva) {
        const tabText = tabAtiva.textContent?.trim();
        if (tabText) statusFiltro = tabText;
      }
    } catch (e) {
      console.error('Erro ao obter status do filtro:', e);
    }
    doc.text(`Status: ${statusFiltro}`, 14, 38);
    
    // Criar tabela com autotable
    autoTable(doc, {
      head: [headers],
      body: pdfData,
      startY: 45,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      // Estilizar a última linha (totais)
      didParseCell: function(data) {
        if (data.row.index === pdfData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [220, 220, 220];
        }
      }
    });
    
    // Adicionar rodapé com paginação
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Página ${i} de ${totalPages}`, 
        doc.internal.pageSize.getWidth() / 2, 
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Salvar o PDF
    doc.save('relatorio_financeiro.pdf');
    
    console.log('Exportação para PDF concluída com sucesso!');
  } catch (error) {
    console.error('Erro na exportação para PDF:', error);
    alert(`Erro ao exportar para PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// Função para buscar dados completos da API
async function fetchDataFromAPI(): Promise<any[]> {
  try {
    console.log('Buscando dados da API...');
    
    // Obter financialStatus da aba ativa
    let financialStatus = 'all';
    try {
      const tabAtiva = document.querySelector('[role="tab"][data-state="active"]')?.getAttribute('value');
      if (tabAtiva) {
        if (tabAtiva === 'pending') financialStatus = 'pending';
        else if (tabAtiva === 'inProgress') financialStatus = 'in_progress';
        else if (tabAtiva === 'completed') financialStatus = 'completed';
        else if (tabAtiva === 'paid') financialStatus = 'paid';
        else financialStatus = 'all';
      }
    } catch (e) {
      console.error('Erro ao obter aba ativa:', e);
    }
    
    // Construir URL para buscar todos os dados
    const url = new URL('/api/sales', window.location.origin);
    
    // Adicionar parâmetros para pegar todos os dados (limite alto) com informações completas
    url.searchParams.append('page', '1');
    url.searchParams.append('limit', '1000');  // Limite alto para pegar todos
    url.searchParams.append('financialStatus', financialStatus);
    url.searchParams.append('includeSummary', 'true');  // Incluir resumo financeiro
    
    // Adicionar filtros atuais
    const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
    if (searchInput && searchInput.value.trim()) {
      url.searchParams.append('searchTerm', searchInput.value.trim());
    }
    
    // Filtro de datas
    const dateFromElement = document.querySelector('[data-from]');
    const dateToElement = document.querySelector('[data-to]');
    
    if (dateFromElement && dateFromElement.getAttribute('data-from')) {
      const fromDate = dateFromElement.getAttribute('data-from');
      if (fromDate) url.searchParams.append('startDate', new Date(fromDate).toISOString());
    }
    
    if (dateToElement && dateToElement.getAttribute('data-to')) {
      const toDate = dateToElement.getAttribute('data-to');
      if (toDate) url.searchParams.append('endDate', new Date(toDate).toISOString());
    }
    
    console.log('URL de busca:', url.toString());
    
    // Fazer a requisição
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Processar os dados
    const processedData = (result.data || []).map((sale: any) => {
      // Calcular valores financeiros (caso não estejam disponíveis)
      let paidAmount = sale.paidAmount;
      if (paidAmount === undefined && sale.installments) {
        paidAmount = sale.installments
          .filter((inst: any) => inst.status === 'paid')
          .reduce((sum: number, inst: any) => sum + parseFloat(inst.amount || 0), 0);
      }
      
      let operationalCostsTotal = sale.operationalCostsTotal;
      if (operationalCostsTotal === undefined && sale.operationalCosts) {
        operationalCostsTotal = sale.operationalCosts
          .reduce((sum: number, cost: any) => sum + parseFloat(cost.amount || 0), 0);
      }
      
      return {
        ...sale,
        paidAmount: paidAmount?.toString() || '0',
        operationalCostsTotal: operationalCostsTotal?.toString() || '0'
      };
    });
    
    console.log(`Processados ${processedData.length} registros`);
    return processedData;
  } catch (error) {
    console.error('Erro ao buscar dados da API:', error);
    throw error;
  }
}

// Funções auxiliares

// Formatar data para o formato brasileiro
function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateString;
  }
}

// Formatar valor monetário
function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

// Obter label para status
function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Aguardando Pagamento';
    case 'in_progress': return 'Em Execução';
    case 'completed': return 'Executado';
    case 'paid': return 'Pago';
    default: return status || '';
  }
}
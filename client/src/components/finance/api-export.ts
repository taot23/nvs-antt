/**
 * Exportação baseada em API
 * Busca TODOS os dados diretamente da API em vez de tentar extrair da tabela
 */
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Função para exportar para Excel via API
export async function exportToExcel(): Promise<void> {
  try {
    console.log('Iniciando exportação para Excel via API...');
    
    // Buscar todos os dados (limite 1000 para pegar tudo)
    const data = await fetchAllData();
    
    if (data.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }
    
    // Preparar dados para exportação
    const dadosExcel = data.map(venda => ({
      'Nº OS': venda.orderNumber || '',
      'Vendedor': venda.sellerName || '',
      'Cliente': venda.customerName || '',
      'Data': formatDateString(venda.date),
      'Valor Total': formatCurrency(parseFloat(venda.totalAmount) || 0),
      'Valor Pago': formatCurrency(parseFloat(venda.paidAmount) || 0),
      'Custos': formatCurrency(parseFloat(venda.operationalCosts) || 0),
      'Resultado': formatCurrency((parseFloat(venda.paidAmount) || 0) - (parseFloat(venda.operationalCosts) || 0)),
      'Status': venda.financialStatusLabel || venda.status || ''
    }));
    
    // Calcular totais
    let totalValorTotal = 0;
    let totalValorPago = 0;
    let totalCustos = 0;
    let totalResultado = 0;
    
    data.forEach(venda => {
      totalValorTotal += parseFloat(venda.totalAmount) || 0;
      totalValorPago += parseFloat(venda.paidAmount) || 0;
      totalCustos += parseFloat(venda.operationalCosts) || 0;
      totalResultado += (parseFloat(venda.paidAmount) || 0) - (parseFloat(venda.operationalCosts) || 0);
    });
    
    // Adicionar linha de totais
    dadosExcel.push({
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
    const ws = XLSX.utils.json_to_sheet(dadosExcel);
    
    // Ajustar largura das colunas
    const wscols = [
      { wch: 10 },  // Nº OS
      { wch: 15 },  // Vendedor
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
    alert(`Erro ao exportar para Excel: ${error}`);
  }
}

// Função para exportar para PDF via API
export async function exportToPDF(): Promise<void> {
  try {
    console.log('Iniciando exportação para PDF via API...');
    
    // Buscar todos os dados (limite 1000 para pegar tudo)
    const data = await fetchAllData();
    
    if (data.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }
    
    // Preparar cabeçalhos
    const cabecalhos = ['Nº OS', 'Vendedor', 'Cliente', 'Data', 'Valor Total', 'Valor Pago', 'Custos', 'Resultado', 'Status'];
    
    // Converter para formato de array
    const dadosTabela = data.map(venda => [
      venda.orderNumber || '',
      venda.sellerName || '',
      venda.customerName || '',
      formatDateString(venda.date),
      formatCurrency(parseFloat(venda.totalAmount) || 0),
      formatCurrency(parseFloat(venda.paidAmount) || 0),
      formatCurrency(parseFloat(venda.operationalCosts) || 0),
      formatCurrency((parseFloat(venda.paidAmount) || 0) - (parseFloat(venda.operationalCosts) || 0)),
      venda.financialStatusLabel || venda.status || ''
    ]);
    
    // Calcular totais
    let totalValorTotal = 0;
    let totalValorPago = 0;
    let totalCustos = 0;
    let totalResultado = 0;
    
    data.forEach(venda => {
      totalValorTotal += parseFloat(venda.totalAmount) || 0;
      totalValorPago += parseFloat(venda.paidAmount) || 0;
      totalCustos += parseFloat(venda.operationalCosts) || 0;
      totalResultado += (parseFloat(venda.paidAmount) || 0) - (parseFloat(venda.operationalCosts) || 0);
    });
    
    // Adicionar linha de totais
    dadosTabela.push([
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
    
    // Criar documento PDF (orientação paisagem)
    const doc = new jsPDF('landscape');
    
    // Adicionar título
    doc.setFontSize(18);
    doc.text('Relatório Financeiro', 14, 22);
    
    // Adicionar data de geração
    doc.setFontSize(11);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, 14, 30);
    
    // Adicionar filtro atual
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
      head: [cabecalhos],
      body: dadosTabela,
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
        if (data.row.index === dadosTabela.length - 1) {
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
    alert(`Erro ao exportar para PDF: ${error}`);
  }
}

// Função para buscar todos os dados da API
async function fetchAllData(): Promise<any[]> {
  try {
    console.log('Buscando todos os dados da API...');
    
    // Obter a aba ativa para o status financeiro
    let financialStatus = 'all';
    try {
      const tabAtiva = document.querySelector('[role="tab"][data-state="active"]');
      if (tabAtiva) {
        if (tabAtiva.getAttribute('value') === 'pending') financialStatus = 'pending';
        else if (tabAtiva.getAttribute('value') === 'inProgress') financialStatus = 'in_progress';
        else if (tabAtiva.getAttribute('value') === 'completed') financialStatus = 'completed';
        else if (tabAtiva.getAttribute('value') === 'paid') financialStatus = 'paid';
      }
    } catch (e) {
      console.error('Erro ao obter status do filtro:', e);
    }
    
    // Construir URL com todos os parâmetros atuais
    const url = new URL('/api/sales', window.location.origin);
    
    // Adicionar parâmetros importantes
    url.searchParams.append('page', '1');
    url.searchParams.append('limit', '1000'); // Limite alto para pegar tudo
    url.searchParams.append('financialStatus', financialStatus);
    url.searchParams.append('includeSummary', 'true'); // Para obter resumo financeiro
    
    // Verificar se temos range de datas selecionado
    const dateFromInput = document.querySelector('[data-from]');
    const dateToInput = document.querySelector('[data-to]');
    
    const dateFrom = dateFromInput?.getAttribute('data-from');
    const dateTo = dateToInput?.getAttribute('data-to');
    
    if (dateFrom) {
      url.searchParams.append('startDate', new Date(dateFrom).toISOString());
    }
    
    if (dateTo) {
      url.searchParams.append('endDate', new Date(dateTo).toISOString());
    }
    
    // Verificar se temos busca de texto
    const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
    if (searchInput && searchInput.value.trim()) {
      url.searchParams.append('searchTerm', searchInput.value.trim());
    }
    
    console.log('URL da API:', url.toString());
    
    // Fazer a requisição
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Erro ao buscar dados da API');
    }
    
    const result = await response.json();
    const vendas = result.data || [];
    
    console.log(`Recebidos ${vendas.length} registros da API`);
    
    // Processar os dados para garantir que temos todas as informações
    const dadosProcessados = vendas.map((venda: any) => {
      // Adicionar labels para status
      venda.financialStatusLabel = getFinancialStatusLabel(venda.financialStatus || 'pending');
      
      // Garantir que temos o valor pago calculado
      if (venda.paidAmount === undefined) {
        venda.paidAmount = calcularValorPago(venda);
      }
      
      // Garantir que temos os custos operacionais calculados
      if (venda.operationalCosts === undefined) {
        venda.operationalCosts = calcularCustosOperacionais(venda);
      }
      
      return venda;
    });
    
    return dadosProcessados;
  } catch (error) {
    console.error('Erro ao buscar dados da API:', error);
    return [];
  }
}

// Funções auxiliares
function getFinancialStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Aguardando Pagamento';
    case 'in_progress': return 'Em Execução';
    case 'completed': return 'Executado';
    case 'paid': return 'Pago';
    default: return status;
  }
}

function formatDateString(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateString;
  }
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function calcularValorPago(venda: any): string {
  // Calcular baseado nas parcelas pagas
  if (venda.installments && Array.isArray(venda.installments)) {
    const valorPago = venda.installments
      .filter((parcela: any) => parcela.status === 'paid')
      .reduce((total: number, parcela: any) => total + (parseFloat(parcela.amount) || 0), 0);
    
    return valorPago.toString();
  }
  
  return '0';
}

function calcularCustosOperacionais(venda: any): string {
  // Calcular baseado nos custos operacionais
  if (venda.operationalCosts && Array.isArray(venda.operationalCosts)) {
    const totalCustos = venda.operationalCosts
      .reduce((total: number, custo: any) => total + (parseFloat(custo.amount) || 0), 0);
    
    return totalCustos.toString();
  }
  
  return '0';
}
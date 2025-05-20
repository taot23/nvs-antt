/**
 * Exportação completa para Excel e PDF com todas as colunas e linha de totais
 */
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Função para exportar para Excel com todas as colunas e linha de totais
export function exportToExcel(data: any[]): void {
  try {
    console.log('Iniciando exportação completa para Excel...');
    
    // Verificar dados
    if (!data || data.length === 0) {
      alert('Não há dados para exportar');
      return;
    }
    
    // Mapear dados mantendo todas as colunas
    const dadosParaWorksheet = data.map(item => ({
      'Nº OS': item.orderNumber || '',
      'Vendedor': item.sellerName || '',
      'Cliente': item.customerName || '',
      'Data': item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '',
      'Valor Total': formatarNumero(item.totalAmount),
      'Valor Pago': formatarNumero(item.paidAmount || 0),
      'Custos': formatarNumero(item.operationalCosts || 0),
      'Resultado': formatarNumero((item.paidAmount || 0) - (item.operationalCosts || 0)),
      'Status': formatarStatus(item.financialStatus || item.status)
    }));
    
    // Calcular totais
    const totalValores = dadosParaWorksheet.reduce((acc, item) => {
      acc.valorTotal += converterParaNumero(item['Valor Total']);
      acc.valorPago += converterParaNumero(item['Valor Pago']);
      acc.custos += converterParaNumero(item['Custos']);
      acc.resultado += converterParaNumero(item['Resultado']);
      return acc;
    }, { valorTotal: 0, valorPago: 0, custos: 0, resultado: 0 });
    
    // Adicionar linha de totais
    dadosParaWorksheet.push({
      'Nº OS': `Total de ${data.length} vendas`,
      'Vendedor': '',
      'Cliente': '',
      'Data': '',
      'Valor Total': formatarNumero(totalValores.valorTotal),
      'Valor Pago': formatarNumero(totalValores.valorPago),
      'Custos': formatarNumero(totalValores.custos),
      'Resultado': formatarNumero(totalValores.resultado),
      'Status': ''
    });
    
    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dadosParaWorksheet);
    
    // Definir larguras das colunas
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
    alert(`Erro ao exportar para Excel: ${error}`);
  }
}

// Função para exportar para PDF com todas as colunas e linha de totais
export function exportToPDF(data: any[]): void {
  try {
    console.log('Iniciando exportação completa para PDF...');
    
    // Verificar dados
    if (!data || data.length === 0) {
      alert('Não há dados para exportar');
      return;
    }
    
    // Criar documento PDF (orientação paisagem para caber todas as colunas)
    const doc = new jsPDF('landscape');
    
    // Adicionar título
    doc.setFontSize(18);
    doc.text('Relatório Financeiro', 14, 22);
    
    // Adicionar data de geração e status do filtro
    doc.setFontSize(11);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, 14, 30);
    doc.text('Status: Todos', 14, 38);
    
    // Mapear dados mantendo todas as colunas
    const dadosTabela = data.map(item => [
      item.orderNumber || '',
      item.sellerName || '',
      item.customerName || '',
      item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '',
      formatarNumero(item.totalAmount),
      formatarNumero(item.paidAmount || 0),
      formatarNumero(item.operationalCosts || 0),
      formatarNumero((item.paidAmount || 0) - (item.operationalCosts || 0)),
      formatarStatus(item.financialStatus || item.status)
    ]);
    
    // Calcular totais
    let totalValorTotal = 0;
    let totalValorPago = 0;
    let totalCustos = 0;
    let totalResultado = 0;
    
    data.forEach(item => {
      totalValorTotal += converterParaNumero(item.totalAmount);
      totalValorPago += converterParaNumero(item.paidAmount || 0);
      totalCustos += converterParaNumero(item.operationalCosts || 0);
      totalResultado += converterParaNumero((item.paidAmount || 0) - (item.operationalCosts || 0));
    });
    
    // Adicionar linha de totais
    dadosTabela.push([
      `Total de ${data.length} vendas`,
      '',
      '',
      '',
      formatarNumero(totalValorTotal),
      formatarNumero(totalValorPago),
      formatarNumero(totalCustos),
      formatarNumero(totalResultado),
      ''
    ]);
    
    // Criar tabela com autotable
    autoTable(doc, {
      head: [['Nº OS', 'Vendedor', 'Cliente', 'Data', 'Valor Total', 'Valor Pago', 'Custos', 'Resultado', 'Status']],
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
      // Formatação especial para a última linha (totais)
      didDrawCell: function(data) {
        // Verifica se é a última linha (linha de totais)
        if (data.row.index === dadosTabela.length - 1) {
          // Formatar a última linha com fonte em negrito
          doc.setFont("Helvetica-Bold");
          // Ajustar cor de fundo para cinza claro
          doc.setFillColor(220, 220, 220);
        }
      }
    });
    
    // Adicionar rodapé
    const totalPaginas = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Página ${i} de ${totalPaginas}`, 
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

// Funções auxiliares
function formatarNumero(valor: any): string {
  if (valor === undefined || valor === null) return 'R$ 0,00';
  
  const numero = converterParaNumero(valor);
  return `R$ ${Math.abs(numero).toFixed(2).replace('.', ',')}`;
}

function converterParaNumero(valor: any): number {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  
  // Se for string com "R$", remover e converter
  if (typeof valor === 'string') {
    return parseFloat(valor.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
  }
  
  return 0;
}

function formatarStatus(status: string): string {
  switch (status) {
    case 'pending': return 'Aguardando Pagamento';
    case 'in_progress': return 'Em Execução';
    case 'completed': return 'Executado';
    case 'paid': return 'Pago';
    default: return status || '';
  }
}
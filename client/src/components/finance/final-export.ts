/**
 * Implementação final da exportação de dados para Excel e PDF
 * Utilizando bibliotecas oficiais e estáveis: xlsx e jspdf
 */

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Tipo para representar os dados formatados, exatamente como na tabela
interface FormattedData {
  id: number;
  orderNumber: string;
  vendedor: string;
  cliente: string;
  data: string;
  valorTotal: string;
  valorPago: string;
  custos: string;
  resultado: string;
  status: string;
}

/**
 * Formata os dados brutos para um formato simplificado, exatamente como na tabela da interface
 */
function formatarDados(dadosBrutos: any[]): FormattedData[] {
  return dadosBrutos.map(item => {
    // Calcular informações financeiras conforme mostrado na tabela
    const totalPago = item.installments ? 
      item.installments
        .filter((inst: any) => inst.status === 'paid')
        .reduce((sum: number, inst: any) => sum + parseFloat(inst.amount || 0), 0) : 0;
    
    // Calcular custos operacionais
    const custoTotal = item.operationalCosts ? 
      item.operationalCosts.reduce((sum: number, cost: any) => sum + parseFloat(cost.amount || 0), 0) : 0;
    
    // Calcular resultado líquido
    const totalVenda = parseFloat(item.totalAmount || 0);
    const resultadoLiquido = totalVenda - custoTotal;
    
    // Formatação de valores monetários - mesmo estilo da tabela (R$ XX,XX)
    const formatarMoeda = (valor: number) => {
      return `R$ ${valor.toFixed(2).replace('.', ',')}`;
    };

    return {
      id: item.id || 0,
      orderNumber: item.orderNumber || '',
      vendedor: item.sellerName || '',
      cliente: item.customerName || '',
      data: item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '',
      valorTotal: typeof item.totalAmount === 'number' 
        ? formatarMoeda(item.totalAmount)
        : item.totalAmount || 'R$ 0,00',
      valorPago: formatarMoeda(totalPago),
      custos: formatarMoeda(custoTotal),
      resultado: formatarMoeda(resultadoLiquido),
      status: item.status || ''
    };
  });
}

/**
 * Exporta os dados para Excel usando a biblioteca xlsx
 */
export function exportToExcel(dados: any[]): void {
  try {
    console.log('Iniciando exportação para Excel...');
    
    // Verificar dados
    if (!dados || dados.length === 0) {
      alert('Não há dados para exportar');
      return;
    }
    
    // Formatar dados
    const dadosFormatados = formatarDados(dados);
    
    // Preparar dados para o formato que a biblioteca xlsx espera (exatamente como na tabela)
    const dadosParaWorksheet = dadosFormatados.map(item => ({
      'Nº OS': item.orderNumber,
      'Vendedor': item.vendedor,
      'Cliente': item.cliente, 
      'Data': item.data,
      'Valor Total': item.valorTotal,
      'Valor Pago': item.valorPago,
      'Custos': item.custos,
      'Resultado': item.resultado,
      'Status': item.status
    }));
    
    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dadosParaWorksheet);
    
    // Adicionar formatação (largura das colunas) - exatamente como na tabela
    const wscols = [
      { wch: 10 }, // Nº OS
      { wch: 20 }, // Vendedor
      { wch: 25 }, // Cliente
      { wch: 12 }, // Data 
      { wch: 15 }, // Valor Total
      { wch: 15 }, // Valor Pago
      { wch: 15 }, // Custos
      { wch: 15 }, // Resultado
      { wch: 15 }  // Status
    ];
    ws['!cols'] = wscols;
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    
    // Gerar arquivo e baixar
    XLSX.writeFile(wb, 'relatorio_financeiro.xlsx');
    
    console.log('Exportação para Excel concluída com sucesso!');
  } catch (error) {
    console.error('Erro na exportação para Excel:', error);
    alert(`Erro ao exportar para Excel: ${error}`);
  }
}

/**
 * Exporta os dados para PDF usando jsPDF
 */
export function exportToPDF(dados: any[]): void {
  try {
    console.log('Iniciando exportação para PDF...');
    
    // Verificar dados
    if (!dados || dados.length === 0) {
      alert('Não há dados para exportar');
      return;
    }
    
    // Formatar dados
    const dadosFormatados = formatarDados(dados);
    
    // Criar documento PDF (orientação paisagem para caber mais colunas)
    // Ajustamos para tamanho A4 que é o padrão mais comum
    const doc = new jsPDF('landscape');
    
    // Adicionar título
    doc.setFontSize(18);
    doc.text('Relatório Financeiro', 14, 22);
    
    // Adicionar data de geração
    doc.setFontSize(11);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    
    // Preparar dados para a tabela - exatamente como na tabela da interface
    const dadosTabela = dadosFormatados.map(item => [
      item.orderNumber,
      item.vendedor,
      item.cliente,
      item.data,
      item.valorTotal,
      item.valorPago,
      item.custos,
      item.resultado,
      item.status
    ]);
    
    // Criar tabela com autotable - cabeçalhos idênticos aos da tabela na interface
    autoTable(doc, {
      head: [['Nº OS', 'Vendedor', 'Cliente', 'Data', 'Valor Total', 'Valor Pago', 'Custos', 'Resultado', 'Status']],
      body: dadosTabela,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 10,
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
      columnStyles: {
        0: { cellWidth: 20 },    // Nº OS
        1: { cellWidth: 30 },    // Vendedor
        2: { cellWidth: 30 },    // Cliente
        3: { cellWidth: 20 },    // Data
        4: { cellWidth: 25 },    // Valor Total
        5: { cellWidth: 25 },    // Valor Pago
        6: { cellWidth: 25 },    // Custos
        7: { cellWidth: 25 },    // Resultado
        8: { cellWidth: 25 }     // Status
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
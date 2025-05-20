/**
 * Exportação direta para PDF e Excel usando o formato exato mostrado na tabela
 */
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Função para exportar para Excel (formato exato da tabela)
export function exportToExcel(data: any[]): void {
  try {
    console.log('Iniciando exportação para Excel...');
    
    // Verificar dados
    if (!data || data.length === 0) {
      alert('Não há dados para exportar');
      return;
    }
    
    // Mapear apenas os dados exatos mostrados na tabela
    const dadosParaWorksheet = data.map(item => ({
      'Número': item.orderNumber || '',
      'Cliente': item.customerName || '',
      'Data': item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '',
      'Valor Total': `R$ ${parseFloat(item.totalAmount || 0).toFixed(2).replace('.', ',')}`,
      'Status': item.status === 'paid' ? 'Pago' : (item.status || '')
    }));
    
    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dadosParaWorksheet);
    
    // Adicionar formatação (largura das colunas) - exatamente como na tabela
    const wscols = [
      { wch: 10 }, // Número
      { wch: 25 }, // Cliente
      { wch: 12 }, // Data 
      { wch: 15 }, // Valor Total
      { wch: 15 }  // Status
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

// Função para exportar para PDF (formato exato da tabela)
export function exportToPDF(data: any[]): void {
  try {
    console.log('Iniciando exportação para PDF...');
    
    // Verificar dados
    if (!data || data.length === 0) {
      alert('Não há dados para exportar');
      return;
    }
    
    // Criar documento PDF (orientação paisagem)
    const doc = new jsPDF('landscape');
    
    // Adicionar título
    doc.setFontSize(18);
    doc.text('Relatório Financeiro', 14, 22);
    
    // Adicionar data de geração e status
    doc.setFontSize(11);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, 14, 30);
    doc.text(`Status: Todos`, 14, 38);
    
    // Preparar dados para a tabela - apenas as colunas da tabela
    const dadosTabela = data.map(item => [
      item.orderNumber || '',
      item.customerName || '',
      item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '',
      `R$ ${parseFloat(item.totalAmount || 0).toFixed(2).replace('.', ',')}`,
      item.status === 'paid' ? 'Pago' : (item.status || '')
    ]);
    
    // Criar tabela com autotable - cabeçalhos simplificados como na imagem
    autoTable(doc, {
      head: [['Número', 'Cliente', 'Data', 'Valor Total', 'Status']],
      body: dadosTabela,
      startY: 45,
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
/**
 * Exportação baseada diretamente na tabela exibida
 * Captura os dados diretamente da DOM para garantir a exportação correta
 */
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Função para exportar para Excel usando a tabela real
export function exportToExcel(): void {
  try {
    console.log('Iniciando exportação para Excel baseada na tabela...');
    
    // Obter todas as linhas da tabela
    const table = document.querySelector('.finance-table');
    if (!table) {
      alert('Não foi possível encontrar a tabela para exportar');
      return;
    }
    
    // Obter cabeçalhos
    const headerRow = table.querySelector('thead tr');
    if (!headerRow) {
      alert('Não foi possível encontrar os cabeçalhos da tabela');
      return;
    }
    
    const headers = Array.from(headerRow.querySelectorAll('th')).map(th => 
      th.textContent?.trim() || ''
    ).filter(header => header !== 'Ações');
    
    // Obter linhas de dados (excluindo ações)
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    if (rows.length === 0) {
      alert('Não há dados para exportar');
      return;
    }
    
    // Preparar dados para o Excel
    const formattedData = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      
      // Filtrar células para corresponder aos cabeçalhos (excluir coluna de ações)
      const rowData: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        if (cells[index]) {
          rowData[header] = cells[index].textContent?.trim() || '';
        } else {
          rowData[header] = '';
        }
      });
      
      return rowData;
    });
    
    // Calcular totais
    let totalValorTotal = 0;
    let totalValorPago = 0;
    let totalCustos = 0;
    let totalResultado = 0;
    
    formattedData.forEach(row => {
      // Extrai valores númericos das células
      const valorTotal = extractNumber(row['Valor Total'] || '');
      const valorPago = extractNumber(row['Valor Pago'] || '');
      const custos = extractNumber(row['Custos'] || '');
      const resultado = extractNumber(row['Resultado'] || '');
      
      totalValorTotal += valorTotal;
      totalValorPago += valorPago;
      totalCustos += custos;
      totalResultado += resultado;
    });
    
    // Adicionar linha de totais
    formattedData.push({
      'Nº OS': `Total de ${formattedData.length} vendas`,
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
    const ws = XLSX.utils.json_to_sheet(formattedData);
    
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

// Função para exportar para PDF usando a tabela real
export function exportToPDF(): void {
  try {
    console.log('Iniciando exportação para PDF baseada na tabela...');
    
    // Obter todas as linhas da tabela
    const table = document.querySelector('.finance-table');
    if (!table) {
      alert('Não foi possível encontrar a tabela para exportar');
      return;
    }
    
    // Obter cabeçalhos
    const headerRow = table.querySelector('thead tr');
    if (!headerRow) {
      alert('Não foi possível encontrar os cabeçalhos da tabela');
      return;
    }
    
    const headers = Array.from(headerRow.querySelectorAll('th')).map(th => 
      th.textContent?.trim() || ''
    ).filter(header => header !== 'Ações');
    
    // Obter linhas de dados (excluindo ações)
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    if (rows.length === 0) {
      alert('Não há dados para exportar');
      return;
    }
    
    // Preparar dados para o PDF
    const tableData = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      
      // Retornar apenas as células que correspondem aos cabeçalhos (excluir coluna de ações)
      return headers.map((_, index) => {
        if (cells[index]) {
          return cells[index].textContent?.trim() || '';
        } else {
          return '';
        }
      });
    });
    
    // Calcular totais
    let totalValorTotal = 0;
    let totalValorPago = 0;
    let totalCustos = 0;
    let totalResultado = 0;
    
    // Encontrar índices das colunas
    const valorTotalIndex = headers.findIndex(h => h === 'Valor Total');
    const valorPagoIndex = headers.findIndex(h => h === 'Valor Pago');
    const custosIndex = headers.findIndex(h => h === 'Custos');
    const resultadoIndex = headers.findIndex(h => h === 'Resultado');
    
    tableData.forEach(row => {
      if (valorTotalIndex >= 0) totalValorTotal += extractNumber(row[valorTotalIndex]);
      if (valorPagoIndex >= 0) totalValorPago += extractNumber(row[valorPagoIndex]);
      if (custosIndex >= 0) totalCustos += extractNumber(row[custosIndex]);
      if (resultadoIndex >= 0) totalResultado += extractNumber(row[resultadoIndex]);
    });
    
    // Adicionar linha de totais
    const totalRow = headers.map((header, index) => {
      if (index === 0) return `Total de ${tableData.length} vendas`;
      if (header === 'Valor Total') return formatCurrency(totalValorTotal);
      if (header === 'Valor Pago') return formatCurrency(totalValorPago);
      if (header === 'Custos') return formatCurrency(totalCustos);
      if (header === 'Resultado') return formatCurrency(totalResultado);
      return '';
    });
    
    tableData.push(totalRow);
    
    // Criar documento PDF (orientação paisagem)
    const doc = new jsPDF('landscape');
    
    // Adicionar título
    doc.setFontSize(18);
    doc.text('Relatório Financeiro', 14, 22);
    
    // Adicionar data de geração
    doc.setFontSize(11);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, 14, 30);
    
    // Adicionar status do filtro
    // Tentar obter o valor atual da aba selecionada
    let statusFiltro = 'Todos';
    const tabAtiva = document.querySelector('[role="tab"][data-state="active"]');
    if (tabAtiva) {
      const tabText = tabAtiva.textContent?.trim();
      if (tabText) statusFiltro = tabText;
    }
    doc.text(`Status: ${statusFiltro}`, 14, 38);
    
    // Criar tabela com autotable
    autoTable(doc, {
      head: [headers],
      body: tableData,
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
        if (data.row.index === tableData.length - 1) {
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

// Funções auxiliares
function extractNumber(text: string): number {
  if (!text) return 0;
  
  // Remover símbolos de moeda e converter ',' para '.'
  const numStr = text.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(numStr) || 0;
}

function formatCurrency(value: number): string {
  return `R$ ${Math.abs(value).toFixed(2).replace('.', ',')}`;
}
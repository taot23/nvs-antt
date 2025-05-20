/**
 * Exportação baseada no exemplo Python fornecido
 * Implementa exatamente o mesmo formato com todas as colunas
 */
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Função para exportar para Excel usando estrutura idêntica ao exemplo Python
export function exportToExcel(data: any[]): void {
  try {
    console.log('Iniciando exportação para Excel no formato Python...');
    
    // Verificar dados
    if (!data || data.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    // Buscar dados completos sobre as vendas para ter todos os valores
    (async () => {
      try {
        // Vamos buscar dados completos com resumo financeiro
        const url = new URL('/api/sales', window.location.origin);
        url.searchParams.append('limit', '1000'); // Buscar todos os registros
        url.searchParams.append('financialStatus', 'all');
        url.searchParams.append('includeSummary', 'true'); // Importante: inclui resumo financeiro
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Erro ao buscar dados completos');
        }
        
        const fullData = await response.json();
        const sales = fullData.data || [];
        
        if (sales.length === 0) {
          alert('Não há dados para exportar');
          return;
        }
        
        // Preparar dados no formato esperado
        const formattedData = sales.map((sale: any) => ({
          "N° OS": sale.orderNumber || '',
          "Vendedor": sale.sellerName || '',
          "Cliente": sale.customerName || '',
          "Data": formatDate(sale.date),
          "Valor Total": formatCurrency(sale.totalAmount),
          "Valor Pago": formatCurrency(sale.paidAmount || 0),
          "Custos": formatCurrency(sale.operationalCosts || 0),
          "Resultado": formatCurrency((sale.paidAmount || 0) - (sale.operationalCosts || 0)),
          "Status": formatStatus(sale.financialStatus || sale.status)
        }));
        
        // Calcular totais
        const totals = {
          valorTotal: sumValues(sales, 'totalAmount'),
          valorPago: sumValues(sales, 'paidAmount'),
          custos: sumValues(sales, 'operationalCosts'),
          resultado: sumValues(sales, 'paidAmount') - sumValues(sales, 'operationalCosts')
        };
        
        // Adicionar linha de totais
        formattedData.push({
          "N° OS": `Total de ${sales.length} vendas`,
          "Vendedor": "",
          "Cliente": "",
          "Data": "",
          "Valor Total": formatCurrency(totals.valorTotal),
          "Valor Pago": formatCurrency(totals.valorPago),
          "Custos": formatCurrency(totals.custos),
          "Resultado": formatCurrency(totals.resultado),
          "Status": ""
        });
        
        // Criar workbook e worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(formattedData);
        
        // Ajustar largura das colunas
        const wscols = [
          { wch: 10 },  // N° OS
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
        console.error('Erro ao buscar dados completos:', error);
        alert(`Erro ao exportar: ${error}`);
      }
    })();
  } catch (error) {
    console.error('Erro na exportação para Excel:', error);
    alert(`Erro ao exportar para Excel: ${error}`);
  }
}

// Função para exportar para PDF usando estrutura idêntica ao exemplo Python
export function exportToPDF(data: any[]): void {
  try {
    console.log('Iniciando exportação para PDF no formato Python...');
    
    // Verificar dados
    if (!data || data.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    // Buscar dados completos sobre as vendas para ter todos os valores
    (async () => {
      try {
        // Vamos buscar dados completos com resumo financeiro
        const url = new URL('/api/sales', window.location.origin);
        url.searchParams.append('limit', '1000'); // Buscar todos os registros
        url.searchParams.append('financialStatus', 'all');
        url.searchParams.append('includeSummary', 'true'); // Importante: inclui resumo financeiro
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Erro ao buscar dados completos');
        }
        
        const fullData = await response.json();
        const sales = fullData.data || [];
        
        if (sales.length === 0) {
          alert('Não há dados para exportar');
          return;
        }
        
        // Criar documento PDF (orientação paisagem)
        const doc = new jsPDF('landscape');
        
        // Adicionar título
        doc.setFontSize(18);
        doc.text('Relatório Financeiro', 14, 22);
        
        // Adicionar data de geração
        doc.setFontSize(11);
        doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, 14, 30);
        
        // Adicionar status do filtro
        doc.text('Status: Todos', 14, 38);
        
        // Preparar cabeçalhos e dados
        const headers = ['N° OS', 'Vendedor', 'Cliente', 'Data', 'Valor Total', 'Valor Pago', 'Custos', 'Resultado', 'Status'];
        
        // Converter dados para formato de array
        const tableData = sales.map((sale: any) => [
          sale.orderNumber || '',
          sale.sellerName || '',
          sale.customerName || '',
          formatDate(sale.date),
          formatCurrency(sale.totalAmount),
          formatCurrency(sale.paidAmount || 0),
          formatCurrency(sale.operationalCosts || 0),
          formatCurrency((sale.paidAmount || 0) - (sale.operationalCosts || 0)),
          formatStatus(sale.financialStatus || sale.status)
        ]);
        
        // Calcular totais
        const totals = {
          valorTotal: sumValues(sales, 'totalAmount'),
          valorPago: sumValues(sales, 'paidAmount'),
          custos: sumValues(sales, 'operationalCosts'),
          resultado: sumValues(sales, 'paidAmount') - sumValues(sales, 'operationalCosts')
        };
        
        // Adicionar linha de totais
        tableData.push([
          `Total de ${sales.length} vendas`,
          "",
          "",
          "",
          formatCurrency(totals.valorTotal),
          formatCurrency(totals.valorPago),
          formatCurrency(totals.custos),
          formatCurrency(totals.resultado),
          ""
        ]);
        
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
        console.error('Erro ao buscar dados completos:', error);
        alert(`Erro ao exportar: ${error}`);
      }
    })();
  } catch (error) {
    console.error('Erro na exportação para PDF:', error);
    alert(`Erro ao exportar para PDF: ${error}`);
  }
}

// Funções auxiliares
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function formatCurrency(value: number | string): string {
  if (value === undefined || value === null) return 'R$ 0,00';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `R$ ${Math.abs(numValue).toFixed(2).replace('.', ',')}`;
}

function formatStatus(status: string): string {
  switch (status) {
    case 'pending': return 'Aguardando Pagamento';
    case 'in_progress': return 'Em Execução';
    case 'completed': return 'Executado';
    case 'paid': return 'Pago';
    default: return status || '';
  }
}

function sumValues(data: any[], field: string): number {
  return data.reduce((acc, item) => {
    const value = item[field];
    if (value === undefined || value === null) return acc;
    return acc + (typeof value === 'string' ? parseFloat(value) : value);
  }, 0);
}
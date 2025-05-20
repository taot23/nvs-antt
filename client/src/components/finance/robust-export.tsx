import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FinanceSale } from './finance-types';

interface ColumnDef {
  header: string;
  accessor: string;
  formatter?: (value: any, row?: any) => string;
  width?: number;
}

// Definição das colunas básicas
const baseColumns: ColumnDef[] = [
  { 
    header: 'Nº OS', 
    accessor: 'orderNumber',
    width: 15
  },
  { 
    header: 'Vendedor', 
    accessor: 'sellerName',
    formatter: (value, row) => value || `Vendedor #${row?.sellerId || ''}`,
    width: 30
  },
  { 
    header: 'Cliente', 
    accessor: 'customerName',
    formatter: (value, row) => value || `Cliente #${row?.customerId || ''}`,
    width: 30
  },
  { 
    header: 'Data', 
    accessor: 'date',
    formatter: (value, row) => value ? format(new Date(value), 'dd/MM/yyyy', { locale: ptBR }) : 
                               row?.createdAt ? format(new Date(row.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
    width: 20
  },
  { 
    header: 'Valor Total', 
    accessor: 'totalAmount',
    formatter: (value) => value ? `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}` : 'R$ 0,00',
    width: 20
  },
  { 
    header: 'Status', 
    accessor: 'financialStatus',
    formatter: (value) => {
      switch(value) {
        case 'pending': return 'Aguardando Pagamento';
        case 'in_progress': return 'Em Execução';
        case 'completed': return 'Executado';
        case 'paid': return 'Pago';
        default: return value || '';
      }
    },
    width: 25
  }
];

// Colunas adicionais para informações financeiras
const financialColumns: ColumnDef[] = [
  { 
    header: 'Valor Pago', 
    accessor: 'financialSummary.totalPaid',
    formatter: (value) => value ? `R$ ${parseFloat(value.toString()).toFixed(2).replace('.', ',')}` : 'R$ 0,00',
    width: 20
  },
  { 
    header: 'Custos', 
    accessor: 'financialSummary.totalCosts',
    formatter: (value) => value ? `R$ ${parseFloat(value.toString()).toFixed(2).replace('.', ',')}` : 'R$ 0,00',
    width: 20
  },
  { 
    header: 'Resultado', 
    accessor: 'financialSummary.netResult',
    formatter: (value) => {
      if (value === undefined || value === null) return 'N/A';
      const amount = parseFloat(value.toString());
      return `R$ ${Math.abs(amount).toFixed(2).replace('.', ',')}`;
    },
    width: 20
  }
];

// Função para obter valor baseado em um accessor que pode ser uma path (ex: "financialSummary.totalPaid")
function getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((prev, curr) => {
    return prev && prev[curr] !== undefined ? prev[curr] : undefined;
  }, obj);
}

// Componente para gerar a tabela para exportação
export const ExportTableRenderer: React.FC<{
  data: FinanceSale[];
  includeFinancialColumns: boolean;
  title?: string;
}> = ({ data, includeFinancialColumns, title }) => {
  const columns = includeFinancialColumns 
    ? [...baseColumns, ...financialColumns]
    : baseColumns;

  return (
    <div style={{ display: 'none' }}>
      <table id="export-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} style={{ 
                padding: '8px', 
                textAlign: 'left',
                backgroundColor: '#3498db',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} style={{ 
              backgroundColor: rowIndex % 2 === 0 ? '#f2f2f2' : 'white' 
            }}>
              {columns.map((col, colIndex) => {
                const rawValue = getValueByPath(row, col.accessor);
                const formattedValue = col.formatter 
                  ? col.formatter(rawValue, row) 
                  : (rawValue !== undefined && rawValue !== null ? String(rawValue) : '');
                
                return (
                  <td key={colIndex} style={{ 
                    padding: '8px',
                    borderBottom: '1px solid #ddd'
                  }}>
                    {formattedValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Função para exportar para Excel
export async function exportToExcel(data: FinanceSale[], includeFinancialColumns: boolean): Promise<string> {
  try {
    // Garantir que o elemento existe no documento
    let exportTable = document.getElementById('export-table');
    if (!exportTable) {
      // Se não existir, aguardar um pouco para garantir que a renderização ocorreu
      await new Promise(resolve => setTimeout(resolve, 500));
      exportTable = document.getElementById('export-table');
      
      if (!exportTable) {
        throw new Error('Tabela de exportação não encontrada no DOM');
      }
    }

    // Importar a biblioteca de Excel
    const XLSX = await import('xlsx');
    
    // Criar workbook a partir da tabela HTML
    const wb = XLSX.utils.table_to_book(exportTable, { sheet: 'Relatório Financeiro' });
    
    // Ajustar larguras das colunas
    const ws = wb.Sheets['Relatório Financeiro'];
    const columns = includeFinancialColumns 
      ? [...baseColumns, ...financialColumns]
      : baseColumns;
    
    const wscols = columns.map(col => ({ wch: col.width || 20 }));
    ws['!cols'] = wscols;
    
    // Gerar nome de arquivo
    const fileName = `relatorio_financeiro_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
    
    // Salvar arquivo
    XLSX.writeFile(wb, fileName);
    
    return fileName;
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw error;
  }
}

// Função para exportar para PDF
export async function exportToPDF(data: FinanceSale[], includeFinancialColumns: boolean): Promise<string> {
  try {
    // Garantir que o elemento existe no documento
    let exportTable = document.getElementById('export-table');
    if (!exportTable) {
      // Se não existir, aguardar um pouco para garantir que a renderização ocorreu
      await new Promise(resolve => setTimeout(resolve, 500));
      exportTable = document.getElementById('export-table');
      
      if (!exportTable) {
        throw new Error('Tabela de exportação não encontrada no DOM');
      }
    }

    // Importar as bibliotecas para o PDF
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    // Criar documento PDF em modo paisagem
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Adicionar título
    doc.setFontSize(16);
    doc.text('Relatório Financeiro', 14, 15);
    doc.setFontSize(10);
    doc.text(`Data de Geração: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 22);
    
    // Usar autoTable para gerar PDF a partir da tabela HTML
    autoTable(doc, {
      html: '#export-table',
      startY: 25,
      styles: { 
        fontSize: 8,
        cellPadding: 2 
      },
      headStyles: { 
        fillColor: [52, 152, 219], 
        textColor: 255,
        fontSize: 9,
        halign: 'left'
      },
      alternateRowStyles: { 
        fillColor: [240, 240, 240] 
      },
      columnStyles: columns => {
        const styles: any = {};
        columns.forEach((column, index) => {
          if (index === 0) { // Nº OS - centralizado
            styles[index] = { halign: 'center' };
          } else if (index === 3) { // Data - centralizado
            styles[index] = { halign: 'center' };
          } else if (index === 4 || index === 6 || index === 7 || index === 8) { // Colunas de valores - alinhadas à direita
            styles[index] = { halign: 'right' };
          }
        });
        return styles;
      },
      margin: { top: 25 }
    });
    
    // Gerar nome de arquivo
    const fileName = `relatorio_financeiro_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
    
    // Salvar arquivo
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Erro ao exportar para PDF:', error);
    throw error;
  }
}
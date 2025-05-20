/**
 * Exportações independentes e simples para Excel e PDF
 * Solução definitiva sem dependências de bibliotecas não padrão
 */

import { saveAs } from 'file-saver';

// Interface para dados formatados
interface FormattedData {
  os: string;
  vendedor: string;
  cliente: string;
  data: string;
  valor: string;
  status: string;
}

// Função auxiliar para formatar dados
function formatData(data: any[]): FormattedData[] {
  return data.map(item => ({
    os: item.orderNumber || '',
    vendedor: item.sellerName || '',
    cliente: item.customerName || '',
    data: item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '',
    valor: typeof item.totalAmount === 'number' 
      ? item.totalAmount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
      : item.totalAmount || '0',
    status: item.status || item.financialStatus || ''
  }));
}

// Exportação CSV (base para Excel)
export function exportToCSV(data: any[]): void {
  try {
    console.log("Exportando para CSV...");
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      alert('Sem dados para exportar');
      return;
    }
    
    // Formatar dados
    const formattedData = formatData(data);
    
    // Cabeçalhos
    const headers = ['Nº OS', 'Vendedor', 'Cliente', 'Data', 'Valor', 'Status'];
    
    // Montar conteúdo
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\\r\\n";
    
    // Adicionar linhas
    formattedData.forEach(item => {
      const row = [
        item.os,
        item.vendedor,
        item.cliente,
        item.data,
        item.valor,
        item.status
      ].map(cell => {
        // Escapar células com vírgulas ou aspas
        if (cell.includes(',') || cell.includes('"') || cell.includes('\\n')) {
          return '"' + cell.replace(/"/g, '""') + '"';
        }
        return cell;
      });
      
      csvContent += row.join(",") + "\\r\\n";
    });
    
    // Criar o download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Exportação para CSV concluída!');
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    alert('Erro ao exportar CSV: ' + error);
  }
}

// Exportação para Excel
export function exportToExcel(data: any[]): void {
  try {
    console.log("Exportando para Excel...");
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      alert('Sem dados para exportar');
      return;
    }
    
    // Formatar dados
    const formattedData = formatData(data);
    
    // Cabeçalhos HTML para Excel
    let excelContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    excelContent += '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Relatório</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
    excelContent += '<body><table>';
    
    // Adicionar cabeçalhos
    excelContent += '<tr>';
    ['Nº OS', 'Vendedor', 'Cliente', 'Data', 'Valor', 'Status'].forEach(header => {
      excelContent += '<th>' + header + '</th>';
    });
    excelContent += '</tr>';
    
    // Adicionar linhas de dados
    formattedData.forEach(item => {
      excelContent += '<tr>';
      [item.os, item.vendedor, item.cliente, item.data, item.valor, item.status].forEach(cell => {
        excelContent += '<td>' + cell + '</td>';
      });
      excelContent += '</tr>';
    });
    
    // Fechar a tabela HTML
    excelContent += '</table></body></html>';
    
    // Criar Blob e baixar via FileSaver
    const blob = new Blob([excelContent], {type: 'application/vnd.ms-excel;charset=utf-8'});
    saveAs(blob, 'relatorio.xls');
    
    console.log('Exportação Excel concluída');
    alert('Exportação para Excel concluída!');
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    alert('Erro ao exportar Excel: ' + error);
  }
}

// Exportação para PDF (HTML para impressão)
export function exportToPDF(data: any[]): void {
  try {
    console.log("Exportando para PDF...");
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      alert('Sem dados para exportar');
      return;
    }
    
    // Formatar dados
    const formattedData = formatData(data);
    
    // Criar uma janela de impressão
    const printWindow = window.open('', '', 'height=600,width=800');
    
    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.');
      return;
    }
    
    // Estilo e conteúdo da página
    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório Financeiro</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Relatório Financeiro</h1>
          <div>Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</div>
          <table>
            <thead>
              <tr>
                <th>Nº OS</th>
                <th>Vendedor</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `);
    
    // Adicionar dados
    formattedData.forEach(item => {
      printWindow.document.write(`
        <tr>
          <td>${item.os}</td>
          <td>${item.vendedor}</td>
          <td>${item.cliente}</td>
          <td>${item.data}</td>
          <td>${item.valor}</td>
          <td>${item.status}</td>
        </tr>
      `);
    });
    
    // Fechar tabela e adicionar rodapé
    printWindow.document.write(`
            </tbody>
          </table>
          <div class="footer">
            Sistema de Gestão Empresarial - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </body>
      </html>
    `);
    
    // Fechar documento e acionar impressão
    printWindow.document.close();
    printWindow.focus();
    
    // Aguardar carregamento completo antes de imprimir
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    console.log('Exportação PDF concluída');
    alert('Preparado para impressão PDF. Por favor, escolha "Salvar como PDF" na janela de impressão.');
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    alert('Erro ao exportar PDF: ' + error);
  }
}
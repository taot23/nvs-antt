/**
 * Exportação mínima - Solução definitiva
 * Esta implementação usa apenas recursos nativos e simples
 */

/**
 * Função para exportar para Excel sem dependências
 */
export function exportToExcel(data: any[]): void {
  // Verificar dados
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  try {
    console.log('Iniciando exportação Excel...');
    
    // Construir o HTML para Excel
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">';
    html += '<head>';
    html += '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
    html += '<x:Name>Relatório</x:Name>';
    html += '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>';
    html += '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
    html += '<style>td, th { padding: 5px; border: 1px solid #ccc; } table { border-collapse: collapse; }</style>';
    html += '</head><body>';
    
    // Iniciar tabela
    html += '<table>';
    
    // Adicionar cabeçalhos
    html += '<tr>';
    ['Nº OS', 'Vendedor', 'Cliente', 'Data', 'Valor', 'Status'].forEach(header => {
      html += `<th style="font-weight: bold; background-color: #f0f0f0;">${header}</th>`;
    });
    html += '</tr>';
    
    // Adicionar linhas de dados
    data.forEach(row => {
      html += '<tr>';
      [
        row.orderNumber || '',
        row.sellerName || '',
        row.customerName || '',
        row.date ? new Date(row.date).toLocaleDateString('pt-BR') : '',
        typeof row.totalAmount === 'number' 
          ? row.totalAmount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
          : row.totalAmount || '0',
        row.status || row.financialStatus || ''
      ].forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += '</tr>';
    });
    
    // Fechar tabela e documento
    html += '</table></body></html>';
    
    // Criar Blob
    const blob = new Blob([html], {type: 'application/vnd.ms-excel'});
    
    // Criar URL
    const url = URL.createObjectURL(blob);
    
    // Criar link e forçar download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio.xls';
    document.body.appendChild(a);
    a.click();
    
    // Limpar
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
    
    console.log('Exportação Excel concluída');
  } catch (error) {
    console.error('Erro na exportação Excel:', error);
    alert('Erro ao exportar: ' + error);
  }
}

/**
 * Função para exportar para PDF através da impressão
 */
export function exportToPDF(data: any[]): void {
  // Verificar dados
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  try {
    console.log('Iniciando exportação PDF...');
    
    // Criar nova janela para impressão
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.');
      return;
    }
    
    // Construir o HTML para impressão
    let html = '<!DOCTYPE html><html><head><title>Relatório Financeiro</title>';
    html += '<style>';
    html += 'body { font-family: Arial, sans-serif; margin: 20px; }';
    html += 'h1 { text-align: center; color: #333; margin-bottom: 20px; }';
    html += 'table { width: 100%; border-collapse: collapse; }';
    html += 'th { padding: 10px; background-color: #f2f2f2; text-align: left; font-weight: bold; border: 1px solid #ddd; }';
    html += 'td { padding: 8px; border: 1px solid #ddd; }';
    html += 'tr:nth-child(even) { background-color: #f9f9f9; }';
    html += '.footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }';
    html += '@media print { .no-print { display: none; } body { margin: 0; } }';
    html += '</style></head><body>';
    
    // Adicionar cabeçalho
    html += '<h1>Relatório Financeiro</h1>';
    html += `<p>Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>`;
    
    // Iniciar tabela
    html += '<table>';
    
    // Adicionar cabeçalhos
    html += '<tr>';
    ['Nº OS', 'Vendedor', 'Cliente', 'Data', 'Valor', 'Status'].forEach(header => {
      html += `<th>${header}</th>`;
    });
    html += '</tr>';
    
    // Adicionar linhas de dados
    data.forEach(row => {
      html += '<tr>';
      [
        row.orderNumber || '',
        row.sellerName || '',
        row.customerName || '',
        row.date ? new Date(row.date).toLocaleDateString('pt-BR') : '',
        typeof row.totalAmount === 'number' 
          ? row.totalAmount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
          : row.totalAmount || '0',
        row.status || row.financialStatus || ''
      ].forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += '</tr>';
    });
    
    // Fechar tabela
    html += '</table>';
    
    // Adicionar rodapé
    html += '<div class="footer">';
    html += 'Sistema de Gestão Empresarial';
    html += '</div>';
    
    // Adicionar botão de impressão
    html += '<div class="no-print" style="text-align: center; margin-top: 20px;">';
    html += '<button onclick="window.print()" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Imprimir / Salvar como PDF</button>';
    html += '</div>';
    
    // Fechar documento
    html += '</body></html>';
    
    // Escrever na janela e preparar para impressão
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    console.log('Exportação PDF preparada');
  } catch (error) {
    console.error('Erro na exportação PDF:', error);
    alert('Erro ao exportar: ' + error);
  }
}
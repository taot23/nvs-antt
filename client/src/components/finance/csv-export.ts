/**
 * Exportação CSV - abordagem pura com manipulação de texto
 */

// Função para exportar para CSV - formato de texto simples sem dependências
export function exportToCSV(data: any[]): string {
  try {
    console.log("Exportando para CSV...");
    console.log("Dados recebidos:", data.length, "registros");
    
    // Verificar se temos dados
    if (!data || !Array.isArray(data) || data.length === 0) {
      alert('Sem dados para exportar');
      throw new Error('Sem dados para exportar');
    }

    // Cabeçalhos do CSV
    const headers = ['OS', 'Vendedor', 'Cliente', 'Data', 'Valor', 'Status'];
    
    // Converter todos os dados para texto
    const rows = data.map(item => [
      item.orderNumber || '',
      item.sellerName || '',
      item.customerName || '',
      item.date || '',
      item.totalAmount || '0',
      item.status || item.financialStatus || ''
    ]);
    
    // Juntar cabeçalhos e linhas
    let csvContent = headers.join(',') + '\n';
    
    // Adicionar cada linha ao conteúdo
    rows.forEach(row => {
      // Escapar vírgulas dentro dos dados
      const processedRow = row.map(cell => {
        // Se contém vírgula, aspas ou quebra de linha, envolver em aspas duplas
        if (String(cell).includes(',') || String(cell).includes('"') || 
            String(cell).includes('\n')) {
          // Escapar aspas duplas existentes dobrando-as
          return '"' + String(cell).replace(/"/g, '""') + '"';
        }
        return cell;
      });
      
      csvContent += processedRow.join(',') + '\n';
    });
    
    // Criar um Blob com os dados
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Criar uma URL para o blob
    const url = URL.createObjectURL(blob);
    
    // Criar um link para download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'relatorio.csv');
    
    // Adicionar ao corpo do documento
    document.body.appendChild(link);
    
    // Simular clique para iniciar o download
    link.click();
    
    // Limpar
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Exportação para CSV concluída!');
    return 'relatorio.csv';
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error);
    alert('Erro ao exportar para CSV: ' + error);
    throw error;
  }
}
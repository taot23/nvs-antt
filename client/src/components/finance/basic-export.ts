/**
 * Exportação ultra básica - solução definitiva
 */

export async function exportToExcel(data: any): Promise<string> {
  try {
    console.log("Importando XLSX...");
    const XLSX = await import('xlsx');
    console.log("XLSX importado:", XLSX);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Sem dados para exportar');
    }
    
    // Preparar dados super simplificados
    const simpleData = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      simpleData.push({
        'OS': item.orderNumber || '',
        'Vendedor': item.sellerName || '',
        'Cliente': item.customerName || '',
        'Data': item.date || '',
        'Valor': item.totalAmount || '0',
        'Status': item.status || item.financialStatus || ''
      });
    }
    
    console.log("Dados processados:", simpleData);
    
    // Criar planilha básica com dados crus
    const ws = XLSX.utils.json_to_sheet(simpleData);
    console.log("Planilha criada");
    
    // Criar workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
    console.log("Workbook criado");
    
    // Salvar
    const filename = 'relatorio.xlsx';
    XLSX.writeFile(wb, filename);
    console.log("Arquivo salvo:", filename);
    
    return filename;
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    alert('Erro ao exportar Excel: ' + error);
    throw error;
  }
}

export async function exportToPDF(data: any): Promise<string> {
  try {
    console.log("Importando jsPDF e autoTable...");
    const jsPDF = (await import('jspdf')).default;
    console.log("jsPDF importado:", jsPDF);
    
    const autoTableModule = await import('jspdf-autotable');
    const autoTable = autoTableModule.default;
    console.log("autoTable importado:", autoTable);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Sem dados para exportar');
    }
    
    // Dados simplificados
    const headers = ['OS', 'Vendedor', 'Cliente', 'Data', 'Valor', 'Status'];
    const rows = data.map(item => [
      item.orderNumber || '',
      item.sellerName || '',
      item.customerName || '',
      item.date || '',
      item.totalAmount || '0',
      item.status || item.financialStatus || ''
    ]);
    
    // Criar PDF
    const doc = new jsPDF({
      orientation: 'landscape'
    });
    
    // Título
    doc.text('Relatório', 14, 15);
    
    // Criar tabela
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20
    });
    
    // Salvar
    const filename = 'relatorio.pdf';
    doc.save(filename);
    
    return filename;
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    alert('Erro ao exportar PDF: ' + error);
    throw error;
  }
}
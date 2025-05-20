import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExportPDFData {
  orderNumber: string;
  sellerName: string;
  customerName: string;
  date: string;
  totalAmount: string;
  status: string;
}

export function exportFinanceToPDF(title: string, status: string, data: ExportPDFData[]) {
  // Criar documento PDF diretamente com a configuração correta
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Configurações de texto
  doc.setFont("helvetica");
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Status: ${status}`, 14, 30);
  doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 38);
  
  // Mapear vendas para formato exato da tabela
  const tableHeaders = ["Número", "Vendedor", "Cliente", "Data", "Valor Total", "Status"];
  
  // Mapear dados para o formato correto
  const tableRows = data.map(item => {
    // Forçar uso dos dados disponíveis
    console.log("Item para exportação PDF:", item);
    
    return [
      item.orderNumber || '',
      item.sellerName || '',
      item.customerName || '',
      item.date || '',
      item.totalAmount || '',
      item.status || ''
    ];
  });
  
  // Adicionar tabela ao PDF
  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [51, 51, 51] }
  });
  
  // Salvar o PDF
  const fileName = `financeiro_${format(new Date(), 'dd-MM-yyyy')}.pdf`;
  doc.save(fileName);
  
  return fileName;
}
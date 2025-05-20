import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExportExcelData {
  orderNumber: string;
  sellerName: string;
  customerName: string;
  date: string;
  totalAmount: string;
  status: string;
}

export function exportFinanceToExcel(status: string, data: ExportExcelData[]) {
  // Log para debug
  console.log("Exportando Excel com dados:", data);
  
  // Preparar dados para o Excel - versão simples com mapeamento explícito
  const excelData = data.map(item => {
    // Debug para verificar estrutura de cada item
    console.log("Processando item Excel:", item);
    
    return {
      'Número': item.orderNumber || '', 
      'Vendedor': item.sellerName || '',
      'Cliente': item.customerName || '',
      'Data': item.date || '',
      'Valor Total': item.totalAmount || '',
      'Status': item.status || ''
    };
  });
  
  // Criar planilha
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Financeiro');
  
  // Ajustar largura das colunas
  const wscols = [
    {wch: 10}, // Número
    {wch: 20}, // Vendedor
    {wch: 20}, // Cliente
    {wch: 12}, // Data
    {wch: 15}, // Valor Total
    {wch: 15}, // Status
  ];
  worksheet['!cols'] = wscols;
  
  // Definir nome do arquivo e exportar
  const fileName = `financeiro_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
}
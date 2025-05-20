import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Customer } from "@shared/schema";
import { 
  Plus, Search, Edit, Trash2, 
  RefreshCw, ChevronLeft, ChevronRight, Building,
  User, Download, Filter, X,
  FileText, FileSpreadsheet, ChevronUp, ChevronDown,
  Mail, Phone, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import CustomerDialog from "../components/customers/customer-dialog";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CustomersPage() {
  console.log("Renderizando CustomersPage - versão completa");
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  
  // Estados para filtros
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para ordenação
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Buscar clientes
  const { 
    data: customers = [], 
    isLoading,
    isError,
    refetch
  } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include" // Incluir credenciais para autenticação
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ${res.status}: ${errorText || res.statusText}`);
      }
      return res.json();
    }
  });

  // Função de ordenação
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Se o campo já está selecionado, inverte a direção
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Se é um novo campo, define-o como o campo de ordenação e começa com asc
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filtrar clientes pelo termo de busca e outros filtros
  const filteredCustomers = customers.filter(customer => {
    // Filtro por texto de busca
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.document && customer.document.includes(searchTerm)) ||
      customer.phone.includes(searchTerm);
    
    // Filtro por tipo de documento
    const matchesDocumentType = documentTypeFilter === "all" || customer.documentType === documentTypeFilter;
    
    // Filtro por nome específico
    const matchesName = nameFilter === "" || customer.name.toLowerCase().includes(nameFilter.toLowerCase());
    
    // Filtro por email específico
    const matchesEmail = emailFilter === "" || customer.email.toLowerCase().includes(emailFilter.toLowerCase());
    
    return matchesSearch && matchesDocumentType && matchesName && matchesEmail;
  })
  // Aplicar ordenação
  .sort((a, b) => {
    let aValue: any = a[sortField as keyof Customer];
    let bValue: any = b[sortField as keyof Customer];
    
    // Tratamentos especiais por campo
    if (sortField === "document") {
      // Remove caracteres não numéricos para ordenar corretamente
      aValue = aValue?.replace(/\D/g, "") || "";
      bValue = bValue?.replace(/\D/g, "") || "";
    }
    
    // Ordenação de string
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // Ordenação de valores numéricos ou outros tipos
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
  
  // Função para exportar para Excel
  const exportToExcel = () => {
    try {
      // Preparar dados para exportação
      const exportData = filteredCustomers.map(customer => ({
        'Nome/Razão Social': customer.name,
        'Tipo de Documento': customer.documentType === 'cpf' ? 'CPF' : 'CNPJ',
        'Documento': customer.document,
        'Nome do Contato': customer.contactName || '-',
        'Email': customer.email,
        'Telefone Principal': customer.phone,
        'Telefone Secundário': customer.phone2 || '-'
      }));
      
      // Criar uma nova planilha
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
      
      // Gerar arquivo e download
      XLSX.writeFile(workbook, "clientes.xlsx");
      
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados para Excel com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados para Excel.",
        variant: "destructive",
      });
    }
  };
  
  // Função para exportar para PDF
  const exportToPDF = () => {
    try {
      // Criar novo documento PDF
      const doc = new jsPDF();
      
      // Adicionar título
      doc.setFontSize(18);
      doc.text("Relatório de Clientes", 14, 22);
      doc.setFontSize(11);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
      
      // Preparar dados para a tabela
      const tableColumn = [
        "Nome/Razão Social", 
        "Documento", 
        "Contato", 
        "Email", 
        "Telefone"
      ];
      
      const tableRows = filteredCustomers.map(customer => [
        customer.name,
        `${customer.documentType === 'cpf' ? 'CPF: ' : 'CNPJ: '}${customer.document}`,
        customer.contactName || '-',
        customer.email,
        customer.phone
      ]);
      
      // Adicionar tabela automática
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 40 },
      });
      
      // Salvar o PDF
      doc.save("clientes.pdf");
      
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados para PDF com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao exportar para PDF:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados para PDF.",
        variant: "destructive",
      });
    }
  };
  
  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm("");
    setDocumentTypeFilter("all");
    setNameFilter("");
    setEmailFilter("");
  };

  // Deletar cliente
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message || "Não foi possível excluir o cliente.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      deleteCustomerMutation.mutate(id);
    }
  };

  const handleEdit = (customer: Customer) => {
    setCurrentCustomer(customer);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setCurrentCustomer(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentCustomer(null);
  };

  const handleSaveSuccess = () => {
    setDialogOpen(false);
    setCurrentCustomer(null);
    queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Clientes</h1>
            <p className="text-gray-600 mt-1">Gerencie os cadastros de clientes</p>
          </div>
          <div className="mt-4 sm:mt-0 flex">
            <Button 
              onClick={handleAdd}
              className="flex items-center w-full sm:w-auto justify-center py-2 px-4"
              style={{ WebkitAppearance: "none" }}
            >
              <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Novo Cliente</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar clientes..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ WebkitAppearance: "none" }}
                    spellCheck="false"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-9 gap-1"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                </Button>
                
                {/* Botões de exportação */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 gap-1"
                      disabled={filteredCustomers.length === 0}
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Exportar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Exportar para PDF</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      <span>Exportar para Excel</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-2">
                {(documentTypeFilter !== "all" || searchTerm || nameFilter || emailFilter) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-9 gap-1"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Limpar filtros</span>
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => refetch()}
                  disabled={isLoading}
                  style={{ WebkitAppearance: "none" }}
                  className="w-9 h-9 flex items-center justify-center p-0"
                  title="Atualizar lista"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            {/* Painel de filtros avançados */}
            {showFilters && (
              <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                  <Select 
                    value={documentTypeFilter} 
                    onValueChange={setDocumentTypeFilter}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome/Razão Social</label>
                  <Input 
                    placeholder="Filtrar por nome..." 
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="h-9"
                    style={{ WebkitAppearance: "none" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input 
                    placeholder="Filtrar por email..." 
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="h-9"
                    style={{ WebkitAppearance: "none" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tabela para desktop e tablets */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm leading-normal">
                <tr>
                  <th 
                    className="py-3 px-4 font-medium cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Nome/Razão Social</span>
                      {sortField === 'name' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 font-medium cursor-pointer"
                    onClick={() => handleSort('document')}
                  >
                    <div className="flex items-center">
                      <span>Documento</span>
                      {sortField === 'document' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 font-medium">Contato</th>
                  <th 
                    className="py-3 px-4 font-medium cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      <span>Email</span>
                      {sortField === 'email' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 font-medium">Telefone</th>
                  <th className="py-3 px-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Carregando clientes...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center">
                      Nenhum cliente encontrado. {searchTerm && "Tente usar outros termos de busca."}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => (
                    <tr key={customer.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{customer.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {customer.documentType === 'cpf' ? (
                            <User className="h-4 w-4 mr-1.5 text-blue-600" />
                          ) : (
                            <Building className="h-4 w-4 mr-1.5 text-purple-600" />
                          )}
                          <span>
                            {customer.documentType === 'cpf' ? 'CPF: ' : 'CNPJ: '}
                            {customer.document}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {customer.contactName || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-3 px-4">{customer.email}</td>
                      <td className="py-3 px-4">{customer.phone}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(customer)}
                            className="h-8 w-8"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(customer.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Visualização mobile - Cards */}
          <div className="md:hidden">
            {isLoading ? (
              <div className="py-6 text-center">
                <div className="flex justify-center items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Carregando clientes...</span>
                </div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-6 text-center">
                Nenhum cliente encontrado. {searchTerm && "Tente usar outros termos de busca."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCustomers.map(customer => (
                  <div 
                    key={customer.id} 
                    className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-base">{customer.name}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(customer)}
                          className="h-8 w-8"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(customer.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        {customer.documentType === 'cpf' ? (
                          <User className="h-4 w-4 mr-1.5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Building className="h-4 w-4 mr-1.5 text-purple-600 flex-shrink-0" />
                        )}
                        <span className="text-gray-600">
                          {customer.documentType === 'cpf' ? 'CPF: ' : 'CNPJ: '}
                          {customer.document}
                        </span>
                      </div>
                      
                      {customer.contactName && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{customer.contactName}</span>
                        </div>
                      )}
                      
                      <div className="flex items-start">
                        <Mail className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 break-all">{customer.email || "-"}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <div className="text-gray-600">{customer.phone}</div>
                          {customer.phone2 && (
                            <div className="text-gray-500 text-xs mt-0.5">{customer.phone2}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de adicionar/editar cliente */}
      <CustomerDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        customer={currentCustomer}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
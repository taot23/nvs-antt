import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Plus, Search, FileText, Download, SortAsc, SortDesc } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import ServiceProviderDialog from "@/components/service-providers/service-provider-dialog";
import { ServiceProvider } from "@shared/schema";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type SortField = 'name' | 'document' | 'email' | 'phone';
type SortDirection = 'asc' | 'desc';

export default function ServiceProvidersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedServiceProvider, setSelectedServiceProvider] = useState<ServiceProvider | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Ref para o input de pesquisa (para focar após limpar)
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Buscar todos os prestadores de serviço
  const { data: serviceProviders = [], isLoading, error } = useQuery({
    queryKey: ['/api/service-providers'],
    queryFn: async () => {
      const res = await fetch('/api/service-providers');
      if (!res.ok) {
        throw new Error('Erro ao buscar prestadores de serviço');
      }
      return res.json();
    }
  });

  // Mutation para excluir um prestador de serviço
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/service-providers/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao excluir prestador de serviço');
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Prestador de serviço excluído com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-providers'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtrar prestadores de serviço pelo termo de pesquisa
  const filteredServiceProviders = serviceProviders
    .filter((provider: ServiceProvider) => {
      if (!searchTerm) return true;
      
      const search = searchTerm.toLowerCase();
      return (
        provider.name.toLowerCase().includes(search) ||
        provider.document.toLowerCase().includes(search) ||
        (provider.contactName && provider.contactName.toLowerCase().includes(search)) ||
        provider.email.toLowerCase().includes(search) ||
        provider.phone.toLowerCase().includes(search) ||
        (provider.phone2 && provider.phone2.toLowerCase().includes(search))
      );
    })
    .sort((a: ServiceProvider, b: ServiceProvider) => {
      // Ordenação padrão por nome
      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } 
      // Ordenação por documento
      else if (sortField === 'document') {
        return sortDirection === 'asc'
          ? a.document.localeCompare(b.document)
          : b.document.localeCompare(a.document);
      } 
      // Ordenação por email
      else if (sortField === 'email') {
        return sortDirection === 'asc'
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      } 
      // Ordenação por telefone
      else if (sortField === 'phone') {
        return sortDirection === 'asc'
          ? a.phone.localeCompare(b.phone)
          : b.phone.localeCompare(a.phone);
      }
      
      return 0;
    });

  // Exportar para PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título do documento
    doc.setFontSize(18);
    doc.text('Relatório de Prestadores de Serviço', 14, 22);
    doc.setFontSize(11);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    
    // Preparar dados para a tabela
    const tableData = filteredServiceProviders.map((provider: ServiceProvider) => [
      provider.name,
      provider.document,
      provider.documentType === 'cpf' ? 'CPF' : 'CNPJ',
      provider.email,
      provider.phone,
      provider.active ? 'Sim' : 'Não'
    ]);
    
    // Desenhar a tabela
    autoTable(doc, {
      head: [['Nome', 'Documento', 'Tipo', 'Email', 'Telefone', 'Ativo']],
      body: tableData,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [75, 85, 99] },
      alternateRowStyles: { fillColor: [240, 242, 245] },
    });
    
    // Salvar o PDF
    doc.save('prestadores-de-servico.pdf');
    
    toast({
      title: "PDF gerado com sucesso",
      description: "O relatório foi baixado para o seu dispositivo",
    });
  };
  
  // Exportar para Excel
  const exportToExcel = () => {
    // Preparar dados para a tabela
    const exportData = filteredServiceProviders.map((provider: ServiceProvider) => ({
      Nome: provider.name,
      Documento: provider.document,
      Tipo: provider.documentType === 'cpf' ? 'CPF' : 'CNPJ',
      "Nome do Contato": provider.contactName || "",
      Email: provider.email,
      "Telefone Principal": provider.phone,
      "Telefone Secundário": provider.phone2 || "",
      Ativo: provider.active ? 'Sim' : 'Não',
      "Data de Cadastro": new Date(provider.createdAt).toLocaleDateString('pt-BR')
    }));
    
    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prestadores");
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 30 }, // Nome
      { wch: 20 }, // Documento
      { wch: 6 },  // Tipo
      { wch: 25 }, // Nome do Contato
      { wch: 30 }, // Email
      { wch: 20 }, // Telefone Principal
      { wch: 20 }, // Telefone Secundário
      { wch: 6 },  // Ativo
      { wch: 15 }, // Data de Cadastro
    ];
    worksheet["!cols"] = colWidths;
    
    // Salvar arquivo
    XLSX.writeFile(workbook, "prestadores-de-servico.xlsx");
    
    toast({
      title: "Excel gerado com sucesso",
      description: "O relatório foi baixado para o seu dispositivo",
    });
  };
  
  // Abrir diálogo para criar novo prestador
  const handleOpenCreateDialog = () => {
    setSelectedServiceProvider(null);
    setDialogOpen(true);
  };
  
  // Abrir diálogo para editar um prestador existente
  const handleEdit = (provider: ServiceProvider) => {
    setSelectedServiceProvider(provider);
    setDialogOpen(true);
  };
  
  // Abrir diálogo para confirmar exclusão
  const handleDeleteClick = (provider: ServiceProvider) => {
    setSelectedServiceProvider(provider);
    setDeleteDialogOpen(true);
  };
  
  // Confirmar e executar exclusão
  const handleConfirmDelete = () => {
    if (selectedServiceProvider) {
      deleteMutation.mutate(selectedServiceProvider.id);
      setDeleteDialogOpen(false);
    }
  };
  
  // Alternar direção da ordenação ao clicar na mesma coluna
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Limpar pesquisa
  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Renderização condicional para dispositivos móveis
  if (isMobile) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold">Prestadores de Serviço</h1>
          <p className="text-muted-foreground">
            Gerencie os prestadores de serviço parceiros da sua empresa
          </p>
        </div>
        
        {/* Barra de ações */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Buscar prestador..."
              className="pl-8 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 px-2.5"
                onClick={clearSearch}
              >
                <span className="sr-only">Limpar</span>
                &times;
              </Button>
            )}
          </div>
          
          <div className="flex justify-between gap-2">
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Prestador
            </Button>
            
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={exportToPDF}>
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={exportToExcel}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Lista de cards para mobile */}
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center py-4">Carregando prestadores...</p>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-destructive text-center">Erro ao carregar prestadores de serviço</p>
              </CardContent>
            </Card>
          ) : filteredServiceProviders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-4">
                <p className="text-center text-muted-foreground">
                  {searchTerm 
                    ? "Nenhum prestador encontrado para sua busca" 
                    : "Nenhum prestador de serviço cadastrado ainda"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredServiceProviders.map((provider: ServiceProvider) => (
              <Card key={provider.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{provider.name}</CardTitle>
                    <Badge variant={provider.active ? "default" : "outline"}>
                      {provider.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <CardDescription>
                    <p className="text-xs uppercase font-semibold">
                      {provider.documentType === 'cpf' ? 'CPF' : 'CNPJ'}
                    </p>
                    {provider.document}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4 pt-0 pb-2 grid gap-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground text-xs">Email:</span>{" "}
                    {provider.email}
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground text-xs">Telefone:</span>{" "}
                    {provider.phone}
                  </div>
                  
                  {provider.contactName && (
                    <div className="text-sm">
                      <span className="text-muted-foreground text-xs">Contato:</span>{" "}
                      {provider.contactName}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="p-2 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    onClick={() => handleEdit(provider)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 px-2"
                    onClick={() => handleDeleteClick(provider)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Excluir
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  // Renderização para desktop
  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prestadores de Serviço</h1>
          <p className="text-muted-foreground">
            Gerencie os prestadores de serviço parceiros da sua empresa
          </p>
        </div>
        
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Prestador
        </Button>
      </div>
      
      {/* Barra de ferramentas */}
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Buscar prestador..."
            className="pl-8 pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 px-2.5"
              onClick={clearSearch}
            >
              <span className="sr-only">Limpar</span>
              &times;
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>
      
      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption>
              {filteredServiceProviders.length === 0
                ? "Nenhum prestador de serviço encontrado"
                : `Total de ${filteredServiceProviders.length} prestadores de serviço${searchTerm ? " encontrados" : ""}`}
            </TableCaption>
            
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] cursor-pointer" onClick={() => toggleSort('name')}>
                  <div className="flex items-center">
                    Nome/Razão Social
                    {sortField === 'name' && (
                      sortDirection === 'asc' 
                        ? <SortAsc className="ml-1 h-4 w-4" /> 
                        : <SortDesc className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('document')}>
                  <div className="flex items-center">
                    Documento
                    {sortField === 'document' && (
                      sortDirection === 'asc' 
                        ? <SortAsc className="ml-1 h-4 w-4" /> 
                        : <SortDesc className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('email')}>
                  <div className="flex items-center">
                    Email
                    {sortField === 'email' && (
                      sortDirection === 'asc' 
                        ? <SortAsc className="ml-1 h-4 w-4" /> 
                        : <SortDesc className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('phone')}>
                  <div className="flex items-center">
                    Telefone
                    {sortField === 'phone' && (
                      sortDirection === 'asc' 
                        ? <SortAsc className="ml-1 h-4 w-4" /> 
                        : <SortDesc className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    Carregando prestadores de serviço...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-destructive">
                    Erro ao carregar prestadores de serviço
                  </TableCell>
                </TableRow>
              ) : filteredServiceProviders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    {searchTerm 
                      ? "Nenhum prestador encontrado para sua busca" 
                      : "Nenhum prestador de serviço cadastrado ainda"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredServiceProviders.map((provider: ServiceProvider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">
                      {provider.name}
                      {provider.contactName && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Contato: {provider.contactName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{provider.document}</span>
                        <span className="text-xs text-muted-foreground">
                          {provider.documentType === 'cpf' ? 'CPF' : 'CNPJ'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{provider.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{provider.phone}</span>
                        {provider.phone2 && (
                          <span className="text-xs text-muted-foreground">
                            {provider.phone2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.active ? "default" : "outline"}>
                        {provider.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(provider)}
                          className="h-8 w-8"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(provider)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Diálogo de edição/criação */}
      <ServiceProviderDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        serviceProvider={selectedServiceProvider}
        onSaveSuccess={() => {}}
      />
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o prestador de serviço{" "}
              <span className="font-semibold">{selectedServiceProvider?.name}</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { type ServiceType } from '@shared/schema';
import ServiceTypeDialog from '@/components/service-types/service-type-dialog';

// Componentes UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle,
  XCircle,
  Plus,
  Download,
  FileText,
  FileSpreadsheet,
  Pencil,
  Trash2,
} from 'lucide-react';

// Função para exportar para Excel e PDF
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ServiceTypesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  
  // Estados para o formulário de diálogo
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  
  // Estados para filtragem, ordenação e busca
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nameFilter, setNameFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado para diálogo de confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceTypeToDelete, setServiceTypeToDelete] = useState<ServiceType | null>(null);

  // Obter tipos de execução de serviço da API
  const { data: serviceTypes = [], isLoading } = useQuery({
    queryKey: ['/api/service-types'],
    queryFn: async () => {
      const res = await fetch('/api/service-types', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error('Erro ao buscar tipos de execução de serviço');
      }
      return res.json();
    }
  });

  // Aplicar filtros
  const filteredServiceTypes = serviceTypes.filter((serviceType: ServiceType) => {
    // Filtro por status
    if (statusFilter === 'active' && !serviceType.active) {
      return false;
    }
    if (statusFilter === 'inactive' && serviceType.active) {
      return false;
    }
    
    // Filtro por nome
    if (nameFilter && !serviceType.name.toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    }
    
    // Filtro por busca geral
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = serviceType.name.toLowerCase().includes(searchLower);
      const descriptionMatch = serviceType.description ? serviceType.description.toLowerCase().includes(searchLower) : false;
      return nameMatch || descriptionMatch;
    }
    
    return true;
  });

  // Função para ordenar por campo
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Aplicar ordenação
  filteredServiceTypes.sort((a: ServiceType, b: ServiceType) => {
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'active') {
        comparison = Number(a.active) - Number(b.active);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Função para exportar para Excel
  const exportToExcel = () => {
    try {
      // Preparar dados para exportação
      const exportData = filteredServiceTypes.map((serviceType: ServiceType) => ({
        'ID': serviceType.id,
        'Nome': serviceType.name,
        'Descrição': serviceType.description || '-',
        'Status': serviceType.active ? 'Ativo' : 'Inativo'
      }));
      
      // Criar uma nova planilha
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tipos de Execução");
      
      // Gerar arquivo e download
      XLSX.writeFile(workbook, "tipos-execucao.xlsx");
      
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
      doc.text("Relatório de Tipos de Execução de Serviço", 14, 22);
      doc.setFontSize(11);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
      
      // Preparar dados para a tabela
      const tableColumn = ["Nome", "Descrição", "Status"];
      
      const tableRows = filteredServiceTypes.map((serviceType: ServiceType) => [
        serviceType.name,
        serviceType.description || '-',
        serviceType.active ? 'Ativo' : 'Inativo'
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
      doc.save("tipos-execucao.pdf");
      
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

  // Função para abrir o modal de edição
  const handleEdit = (serviceType: ServiceType) => {
    setSelectedServiceType(serviceType);
    setIsDialogOpen(true);
  };

  // Função para abrir o modal de exclusão
  const handleDeleteClick = (serviceType: ServiceType) => {
    setServiceTypeToDelete(serviceType);
    setIsDeleteDialogOpen(true);
  };

  // Função para excluir um tipo de execução de serviço
  const handleDeleteConfirm = async () => {
    if (!serviceTypeToDelete) return;

    try {
      const res = await apiRequest("DELETE", `/api/service-types/${serviceTypeToDelete.id}`);
      
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/service-types"] });
        toast({
          title: "Sucesso",
          description: "Tipo de execução de serviço excluído com sucesso",
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao excluir tipo de execução de serviço");
      }
    } catch (error) {
      console.error("Erro ao excluir tipo de execução de serviço:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir tipo de execução de serviço",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setServiceTypeToDelete(null);
    }
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setStatusFilter("all");
    setNameFilter("");
  };

  // Verifica se o usuário atual tem permissão para gerenciar tipos de execução de serviço
  const hasPermission = currentUser?.role === "admin" || currentUser?.role === "operacional";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de Execução de Serviço</h1>
          <p className="text-muted-foreground">
            Gerencie os tipos de execução de serviço disponíveis
          </p>
        </div>
        {hasPermission && (
          <Button onClick={() => {
            setSelectedServiceType(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Tipo de Execução
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tipos de Execução de Serviço</CardTitle>
          <CardDescription>
            Total de {filteredServiceTypes.length} tipos de execução cadastrados
          </CardDescription>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar tipos de execução..."
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
                    disabled={filteredServiceTypes.length === 0}
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
          </div>
          
          {/* Filtros avançados */}
          {showFilters && (
            <div className="bg-slate-50 border rounded-md p-3 mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Filtros avançados</div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={clearFilters}
                    className="h-8 px-2 text-xs"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Limpar
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status:
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome:
                  </label>
                  <Input
                    type="text"
                    placeholder="Filtrar por nome"
                    className="h-8 text-sm"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="py-3 px-4 font-medium cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <span>Nome</span>
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
                    </TableHead>
                    <TableHead className="py-3 px-4 font-medium">Descrição</TableHead>
                    <TableHead 
                      className="py-3 px-4 font-medium cursor-pointer"
                      onClick={() => handleSort('active')}
                    >
                      <div className="flex items-center">
                        <span>Status</span>
                        {sortField === 'active' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 font-medium text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServiceTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum tipo de execução de serviço encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServiceTypes.map((serviceType: ServiceType) => (
                      <TableRow key={serviceType.id}>
                        <TableCell className="font-medium">{serviceType.name}</TableCell>
                        <TableCell>{serviceType.description || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={serviceType.active ? "default" : "destructive"}>
                            {serviceType.active ? (
                              <div className="flex items-center">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                <span>Ativo</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <XCircle className="mr-1 h-3 w-3" />
                                <span>Inativo</span>
                              </div>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {hasPermission && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(serviceType)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(serviceType)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">Excluir</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de edição/criação */}
      <ServiceTypeDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        serviceType={selectedServiceType}
        onSaveSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/service-types"] })}
      />

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o tipo de execução "{serviceTypeToDelete?.name}"?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { type PaymentMethod } from '@shared/schema';
import PaymentMethodDialog from '@/components/payment-methods/payment-method-dialog';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Pencil,
  Trash2,
  Plus,
  FileText,
  FileSpreadsheet,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';

// Importando biblioteca para exportação
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PaymentMethodsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<PaymentMethod | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [nameFilter, setNameFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Função para ordenar os itens
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Carregamento de dados
  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['/api/payment-methods'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/payment-methods');
      if (!res.ok) throw new Error('Falha ao buscar formas de pagamento');
      return res.json();
    }
  });

  // Filtragem das formas de pagamento
  const filteredPaymentMethods = paymentMethods
    .filter((item: PaymentMethod) => {
      // Aplicar filtro por status
      if (statusFilter === 'active' && !item.active) return false;
      if (statusFilter === 'inactive' && item.active) return false;

      // Aplicar filtro por nome
      if (nameFilter && !item.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;

      // Aplicar filtro de busca global
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(searchLower);
        const matchesDesc = item.description && item.description.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    })
    .sort((a: PaymentMethod, b: PaymentMethod) => {
      // Ordenação
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'active') {
        comparison = Number(a.active) - Number(b.active);
      } else if (sortField === 'description') {
        const descA = a.description || '';
        const descB = b.description || '';
        comparison = descA.localeCompare(descB);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Função para exportar para Excel
  const exportToExcel = () => {
    try {
      // Preparar dados para exportação
      const exportData = filteredPaymentMethods.map((paymentMethod: PaymentMethod) => ({
        'ID': paymentMethod.id,
        'Nome': paymentMethod.name,
        'Descrição': paymentMethod.description || '-',
        'Status': paymentMethod.active ? 'Ativo' : 'Inativo'
      }));
      
      // Criar uma nova planilha
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Formas de Pagamento");
      
      // Gerar arquivo e download
      XLSX.writeFile(workbook, "formas-pagamento.xlsx");
      
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
      doc.text("Relatório de Formas de Pagamento", 14, 22);
      doc.setFontSize(11);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
      
      // Preparar dados para a tabela
      const tableColumn = ["Nome", "Descrição", "Status"];
      
      const tableRows = filteredPaymentMethods.map((paymentMethod: PaymentMethod) => [
        paymentMethod.name,
        paymentMethod.description || '-',
        paymentMethod.active ? 'Ativo' : 'Inativo'
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
      doc.save("formas-pagamento.pdf");
      
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
  const handleEdit = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setIsDialogOpen(true);
  };

  // Função para abrir o modal de exclusão
  const handleDeleteClick = (paymentMethod: PaymentMethod) => {
    setPaymentMethodToDelete(paymentMethod);
    setIsDeleteDialogOpen(true);
  };

  // Função para excluir uma forma de pagamento
  const handleDeleteConfirm = async () => {
    if (!paymentMethodToDelete) return;

    try {
      const res = await apiRequest("DELETE", `/api/payment-methods/${paymentMethodToDelete.id}`);
      
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
        toast({
          title: "Sucesso",
          description: "Forma de pagamento excluída com sucesso",
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao excluir forma de pagamento");
      }
    } catch (error) {
      console.error("Erro ao excluir forma de pagamento:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir forma de pagamento",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setPaymentMethodToDelete(null);
    }
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setStatusFilter("all");
    setNameFilter("");
  };

  // Verifica se o usuário atual tem permissão para gerenciar formas de pagamento
  const hasPermission = currentUser?.role === "admin" || currentUser?.role === "financeiro";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formas de Pagamento</h1>
          <p className="text-muted-foreground">
            Gerencie as formas de pagamento disponíveis
          </p>
        </div>
        {hasPermission && (
          <Button onClick={() => {
            setSelectedPaymentMethod(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Forma de Pagamento
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Formas de Pagamento</CardTitle>
          <CardDescription>
            Total de {filteredPaymentMethods.length} formas de pagamento cadastradas
          </CardDescription>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar formas de pagamento..."
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
                    disabled={filteredPaymentMethods.length === 0}
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
                  {filteredPaymentMethods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhuma forma de pagamento encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPaymentMethods.map((paymentMethod: PaymentMethod) => (
                      <TableRow key={paymentMethod.id}>
                        <TableCell className="font-medium">{paymentMethod.name}</TableCell>
                        <TableCell>{paymentMethod.description || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={paymentMethod.active ? "default" : "destructive"}>
                            {paymentMethod.active ? (
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
                                  onClick={() => handleEdit(paymentMethod)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(paymentMethod)}
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
      <PaymentMethodDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        paymentMethod={selectedPaymentMethod}
        onSaveSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] })}
      />

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a forma de pagamento "{paymentMethodToDelete?.name}"?
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
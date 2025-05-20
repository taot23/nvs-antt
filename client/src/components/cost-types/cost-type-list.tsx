import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Edit,
  Trash2,
  Plus,
  Loader2,
  InfoIcon,
  CheckCircle2,
  XCircle,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Filter,
} from "lucide-react";
import { CostType } from "@shared/schema";
import CostTypeDialog from "./cost-type-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function CostTypeList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [selectedCostTypeId, setSelectedCostTypeId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCostType, setEditingCostType] = useState<CostType | undefined>(undefined);
  
  // Estados para filtros e paginação
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<"name" | "createdAt">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Debounce para a busca
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  
  // Limpar filtros
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
    setSortField("name");
    setSortDirection("asc");
  };

  // Buscar todos os tipos de custo
  const {
    data: costTypes,
    isLoading,
    error,
    refetch,
  } = useQuery<CostType[]>({
    queryKey: ["/api/cost-types", debouncedSearchTerm, statusFilter, currentPage, sortField, sortDirection],
    queryFn: async () => {
      const response = await fetch("/api/cost-types");
      if (!response.ok) {
        throw new Error("Erro ao carregar tipos de custo");
      }
      return response.json();
    },
  });
  
  // Filtrar e ordenar os tipos de custo localmente
  const filteredCostTypes = costTypes ? [...costTypes].filter(costType => {
    // Filtro por termo de busca
    const matchesSearch = debouncedSearchTerm 
      ? costType.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (costType.description?.toLowerCase() || "").includes(debouncedSearchTerm.toLowerCase())
      : true;
      
    // Filtro por status
    const matchesStatus = statusFilter === "all" 
      ? true 
      : statusFilter === "active" 
        ? costType.active 
        : !costType.active;
        
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Ordenação
    if (sortField === "name") {
      return sortDirection === "asc" 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === "createdAt" && a.createdAt && b.createdAt) {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    return 0;
  }) : [];
  
  // Calcular paginação
  const totalItems = filteredCostTypes.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedCostTypes = filteredCostTypes.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  // Mutation para excluir tipo de custo
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/cost-types/${id}`);
      if (!response.ok) {
        throw new Error("Erro ao excluir tipo de custo");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Tipo de custo excluído",
        description: "O tipo de custo foi excluído com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cost-types"] });
      setSelectedCostTypeId(null);
      setConfirmDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      setConfirmDeleteDialogOpen(false);
    },
  });

  // Manipular abertura do diálogo de criação
  const handleAddNew = () => {
    setEditingCostType(undefined);
    setDialogOpen(true);
  };

  // Manipular edição de tipo de custo
  const handleEdit = (costType: CostType) => {
    setEditingCostType(costType);
    setDialogOpen(true);
  };

  // Manipular exclusão de tipo de custo
  const handleDelete = (id: number) => {
    setSelectedCostTypeId(id);
    setConfirmDeleteDialogOpen(true);
  };

  // Confirmar exclusão
  const confirmDelete = () => {
    if (selectedCostTypeId) {
      deleteMutation.mutate(selectedCostTypeId);
    }
  };

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Custo Operacional</CardTitle>
          <CardDescription>Gerencie os tipos padronizados de custo operacional.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="rounded-md border">
              <div className="p-4">
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar estado de erro
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Custo Operacional</CardTitle>
          <CardDescription>Gerencie os tipos padronizados de custo operacional.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <InfoIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold text-destructive">Erro ao carregar dados</p>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar a lista de tipos de custo.
            </p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Tipos de Custo Operacional</CardTitle>
        <CardDescription>
          Cadastre tipos padronizados de custo para facilitar o preenchimento e consistência nos registros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros e botões de ação */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome ou descrição..."
                className="pl-8 w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filtro por Status */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* Ordenação */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <ListFilter className="h-4 w-4 mr-2" />
                  Ordenar
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={sortField === "name" && sortDirection === "asc"}
                  onCheckedChange={() => {
                    setSortField("name");
                    setSortDirection("asc");
                  }}
                >
                  Nome (A-Z)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortField === "name" && sortDirection === "desc"}
                  onCheckedChange={() => {
                    setSortField("name");
                    setSortDirection("desc");
                  }}
                >
                  Nome (Z-A)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortField === "createdAt" && sortDirection === "desc"}
                  onCheckedChange={() => {
                    setSortField("createdAt");
                    setSortDirection("desc");
                  }}
                >
                  Mais recentes
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortField === "createdAt" && sortDirection === "asc"}
                  onCheckedChange={() => {
                    setSortField("createdAt");
                    setSortDirection("asc");
                  }}
                >
                  Mais antigos
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Botão para limpar filtros */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={resetFilters}
              className="text-xs md:text-sm"
            >
              Limpar filtros
            </Button>
          </div>
          
          {/* Botão Novo Tipo de Custo */}
          <Button onClick={handleAddNew} className="md:ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Tipo de Custo
          </Button>
        </div>

        {/* Tabela de dados */}
        {costTypes && costTypes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">
              Não há tipos de custo cadastrados.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Clique no botão acima para adicionar um novo tipo de custo.
            </p>
          </div>
        ) : filteredCostTypes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">
              Nenhum resultado encontrado para os filtros aplicados.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Tente ajustar seus critérios de busca ou <Button variant="link" onClick={resetFilters} className="p-0 h-auto">limpar filtros</Button>.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCostTypes.map((costType) => (
                  <TableRow key={costType.id}>
                    <TableCell className="font-medium">{costType.name}</TableCell>
                    <TableCell>
                      {costType.description || 
                        <span className="text-muted-foreground italic">Sem descrição</span>
                      }
                    </TableCell>
                    <TableCell>
                      {costType.active ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center w-fit">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center w-fit">
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(costType)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(costType.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(p => Math.max(1, p - 1));
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href="#" 
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Diálogo de confirmação de exclusão */}
        <AlertDialog 
          open={confirmDeleteDialogOpen} 
          onOpenChange={setConfirmDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este tipo de custo? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>Excluir</>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Diálogo de criação/edição de tipo de custo */}
        <CostTypeDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          costType={editingCostType}
        />
      </CardContent>
    </Card>
  );
}
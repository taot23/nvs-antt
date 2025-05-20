import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  FileBarChart2, 
  FileText, 
  Plus, 
  Play, 
  RefreshCw,
  Clock, 
  FileCheck, 
  FileX,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportListProps {
  onExecuteReport: (reportId: number) => void;
  onViewExecution: (executionId: number) => void;
}

export function ReportList({ onExecuteReport, onViewExecution }: ReportListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openNew, setOpenNew] = useState(false);
  const [openExecute, setOpenExecute] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [sellerFilter, setSellerFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState<"reports" | "executions">("reports");
  
  // Estado para novo relatório
  const [newReport, setNewReport] = useState({
    name: "",
    description: "",
    query: "",
    permissions: "admin",
  });

  // Buscar todos os relatórios
  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["/api/reports"],
    refetchOnWindowFocus: false,
  });

  // Buscar usuários (para filtro de vendedores)
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    refetchOnWindowFocus: false,
  });

  // Buscar execuções recentes
  const { data: recentExecutions, isLoading: isLoadingExecutions } = useQuery({
    queryKey: ["/api/recent-executions"],
    enabled: selectedTab === "executions",
  });

  // Mutação para criar um novo relatório
  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await apiRequest("POST", "/api/reports", reportData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        description: "Relatório criado com sucesso!",
      });
      setOpenNew(false);
      // Limpar o formulário
      setNewReport({
        name: "",
        description: "",
        query: "",
        permissions: "admin",
      });
      // Recarregar a lista de relatórios
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar relatório",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutação para executar um relatório
  const executeReportMutation = useMutation({
    mutationFn: async (data: { reportId: number, parameters: any }) => {
      const response = await apiRequest(
        "POST", 
        `/api/reports/${data.reportId}/execute`, 
        { parameters: data.parameters }
      );
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        description: "Relatório executado com sucesso!",
      });
      setOpenExecute(false);
      // Limpar a seleção
      setStartDate(undefined);
      setEndDate(undefined);
      setSellerFilter(undefined);
      setStatusFilter(undefined);
      // Recarregar as execuções recentes
      queryClient.invalidateQueries({ queryKey: ["/api/recent-executions"] });
      
      // Visualizar a execução
      if (data && data.executionId) {
        onViewExecution(data.executionId);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao executar relatório",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Função para abrir o modal de execução
  const handleExecuteReport = (report: any) => {
    setSelectedReport(report);
    setOpenExecute(true);
  };
  
  // Função para executar o relatório com os parâmetros selecionados
  const handleExecuteConfirm = () => {
    if (!selectedReport) return;
    
    const parameters: any = {};
    
    // Adicionar datas se selecionadas
    if (startDate) {
      parameters.startDate = format(startDate, 'yyyy-MM-dd');
    }
    
    if (endDate) {
      parameters.endDate = format(endDate, 'yyyy-MM-dd');
    }
    
    // Adicionar filtro de vendedor se selecionado e não for "all"
    if (sellerFilter && sellerFilter !== "all") {
      parameters.sellerId = sellerFilter;
    }
    
    // Adicionar filtro de status se selecionado e não for "all"
    if (statusFilter && statusFilter !== "all") {
      parameters.status = statusFilter;
    }
    
    executeReportMutation.mutate({
      reportId: selectedReport.id,
      parameters
    });
  };

  // Criar novo relatório
  const handleCreateReport = () => {
    createReportMutation.mutate(newReport);
  };

  // Definir as colunas da tabela de relatórios
  const reportColumns = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }: any) => {
        const report = row.original;
        return (
          <div className="flex items-center space-x-2">
            <FileBarChart2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{report.name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }: any) => {
        return (
          <div className="max-w-md truncate">
            {row.original.description}
          </div>
        );
      }
    },
    {
      accessorKey: "permissions",
      header: "Permissões",
      cell: ({ row }: any) => {
        const permissions = row.original.permissions.split(',');
        return (
          <div className="flex flex-wrap gap-1">
            {permissions.map((permission: string) => (
              <Badge key={permission} variant="outline">{permission}</Badge>
            ))}
          </div>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const report = row.original;
        return (
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleExecuteReport(report)}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  // Definir as colunas da tabela de execuções
  const executionColumns = [
    {
      accessorKey: "report_name",
      header: "Relatório",
      cell: ({ row }: any) => {
        const execution = row.original;
        return (
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{execution.report_name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "created_at",
      header: "Data de Execução",
      cell: ({ row }: any) => {
        const execution = row.original;
        const date = new Date(execution.created_at);
        return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
      }
    },
    {
      accessorKey: "username",
      header: "Usuário"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const execution = row.original;
        const status = execution.status;
        
        if (status === "success") {
          return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <FileCheck className="h-3 w-3 mr-1" />
              Concluído
            </Badge>
          );
        } else if (status === "processing") {
          return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Processando
            </Badge>
          );
        } else if (status === "error") {
          return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <FileX className="h-3 w-3 mr-1" />
              Erro
            </Badge>
          );
        } else {
          return (
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              Pendente
            </Badge>
          );
        }
      }
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const execution = row.original;
        return (
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onViewExecution(execution.id)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            variant={selectedTab === "reports" ? "default" : "outline"}
            onClick={() => setSelectedTab("reports")}
          >
            <FileBarChart2 className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          <Button 
            variant={selectedTab === "executions" ? "default" : "outline"}
            onClick={() => setSelectedTab("executions")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Execuções Recentes
          </Button>
        </div>
        {selectedTab === "reports" && user?.role === "admin" && (
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        )}
      </div>

      {selectedTab === "reports" ? (
        <>
          {reports && reports.length > 0 ? (
            <DataTable
              columns={reportColumns}
              data={reports}
              onRowClick={(row) => handleExecuteReport(row)}
              searchable
              searchPlaceholder="Buscar relatórios..."
            />
          ) : (
            <div className="text-center py-8">
              {isLoadingReports ? (
                <p>Carregando relatórios...</p>
              ) : (
                <p>Nenhum relatório disponível.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {recentExecutions && recentExecutions.length > 0 ? (
            <DataTable
              columns={executionColumns}
              data={recentExecutions}
              onRowClick={(row) => onViewExecution(row.id)}
              searchable
              searchPlaceholder="Buscar execuções..."
            />
          ) : (
            <div className="text-center py-8">
              {isLoadingExecutions ? (
                <p>Carregando execuções...</p>
              ) : (
                <p>Nenhuma execução recente encontrada.</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal para criar novo relatório */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Relatório</DialogTitle>
            <DialogDescription>
              Crie um novo modelo de relatório para o sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={newReport.name}
                onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="query" className="text-right">
                Consulta SQL
              </Label>
              <Input
                id="query"
                value={newReport.query}
                onChange={(e) => setNewReport({ ...newReport, query: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="permissions" className="text-right">
                Permissões
              </Label>
              <Input
                id="permissions"
                value={newReport.permissions}
                onChange={(e) => setNewReport({ ...newReport, permissions: e.target.value })}
                className="col-span-3"
                placeholder="admin,vendedor,financeiro (separados por vírgula)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateReport} disabled={createReportMutation.isPending}>
              {createReportMutation.isPending ? "Criando..." : "Criar Relatório"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para executar relatório */}
      <Dialog open={openExecute} onOpenChange={setOpenExecute}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Executar Relatório</DialogTitle>
            <DialogDescription>
              {selectedReport?.description || "Configurar parâmetros para executar o relatório."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Data Inicial
              </Label>
              <div className="col-span-3">
                <DatePicker 
                  date={startDate} 
                  setDate={setStartDate} 
                  placeholder="Selecione a data inicial" 
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Data Final
              </Label>
              <div className="col-span-3">
                <DatePicker 
                  date={endDate} 
                  setDate={setEndDate} 
                  placeholder="Selecione a data final" 
                />
              </div>
            </div>
            
            {/* Somente mostrar filtro de vendedor para admin, supervisor e financeiro */}
            {(user?.role === "admin" || user?.role === "supervisor" || user?.role === "financeiro") && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sellerFilter" className="text-right">
                  Vendedor
                </Label>
                <div className="col-span-3">
                  <Select
                    value={sellerFilter}
                    onValueChange={setSellerFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os vendedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os vendedores</SelectItem>
                      {users && users.map((user: any) => (
                        user.role === "vendedor" && (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.username}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="statusFilter" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="returned">Devolvido</SelectItem>
                    <SelectItem value="returned_to_seller">Devolvido ao Vendedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenExecute(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExecuteConfirm} disabled={executeReportMutation.isPending}>
              {executeReportMutation.isPending ? "Executando..." : "Executar Relatório"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
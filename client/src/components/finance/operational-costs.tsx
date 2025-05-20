import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { CostType, SaleOperationalCost } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OperationalCostsProps {
  saleId: number;
  canManage?: boolean;
}

interface AddCostFormData {
  costTypeId: number;
  amount: string;
  description: string;
  paymentDate: string;
}

export default function OperationalCosts({ saleId, canManage = true }: OperationalCostsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<AddCostFormData>({
    costTypeId: 0,
    amount: "",
    description: "",
    paymentDate: ""
  });
  
  // Buscar custos operacionais existentes para esta venda
  const { 
    data: operationalCosts = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/sales', saleId, 'operational-costs'],
    queryFn: async () => {
      const response = await fetch(`/api/sales/${saleId}/operational-costs`);
      if (!response.ok) {
        throw new Error('Erro ao carregar custos operacionais');
      }
      return response.json();
    },
  });
  
  // Buscar tipos de custo para o formulário
  const { 
    data: costTypes = [], 
    isLoading: loadingCostTypes 
  } = useQuery<CostType[]>({
    queryKey: ['/api/cost-types'],
    queryFn: async () => {
      const response = await fetch('/api/cost-types?active=true');
      if (!response.ok) {
        throw new Error('Erro ao carregar tipos de custo');
      }
      return response.json();
    },
  });
  
  // Mutação para adicionar um novo custo operacional
  const addCostMutation = useMutation({
    mutationFn: async (data: AddCostFormData) => {
      // Converter o valor para o formato esperado pela API
      const parsedAmount = data.amount.replace(/\./g, '').replace(',', '.');
      
      // Garantir que costTypeId seja enviado mesmo se for zero
      const dataToSend = {
        ...data,
        amount: parsedAmount,
        saleId,
        paymentDate: data.paymentDate || null, // Enviar null se não houver data de pagamento
        costTypeId: data.costTypeId || null // Enviar explicitamente null se não houver valor
      };
      
      console.log("Enviando dados para criar custo operacional:", dataToSend);
      
      const response = await fetch(`/api/sales/${saleId}/operational-costs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar custo operacional');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Limpar formulário
      setFormData({
        costTypeId: 0,
        amount: "",
        description: "",
        paymentDate: ""
      });
      
      // Fechar diálogo
      setShowAddDialog(false);
      
      // Atualizar dados
      queryClient.invalidateQueries({ queryKey: ['/api/sales', saleId, 'operational-costs'] });
      
      // Mostrar notificação
      toast({
        title: "Custo adicionado",
        description: "O custo operacional foi adicionado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar custo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para excluir um custo operacional
  const deleteCostMutation = useMutation({
    mutationFn: async (costId: number) => {
      const response = await fetch(`/api/sales/${saleId}/operational-costs/${costId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // Só tentamos analisar como JSON se houver um erro
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao excluir custo operacional');
        } catch (e) {
          throw new Error('Erro ao excluir custo operacional');
        }
      }
      
      // Não tentamos analisar a resposta se for bem-sucedida
      // Alguns endpoints retornam 204 No Content
      return true;
    },
    onSuccess: () => {
      // Atualizar dados
      queryClient.invalidateQueries({ queryKey: ['/api/sales', saleId, 'operational-costs'] });
      
      // Mostrar notificação
      toast({
        title: "Custo excluído",
        description: "O custo operacional foi excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir custo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Função para formatar valor monetário no input
  const handleAmountChange = (value: string) => {
    // Remover tudo que não for número
    const numericValue = value.replace(/\D/g, '');
    
    // Converter para formato de moeda (R$ 100,00)
    if (numericValue === '') {
      setFormData({ ...formData, amount: '' });
    } else {
      // Converter para centavos e depois para o formato brasileiro
      const cents = parseInt(numericValue, 10);
      const formatted = (cents / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      
      setFormData({ ...formData, amount: formatted });
    }
  };
  
  // Handler de submit do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.costTypeId) {
      toast({
        title: "Campo obrigatório",
        description: "Selecione um tipo de custo.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.amount || formData.amount === '0,00') {
      toast({
        title: "Campo obrigatório",
        description: "Informe o valor do custo.",
        variant: "destructive",
      });
      return;
    }
    
    // Processar o envio
    addCostMutation.mutate(formData);
  };
  
  // Função para confirmar exclusão
  const handleDeleteCost = (costId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este custo operacional?')) {
      deleteCostMutation.mutate(costId);
    }
  };
  
  // Calcular o total de custos
  const calculateTotal = () => {
    return operationalCosts.reduce((total, cost) => {
      return total + parseFloat(cost.amount.toString());
    }, 0);
  };
  
  // Exibir estado de carregamento
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custos Operacionais</CardTitle>
          <CardDescription>Carregando informações...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // Exibir erro, se houver
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custos Operacionais</CardTitle>
          <CardDescription>Ocorreu um erro ao carregar os dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Não foi possível carregar os custos operacionais. Tente novamente mais tarde.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Custos Operacionais</CardTitle>
          <CardDescription>
            {canManage ? 'Gerencie os custos operacionais desta venda' : 'Visualize os custos operacionais desta venda'}
          </CardDescription>
        </div>
        
        {canManage && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Custo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Custo Operacional</DialogTitle>
                <DialogDescription>
                  Preencha os dados para registrar um novo custo operacional para esta venda.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="costType">Tipo de Custo</Label>
                  <Select
                    value={formData.costTypeId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, costTypeId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de custo" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCostTypes ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          <span>Carregando...</span>
                        </div>
                      ) : (
                        costTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="amount"
                      placeholder="0,00"
                      className="pl-9"
                      value={formData.amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o custo operacional..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Data de Pagamento</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se o custo já foi pago, informe a data de pagamento. Caso contrário, deixe em branco.
                  </p>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={addCostMutation.isPending}
                  >
                    {addCostMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>Salvar</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent>
        {operationalCosts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Nenhum custo operacional registrado para esta venda.</p>
            {canManage && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Custo
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-auto">
            <ScrollArea className="max-h-[400px]">
              <div className="w-full min-w-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[20%]">Tipo de Custo</TableHead>
                      <TableHead className="w-[12%]">Valor</TableHead>
                      <TableHead className="w-[30%]">Descrição</TableHead>
                      <TableHead className="w-[12%]">Data</TableHead>
                      <TableHead className="w-[16%]">Data Pagamento</TableHead>
                      <TableHead className="w-[10%] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operationalCosts.map((cost) => {
                      // Encontrar nome do tipo de custo
                      const costType = costTypes.find(t => t.id === cost.costTypeId);
                      
                      return (
                        <TableRow key={cost.id}>
                          <TableCell className="font-medium">
                            {costType?.name || `Tipo #${cost.costTypeId}`}
                          </TableCell>
                          <TableCell>{formatCurrency(cost.amount)}</TableCell>
                          <TableCell>
                            <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap" 
                                 title={cost.description || "Sem descrição"}>
                              {cost.description || "-"}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(cost.date || cost.createdAt)}</TableCell>
                          <TableCell>
                            {cost.paymentDate ? (
                              <span className="text-emerald-600">{formatDate(cost.paymentDate)}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">Não pago</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {canManage && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCost(cost.id)}
                                title="Excluir custo"
                                disabled={deleteCostMutation.isPending}
                              >
                                {deleteCostMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
            
            {/* Totais fora da ScrollArea para ficar sempre visível */}
            <div className="mt-4 border-t pt-2 flex justify-between items-center">
              <span className="font-bold text-base">Total:</span>
              <span className="font-bold text-base">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
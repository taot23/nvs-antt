import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Sale, SaleInstallment, SaleOperationalCost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  FileText,
  Loader2,
  Truck,
  User,
  Calendar,
  CreditCard,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getStatusLabel, getStatusVariant } from "@/lib/status-utils";
import { Badge } from "@/components/ui/badge";
import { PaymentConfirmation } from "./payment-confirmation";
import OperationalCosts from "./operational-costs";
import SaleFinancialSummary from "./sale-financial-summary";

interface FinanceTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  saleId: number | null;
}

export default function FinanceTransactionDialog({
  open,
  onClose,
  saleId
}: FinanceTransactionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Buscar detalhes da venda, se houver ID
  const { data: sale, isLoading: isLoadingSale } = useQuery({
    queryKey: ['/api/sales', saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const res = await apiRequest("GET", `/api/sales/${saleId}`);
      return res.json();
    },
    enabled: !!saleId && open,
  });
  
  // Buscar o cliente associado à venda
  const { data: customerData } = useQuery({
    queryKey: ['/api/customers', sale?.customerId],
    queryFn: async () => {
      if (!sale?.customerId) return null;
      const res = await apiRequest("GET", `/api/customers/${sale.customerId}`);
      return res.json();
    },
    enabled: !!sale?.customerId,
  });
  
  // Buscar forma de pagamento
  const { data: paymentMethodData } = useQuery({
    queryKey: ['/api/payment-methods', sale?.paymentMethodId],
    queryFn: async () => {
      if (!sale?.paymentMethodId) return null;
      const res = await apiRequest("GET", `/api/payment-methods/${sale.paymentMethodId}`);
      return res.json();
    },
    enabled: !!sale?.paymentMethodId,
  });
  
  // Atualizar status financeiro para "in_progress"
  const startFinancialProcessMutation = useMutation({
    mutationFn: async () => {
      if (!saleId || !user?.id) return null;
      
      const res = await apiRequest("POST", `/api/sales/${saleId}/process-financial`, {
        financialId: user.id
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/sales']});
      queryClient.invalidateQueries({queryKey: ['/api/sales', saleId]});
      toast({
        title: "Tratativa iniciada",
        description: "A venda entrou em tratativa financeira com sucesso!",
      });
      setActiveTab("payments"); // Muda para a aba de pagamentos
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao iniciar tratativa",
        description: error.message || "Não foi possível iniciar a tratativa financeira",
        variant: "destructive",
      });
    }
  });
  
  // Finalizar processo financeiro
  const completeFinancialProcessMutation = useMutation({
    mutationFn: async () => {
      if (!saleId || !user?.id) return null;
      
      const res = await apiRequest("POST", `/api/sales/${saleId}/complete-financial`, {
        financialId: user.id
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/sales']});
      queryClient.invalidateQueries({queryKey: ['/api/sales', saleId]});
      toast({
        title: "Processo finalizado",
        description: "A venda foi finalizada financeiramente com sucesso!",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao finalizar processo",
        description: error.message || "Não foi possível finalizar o processo financeiro",
        variant: "destructive",
      });
    }
  });

  // Verificar se todos os pagamentos foram confirmados
  const { data: installments } = useQuery({
    queryKey: ['/api/sales', saleId, 'installments'],
    queryFn: async () => {
      if (!saleId) return [];
      const res = await apiRequest("GET", `/api/sales/${saleId}/installments`);
      return res.json();
    },
    enabled: !!saleId && open,
  });
  
  const allPaymentsConfirmed = React.useMemo(() => {
    if (!installments || installments.length === 0) return false;
    return installments.every((item: SaleInstallment) => item.status === 'paid');
  }, [installments]);
  
  // Função para iniciar tratativa
  const handleStartProcess = () => {
    startFinancialProcessMutation.mutate();
  };
  
  // Função para finalizar tratativa
  const handleCompleteProcess = () => {
    completeFinancialProcessMutation.mutate();
  };
  
  // Verificar se é possível finalizar
  const canComplete = sale?.financialStatus === 'in_progress' && allPaymentsConfirmed;

  // Buscar custos operacionais para o resumo financeiro
  const { data: operationalCosts = [] } = useQuery<SaleOperationalCost[]>({
    queryKey: ['/api/sales', saleId, 'operational-costs'],
    queryFn: async () => {
      if (!saleId) return [];
      const res = await apiRequest("GET", `/api/sales/${saleId}/operational-costs`);
      return res.json();
    },
    enabled: !!saleId && open,
  });
  
  if (!open || !saleId) return null;
  
  if (isLoadingSale) {
    return (
      <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando detalhes da venda...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (!sale) {
    return (
      <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
            <DialogDescription>
              Não foi possível carregar os detalhes desta venda.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4 text-destructive">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <p>Venda não encontrada ou você não tem permissão para visualizá-la.</p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestão Financeira - Venda #{sale.orderNumber}
          </DialogTitle>
          <DialogDescription>
            Gerencie os recebimentos e custos operacionais desta venda.
          </DialogDescription>
        </DialogHeader>
        
        {/* Status financeiro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 mb-4 border-b">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Status Financeiro</span>
            <span 
              className={`inline-flex items-center px-3 py-1 rounded-full text-base font-medium w-fit ${
                sale.financialStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                sale.financialStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                sale.financialStatus === 'completed' ? 'bg-green-100 text-green-800' :
                sale.financialStatus === 'paid' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {sale.financialStatus === 'pending' && <AlertCircle className="h-4 w-4 mr-1" />}
              {sale.financialStatus === 'in_progress' && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {sale.financialStatus === 'completed' && <CheckCircle className="h-4 w-4 mr-1" />}
              {sale.financialStatus === 'paid' && <DollarSign className="h-4 w-4 mr-1" />}
              {getStatusLabel(sale.financialStatus)}
            </span>
          </div>
          
          {/* Botões de ação com base no status */}
          <div className="flex flex-wrap gap-2 justify-end">
            {sale.financialStatus === 'pending' && (
              <Button 
                onClick={handleStartProcess}
                disabled={startFinancialProcessMutation.isPending}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                {startFinancialProcessMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <DollarSign className="h-4 w-4 mr-2" />
                )}
                Iniciar Tratativa Financeira
              </Button>
            )}
            
            {sale.financialStatus === 'in_progress' && (
              <Button
                onClick={handleCompleteProcess}
                disabled={!canComplete || completeFinancialProcessMutation.isPending}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {completeFinancialProcessMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Finalizar Tratativa Financeira
              </Button>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">
              <FileText className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Pagamentos
            </TabsTrigger>
            <TabsTrigger value="costs">
              <Receipt className="h-4 w-4 mr-2" />
              Custos Operacionais
            </TabsTrigger>
          </TabsList>
          
          {/* Aba de visão geral */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Detalhes da Venda
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <Label className="text-muted-foreground">Ordem de Serviço</Label>
                    <p className="font-medium">{sale.orderNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Data</Label>
                    <p className="font-medium">{formatDate(sale.date) || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Valor Total</Label>
                    <p className="font-medium text-lg text-primary">{formatCurrency(sale.totalAmount)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Parcelas</Label>
                    <p className="font-medium">{sale.installments || "1"} x {formatCurrency(sale.installmentValue || sale.totalAmount)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Forma de Pagamento</Label>
                    <p className="font-medium">{paymentMethodData?.name || "N/A"}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <Label className="text-muted-foreground">Cliente</Label>
                    <p className="font-medium flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {customerData?.name || `Cliente #${sale.customerId}`}
                    </p>
                  </div>
                  {customerData?.document && (
                    <div>
                      <Label className="text-muted-foreground">Documento</Label>
                      <p className="font-medium">{customerData.document}</p>
                    </div>
                  )}
                  {customerData?.phone && (
                    <div>
                      <Label className="text-muted-foreground">Telefone</Label>
                      <p className="font-medium">{customerData.phone}</p>
                    </div>
                  )}
                  {customerData?.email && (
                    <div>
                      <Label className="text-muted-foreground">E-mail</Label>
                      <p className="font-medium">{customerData.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Resumo Financeiro */}
            <SaleFinancialSummary 
              totalAmount={sale.totalAmount} 
              operationalCosts={operationalCosts} 
              installments={installments || []} 
            />
            
            {/* Status Operacional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Status Operacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    sale.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                    sale.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    sale.status === 'returned' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusLabel(sale.status)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {sale.status === "pending" && "A venda está aguardando processamento operacional."}
                    {sale.status === "in_progress" && "A venda está sendo processada pela equipe operacional."}
                    {sale.status === "completed" && "A venda foi concluída com sucesso pela equipe operacional."}
                    {sale.status === "returned" && "A venda foi devolvida para revisão."}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Aba de pagamentos */}
          <TabsContent value="payments" className="space-y-4">
            <PaymentConfirmation 
              saleId={saleId} 
              canManage={sale.financialStatus === 'in_progress' || sale.financialStatus === 'partial'} 
              isAdmin={user?.role === 'admin'}
            />
          </TabsContent>
          
          {/* Aba de custos operacionais */}
          <TabsContent value="costs" className="space-y-4">
            <OperationalCosts 
              saleId={saleId} 
              canManage={sale.financialStatus === 'in_progress' || sale.financialStatus === 'paid'} 
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          
          {canComplete && (
            <Button
              onClick={handleCompleteProcess}
              disabled={!canComplete || completeFinancialProcessMutation.isPending}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {completeFinancialProcessMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Finalizar Tratativa Financeira
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
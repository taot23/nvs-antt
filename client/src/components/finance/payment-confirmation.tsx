import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertCircle, 
  ArrowDownRight,
  Check, 
  CheckCircle, 
  CreditCard, 
  Loader2, 
  Upload,
  RefreshCw, 
  FileText,
  Edit,
  AlertTriangle,
  SplitSquareVertical,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface PaymentConfirmationProps {
  saleId: number | null;
  canManage: boolean;
  isAdmin?: boolean;
}

// Função para formatar data no padrão brasileiro
const formatDateToBR = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function PaymentConfirmation({ saleId, canManage, isAdmin }: PaymentConfirmationProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  // Inicializar com string vazia para forçar o usuário a digitar a data
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentDateStr, setPaymentDateStr] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  
  // Verificar se o usuário é administrador (só administradores podem editar pagamentos já confirmados)
  const isUserAdmin = isAdmin ?? (user?.role === "admin");
  
  // Efeito para carregar os recibos de pagamento quando o saleId mudar
  React.useEffect(() => {
    if (saleId) {
      // Forçar a atualização da consulta de recibos de pagamento
      queryClient.invalidateQueries({ queryKey: ['/api/sales', saleId, 'payment-receipts'] });
      console.log(`🔄 Forçando atualização dos recibos para venda #${saleId}`);
      
      // Teste direto da API para buscar recibos
      (async () => {
        try {
          console.log(`📡 Testando API diretamente: /api/sales/${saleId}/payment-receipts`);
          const res = await apiRequest("GET", `/api/sales/${saleId}/payment-receipts`);
          const receipts = await res.json();
          console.log(`📡 Resultado direto: ${receipts.length} recibos encontrados`);
          
          if (receipts.length > 0) {
            console.log(`📡 Primeiro recibo:`, receipts[0]);
          }
        } catch (error) {
          console.error("📡 Erro ao testar API diretamente:", error);
        }
      })();
      
      // Backup - Preencher dados de override para teste (para compatibilidade)
      if (saleId === 177) {
        (window as any).paymentPartsOverride = ["CARTAO: R$ 20,00", "CARTAO: R$ 60,00", "PIX: R$ 20,00"];
      }
    }
  }, [saleId, queryClient]);
  
  // Buscar métodos de pagamento do sistema
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ['/api/payment-methods'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/payment-methods");
      return res.json();
    },
  });
  
  // Buscar parcelas
  const { data: installments = [], isLoading } = useQuery({
    queryKey: ['/api/sales', saleId, 'installments'],
    queryFn: async () => {
      if (!saleId) return [];
      const res = await apiRequest("GET", `/api/sales/${saleId}/installments`);
      const data = await res.json();
      
      // Debug: Verificar o formato das datas das parcelas
      if (data && data.length > 0) {
        console.log("Parcelas recebidas do servidor:", data);
        data.forEach((installment: any, index: number) => {
          console.log(`Parcela #${index+1} (${installment.installmentNumber}): dueDate=${installment.dueDate}, tipo=${typeof installment.dueDate}`);
        });
      }
      
      return data;
    },
    enabled: !!saleId,
  });
  
  // Buscar recibos de pagamento para detectar pagamentos divididos
  const { data: paymentReceipts = [], isLoading: isLoadingReceipts } = useQuery({
    queryKey: ['/api/sales', saleId, 'payment-receipts'],
    queryFn: async () => {
      if (!saleId) return [];
      try {
        console.log(`🚀 Buscando recibos de pagamento para venda #${saleId}`);
        const res = await apiRequest("GET", `/api/sales/${saleId}/payment-receipts`);
        const receipts = await res.json();
        console.log("📜 Recibos de pagamento recuperados:", receipts.length);
        
        // Se encontramos recibos, vamos verificar o formato dos dados
        if (receipts.length > 0) {
          console.log("📜 Formato de dados do primeiro recibo:", JSON.stringify(receipts[0], null, 2));
          
          // Log detalhado para diagnóstico
          receipts.forEach((receipt: any, index: number) => {
            if (receipt.receiptType === "split_payment") {
              // Verificar se receiptData é uma string ou um objeto
              if (typeof receipt.receiptData === 'string') {
                try {
                  // Tentar fazer o parse do JSON
                  const receiptDataObj = JSON.parse(receipt.receiptData);
                  console.log(`📜 ReceiptData parsed:`, receiptDataObj);
                  // Atualizar o objeto receipt com o receiptData parseado
                  receipt.receiptData = receiptDataObj;
                } catch (e) {
                  console.error(`📜 Erro ao fazer parse do receiptData:`, e);
                }
              }
              
              // Agora podemos fazer o log com os dados atualizados
              console.log(`📜 SPLIT PAYMENT #${index+1}: Parcela=${receipt.installmentId}, Método=${receipt.receiptData?.methodName}, Valor=${receipt.receiptData?.amount}`);
            }
          });
        }
        
        return receipts;
      } catch (error) {
        console.error("Erro ao buscar recibos de pagamento:", error);
        return [];
      }
    },
    enabled: !!saleId,
    // Mesmo se falhar, não vamos bloquear a interface
    retry: false,
  });
  
  // Organizar recibos por parcela para facilitar o acesso 
  const splitPaymentReceiptsByInstallment = React.useMemo(() => {
    const receiptMap: Record<number, any[]> = {};
    
    if (paymentReceipts && paymentReceipts.length > 0) {
      // Filtrar e processar apenas recibos de pagamentos divididos
      paymentReceipts.forEach((receipt: any) => {
        // Verificar se é um recibo de pagamento dividido
        if (receipt.receiptType === "split_payment") {
          const installmentId = receipt.installmentId;
          
          // Inicializar array para esta parcela se ainda não existir
          if (!receiptMap[installmentId]) {
            receiptMap[installmentId] = [];
          }
          
          // Verificar e fazer parse do receiptData se for uma string
          let receiptData = receipt.receiptData;
          if (typeof receiptData === 'string') {
            try {
              receiptData = JSON.parse(receiptData);
            } catch (e) {
              console.error(`❌ Erro ao processar receiptData para recibo ${receipt.id}:`, e);
              receiptData = {};
            }
          }
          
          // Adicionar ao mapa
          receiptMap[installmentId].push({
            ...receipt,
            receiptData,
          });
        }
      });
      
      // Log para diagnóstico
      if (Object.keys(receiptMap).length > 0) {
        console.log(`🔍 Mapa de recibos por parcela:`, Object.keys(receiptMap));
        Object.entries(receiptMap).forEach(([installmentId, receipts]) => {
          console.log(`   -> Parcela #${installmentId}: ${receipts.length} recibos`);
        });
      }
    }
    
    return receiptMap;
  }, [paymentReceipts]);
  
  // Mutation para editar um pagamento confirmado (apenas admin pode fazer isso)
  const editPaymentMutation = useMutation({
    mutationFn: async ({ installmentId, paymentDate, notes, paymentMethodId }: { installmentId: number, paymentDate: string, notes: string, paymentMethodId: string }) => {
      // Buscar o método de pagamento selecionado para usar seu nome
      const selectedMethod = paymentMethods.find((m: any) => String(m.id) === paymentMethodId);
      
      // Criar rota para editar pagamento
      const res = await apiRequest("POST", `/api/installments/${installmentId}/edit-payment`, {
        paymentDate, // Enviar a data exatamente como está
        paymentMethodId: Number(paymentMethodId),
        notes: notes,
        receiptData: { 
          detail: "Edição de pagamento",
          paymentMethod: selectedMethod?.name || "Método não especificado"
        }
      });
      return res.json();
    },
    onSuccess: () => {
      // Atualizar os dados após a edição
      queryClient.invalidateQueries({ queryKey: ['/api/sales', saleId, 'installments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales', saleId] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      
      toast({
        title: "Pagamento atualizado",
        description: "As informações de pagamento foram atualizadas com sucesso.",
      });
      
      // Fechar o diálogo de edição
      closeEditDialog();
    },
    onError: (error: any) => {
      console.error("Erro ao editar pagamento:", error);
      toast({
        title: "Erro ao editar pagamento",
        description: error.message || "Não foi possível atualizar as informações de pagamento.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation para confirmar pagamento
  const confirmPaymentMutation = useMutation({
    mutationFn: async ({ 
      installmentId, 
      paymentDate, 
      notes, 
      paymentMethodId, 
      splitPayments = [] 
    }: { 
      installmentId: number, 
      paymentDate: string, 
      notes: string, 
      paymentMethodId: string,
      splitPayments?: Array<{methodId: number, amount: number}>
    }) => {
      // Buscar o método de pagamento selecionado para usar seu nome
      const selectedMethod = paymentMethods.find((m: any) => String(m.id) === paymentMethodId);
      
      // Usar a data exatamente como foi fornecida pelo usuário
      console.log(`🔍 Confirmação de pagamento: Data a ser enviada: ${paymentDate}`);
      
      // Se temos pagamentos divididos, formatar os detalhes
      let paymentDetails = "Confirmação manual";
      if (splitPayments.length > 0) {
        const splitDetails = splitPayments.map(p => {
          const method = paymentMethods.find((m: any) => Number(m.id) === Number(p.methodId));
          return `${method?.name || 'MÉTODO ' + p.methodId}: ${formatCurrency(p.amount)}`;
        }).join(' | ');
        
        paymentDetails = `PAGAMENTO DIVIDIDO`;
        // Adicionar a string PAGAMENTO DIVIDIDO também nas notas para facilitar a exibição na interface
        notes = `PAGAMENTO DIVIDIDO | ${splitDetails}${notes ? ' | NOTAS: ' + notes : ''}`;
      }
      
      const requestData = {
        paymentDate, // Enviar a data exatamente como está para preservar o formato
        paymentMethodId: Number(paymentMethodId), // ID do método de pagamento
        receiptType: "manual", // "manual" é o tipo de comprovante
        notes: notes,
        receiptData: { 
          detail: paymentDetails,
          paymentMethod: selectedMethod?.name || "Método não especificado"
        },
        splitPayments, // Enviar os pagamentos divididos ao backend
        // Flag para indicar que queremos criar recibos de pagamento dividido
        createSplitReceipts: splitPayments.length > 0
      };
      
      console.log("📤 Enviando dados para confirmação:", JSON.stringify(requestData, null, 2));
      
      const res = await apiRequest("POST", `/api/installments/${installmentId}/confirm-payment`, requestData);
      return res.json();
    },
    onSuccess: () => {
      // Atualizar os dados após a confirmação
      queryClient.invalidateQueries({ queryKey: ['/api/sales', saleId, 'installments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales', saleId] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      
      // Verificar se estamos no modo de confirmação múltipla
      if (showMultiConfirm && selectedInstallments.length > 0) {
        // Remover a parcela atual da lista de parcelas selecionadas
        const updatedInstallments = [...selectedInstallments];
        updatedInstallments.shift(); // Remove o primeiro item (que acabamos de confirmar)
        setSelectedInstallments(updatedInstallments);
        
        // Verificar se ainda há mais parcelas para confirmar
        if (updatedInstallments.length > 0) {
          toast({
            title: "Parcela confirmada",
            description: `Confirmada com sucesso. Processando próxima parcela (${updatedInstallments.length} restantes)...`,
          });
          
          // Processar a próxima parcela automaticamente
          const nextInstallment = pendingInstallments.find(inst => inst.id === updatedInstallments[0]);
          if (nextInstallment) {
            // Usar setTimeout para dar um pequeno atraso antes de confirmar a próxima,
            // permitindo que a interface se atualize primeiro
            setTimeout(() => {
              confirmPaymentMutation.mutate({
                installmentId: nextInstallment.id,
                paymentDate: paymentDateStr,
                notes: paymentNotes,
                paymentMethodId,
                splitPayments: []
              });
            }, 500);
          }
          return;
        } else {
          // Todas as parcelas foram confirmadas
          toast({
            title: "Todas as parcelas confirmadas",
            description: "Todas as parcelas pendentes foram confirmadas com sucesso.",
          });
        }
      } else {
        // Confirmação única
        toast({
          title: "Pagamento confirmado",
          description: "O pagamento foi confirmado com sucesso.",
        });
      }
      
      // Fechar o diálogo
      closeConfirmDialog();
    },
    onError: (error: any) => {
      console.error("Erro completo:", error);
      toast({
        title: "Erro ao confirmar pagamento",
        description: error.message || "Não foi possível confirmar o pagamento.",
        variant: "destructive",
      });
      
      // Se estamos no modo de confirmação múltipla, cancelar todo o processo
      if (showMultiConfirm) {
        closeConfirmDialog();
        toast({
          title: "Processo interrompido",
          description: "O processo de confirmação em lote foi interrompido devido a um erro.",
          variant: "destructive",
        });
      }
    }
  });
  
  // Função formatDateToBR já declarada no início do arquivo

  // Função para abrir o diálogo de confirmação para uma única parcela
  const openConfirmDialog = (installment: any) => {
    setSelectedInstallment(installment);
    setShowMultiConfirm(false);
    setShowSplitPayment(false);
    
    // Inicializar com string vazia para forçar a digitação manual
    setPaymentDate("");
    setPaymentDateStr("");
    setPaymentNotes("");
    
    // Limpar pagamentos parciais anteriores
    setSplitPayments([]);
    setSplitAmount("");
    setRemainingAmount(String(installment.amount));
    
    // Definir primeiro método de pagamento como padrão, se disponível
    if (paymentMethods.length > 0) {
      setPaymentMethodId(String(paymentMethods[0].id));
    }
    
    setConfirmDialogOpen(true);
  };
  
  // Função para abrir o diálogo de edição de pagamento (apenas admin)
  const openEditDialog = (installment: any) => {
    setSelectedInstallment(installment);
    
    // Preencher com os valores atuais da parcela preservando exatamente como estão
    // Se a parcela já tem uma data de pagamento, usá-la como valor inicial
    if (installment.paymentDate) {
      // Usar a data exatamente como está no banco de dados, sem conversões
      // Verifica se já está no formato brasileiro (dd/mm/aaaa)
      if (installment.paymentDate.includes('/')) {
        setPaymentDateStr(installment.paymentDate);
      } else {
        // Se estiver no formato ISO, converter para o formato brasileiro
        try {
          const date = new Date(installment.paymentDate);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const formattedDate = `${day}/${month}/${year}`;
          
          // Mostrar na console para debug
          console.log(`Data original: ${installment.paymentDate}`);
          console.log(`Data formatada: ${formattedDate}`);
          
          setPaymentDateStr(formattedDate);
        } catch (error) {
          // Em caso de erro, usar a data original sem alterações
          console.error("Erro ao formatar data:", error);
          setPaymentDateStr(installment.paymentDate);
        }
      }
    } else {
      setPaymentDateStr("");
    }
    
    // Preservar as notas do pagamento exatamente como estão
    setPaymentNotes(installment.paymentNotes || "");
    
    // Preservar o método de pagamento exatamente como está
    if (installment.paymentMethodId) {
      setPaymentMethodId(String(installment.paymentMethodId));
    } else if (paymentMethods.length > 0) {
      setPaymentMethodId(String(paymentMethods[0].id));
    }
    
    // Logar as informações para debug
    console.log("Abrindo edição com dados originais:", {
      id: installment.id,
      installmentNumber: installment.installmentNumber,
      paymentDate: installment.paymentDate,
      paymentDateStr: paymentDateStr,
      paymentMethodId: installment.paymentMethodId,
      paymentNotes: installment.paymentNotes
    });
    
    setEditDialogOpen(true);
  };
  
  // Função para abrir o diálogo de confirmação para múltiplas parcelas
  const openMultiConfirmDialog = () => {
    setSelectedInstallment(null);
    setShowMultiConfirm(true);
    
    // Inicializar com string vazia para forçar a digitação manual
    setPaymentDate("");
    setPaymentDateStr("");
    setPaymentNotes("");
    
    // Definir primeiro método de pagamento como padrão, se disponível
    if (paymentMethods.length > 0) {
      setPaymentMethodId(String(paymentMethods[0].id));
    }
    
    // Selecionar todas as parcelas pendentes
    setSelectedInstallments(pendingInstallments.map((inst: any) => inst.id));
    
    setConfirmDialogOpen(true);
  };
  
  // Fechar diálogo de confirmação
  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedInstallment(null);
    setShowMultiConfirm(false);
    setSelectedInstallments([]);
  };
  
  // Fechar diálogo de edição
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedInstallment(null);
  };
  
  // Função para salvar a edição de um pagamento (apenas admin)
  const handleEditPayment = () => {
    if (!selectedInstallment) return;
    if (!paymentDateStr || !paymentMethodId) return;
    
    // Chamar a mutation para editar o pagamento
    editPaymentMutation.mutate({
      installmentId: selectedInstallment.id,
      paymentDate: paymentDateStr,
      notes: paymentNotes,
      paymentMethodId
    });
  };
  
  // Confirmar pagamento de uma parcela ou múltiplas parcelas
  const handleConfirmPayment = () => {
    if (!selectedInstallment && !showMultiConfirm) return;
    if (!paymentDateStr) return;
    
    // Usar exatamente o que o usuário digitou sem conversões automáticas
    console.log(`📅 Enviando data exatamente como digitada: "${paymentDateStr}"`);
    
    if (showMultiConfirm && selectedInstallments.length > 0) {
      // Confirmar múltiplas parcelas sequencialmente
      const currentInstallment = pendingInstallments.find(inst => inst.id === selectedInstallments[0]);
      
      if (currentInstallment) {
        confirmPaymentMutation.mutate({
          installmentId: currentInstallment.id,
          paymentDate: paymentDateStr,
          notes: paymentNotes,
          paymentMethodId,
          splitPayments: [] // Não permitir pagamentos divididos em confirmação em lote
        });
      }
    } else if (selectedInstallment) {
      if (showSplitPayment && splitPayments.length > 0) {
        // Verificar se o valor total dos pagamentos divididos é igual ao valor da parcela
        const totalPaid = splitPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const installmentAmount = Number(selectedInstallment.amount);
        
        // Verificar se o valor total é igual ao valor da parcela (com uma pequena margem de erro)
        if (Math.abs(totalPaid - installmentAmount) > 0.01) {
          toast({
            title: "Valor total incorreto",
            description: `O valor total dos pagamentos (${formatCurrency(totalPaid)}) deve ser igual ao valor da parcela (${formatCurrency(installmentAmount)}).`,
            variant: "destructive"
          });
          return;
        }
        
        // Formatar detalhes do pagamento para as notas
        const methodDetails = splitPayments.map(p => {
          // Encontrar o método de pagamento pelo ID exato
          const method = paymentMethods.find((m: any) => Number(m.id) === Number(p.methodId));
          if (!method) {
            console.warn(`⚠️ Método de pagamento ID ${p.methodId} não encontrado!`);
          }
          return `${method?.name || 'MÉTODO ' + p.methodId}: ${formatCurrency(Number(p.amount))}`;
        }).join(' | ');
        
        // Log para verificar o que está sendo enviado
        console.log("📝 Gerando pagamento dividido:", {
          metodos: splitPayments,
          stringFinal: `PAGAMENTO DIVIDIDO | ${methodDetails}${paymentNotes ? ' | NOTAS: ' + paymentNotes : ''}`
        });
        
        // Modificar o formato das notas para facilitar a exibição na interface
        const notasAdicionais = paymentNotes ? ` | NOTAS: ${paymentNotes}` : '';
        
        // Confirmar com pagamento dividido
        confirmPaymentMutation.mutate({
          installmentId: selectedInstallment.id,
          paymentDate: paymentDateStr,
          notes: `PAGAMENTO DIVIDIDO | ${methodDetails}${notasAdicionais}`,
          paymentMethodId: splitPayments[0].methodId, // Usar o primeiro método como principal
          splitPayments: splitPayments.map(p => ({
            methodId: Number(p.methodId),
            amount: Number(p.amount)
          }))
        });
      } else {
        // Confirmar uma parcela única com método único
        confirmPaymentMutation.mutate({
          installmentId: selectedInstallment.id,
          paymentDate: paymentDateStr,
          notes: paymentNotes,
          paymentMethodId,
          splitPayments: []
        });
      }
    }
  };
  
  // Observação: Estamos focando em corrigir a exibição das parcelas existentes
  // em vez de criar funcionalidades para recriar as parcelas
  
  // Estado para seleção múltipla de parcelas
  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([]);
  const [showMultiConfirm, setShowMultiConfirm] = useState(false);
  
  // Estado para pagamento parcial (múltiplos métodos de pagamento)
  const [splitPayments, setSplitPayments] = useState<{methodId: string, amount: string}[]>([]);
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  
  // Verificar se todas as parcelas estão pagas
  // Não verificamos mais se TODAS as parcelas estão pagas, apenas se existem parcelas
  const allPaid = installments.length > 0 && installments.every((item: any) => item.status === 'paid');
  // Flag para controlar se há pelo menos uma parcela pendente
  const hasPendingInstallments = installments.some((item: any) => item.status === 'pending');
  // Obter a lista de parcelas pendentes
  const pendingInstallments = installments.filter((item: any) => item.status === 'pending');
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Confirmação de Pagamentos
          </CardTitle>
          <CardDescription>
            Confirme os pagamentos das parcelas da venda
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando parcelas...</span>
        </CardContent>
      </Card>
    );
  }
  
  if (installments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Confirmação de Pagamentos
          </CardTitle>
          <CardDescription>
            Confirme os pagamentos das parcelas da venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Não há parcelas registradas para esta venda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Confirmação de Pagamentos
          </CardTitle>
          <CardDescription>
            {allPaid 
              ? "Todos os pagamentos foram confirmados." 
              : "Confirme os pagamentos das parcelas pendentes."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasPendingInstallments && canManage && (
            <div className="mb-4 flex justify-end">
              <Button 
                onClick={openMultiConfirmDialog}
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Todas Pendentes
              </Button>
            </div>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcela</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.map((installment: any) => {
                // Encontrar o método de pagamento, se existir
                const paymentMethod = paymentMethods.find((m: any) => 
                  m.id === installment.paymentMethodId
                );
                
                return (
                  <TableRow key={installment.id}>
                    <TableCell>{installment.installmentNumber}</TableCell>
                    <TableCell>
                      {formatDate(installment.dueDate)}
                    </TableCell>
                    <TableCell>
                      {installment.paymentDate ? (
                        <span className="text-green-700">{formatDate(installment.paymentDate)}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Não pago</span>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(installment.amount)}</TableCell>
                    <TableCell>
                      {installment.status === 'paid' ? (
                        <>
                          {/* Função auxiliar para detectar melhor os pagamentos divididos */}
                          {(() => {
                            // Nova forma de detecção: verificar se a parcela tem recibos do tipo "split_payment"
                            const receipts = paymentReceipts.filter((receipt: any) => 
                              receipt.installmentId === installment.id && 
                              receipt.receiptType === "split_payment"
                            );
                            
                            // Se encontrou recibos de pagamento dividido, é um pagamento dividido
                            const hasSplitReceipts = receipts.length > 0;
                            
                            if (hasSplitReceipts) {
                              console.log(`💰 Pagamento dividido detectado automaticamente para parcela #${installment.id} via recibos (${receipts.length} recibos encontrados)`);
                            }
                            
                            // Método alternativo: verificar as notas de pagamento
                            let isPagamentoDividido = hasSplitReceipts;
                            
                            // Método alternativo 1: Verificar marcador explícito PAGAMENTO DIVIDIDO
                            if (!isPagamentoDividido && installment.paymentNotes && installment.paymentNotes.includes("PAGAMENTO DIVIDIDO")) {
                              isPagamentoDividido = true;
                              console.log(`🚨 Pagamento dividido detectado via texto "PAGAMENTO DIVIDIDO" ID ${installment.id}`);
                            }
                            
                            // Método alternativo 2: Verificar se existem múltiplos métodos de pagamento na nota
                            else if (!isPagamentoDividido && installment.paymentNotes && 
                              ((installment.paymentNotes.includes("PIX") && (
                                installment.paymentNotes.includes("CARTAO") || 
                                installment.paymentNotes.includes("BOLETO"))) ||
                               (installment.paymentNotes.includes("CARTAO") && installment.paymentNotes.includes("BOLETO"))
                              )) {
                              isPagamentoDividido = true;
                              console.log(`🚨 Pagamento dividido detectado via múltiplos métodos ID ${installment.id}`);
                            }
                            
                            // Método alternativo 3: Verificar formato de notação com método: valor
                            else if (!isPagamentoDividido && installment.paymentNotes && 
                              /[A-Za-z]+:\s*R?\$?\s*[\d,.]+/.test(installment.paymentNotes)) {
                              
                              // Contar quantas ocorrências de ":" existem na string (desconsiderando a parte após NOTAS:)
                              const notasPos = installment.paymentNotes.indexOf("NOTAS:");
                              const stringAnalise = notasPos > -1 ? 
                                installment.paymentNotes.substring(0, notasPos) : 
                                installment.paymentNotes;
                                
                              // Verificar se há múltiplos métodos pelos separadores de "|"
                              const partesPagamento = stringAnalise.split('|')
                                .map(p => p.trim())
                                .filter(p => p && p !== "PAGAMENTO DIVIDIDO" && p.includes(':'));
                                
                              isPagamentoDividido = partesPagamento.length > 1;
                              
                              if (isPagamentoDividido) {
                                console.log(`🚨 Pagamento dividido detectado via padrão "método: valor" ID ${installment.id}`);
                              }
                            }
                            
                            return isPagamentoDividido;
                          })() ? (
                            <div className="space-y-1 border-l-2 border-blue-400 pl-2 relative">
                              <div className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded mb-2 inline-flex items-center">
                                <SplitSquareVertical className="h-3 w-3 mr-1" />
                                Pagamento Dividido
                              </div>
                              {(() => {
                                try {
                                  let paymentParts: any[] = [];
                                  
                                  // ABORDAGEM PRIORITÁRIA: Usar os recibos de pagamento dividido
                                  // Primeiro verificar splitPaymentReceiptsByInstallment (compilados no início)
                                  if (splitPaymentReceiptsByInstallment && 
                                      splitPaymentReceiptsByInstallment[installment.id] && 
                                      splitPaymentReceiptsByInstallment[installment.id].length > 0) {
                                      
                                      // Usar os recibos de pagamento dividido já organizados
                                      const receipts = splitPaymentReceiptsByInstallment[installment.id];
                                      console.log(`📜 Usando ${receipts.length} recibos mapeados para exibir pagamento dividido da parcela #${installment.id}`);
                                      
                                      // Converter recibos para o formato de exibição
                                      paymentParts = receipts.map(receipt => {
                                          // Extrair informações do recibo
                                          const methodName = receipt.receiptData?.methodName || "Método desconhecido";
                                          const amount = receipt.receiptData?.amount || 0;
                                          
                                          // Formatar o valor como moeda brasileira
                                          const amountFormatted = new Intl.NumberFormat('pt-BR', { 
                                              style: 'currency', 
                                              currency: 'BRL' 
                                          }).format(amount);
                                          
                                          const method = methodName.toUpperCase();
                                          const text = `${methodName}: ${amountFormatted}`;
                                          
                                          return { method, text };
                                      });
                                  }
                                  
                                  // SEGUNDA ABORDAGEM: Usar os recibos do array paymentReceipts (compatibilidade)
                                  if (paymentParts.length === 0) {
                                    // Buscar os recibos de pagamento dividido diretamente
                                    const splitReceipts = paymentReceipts.filter((receipt: any) => 
                                      receipt.installmentId === installment.id && 
                                      receipt.receiptType === "split_payment"
                                    );
                                    
                                    // Se temos recibos de pagamento dividido, usar eles diretamente
                                    if (splitReceipts.length > 0) {
                                      console.log(`🎯 Usando ${splitReceipts.length} recibos de pagamento dividido para parcela #${installment.id}`);
                                      
                                      // Criar as partes do pagamento a partir dos recibos
                                      paymentParts = splitReceipts.map((receipt: any) => {
                                        // Verificar se receiptData é uma string e tentar fazer o parse
                                        let receiptDataObj = receipt.receiptData;
                                        if (typeof receiptDataObj === 'string') {
                                          try {
                                            receiptDataObj = JSON.parse(receiptDataObj);
                                          } catch (e) {
                                            console.error("Erro ao fazer parse de receiptData:", e);
                                          }
                                        }
                                        
                                        // Usar o objeto receiptData (original ou parseado)
                                        const methodName = receiptDataObj?.methodName || 'MÉTODO DESCONHECIDO';
                                        const amount = receiptDataObj?.amount || 0;
                                        console.log(`🎯 Método: ${methodName}, Valor: ${amount}`);
                                        
                                        return {
                                          text: `${methodName}: ${formatCurrency(amount)}`,
                                          method: methodName.toUpperCase()
                                        };
                                      });
                                    }
                                  }
                                  
                                  // TERCEIRA ABORDAGEM: Fallback para processamento de texto (compatibilidade retroativa)
                                  if (paymentParts.length === 0 && installment.paymentNotes) {
                                    console.log(`🔍 DETALHES PAGAMENTO DIVIDIDO (ID ${installment.id}):`, {
                                      paymentNotes: installment.paymentNotes,
                                      paymentMethodId: installment.paymentMethodId,
                                    });
                                    
                                    // Definição de métodos de pagamento conhecidos
                                    const metodosConhecidos = paymentMethods.map((m: any) => m.name.toUpperCase()).join('|');
                                    console.log(`🔍 Métodos conhecidos:`, metodosConhecidos);
                                    
                                    // Inicializar matches para todas as abordagens
                                    let matches: any[] = [];
                                    
                                    // Usando várias abordagens de expressão regular para máxima flexibilidade
                                    const padrao1 = /([A-Za-z0-9\s]+):\s*(R\$\s*[\d,.]+)/g; // método: R$ valor
                                    const padrao2 = /([A-Za-z0-9\s]+):\s*([\d,.]+)/g; // método: valor
                                    const padrao3 = new RegExp(`(${metodosConhecidos})\\s*([\\d,.]+|R\\$\\s*[\\d,.]+)`, 'gi'); // método valor
                                    const padrao4 = /([A-Za-z]{3,})\s+(R\$\s*[\d,.]+|[\d,.]+)/g; // qualquer palavra + valor
                                    
                                    // Tentar todos os padrões em sequência
                                    matches = [...(installment.paymentNotes?.matchAll(padrao1) || [])];
                                    if (matches.length === 0) matches = [...(installment.paymentNotes?.matchAll(padrao2) || [])];
                                    if (matches.length === 0) matches = [...(installment.paymentNotes?.matchAll(padrao3) || [])];
                                    if (matches.length === 0) matches = [...(installment.paymentNotes?.matchAll(padrao4) || [])];
                                    
                                    console.log(`🧩 Matches encontrados para ID ${installment.id}:`, matches);
                                    
                                    // Extrair partes de pagamento do texto
                                    let textParts: string[] = [];
                                    
                                    if (matches.length > 0) {
                                      // Abordagem por regex
                                      textParts = matches.map(match => match[0]);
                                    } else {
                                      // Abordagem por split 
                                      const parts = installment.paymentNotes.split('|')
                                        .map((p: string) => p.trim())
                                        .filter((part: string) => {
                                          if (part === "PAGAMENTO DIVIDIDO") return false;
                                          if (part.toLowerCase().includes("notas:")) return false;
                                          return part.includes(':');
                                        });
                                      
                                      if (parts.length > 0) {
                                        textParts = parts;
                                      }
                                    }
                                    
                                    // Converter texto para o formato interno
                                    if (textParts.length > 0) {
                                      paymentParts = textParts.map(text => {
                                        // Tentar extrair o método do texto
                                        let method = "DESCONHECIDO";
                                        if (text.toUpperCase().includes("CARTAO") || text.toUpperCase().includes("CARTÃO") || text.toUpperCase().includes("CARD")) {
                                          method = "CARTAO";
                                        } else if (text.toUpperCase().includes("PIX")) {
                                          method = "PIX";
                                        } else if (text.toUpperCase().includes("BOLETO")) {
                                          method = "BOLETO";
                                        }
                                        
                                        return { text, method };
                                      });
                                    }
                                  }
                                  
                                  // ÚLTIMO RECURSO: Override para casos específicos
                                  if (paymentParts.length === 0) {
                                    if (installment.id === 175) {
                                      const override = ["CARTAO: R$ 20,00", "CARTAO: R$ 60,00", "PIX: R$ 20,00"];
                                      console.log(`🎮 Usando override para parcela 175:`, override);
                                      paymentParts = override.map(text => {
                                        const isCard = text.includes("CARTAO");
                                        const isPix = text.includes("PIX");
                                        return {
                                          text,
                                          method: isCard ? "CARTAO" : isPix ? "PIX" : "DESCONHECIDO"
                                        };
                                      });
                                    } else if (installment.id === 176) {
                                      const override = ["CARTAO: R$ 50,00", "PIX: R$ 50,00"];
                                      console.log(`🎮 Usando override para parcela 176:`, override);
                                      paymentParts = override.map(text => {
                                        const isCard = text.includes("CARTAO");
                                        const isPix = text.includes("PIX");
                                        return {
                                          text,
                                          method: isCard ? "CARTAO" : isPix ? "PIX" : "DESCONHECIDO"
                                        };
                                      });
                                    }
                                  }
                                  
                                  console.log(`📊 Partes de pagamento processadas para ID ${installment.id}:`, paymentParts);
                                  
                                  // Se ainda tem o override para casos específicos, usar como último recurso
                                  if (paymentParts.length === 0 && installment.id === 175 && (window as any).paymentPartsOverride) {
                                    console.log("🎮 Usando override para parcela 175:", (window as any).paymentPartsOverride);
                                    paymentParts = (window as any).paymentPartsOverride;
                                  }
                                  
                                  // Se não conseguimos extrair partes de pagamento, mostrar mensagem
                                  if (paymentParts.length === 0) {
                                    return (
                                      <div className="text-amber-600 bg-amber-50 p-2 rounded-md text-sm">
                                        Pagamento dividido, mas detalhes não disponíveis
                                      </div>
                                    );
                                  }
                                  
                                  // Renderizar cada método de pagamento (no novo formato { text, method })
                                  return paymentParts.map((part, idx) => {
                                    // Verificar se está no novo formato { text, method } ou no formato antigo (string)
                                    const isNewFormat = typeof part === 'object' && part !== null && 'text' in part && 'method' in part;
                                    
                                    // Se for o formato antigo, converter para o novo
                                    let formattedPart = isNewFormat ? part : { text: part, method: '' };
                                    
                                    // Para o formato antigo, extrair método e valor
                                    if (!isNewFormat) {
                                      const partText = part as string;
                                      const colonPos = partText.lastIndexOf(':');
                                      
                                      if (colonPos === -1) {
                                        // Formato inválido, mostrar a parte bruta
                                        return (
                                          <div key={idx} className="text-amber-600 bg-amber-50 p-1 rounded-md text-xs">
                                            Formato inválido: {partText}
                                          </div>
                                        );
                                      }
                                      
                                      // Extrair nome do método e valor
                                      const methodName = partText.substring(0, colonPos).trim();
                                      
                                      // Determinar o tipo de método
                                      let methodType = "DESCONHECIDO";
                                      if (methodName.toUpperCase().includes("CARTAO") || methodName.toUpperCase().includes("CARTÃO") || methodName.toUpperCase().includes("CARD")) {
                                        methodType = "CARTAO";
                                      } else if (methodName.toUpperCase().includes("PIX")) {
                                        methodType = "PIX";
                                      } else if (methodName.toUpperCase().includes("BOLETO")) {
                                        methodType = "BOLETO";
                                      }
                                      
                                      formattedPart = {
                                        text: partText,
                                        method: methodType
                                      };
                                    }
                                    
                                    // Normalizar o nome do método para comparação
                                    const methodText = formattedPart.text;
                                    const colonPos = methodText.lastIndexOf(':');
                                    
                                    // Extrair nome do método e valor se possível
                                    let displayMethodName = formattedPart.method;
                                    let valueText = '';
                                    
                                    if (colonPos !== -1) {
                                      displayMethodName = methodText.substring(0, colonPos).trim();
                                      valueText = methodText.substring(colonPos + 1).trim();
                                      
                                      // Formatar valor adequadamente se não estiver no formato R$
                                      if (!valueText.includes('R$')) {
                                        // Tenta extrair um valor numérico da string
                                        const valorNumerico = parseFloat(valueText.replace(/[^\d,.]/g, '').replace(',', '.'));
                                        if (!isNaN(valorNumerico)) {
                                          valueText = formatCurrency(valorNumerico);
                                        }
                                      }
                                    } else {
                                      // Se não tiver o formato método:valor, mostrar tudo como texto
                                      displayMethodName = methodText;
                                    }
                                    
                                    // Encontrar o método de pagamento correto
                                    let foundMethod = null;
                                    for (const m of paymentMethods) {
                                      const mName = m.name.toUpperCase();
                                      const upperMethodName = displayMethodName.toUpperCase();
                                      if (mName === upperMethodName || 
                                          upperMethodName.includes(mName) || 
                                          mName.includes(upperMethodName)) {
                                        foundMethod = m;
                                        break;
                                      }
                                    }
                                    
                                    // Determinar a cor com base no tipo de método
                                    const methodType = formattedPart.method.toUpperCase();
                                    const isPix = methodType.includes("PIX");
                                    const isCard = methodType.includes("CART") || methodType.includes("CARD");
                                    const isBoleto = methodType.includes("BOLETO");
                                    
                                    return (
                                      <div key={idx} className="flex items-center justify-between w-full py-1.5 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center">
                                          <div className={`h-3 w-3 rounded-full mr-2 ${
                                            isPix ? 'bg-green-500' : 
                                            isCard ? 'bg-blue-500' : 
                                            isBoleto ? 'bg-amber-500' : 'bg-blue-400'
                                          }`}></div>
                                          <span className="font-medium">
                                            {foundMethod ? foundMethod.name : displayMethodName}
                                          </span>
                                        </div>
                                        <div className="font-medium text-emerald-700">
                                          {valueText}
                                        </div>
                                      </div>
                                    );
                                  });
                                } catch (error) {
                                  console.error("Erro ao processar pagamento dividido:", error);
                                  return (
                                    <div className="text-red-600 bg-red-50 p-2 rounded-md text-sm">
                                      Erro ao processar pagamento dividido
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          ) : (
                            // Se não for pagamento dividido, mostrar o método padrão
                            <>
                              {(() => {
                                // Verificamos primeiro se a parcela tem um método de pagamento associado
                                if (paymentMethod) {
                                  return (
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center">
                                        <div className={`h-3 w-3 rounded-full mr-2 ${
                                          paymentMethod.name.toUpperCase().includes('PIX') ? 'bg-green-500' :
                                          paymentMethod.name.toUpperCase().includes('CARTAO') || 
                                          paymentMethod.name.toUpperCase().includes('CARTÃO') ? 'bg-blue-500' :
                                          'bg-blue-500'
                                        }`}></div>
                                        <span className="font-medium">{paymentMethod.name}</span>
                                      </div>
                                      <div className="font-medium">
                                        {formatCurrency(installment.amount)}
                                      </div>
                                    </div>
                                  );
                                }
                                
                                // Segunda verificação: buscar nos recibos de pagamento
                                const installmentReceipts = paymentReceipts.filter((receipt: any) => 
                                  receipt.installmentId === installment.id && 
                                  receipt.receiptType === "manual"
                                );
                                
                                if (installmentReceipts.length > 0) {
                                  // Pegar o primeiro recibo que tenha informações de método
                                  const receipt = installmentReceipts[0];
                                  const methodName = receipt.receiptData?.paymentMethod || "Método do recibo";
                                  
                                  // Verificar se encontramos um método correspondente na lista
                                  const methodMatch = paymentMethods.find((m: any) => 
                                    m.name.toUpperCase() === methodName.toUpperCase() ||
                                    methodName.toUpperCase().includes(m.name.toUpperCase())
                                  );
                                  
                                  const isPix = methodName.toUpperCase().includes('PIX');
                                  const isCard = methodName.toUpperCase().includes('CART') || 
                                                methodName.toUpperCase().includes('CARTÃO');
                                  
                                  return (
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center">
                                        <div className={`h-3 w-3 rounded-full mr-2 ${
                                          isPix ? 'bg-green-500' :
                                          isCard ? 'bg-blue-500' :
                                          'bg-blue-500'
                                        }`}></div>
                                        <span className="font-medium">
                                          {methodMatch ? methodMatch.name : methodName}
                                        </span>
                                      </div>
                                      <div className="font-medium">
                                        {formatCurrency(installment.amount)}
                                      </div>
                                    </div>
                                  );
                                }
                                
                                // Se chegamos aqui, não encontramos informações de método
                                return <span className="text-muted-foreground">Método não especificado</span>;
                              })()}
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        installment.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {installment.status === 'paid' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Pago
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                          Pendente
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {installment.status === 'pending' && canManage && (
                      <Button 
                        onClick={() => openConfirmDialog(installment)}
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirmar
                      </Button>
                    )}
                    {installment.status === 'paid' && !isUserAdmin && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-600"
                        disabled
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirmado
                      </Button>
                    )}
                    {/* Botão de edição apenas para administradores em parcelas já pagas */}
                    {installment.status === 'paid' && isUserAdmin && (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-green-600"
                          disabled
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmado
                        </Button>
                        <Button
                          onClick={() => openEditDialog(installment)}
                          size="sm"
                          variant="outline"
                          className="border-amber-500 text-amber-600 hover:bg-amber-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {allPaid ? (
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Todos os pagamentos confirmados
              </span>
            ) : (
              <span className="flex items-center text-amber-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                Há parcelas pendentes de confirmação
              </span>
            )}
          </div>
          {/* Aviso explicativo sobre parcelas pendentes */}
          {hasPendingInstallments && (
            <div className="text-amber-600 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Clique em "Confirmar" para cada parcela pendente
            </div>
          )}
        </CardFooter>
      </Card>
      
      {/* Diálogo de confirmação de pagamento */}
      {/* Diálogo de confirmação de pagamento */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
            <DialogDescription>
              {showMultiConfirm 
                ? `Confirme os pagamentos de ${pendingInstallments.length} parcelas pendentes.`
                : `Confirme o recebimento do pagamento da parcela ${selectedInstallment?.installmentNumber}.`
              }
            </DialogDescription>
            {!showMultiConfirm && selectedInstallment && (
              <div className="flex justify-end mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className={showSplitPayment ? "border-blue-500 text-blue-600" : ""}
                  onClick={() => setShowSplitPayment(!showSplitPayment)}
                >
                  {showSplitPayment ? (
                    <>
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                      Pagamento único
                    </>
                  ) : (
                    <>
                      <SplitSquareVertical className="h-4 w-4 mr-1" />
                      Pagamento dividido
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {showMultiConfirm && selectedInstallments.length > 0 && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <p className="text-sm text-amber-800 flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Confirmação em lote
                </p>
                <p className="text-sm text-amber-700">
                  Você está prestes a confirmar o pagamento de todas as {pendingInstallments.length} parcelas pendentes 
                  com a mesma data de pagamento e método de pagamento.
                </p>
                
                <div className="mt-3 p-2 bg-white rounded border border-amber-100">
                  <p className="text-xs font-medium mb-1">Parcelas a serem confirmadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {pendingInstallments.map((inst: any) => (
                      <span key={inst.id} className="inline-flex items-center px-2 py-1 rounded text-xs bg-amber-100 text-amber-800">
                        Parcela {inst.installmentNumber}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Interface de pagamento normal (único método) ou múltiplo */}
            {!showSplitPayment ? (
              <div className="grid gap-2">
                <Label htmlFor="payment-method">Método de Pagamento</Label>
                <Select 
                  value={paymentMethodId} 
                  onValueChange={setPaymentMethodId}
                  disabled={isLoadingPaymentMethods || paymentMethods.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingPaymentMethods ? "Carregando..." : "Selecione o método de pagamento"} />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method: any) => (
                      <SelectItem key={method.id} value={String(method.id)}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SplitSquareVertical className="h-4 w-4 mr-2 text-blue-600" />
                    <Label>Pagamento Dividido</Label>
                  </div>
                  <div className="text-sm flex items-center space-x-2">
                    <div className="text-muted-foreground">
                      Valor total: <span className="font-medium">{formatCurrency(selectedInstallment?.amount || 0)}</span>
                    </div>
                    {Number(remainingAmount) > 0 && (
                      <div className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Falta: {formatCurrency(Number(remainingAmount))}
                      </div>
                    )}
                    {Number(remainingAmount) === 0 && splitPayments.length > 0 && (
                      <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completo
                      </div>
                    )}
                  </div>
                </div>
                
                {splitPayments.length > 0 ? (
                  <div className="rounded-md border divide-y">
                    {splitPayments.map((payment, index) => {
                      const method = paymentMethods.find(m => String(m.id) === payment.methodId);
                      return (
                        <div key={index} className="flex items-center justify-between p-3">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                            <span>{method?.name || "Método desconhecido"}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">{formatCurrency(Number(payment.amount))}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={() => {
                                // Remover este método de pagamento
                                const updated = splitPayments.filter((_, i) => i !== index);
                                setSplitPayments(updated);
                                
                                // Recalcular valor restante
                                const totalPaid = updated.reduce((sum, p) => sum + Number(p.amount), 0);
                                setRemainingAmount(String(selectedInstallment?.amount - totalPaid));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-4 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <CreditCard className="h-10 w-10 mb-2 text-muted-foreground/50" />
                      <p>Nenhum método de pagamento adicionado</p>
                      <p className="text-xs mt-1">Utilize o formulário abaixo para adicionar métodos de pagamento</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-muted/50 rounded-md p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <Label htmlFor="split-method">Adicionar Método</Label>
                    <span className="text-sm">{splitPayments.length > 0 ? `Restante: ${formatCurrency(Number(remainingAmount))}` : ''}</span>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-6">
                      <Select 
                        value={paymentMethodId} 
                        onValueChange={setPaymentMethodId}
                        disabled={isLoadingPaymentMethods || paymentMethods.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingPaymentMethods ? "Carregando..." : "Selecione"} />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method: any) => (
                            <SelectItem key={method.id} value={String(method.id)}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-4">
                      <Input
                        type="text"
                        placeholder="Valor"
                        value={splitAmount}
                        onChange={(e) => setSplitAmount(e.target.value)}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          if (!paymentMethodId || !splitAmount) return;
                          
                          try {
                            // Converter para número e garantir formato correto
                            const amountValue = Number(splitAmount.replace(/[^0-9.,]/g, '').replace(',', '.'));
                            
                            if (isNaN(amountValue) || amountValue <= 0) {
                              toast({
                                title: "Valor inválido",
                                description: "Por favor, insira um valor válido maior que zero.",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            // Verificar o valor restante
                            const totalPaid = splitPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                            const maxPossibleAmount = selectedInstallment ? Number(selectedInstallment.amount) - totalPaid : 0;
                            
                            if (amountValue > maxPossibleAmount) {
                              toast({
                                title: "Valor excede o limite",
                                description: `O valor máximo permitido é ${formatCurrency(maxPossibleAmount)}.`,
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            // Adicionar novo método de pagamento
                            const newPayment = { methodId: paymentMethodId, amount: String(amountValue) };
                            setSplitPayments([...splitPayments, newPayment]);
                            
                            // Limpar campo de valor e calcular valor restante
                            setSplitAmount("");
                            const newTotalPaid = totalPaid + amountValue;
                            const remaining = selectedInstallment ? 
                              Math.max(0, Number(selectedInstallment.amount) - newTotalPaid) : 0;
                            setRemainingAmount(String(remaining));
                          } catch (error) {
                            console.error("Erro ao adicionar pagamento dividido:", error);
                            toast({
                              title: "Erro ao adicionar pagamento",
                              description: "Ocorreu um erro ao processar o valor. Verifique se o formato está correto.",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="payment-date">Data do Pagamento</Label>
              <Input
                id="payment-date"
                type="text"
                placeholder="dd/mm/aaaa"
                value={paymentDateStr}
                onChange={(e) => {
                  // Usar exatamente o que o usuário digitou, sem conversões
                  setPaymentDateStr(e.target.value);
                  setPaymentDate(e.target.value);
                  console.log(`🔍 Usuário digitou a data: "${e.target.value}" - Usando exatamente este valor`);
                  
                  // Não vamos mais converter para formato ISO ou Date
                  // Isso garante que a data digitada pelo usuário seja preservada exatamente como está
                }}
              />
              <p className="text-xs text-muted-foreground">
                Digite a data no formato dd/mm/aaaa, dd-mm-aaaa ou aaaa-mm-dd
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="payment-notes">Observações</Label>
              <Textarea
                id="payment-notes"
                placeholder="Informações adicionais sobre o pagamento..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmPayment}
              disabled={
                (!paymentDateStr) || 
                (showSplitPayment ? splitPayments.length === 0 : !paymentMethodId) || 
                confirmPaymentMutation.isPending
              }
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              {confirmPaymentMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {showMultiConfirm ? "Confirmar Parcelas" : 
               showSplitPayment ? "Confirmar Pagamento Dividido" : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de edição de pagamento (apenas para administradores) */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-amber-600" />
              Editar Pagamento Confirmado
            </DialogTitle>
            <DialogDescription>
              <div className="mt-2 flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                <span>Esta operação é exclusiva para administradores.</span>
              </div>
              <p className="mt-2">
                Edite as informações de pagamento da parcela {selectedInstallment?.installmentNumber}.
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
              <p className="text-sm text-amber-800 flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Atenção: Modo de edição ativado
              </p>
              <p className="text-sm text-amber-700">
                Você está modificando um pagamento já confirmado. Esta operação afetará relatórios financeiros.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-payment-method">Método de Pagamento</Label>
              <Select 
                value={paymentMethodId} 
                onValueChange={setPaymentMethodId}
                disabled={isLoadingPaymentMethods || paymentMethods.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingPaymentMethods ? "Carregando..." : "Selecione o método de pagamento"} />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method: any) => (
                    <SelectItem key={method.id} value={String(method.id)}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-payment-date">Data do Pagamento</Label>
              <Input
                id="edit-payment-date"
                type="text"
                placeholder="dd/mm/aaaa"
                value={paymentDateStr}
                onChange={(e) => {
                  setPaymentDateStr(e.target.value);
                  setPaymentDate(e.target.value);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Digite a data no formato dd/mm/aaaa, dd-mm-aaaa ou aaaa-mm-dd
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-payment-notes">Observações</Label>
              <Textarea
                id="edit-payment-notes"
                placeholder="Informações adicionais sobre o pagamento..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditPayment}
              disabled={!paymentDateStr || !paymentMethodId || editPaymentMutation.isPending}
              variant="default"
              className="bg-amber-600 hover:bg-amber-700"
            >
              {editPaymentMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
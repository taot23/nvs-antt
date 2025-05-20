import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useForm, useFieldArray, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus, Trash2, Search, Check, User, UserPlus, CreditCard, AlignLeft, FileText, Calendar, DollarSign, Cog, Save, AlertTriangle, X, Package, Trash } from "lucide-react";
import { SaleItemsFix } from "./sale-items-fix";
import { format, addMonths, isValid } from "date-fns";
import CustomerDialog from "@/components/customers/customer-dialog";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Tipo Sale para tipagem da venda
type Sale = {
  id: number;
  orderNumber: string;
  date: string;
  customerId: number;
  paymentMethodId: number;
  sellerId: number;
  totalAmount: string;
  installments: number;
  installmentValue: string | null;
  status: string;
  executionStatus: string;
  financialStatus: string;
  notes: string | null;
  returnReason: string | null;
  responsibleOperationalId: number | null;
  responsibleFinancialId: number | null;
  createdAt: string;
  updatedAt: string;
};

// Esquema de validação para itens da venda
const saleItemSchema = z.object({
  serviceId: z.coerce.number().min(1, "Serviço é obrigatório"),
  quantity: z.coerce.number().min(1, "Quantidade mínima é 1"),
  notes: z.string().optional().nullable(),
});

// Esquema de validação para a venda
const saleSchema = z.object({
  orderNumber: z.string()
    .min(1, "Número de ordem é obrigatório")
    .nonempty("Número de ordem é obrigatório"),
  // Aceita date ou string para maior flexibilidade
  date: z.union([
    z.date({
      required_error: "Data da venda é obrigatória",
    }),
    z.string().min(1, "Data da venda é obrigatória")
  ]),
  customerId: z.coerce.number().min(1, "Cliente é obrigatório"),
  paymentMethodId: z.coerce.number().min(1, "Forma de pagamento é obrigatória"),
  serviceTypeId: z.coerce.number().min(1, "Tipo de serviço é obrigatório"),
  sellerId: z.coerce.number().min(1, "Vendedor é obrigatório"),
  totalAmount: z.string().optional(),
  installments: z.coerce.number().min(1, "Número de parcelas deve ser pelo menos 1").default(1),
  notes: z.string().optional(),
  // Removida a validação de item mínimo para permitir edição de vendas sem itens
  items: z.array(saleItemSchema).default([]),
});

// Tipo SaleItem para tipagem de itens da venda
type SaleItem = {
  id?: number;
  serviceId: number;
  serviceTypeId: number;
  quantity: number;
  price: string;
  totalPrice: string;
  status?: string;
  notes?: string | null;
};

interface SaleDialogProps {
  open: boolean;
  onClose: () => void;
  sale?: Sale | null;
  saleId?: number;
  readOnly?: boolean;
  renderAdditionalContent?: () => React.ReactNode;
  onSaveSuccess?: () => void;
  /**
   * Força o modo de reenvio de venda devolvida.
   * Quando true, o componente tratará como um reenvio de venda com status "returned",
   * mesmo que no backend o status já tenha sido alterado.
   */
  forceResendMode?: boolean;
}

export default function SaleDialog({ 
  open, 
  onClose, 
  sale: propSale, 
  saleId,
  readOnly = false,
  renderAdditionalContent,
  onSaveSuccess,
  forceResendMode = false
}: SaleDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formInitialized = useRef(false);
  
  // Estados para controle de busca
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [sellerSearchTerm, setSellerSearchTerm] = useState("");
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0);
  const [selectedServiceQuantity, setSelectedServiceQuantity] = useState<number>(1);
  const [showCustomerPopover, setShowCustomerPopover] = useState(false);
  const [showSellerPopover, setShowSellerPopover] = useState(false);
  const [showServicePopover, setShowServicePopover] = useState(false);
  
  // Estado para armazenar a data original da venda (para preservação exata durante edições)
  const [originalSaleDate, setOriginalSaleDate] = useState<string | null>(null);
  
  // Estado para controlar o modal de cadastro de cliente
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  
  // Função para lidar com o cliente criado pelo CustomerDialog
  const handleCustomerDialogSuccess = (newCustomer: any) => {
    // Fechar o diálogo
    setShowCustomerDialog(false);
    
    // Atualizar a lista de clientes
    queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    
    // Se recebemos um cliente, atualizamos o formulário
    if (newCustomer && newCustomer.id) {
      // Atualiza o formulário com o novo cliente
      form.setValue("customerId", newCustomer.id);
      setCustomerSearchTerm(newCustomer.name);
      
      console.log("✅ Cliente criado e selecionado:", newCustomer.name, "id:", newCustomer.id);
    }
    
    toast({
      title: "Cliente cadastrado",
      description: "Cliente cadastrado e selecionado com sucesso",
      className: "top-toast",
    });
  };
  
  // Estados para controle das parcelas e datas de vencimento - aceitamos tanto Date quanto string no formato YYYY-MM-DD
  const [installmentDates, setInstallmentDates] = useState<(Date | string)[]>([]);
  const [firstDueDate, setFirstDueDate] = useState<Date | string>(addMonths(new Date(), 1));
  
  // Estado para rastrear o status original da venda (para identificar vendas devolvidas)
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);
  // Estado para rastrear o status financeiro da venda (para bloqueio de campos)
  const [financialStatus, setFinancialStatus] = useState<string | null>(null);
  // Estado para armazenar as observações de correção quando a venda está com status "returned"
  const [correctionNotes, setCorrectionNotes] = useState<string>("");
  
  // Já definido anteriormente
  
  /**
   * Função para determinar se os campos financeiros (valor, forma de pagamento, parcelas, datas) 
   * devem ser bloqueados para edição.
   * 
   * Os campos são bloqueados quando:
   * 1. O status financeiro é "in_progress" (processamento pelo setor financeiro)
   * 2. O status financeiro é "completed" (venda concluída financeiramente)
   * 3. A venda está sendo editada (não é um reenvio de venda devolvida)
   * 
   * @returns {boolean} Retorna true se os campos devem ser bloqueados, false caso contrário
   */
  const shouldBlockFinancialFields = (): boolean => {
    console.log("🔒 Verificando bloqueio de campos financeiros:", {
      financialStatus,
      originalStatus,
      forceResendMode
    });
    
    // Se a venda está em modo de reenvio (devolvida), não bloquear campos
    if (originalStatus === "returned" || forceResendMode) {
      console.log("🔓 Venda em modo de reenvio - campos liberados");
      return false;
    }
    
    // Bloqueia campos financeiros se:
    // 1. Venda estiver em processamento pelo departamento financeiro (financialStatus === "in_progress")
    // 2. Venda estiver sendo alterada (não é reenvio de venda devolvida ou forceResendMode)
    const isEditingExistingSale = !!sale?.id && originalStatus !== "returned" && !forceResendMode;
    const isInFinancialProcessing = financialStatus === "in_progress";
    
    const shouldBlock = isEditingExistingSale && isInFinancialProcessing;
    console.log("🔒 CONTROLE DE BLOQUEIO: isEditingExistingSale =", isEditingExistingSale, 
                "isInFinancialProcessing =", isInFinancialProcessing, 
                "shouldBlock =", shouldBlock);
    
    return shouldBlock;
  };

  // Consultas para obter dados relacionados
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error("Erro ao carregar clientes");
      }
      return response.json();
    }
  });
  
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Erro ao carregar usuários");
      }
      return response.json();
    }
  });
  
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["/api/payment-methods"],
    queryFn: async () => {
      const response = await fetch("/api/payment-methods");
      if (!response.ok) {
        throw new Error("Erro ao carregar formas de pagamento");
      }
      return response.json();
    }
  });
  
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error("Erro ao carregar serviços");
      }
      return response.json();
    }
  });
  
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["/api/service-types"],
    queryFn: async () => {
      const response = await fetch("/api/service-types");
      if (!response.ok) {
        throw new Error("Erro ao carregar tipos de serviço");
      }
      return response.json();
    }
  });
  
  // Valores padrão iniciais do formulário
  const defaultFormValues = {
    orderNumber: "",
    date: new Date(),
    customerId: 0,
    paymentMethodId: 0,
    serviceTypeId: 0,
    sellerId: user?.id || 0,
    totalAmount: "",
    installments: 1, // Padrão: pagamento à vista
    notes: "",
    items: [] // Sem item inicial, usuário precisa adicionar manualmente
  };
  
  // Efeito para resetar o estado quando o diálogo é aberto/fechado
  useEffect(() => {
    // Se o diálogo fecha, resetamos o estado
    if (!open) {
      formInitialized.current = false;
      console.log("🔄 Diálogo fechado, estado resetado");
    }
  }, [open]);
  
  // Formulário
  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: defaultFormValues
  });
  
  // Field array para os itens da venda
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });
  
  // Consulta para obter a venda pelo ID
  const { data: sale = null, isLoading: isLoadingSale } = useQuery({
    queryKey: ["/api/sales", saleId],
    queryFn: async () => {
      if (!saleId) {
        console.log("⚠️ Sem ID da venda, usando propSale:", propSale);
        return propSale || null;
      }
      
      try {
        console.log("🔍 Buscando venda com ID:", saleId);
        const response = await fetch(`/api/sales/${saleId}`);
        
        if (!response.ok) {
          console.error("❌ Erro ao carregar venda:", response.status);
          throw new Error("Erro ao carregar venda");
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("❌ Resposta não é JSON:", contentType);
          throw new Error("Resposta inválida da API");
        }
        
        const saleData = await response.json();
        console.log("✅ DADOS DA VENDA CARREGADOS:", JSON.stringify(saleData, null, 2));
        
        // Verifica se temos os dados mínimos necessários
        console.log("Verificando campos da venda:");
        console.log("orderNumber:", saleData.orderNumber);
        console.log("date:", saleData.date);
        console.log("customerId:", saleData.customerId);
        console.log("paymentMethodId:", saleData.paymentMethodId);
        console.log("serviceTypeId:", saleData.serviceTypeId);
        console.log("sellerId:", saleData.sellerId);
        
        return saleData;
      } catch (error) {
        console.error("❌ ERRO CRÍTICO ao carregar venda:", error);
        throw error;
      }
    },
    enabled: !!saleId,
    initialData: propSale || null,
    staleTime: 0, // Não usar cache
    refetchOnWindowFocus: false // Não refazer a consulta quando a janela ganha foco
  });

  // Consulta para obter os itens da venda ao editar
  const { data: saleItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["/api/sales", sale?.id || saleId, "items"],
    queryFn: async () => {
      const id = sale?.id || saleId;
      if (!id) {
        console.log("⚠️ Sem ID para buscar itens");
        return [];
      }
      
      try {
        console.log("🔍 Buscando itens da venda com ID:", id);
        const response = await fetch(`/api/sales/${id}/items`);
        
        if (!response.ok) {
          console.error("❌ Erro ao carregar itens da venda:", response.status);
          throw new Error("Erro ao carregar itens da venda");
        }
        
        const data = await response.json();
        console.log("✅ ITENS DA VENDA CARREGADOS:", JSON.stringify(data, null, 2));
        return data;
      } catch (error) {
        console.error("❌ ERRO ao carregar itens da venda:", error);
        throw error;
      }
    },
    enabled: !!(sale?.id || saleId),
    staleTime: 0,
    refetchOnWindowFocus: false
  });
  
  // Consulta para obter as parcelas da venda ao editar
  const { data: saleInstallments = [] } = useQuery({
    queryKey: ["/api/sales", sale?.id || saleId, "installments"],
    queryFn: async () => {
      const id = sale?.id || saleId;
      if (!id) return [];
      const response = await fetch(`/api/sales/${id}/installments`);
      if (!response.ok) {
        throw new Error("Erro ao carregar parcelas da venda");
      }
      return response.json();
    },
    enabled: !!(sale?.id || saleId)
  });
  
  // Não precisamos mais da mutation de criar cliente, pois usaremos o CustomerDialog

  // Filtra clientes com base no termo de busca
  const filteredCustomers = customers.filter((customer: any) => {
    const nameMatch = customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase());
    const documentMatch = customer.document.toLowerCase().includes(customerSearchTerm.toLowerCase());
    return nameMatch || documentMatch;
  });

  // Mostra todos os usuários para perfis admin, supervisor, operacional e financeiro
  // Para perfil vendedor, mostra apenas ele mesmo
  const sellers = user?.role === 'vendedor'
    ? users.filter((u: any) => u.id === user.id)
    : users;
  
  const filteredSellers = sellers.filter((seller: any) => 
    seller.username.toLowerCase().includes(sellerSearchTerm.toLowerCase())
  );
  
  // Filtra serviços com base no termo de busca
  const filteredServices = services.filter((service: any) =>
    service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
  );

  // Função para gerar as datas de vencimento com base na data do primeiro vencimento
  const generateInstallmentDates = (firstDate: Date | string, numberOfInstallments: number) => {
    const dates = [];
    
    // A primeira data pode ser um objeto Date ou uma string no formato YYYY-MM-DD
    if (typeof firstDate === 'string') {
      // Se for string, usar diretamente
      dates.push(firstDate);
      
      // Para as próximas parcelas, precisamos converter para Date temporariamente para calcular
      const parts = firstDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        
        const tempDate = new Date(year, month, day);
        
        for (let i = 1; i < numberOfInstallments; i++) {
          // Adiciona um mês para cada parcela subsequente
          const nextDate = addMonths(tempDate, i);
          // Converte de volta para string no formato YYYY-MM-DD
          dates.push(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`);
        }
      }
    } else {
      // Se for objeto Date, converter para string YYYY-MM-DD para evitar problemas de timezone
      const fixedDate = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, '0')}-${String(firstDate.getDate()).padStart(2, '0')}`;
      dates.push(fixedDate);
      
      for (let i = 1; i < numberOfInstallments; i++) {
        // Adiciona um mês para cada parcela subsequente
        const nextDate = addMonths(firstDate, i);
        // Converte para string no formato YYYY-MM-DD
        dates.push(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`);
      }
    }
    
    return dates;
  };
  
  // Efeito para atualizar as datas de vencimento quando o número de parcelas muda
  useEffect(() => {
    const installmentsValue = form.getValues("installments");
    if (installmentsValue > 1) {
      const dates = generateInstallmentDates(firstDueDate, installmentsValue);
      setInstallmentDates(dates);
    } else {
      setInstallmentDates([]);
    }
  }, [form.watch("installments"), firstDueDate]);
  
  // Efeito para monitorar quando a venda muda ou o ID muda
  // Efeito para preencher o formulário com os dados da venda quando ela estiver disponível
  useEffect(() => {
    // Verifica se temos uma venda atual (através de 'sale' ou 'saleId')
    const currentSale = sale || (saleId ? { id: saleId } : null);
    
    if (currentSale && open && !formInitialized.current) {
      console.log("🔄 Preenchendo formulário com dados da venda:", currentSale.id);
      
      // SOLUÇÃO DEFINITIVA - 30/04/2025 - Preservar a data original da venda para edição
      if (sale && sale.date) {
        console.log("🔴 CORREÇÃO DE DATA: Armazenando data original da venda:", sale.date);
        console.log("🔴 Tipo de data original:", typeof sale.date);
        setOriginalSaleDate(sale.date);
      }
      
      // Para vendas carregadas por props
      if (sale) {
        // Atualizamos todos os campos do formulário com os dados da venda
        form.setValue("orderNumber", sale.orderNumber || "");
        
        // Tratamento especial para a data, garantindo que seja preservada exatamente como está
        if (sale.date) {
          console.log("📅 Data original da venda:", sale.date);
          form.setValue("date", sale.date);
        } else {
          console.log("📅 Sem data na venda, usando data atual");
          form.setValue("date", new Date());
        }
        
        form.setValue("customerId", sale.customerId || 0);
        form.setValue("paymentMethodId", sale.paymentMethodId || 0);
        form.setValue("serviceTypeId", sale.serviceTypeId || 0);
        form.setValue("sellerId", sale.sellerId || user?.id || 0);
        form.setValue("totalAmount", sale.totalAmount || "");
        form.setValue("installments", sale.installments || 1);
        form.setValue("notes", sale.notes || "");
        
        // Atualiza os estados relacionados
        setOriginalStatus(sale.status);
        setFinancialStatus(sale.financialStatus);
        setOriginalSaleDate(sale.date);
        
        // Se há dados do cliente, atualiza o campo de busca
        const selectedCustomer = customers.find(c => c.id === sale.customerId);
        if (selectedCustomer) {
          setCustomerSearchTerm(selectedCustomer.name);
        }
      }
      
      // Marca que o formulário foi inicializado
      formInitialized.current = true;
      console.log("✅ Formulário preenchido com sucesso");
    }
  }, [sale, open, form, customers, user, saleId]);

  // Função auxiliar para atualizar os itens - Implementação Forçada
  const updateFormItems = useCallback((items: any[]) => {
    if (!items || items.length === 0) {
      console.log("🚫 Sem itens para atualizar no formulário");
      return;
    }
    
    console.log("🔄 FORÇA-RESET: Atualizando itens no formulário:", items);
    
    try {
      // Estratégia otimizada - definir todos os itens de uma vez
      const formattedItems = items.map((item: SaleItem) => ({
        serviceId: item.serviceId,
        serviceTypeId: item.serviceTypeId || (sale?.serviceTypeId) || 1,
        quantity: item.quantity || 1,
        notes: item.notes || "",
        price: item.price || "0",
        totalPrice: item.totalPrice || item.price || "0",
        status: "pending"
      }));
      
      // Define diretamente os itens no formulário, sem operações individuais de remoção/adição
      form.setValue("items", formattedItems);
      
      console.log("✅ FORÇA-RESET: Todos os itens foram atualizados com uma única operação");
      
      // Limpa os campos anteriores e adiciona os novos
      setTimeout(() => {
        const currentItems = fields || [];
        if (currentItems.length > 0) {
          // Remove todos os itens existentes
          for (let i = currentItems.length - 1; i >= 0; i--) {
            remove(i);
          }
          
          // Adiciona os novos itens em uma nova chamada
          setTimeout(() => {
            formattedItems.forEach(item => {
              append(item);
            });
          }, 50);
        } else {
          // Se não tiver itens, apenas adiciona
          formattedItems.forEach(item => {
            append(item);
          });
        }
      }, 10);
      
    } catch (error) {
      console.error("❌ FORÇA-RESET: Erro ao atualizar itens:", error);
    }
  }, [form, sale, fields, remove, append]);
  
  // Controle para execução única da atualização de itens
  const itemsWereProcessed = useRef(false);
  const [renderReady, setRenderReady] = useState(false);
  
  // SOLUÇÃO DEFINITIVA 2023: Sistema simples e direto para carregamento de itens
  // Este efeito roda apenas UMA vez por abertura de diálogo
  useEffect(() => {
    // Se o diálogo não estiver aberto, não fazemos nada
    if (!open) {
      itemsWereProcessed.current = false;
      setRenderReady(false);
      return;
    }
    
    // Se não temos o que precisamos para processar itens, saímos
    if (!sale || isLoadingItems || !saleItems || itemsWereProcessed.current) {
      console.log("⏭️ Pulando processamento de itens: condições não atendem os requisitos", {
        hasSale: !!sale,
        isLoading: isLoadingItems,
        hasSaleItems: !!saleItems && Array.isArray(saleItems),
        itemCount: saleItems?.length || 0,
        alreadyProcessed: itemsWereProcessed.current
      });
      return;
    }
    
    console.log("🔄 SOLUÇÃO DEFINITIVA - Iniciando processamento único de itens");
    console.log("🔄 SOLUÇÃO DEFINITIVA - Itens a processar:", saleItems);
    
    // Marcamos que estamos processando para evitar duplicações
    itemsWereProcessed.current = true;
    setRenderReady(false);
    
    // Solução definitiva - processo único com timeout para garantir sequência
    setTimeout(() => {
      try {
        // 1. Limpamos completamente o campo de itens
        form.setValue("items", []);
        
        // Limpamos todos os itens do FieldArray
        const fieldsLength = fields.length;
        if (fieldsLength > 0) {
          for (let i = fieldsLength - 1; i >= 0; i--) {
            remove(i);
          }
          console.log("🧹 SOLUÇÃO DEFINITIVA - Todos os itens anteriores foram removidos");
        }
        
        // 2. Convertemos os itens para o formato correto
        const formattedItems = saleItems.map((item: SaleItem) => ({
          id: item.id, // Preservar ID original
          serviceId: item.serviceId,
          serviceTypeId: item.serviceTypeId || (sale?.serviceTypeId) || 1,
          quantity: item.quantity || 1,
          notes: item.notes || "",
          price: item.price || "0",
          totalPrice: item.totalPrice || item.price || "0",
          status: item.status || "pending"
        }));
        
        // Depois de um timeout para garantir que a limpeza terminou
        setTimeout(() => {
          // 3. Adicionamos apenas os itens originais, garantindo que não haja duplicação
          if (formattedItems.length > 0) {
            formattedItems.forEach(item => {
              append(item);
            });
            console.log("✅ SOLUÇÃO DEFINITIVA - Itens adicionados com sucesso:", formattedItems.length);
          } else {
            console.log("⚠️ SOLUÇÃO DEFINITIVA - Sem itens para adicionar");
          }
          
          // 4. Marcamos como concluído e ativamos a renderização
          setRenderReady(true);
        }, 100);
        
      } catch (error) {
        console.error("❌ SOLUÇÃO DEFINITIVA - Erro processando itens:", error);
        setRenderReady(true);
      }
    }, 100);
    
    // Limpeza ao desmontar
    return () => {
      if (!open) {
        itemsWereProcessed.current = false;
        setRenderReady(false);
      }
    };
  }, [open, sale?.id, saleItems, isLoadingItems]);
  
  // Função auxiliar para obter o nome do serviço pelo ID
  const getServiceNameById = (serviceId: number): string => {
    const service = services.find((s: any) => s.id === serviceId);
    return service ? service.name : `Serviço #${serviceId}`;
  };
  
  // Função auxiliar para obter o nome do tipo de serviço pelo ID
  const getServiceTypeNameById = (serviceTypeId: number): string => {
    const serviceType = serviceTypes.find((t: any) => t.id === serviceTypeId);
    return serviceType ? serviceType.name : `Tipo #${serviceTypeId}`;
  };

  // Funções auxiliares para renderização de componentes
  
  // Efeito para inicializar o formulário quando a venda está disponível
  useEffect(() => {
    // Resetar o formInitialized quando o diálogo fecha
    if (!open) {
      formInitialized.current = false;
      return;
    }
    
    // Inicializamos o formulário quando a venda está disponível
    // Sempre recarregamos para garantir que tudo esteja atualizado
    if (open && !isLoadingSale && sale) {
      console.log("📋 INICIALIZANDO FORMULÁRIO COM DADOS DA VENDA:");
      console.log(JSON.stringify(sale, null, 2));
      console.log("📋 Detalhes da venda para formulário:");
      console.log("- orderNumber:", sale.orderNumber);
      console.log("- date:", sale.date);
      console.log("- customerId:", sale.customerId);
      console.log("- paymentMethodId:", sale.paymentMethodId);
      console.log("- serviceTypeId:", sale.serviceTypeId);
      console.log("- sellerId:", sale.sellerId);
      console.log("- totalAmount:", sale.totalAmount);
      console.log("- installments:", sale.installments);
      console.log("- status:", sale.status);
      console.log("- saleItems:", saleItems);
      
      // Armazenar o status original da venda para verificações
      console.log("🔴 DEBUG STATUS: Definindo status original =", sale.status);
      console.log("💲 DEBUG STATUS FINANCEIRO: Definindo status financeiro =", sale.financialStatus);
      
      // Captura o status financeiro para controle de bloqueio de campos
      setFinancialStatus(sale.financialStatus || null);
      
      // Se forceResendMode está ativo, forçamos o status para "returned" para tratar como reenvio
      // independentemente do status atual no banco de dados
      if (forceResendMode) {
        console.log("🔄 FORÇA REENVIO: Forçando modo de reenvio de venda devolvida");
        setOriginalStatus("returned");
      } else {
        setOriginalStatus(sale.status);
      }
      
      // Se a venda está com status "returned" ou forceResendMode está ativo, prepara campo de observações
      if (sale.status === "returned" || forceResendMode) {
        console.log("🔴 VENDA DEVOLVIDA DETECTADA: Preparando campo de observações para correção");
        setCorrectionNotes("");
      }
      
      // SOLUÇÃO COMPLETA E DEFINITIVA PARA TODOS OS PROBLEMAS DE PRESERVAÇÃO DE DADOS
      // Esta implementação preserva 100% dos dados originais sem nenhuma transformação
      setTimeout(() => {
        try {
          console.log("⚡ SOLUÇÃO DEFINITIVA - Dados originais da venda:", JSON.stringify(sale, null, 2));
          console.log("⚡ SOLUÇÃO DEFINITIVA - Itens originais:", JSON.stringify(saleItems, null, 2));
          console.log("⚡ SOLUÇÃO DEFINITIVA - Parcelas originais:", JSON.stringify(saleInstallments, null, 2));
          
          // --------- PARTE 1: PRESERVAÇÃO EXATA DOS ITENS ---------
          
          // Manter absolutamente todos os campos originais dos itens incluindo IDs
          const formattedItems = Array.isArray(saleItems) && saleItems.length > 0 
            ? saleItems.map((item: SaleItem) => {
                console.log("📦 Item original exato:", JSON.stringify(item, null, 2));
                
                // Copiar exatamente como está, sem nenhuma conversão
                return {
                  id: item.id, 
                  serviceId: item.serviceId,
                  serviceTypeId: item.serviceTypeId || sale.serviceTypeId || 1,
                  quantity: item.quantity || 1,
                  notes: item.notes || "",
                  price: item.price || "0",
                  totalPrice: item.totalPrice || item.price || "0",
                  status: item.status || "pending"
                };
              })
            : [];
            
          console.log("📦 Itens formatados sem nenhuma conversão:", JSON.stringify(formattedItems, null, 2));
          
          // --------- PARTE 2: DATA DA VENDA ---------
          
          // Preservar data exatamente como está no banco, sem conversão para objeto Date
          let dateValue;
          let originalDateString = "";
          
          if (typeof sale.date === 'string' && sale.date) {
            console.log("🗓️ Data original como string:", sale.date);
            originalDateString = sale.date;
            
            // Se tiver formato ISO (YYYY-MM-DD) ou com T (YYYY-MM-DDT00:00:00.000Z)
            if (sale.date.match(/^\d{4}-\d{2}-\d{2}(T.*)?$/)) {
              // Extrair apenas a parte da data YYYY-MM-DD
              const datePart = sale.date.split('T')[0];
              console.log("🗓️ Data original preservada (YYYY-MM-DD):", datePart);
              
              // Criar objeto Date sem timezone apenas para o form
              const [year, month, day] = datePart.split('-').map(Number);
              dateValue = new Date(year, month - 1, day);
            } else {
              // Tentar interpretar como está
              dateValue = new Date(sale.date);
            }
          } else {
            // Se não tiver data, usar data atual formatada
            originalDateString = new Date().toISOString().split('T')[0];
            dateValue = new Date();
          }
          
          console.log("🗓️ ⚠️ SUPER IMPORTANTE: Data original preservada:", originalDateString);
          console.log("🗓️ Data para formulário (pode ser ajustada pelo browser):", dateValue);
          
          // Guardar a data original em um estado local para usar no envio
          setOriginalSaleDate(originalDateString);
          
          // --------- PARTE 3: DEFINIR TODOS OS CAMPOS EXATAMENTE COMO ESTÃO ---------
          
          // Definir campos um por um, preservando tipos e valores originais
          console.log("📋 PRESERVAÇÃO TOTAL DE DADOS - Definindo campos exatamente como estão no original:");
          
          form.setValue("orderNumber", sale.orderNumber || "");
          form.setValue("date", dateValue);
          form.setValue("customerId", sale.customerId);
          form.setValue("paymentMethodId", sale.paymentMethodId);
          form.setValue("serviceTypeId", sale.serviceTypeId);
          form.setValue("sellerId", sale.sellerId);
          form.setValue("totalAmount", sale.totalAmount || "0");
          form.setValue("installments", sale.installments);
          form.setValue("notes", sale.notes || "");
          form.setValue("items", formattedItems);
          
          console.log("📋 Formulário resetado com valores:", {
            orderNumber: sale.orderNumber,
            customerId: sale.customerId,
            paymentMethodId: sale.paymentMethodId,
            serviceTypeId: sale.serviceTypeId,
            sellerId: sale.sellerId,
          });
        } catch (error) {
          console.error("❌ Erro ao resetar formulário:", error);
          toast({
            title: "Erro ao carregar venda",
            description: "Houve um erro ao carregar os dados da venda. Tente novamente.",
            variant: "destructive",
            className: "top-toast",
          });
        }
      }, 100); // Pequeno timeout para garantir que todos os dados estejam disponíveis

      // Encontra e define os nomes de cliente e vendedor para os campos de busca
      const selectedCustomer = customers.find((c: any) => c.id === sale.customerId);
      if (selectedCustomer) {
        setCustomerSearchTerm(selectedCustomer.name);
      }
      
      const selectedSeller = users.find((u: any) => u.id === sale.sellerId);
      if (selectedSeller) {
        setSellerSearchTerm(selectedSeller.username);
      }
      
      // Se temos um parcelamento, carregamos as datas de vencimento
      if (sale.installments > 1 && saleInstallments.length > 0) {
        // Ordenamos as parcelas por número da parcela
        const sortedInstallments = [...saleInstallments].sort((a: any, b: any) => a.installmentNumber - b.installmentNumber);
        
        // CORREÇÃO FINAL - HARD CODED - 26/04/2025
        // A primeira parcela define a data inicial de vencimento
        const firstInstallment = sortedInstallments.find((i: any) => i.installmentNumber === 1);
        if (firstInstallment) {
          console.log("🛑 CORREÇÃO FINAL - Data do banco (primeira parcela):", firstInstallment.dueDate);
          
          // Usar a data exatamente como está no banco ou converter manualmente sem timezone
          if (typeof firstInstallment.dueDate === 'string') {
            // Se já for string, usar diretamente (pode ser YYYY-MM-DD ou com T)
            let rawDate = firstInstallment.dueDate;
            
            // Se tiver T00:00:00, remover
            if (rawDate.includes('T')) {
              rawDate = rawDate.split('T')[0];
            }
            
            // Verificar se está no formato ISO (YYYY-MM-DD)
            if (rawDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              console.log("✅ SOLUÇÃO DEFINITIVA - Primeira data ISO válida:", rawDate);
              setFirstDueDate(rawDate);
            } else {
              console.log("⚠️ FORMATO INVÁLIDO - Tentando converter manualmente a primeira data:", rawDate);
              
              // Se não for ISO, tente extrair os componentes da data
              const parts = rawDate.split(/[-/]/);
              if (parts.length === 3) {
                // Verificar se o primeiro componente parece ser um ano (4 dígitos)
                if (parts[0].length === 4) {
                  // Já está no formato YYYY-MM-DD ou similar
                  const fixedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                  console.log("✅ SOLUÇÃO DEFINITIVA - Primeira data corrigida:", fixedDate);
                  setFirstDueDate(fixedDate);
                } else {
                  // Formato DD/MM/YYYY ou similar
                  const fixedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                  console.log("✅ SOLUÇÃO DEFINITIVA - Primeira data corrigida de DD/MM/YYYY:", fixedDate);
                  setFirstDueDate(fixedDate);
                }
              } else {
                // Se não conseguir converter, use a original
                setFirstDueDate(rawDate);
              }
            }
          } else {
            // Se for um objeto Date, converter cuidadosamente para string ISO
            try {
              // Garantir que temos uma data válida
              const date = new Date(firstInstallment.dueDate);
              if (isNaN(date.getTime())) {
                throw new Error("Data inválida");
              }
              
              // SUPER CORREÇÃO: Usar os valores brutos da data sem ajuste de timezone
              const year = date.getFullYear();
              const month = date.getMonth() + 1; // Mês começa em 0
              const day = date.getDate();
              
              // Verificar se os valores são números válidos
              if (isNaN(year) || isNaN(month) || isNaN(day) || year < 2000 || year > 2050) {
                throw new Error("Componentes de data inválidos");
              }
              
              const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              console.log("✅ SOLUÇÃO DEFINITIVA - Primeira data convertida com segurança:", formattedDate);
              setFirstDueDate(formattedDate);
            } catch (error) {
              console.error("❌ ERRO AO CONVERTER PRIMEIRA DATA:", error);
              console.log("⚠️ FALLBACK - Usando string ISO da data atual para primeira data");
              setFirstDueDate(new Date().toISOString().split('T')[0]);
            }
          }
        }
        
        // Carregamos todas as datas de vencimento das parcelas existentes como strings YYYY-MM-DD
        const dates = sortedInstallments.map((installment: any) => {
          console.log("🛑 CORREÇÃO FINAL - Data do banco (parcela):", installment.dueDate);
          
          // CORREÇÃO ABRIL 2025 - PROBLEMA DE FORMATO DE DATA
          // Usar a data exatamente como está no banco de dados sem nenhuma conversão
          if (typeof installment.dueDate === 'string') {
            // Se já for string, usar diretamente (pode ser YYYY-MM-DD ou com T)
            let rawDate = installment.dueDate;
            
            // Se tiver T00:00:00, remover
            if (rawDate.includes('T')) {
              rawDate = rawDate.split('T')[0];
            }
            
            // Verificar se está no formato ISO (YYYY-MM-DD)
            if (rawDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              console.log("✅ SOLUÇÃO DEFINITIVA - Data ISO válida:", rawDate);
              return rawDate;
            } else {
              console.log("⚠️ FORMATO INVÁLIDO - Tentando converter manualmente:", rawDate);
              
              // Se não for ISO, tente extrair os componentes da data
              const parts = rawDate.split(/[-/]/);
              if (parts.length === 3) {
                // Verificar se o primeiro componente parece ser um ano (4 dígitos)
                if (parts[0].length === 4) {
                  // Já está no formato YYYY-MM-DD ou similar
                  const fixedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                  console.log("✅ SOLUÇÃO DEFINITIVA - Data corrigida:", fixedDate);
                  return fixedDate;
                } else {
                  // Formato DD/MM/YYYY ou similar
                  const fixedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                  console.log("✅ SOLUÇÃO DEFINITIVA - Data corrigida de DD/MM/YYYY:", fixedDate);
                  return fixedDate;
                }
              }
              
              // Fallback - usar a data original
              return rawDate;
            }
          } else {
            // Se for um objeto Date, converter cuidadosamente para string ISO
            try {
              // Garantir que temos uma data válida
              const date = new Date(installment.dueDate);
              if (isNaN(date.getTime())) {
                throw new Error("Data inválida");
              }
              
              // SUPER CORREÇÃO: Usar os valores brutos da data sem ajuste de timezone
              const year = date.getFullYear();
              const month = date.getMonth() + 1; // Mês começa em 0
              const day = date.getDate();
              
              // Verificar se os valores são números válidos
              if (isNaN(year) || isNaN(month) || isNaN(day) || year < 2000 || year > 2050) {
                throw new Error("Componentes de data inválidos");
              }
              
              const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              console.log("✅ SOLUÇÃO DEFINITIVA - Data convertida com segurança:", formattedDate);
              return formattedDate;
            } catch (error) {
              console.error("❌ ERRO AO CONVERTER DATA:", error);
              console.log("⚠️ FALLBACK - Usando string ISO da data atual");
              return new Date().toISOString().split('T')[0];
            }
          }
        });
        
        console.log("🛑 CORREÇÃO FINAL - Datas das parcelas após processamento:", dates);
        
        // SUPER CORREÇÃO ABRIL 2025: Garantir que as datas são strings no formato YYYY-MM-DD
        // e que estão na ordem correta (um mês de diferença entre cada)
        const cleanedDates = dates.filter(date => 
          typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)
        );
        
        console.log("🧹 LIMPEZA DATAS - Datas após filtragem de formatos inválidos:", cleanedDates);
        
        // Se temos datas limpas, usamos. Caso contrário, recriamos a partir da primeira data
        if (cleanedDates.length === sortedInstallments.length) {
          console.log("✅ PRESERVAÇÃO TOTAL - Usando exatamente as datas originais:", cleanedDates);
          setInstallmentDates(cleanedDates);
        } else {
          console.warn("⚠️ RECRIAÇÃO PARCIAL - Algumas datas foram perdidas. Reconstruindo a partir da primeira data");
          
          // Pegar a primeira data válida como referência
          const firstValidDate = cleanedDates[0] || 
            (typeof firstDueDate === 'string' ? firstDueDate : new Date().toISOString().split('T')[0]);
          
          console.log("📆 RECRIAÇÃO - Usando primeira data como base:", firstValidDate);
          
          try {
            // Converter para objeto Date para calcular próximas datas
            const [year, month, day] = firstValidDate.split('-').map(Number);
            const baseDate = new Date(year, month - 1, day);
            
            // Criar array com todas as datas
            const recalculatedDates = [];
            for (let i = 0; i < sale.installments; i++) {
              const nextDate = new Date(baseDate);
              nextDate.setMonth(baseDate.getMonth() + i);
              
              const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
              recalculatedDates.push(nextDateStr);
            }
            
            console.log("📆 RECRIAÇÃO - Datas recalculadas:", recalculatedDates);
            setInstallmentDates(recalculatedDates);
          } catch (error) {
            console.error("❌ ERRO AO RECALCULAR DATAS:", error);
            setInstallmentDates(cleanedDates);
          }
        }
        
        console.log("Parcelas carregadas:", sortedInstallments.length);
      }
      
      formInitialized.current = true;
      console.log("Formulário inicializado com dados da venda e itens");
    }
  }, [sale, saleItems, saleInstallments, customers, users, form]);
  
  // Função para adicionar um item à venda
  const handleAddItem = () => {
    // Validação básica
    if (selectedServiceId <= 0) {
      toast({
        title: "Serviço não selecionado",
        description: "Selecione um serviço válido para adicionar",
        variant: "destructive",
        className: "top-toast",
      });
      return;
    }
    
    const serviceTypeId = form.getValues("serviceTypeId");
    if (!serviceTypeId || serviceTypeId <= 0) {
      toast({
        title: "Tipo de serviço não selecionado",
        description: "Selecione um tipo de execução válido antes de adicionar itens",
        variant: "destructive",
        className: "top-toast",
      });
      return;
    }
    
    // Adiciona o serviço (sem preço individual)
    append({
      serviceId: selectedServiceId,
      quantity: selectedServiceQuantity,
      notes: ""
    });
    
    // Reseta os valores para o próximo item
    setSelectedServiceId(0);
    setSelectedServiceQuantity(1);
    setServiceSearchTerm("");
    setShowServicePopover(false);
    
    toast({
      title: "Item adicionado",
      description: "Item adicionado com sucesso à venda",
      className: "top-toast" // Classe para posicionamento consistente
    });
  };

  // Função para criar novo cliente
  // Função não mais necessária, pois usaremos o CustomerDialog
  
  // Mutation para salvar a venda
  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof saleSchema>) => {
      setIsSubmitting(true);
      
      // SOLUÇÃO ULTRA-MEGA-RADICAL - 30/04/2025: FORÇAR método PATCH para edições
      // Três testes diferentes para garantir que é uma edição:
      // 1. Se temos ID na propriedade saleId passada para o componente
      // 2. Se temos objeto 'sale' com um id
      // 3. Se algum outro modo de edição for detectado
      const editingExistingSale = (!!saleId || !!sale?.id);
      const saleIdToUse = saleId || sale?.id; // Garantir que usamos o ID disponível
      console.log("📋 SOLUÇÃO ULTRA-MEGA-RADICAL - MÉTODO FORÇADO:", editingExistingSale ? "PATCH" : "POST", "ID da venda =", saleIdToUse);
      
      // Calcula o valor de cada parcela com base no valor total e número de parcelas
      const totalAmountValue = parseFloat(data.totalAmount?.replace(',', '.') || "0");
      const installmentValueCalculated = data.installments > 1 
        ? (totalAmountValue / data.installments).toFixed(2) 
        : null;
      
      // Formato ISO para data que será corretamente processado pelo servidor
      // Também converte o formato de número brasileiro (com vírgula) para o formato com ponto
      // Verificamos e convertemos, de forma MUITO cuidadosa, o número de parcelas
      const rawInstallmentsValue = data.installments;
      let parsedInstallments = 1; // Padrão para evitar problemas
      
      console.log(`🔧 CORREÇÃO - Valor bruto de parcelas: [${rawInstallmentsValue}], tipo: ${typeof rawInstallmentsValue}`);
      
      // Forçar a conversão para número
      if (typeof rawInstallmentsValue === 'number') {
        parsedInstallments = Number(rawInstallmentsValue);
      } else if (typeof rawInstallmentsValue === 'string') {
        parsedInstallments = Number(parseInt(rawInstallmentsValue, 10));
      }
      
      // SUPER GARANTIA de valor válido
      if (isNaN(parsedInstallments) || parsedInstallments < 1) {
        parsedInstallments = 1;
        console.log(`⚠️ ALERTA DE SEGURANÇA - Valor de parcelas inválido detectado e corrigido para 1`);
      }
      
      console.log(`✅ CORREÇÃO FINAL - Número de parcelas após validação: ${parsedInstallments}, tipo: ${typeof parsedInstallments}`);
      
      // Forçar que seja um número inteiro explicitamente, com Number()
      const finalInstallmentsNumber = Number(parsedInstallments);
      console.log(`✅ CORREÇÃO FINAL - Valor numérico final: ${finalInstallmentsNumber}, tipo: ${typeof finalInstallmentsNumber}`);
      
      // Garantia absoluta de que é um número válido
      const installmentsToSend = isNaN(finalInstallmentsNumber) ? 1 : finalInstallmentsNumber;
      
      // SOLUÇÃO DEFINITIVA PARA O PROBLEMA DE DATAS - 30/04/2025
      // USAR A DATA ORIGINAL EXATAMENTE COMO ESTAVA NO BANCO DE DADOS
      
      console.log("⚡⚡ SUPER IMPORTANTE ⚡⚡ - Usando data original preservada:", originalSaleDate);
      
      // Se temos uma data original preservada do banco, usamos ela exatamente como está
      // Caso contrário, formatamos a data atual
      let formattedDate;
      if (originalSaleDate) {
        // Usar exatamente a data que veio do banco sem nenhuma conversão
        formattedDate = originalSaleDate;
        console.log("🎯 DATA ORIGINAL PRESERVADA 100%:", formattedDate);
      } else if (data.date instanceof Date) {
        // Formato YYYY-MM-DD sem timezone
        formattedDate = `${data.date.getFullYear()}-${String(data.date.getMonth() + 1).padStart(2, '0')}-${String(data.date.getDate()).padStart(2, '0')}`;
        console.log("🛑 DATA VENDA FORMATADA MANUALMENTE:", formattedDate);
      } else {
        // Se já for string, mantém como está
        formattedDate = data.date;
        console.log("🛑 DATA VENDA JÁ É STRING:", formattedDate);
      }

      const formattedData = {
        ...data,
        date: formattedDate,
        totalAmount: data.totalAmount ? data.totalAmount.replace(',', '.') : "0",
        // SOLUÇÃO DEFINITIVA: Garantir que installments seja um número com várias camadas de segurança
        installments: installmentsToSend,
        // Calculamos o valor da parcela com base no valor total e número de parcelas
        installmentValue: installmentValueCalculated,
      };
      
      // Log especial para verificação final antes do envio
      console.log(`✅ VERIFICAÇÃO FINAL:
      - Número de parcelas original: ${data.installments}, tipo: ${typeof data.installments}
      - Número de parcelas processado: ${installmentsToSend}, tipo: ${typeof installmentsToSend}
      - Valor da parcela calculado: ${installmentValueCalculated}
      `);
      
      console.log("Debug - Dados formatados a serem enviados:", JSON.stringify(formattedData, null, 2));
      
      // 🔥 SOLUÇÃO DEFINITIVA 27/04/2025: Garantir que as datas das parcelas sejam exatamente as que o usuário informou
      // Pegamos as datas dos inputs de data diretamente
      let installmentDatesToSend = [];
      
      // 🔧 SOLUÇÃO FINAL: Obter todas as datas diretamente dos inputs no formato DD/MM/AAAA e converter para YYYY-MM-DD
      const allDateInputs = document.querySelectorAll('[data-installment-date]');
      
      console.log(`🔧 SOLUÇÃO FINAL: Encontrados ${allDateInputs.length} inputs de data para parcelas`);
      
      // Verificação adicional se há inputs de data disponíveis
      if (allDateInputs.length === 0) {
        console.log("⚠️ AVISO: Nenhum input de data encontrado no DOM");
      }
      
      // Converter para array e mapear para obter os valores, convertendo de DD/MM/AAAA para YYYY-MM-DD
      installmentDatesToSend = Array.from(allDateInputs).map(input => {
        const inputElement = input as HTMLInputElement;
        const value = inputElement.value;
        const installmentNumber = inputElement.getAttribute('data-installment-number');
        
        console.log(`🔧 SOLUÇÃO FINAL: Parcela #${installmentNumber} - Data lida do input: "${value}"`);
        
        // Converter de DD/MM/AAAA para YYYY-MM-DD
        if (value && value.includes('/')) {
          const parts = value.split('/');
          if (parts.length === 3) {
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2];
            
            // Validar os componentes da data
            if (!/^\d{1,2}$/.test(parts[0]) || !/^\d{1,2}$/.test(parts[1])) {
              console.log(`⚠️ ERRO: Formato de dia ou mês inválido em "${value}"`);
              return null;
            }
            
            // Validar e padronizar o ano
            if (parts[2].length === 2) {
              year = `20${parts[2]}`;
            } else if (parts[2].length !== 4 || !/^\d{2,4}$/.test(parts[2])) {
              console.log(`⚠️ ERRO: Formato de ano inválido em "${value}"`);
              return null;
            }
            
            // Validar limites de dia e mês
            const dayNum = parseInt(day, 10);
            const monthNum = parseInt(month, 10);
            
            if (dayNum < 1 || dayNum > 31) {
              console.log(`⚠️ ERRO: Dia inválido (${dayNum}) em "${value}"`);
              return null;
            }
            
            if (monthNum < 1 || monthNum > 12) {
              console.log(`⚠️ ERRO: Mês inválido (${monthNum}) em "${value}"`);
              return null;
            }
            
            // Formatar como YYYY-MM-DD para o banco de dados
            const isoDate = `${year}-${month}-${day}`;
            console.log(`✅ Data convertida com sucesso: "${value}" -> "${isoDate}"`);
            return isoDate;
          } else {
            console.log(`⚠️ ERRO: Formato inválido, não tem 3 partes separadas por / em "${value}"`);
          }
        }
        
        // Verificar se já está no formato YYYY-MM-DD
        if (value && value.includes('-') && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.log(`✅ Data já está no formato correto: "${value}"`);
          return value;
        }
        
        console.log(`⚠️ ERRO: Formato desconhecido ou inválido: "${value}"`);
        return null;
      }).filter(date => date !== null); // Remover datas inválidas
      
      console.log(`🔧 SOLUÇÃO FINAL: Total de ${installmentDatesToSend.length} datas válidas coletadas diretamente dos inputs`);
      
      // Se não temos datas suficientes ou válidas, geramos novas como fallback
      if (installmentDatesToSend.length === 0 || installmentDatesToSend.length !== data.installments) {
        console.log("⚠️ SOLUÇÃO DEFINITIVA: Preciso gerar datas porque os inputs não forneceram o necessário");
        const firstDate = firstDueDate || new Date(); // Usa a data selecionada ou a atual
        installmentDatesToSend = generateInstallmentDates(firstDate, data.installments).map(date => {
          if (typeof date === 'string') {
            return date;
          } else {
            // Converter Date para string YYYY-MM-DD sem ajuste de timezone
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          }
        });
        console.log(`⚠️ SOLUÇÃO DEFINITIVA: Geradas ${installmentDatesToSend.length} novas datas para ${data.installments} parcelas`);
      }
      
      // SOLUÇÃO FINAL: Adicionar as datas das parcelas no formato correto para o backend
      // Adicionamos a propriedade para o backend
      // @ts-ignore - Ignoramos o erro de tipo porque sabemos que o backend espera essa propriedade
      formattedData.installmentDates = installmentDatesToSend;
      
      // CORREÇÃO ULTRA-MEGA-RADICAL FINAL 30/04/2025: FORÇAR ID da venda para edição
      if (editingExistingSale) {
        // @ts-ignore - Ignorar erro de tipos, sabemos que é seguro
        formattedData.id = saleIdToUse;
        console.log("🔄 MODO EDIÇÃO 100% GARANTIDO - ID da venda incluído:", saleIdToUse);
      }
      
      // 🛑🛑🛑 SUPER CORREÇÃO - 26/04/2025
      // Verificação extrema do tipo e valor das parcelas
      console.log("🔄 CORREÇÃO EXTREMA - Seleção de parcelas alterada para:", data.installments, "tipo:", typeof data.installments);
      
      // Forçar conversão para número inteiro
      const numInstalments = typeof data.installments === 'string' 
        ? parseInt(data.installments) 
        : (typeof data.installments === 'number' ? Math.floor(data.installments) : 1);
        
      console.log("🔄 CORREÇÃO EXTREMA - Valor após processamento:", numInstalments, "tipo:", typeof numInstalments);
      
      // Aplicar o valor correto diretamente no form data
      formattedData.installments = numInstalments;
      
      console.log("🔄 VERIFICAÇÃO CRÍTICA - Valor atual no form:", formattedData.installments, "tipo:", typeof formattedData.installments);
      
      // Verificação final para garantir consistência
      console.log("🔄 DADOS FINAIS DO FORMULÁRIO:", "Parcelas:", data.installments, "Tipo esperado:", "number", "Valor atual no form:", formattedData.installments, "Tipo atual no form:", typeof formattedData.installments);
      
      // 🛑 CORREÇÃO CRÍTICA: Usar as datas editadas pelo usuário
      // Verificar se temos datas já salvas pelos inputs de data
      console.log("Verificando datas de parcelas disponíveis na interface...");
      
      // 🔧 SOLUÇÃO FINAL 2: PRIORIZAR as datas capturadas dos inputs
      // Se temos datas capturadas dos inputs, usar essas prioritariamente
      if (installmentDatesToSend && installmentDatesToSend.length > 0) {
        console.log(`✅ PRIORIDADE 1: Usando as ${installmentDatesToSend.length} datas coletadas diretamente dos inputs`);
          
        // Verificar se temos o número correto de datas
        if (installmentDatesToSend.length !== numInstalments) {
          console.log(`⚠️ ALERTA: Número de datas coletadas (${installmentDatesToSend.length}) diferente do número de parcelas (${numInstalments})`);
          
          // Se temos mais datas que parcelas, usar apenas as primeiras
          if (installmentDatesToSend.length > numInstalments) {
            console.log("✂️ Recortando excesso de datas");
            installmentDatesToSend = installmentDatesToSend.slice(0, numInstalments);
          } 
          // Se temos menos datas que parcelas, tentar usar datas do estado e depois gerar faltantes
          else {
            console.log("➕ Tentando completar com datas do estado ou gerando novas");
            // Criar uma cópia para não modificar o original
            const datesToUse = [...installmentDatesToSend]; 
            
            // Verificar se temos datas no estado para completar
            if (installmentDates && installmentDates.length > 0) {
              console.log(`🔍 Encontradas ${installmentDates.length} datas no estado para possível complemento`);
              
              // Adicionar datas que faltam a partir do estado
              for (let i = datesToUse.length; i < numInstalments && i < installmentDates.length; i++) {
                const stateDate = installmentDates[i];
                let isoDate;
                
                if (typeof stateDate === 'string') {
                  // Se já é string, usar diretamente
                  isoDate = stateDate.includes('T') ? stateDate.split('T')[0] : stateDate;
                } else if (stateDate instanceof Date) {
                  // Converter Date para string YYYY-MM-DD
                  isoDate = `${stateDate.getFullYear()}-${String(stateDate.getMonth() + 1).padStart(2, '0')}-${String(stateDate.getDate()).padStart(2, '0')}`;
                }
                
                if (isoDate) {
                  datesToUse.push(isoDate);
                  console.log(`➕ Adicionada data do estado: ${isoDate}`);
                }
              }
            }
            
            // Se ainda faltam datas, gerar novas
            if (datesToUse.length < numInstalments) {
              console.log("🔄 Gerando datas adicionais para completar");
              
              // Determinar data base para geração - usar a última data que temos ou data atual
              let baseDate: Date;
              if (datesToUse.length > 0) {
                // Tentar usar a última data que temos como base
                const lastDate = datesToUse[datesToUse.length - 1];
                // Converter string YYYY-MM-DD para Date
                const parts = lastDate.split('-');
                if (parts.length === 3) {
                  baseDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                } else {
                  baseDate = new Date(); // Fallback para data atual
                }
              } else {
                baseDate = new Date(); // Usar data atual se não temos nenhuma data
              }
              
              // Gerar as datas faltantes
              for (let i = datesToUse.length; i < numInstalments; i++) {
                const dueDate = new Date(baseDate);
                dueDate.setMonth(baseDate.getMonth() + (i - datesToUse.length + 1));
                // Converter para string YYYY-MM-DD
                const isoDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
                datesToUse.push(isoDate);
                console.log(`➕ Gerada nova data: ${isoDate}`);
              }
            }
            
            // Atualizar as datas a serem enviadas
            installmentDatesToSend = datesToUse;
          }
          
          console.log(`✓ Final: Usando ${installmentDatesToSend.length} datas após ajustes`);
        }
        
        // @ts-ignore - Atribuir ao objeto a ser enviado
        formattedData.installmentDates = installmentDatesToSend;
      }
      // Se não temos dados dos inputs, tentar usar as datas do estado
      else if (installmentDates && installmentDates.length > 0) {
        console.log(`✅ PRIORIDADE 2: Usando as ${installmentDates.length} datas do estado`);
        
        // Preparar as datas do estado
        let datesToUse = installmentDates.map(date => {
          if (typeof date === 'string') {
            // Se já é string, normalizar para YYYY-MM-DD
            return date.includes('T') ? date.split('T')[0] : date;
          } else if (date instanceof Date) {
            // Converter Date para string YYYY-MM-DD
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          }
          // Caso não seja string nem Date, retornar null (será filtrado depois)
          return null;
        }).filter(Boolean); // Remover valores null/undefined
        
        // Ajustar a quantidade de datas para o número de parcelas
        if (datesToUse.length > numInstalments) {
          console.log("✂️ Recortando excesso de datas do estado");
          datesToUse = datesToUse.slice(0, numInstalments);
        } else if (datesToUse.length < numInstalments) {
          console.log("➕ Gerando datas adicionais para completar");
          
          // Usar a última data como base ou data atual
          const baseDate = datesToUse.length > 0 
            ? (() => {
                const lastDate = datesToUse[datesToUse.length - 1] as string;
                const parts = lastDate.split('-');
                return parts.length === 3 
                  ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])) 
                  : new Date();
              })()
            : new Date();
          
          // Gerar as datas faltantes
          for (let i = datesToUse.length; i < numInstalments; i++) {
            const dueDate = new Date(baseDate);
            dueDate.setMonth(baseDate.getMonth() + (i - datesToUse.length + 1));
            // Converter para string YYYY-MM-DD
            const isoDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
            datesToUse.push(isoDate);
            console.log(`➕ Gerada nova data complementar: ${isoDate}`);
          }
        }
        
        // @ts-ignore - Atribuir ao objeto a ser enviado
        formattedData.installmentDates = datesToUse;
      }
      // Se não temos nenhuma data, gerar todas automaticamente
      else {
        console.log("⚠️ PRIORIDADE 3: Nenhuma data encontrada, gerando automaticamente");
        
        const generatedDates = [];
        const baseDate = new Date();
        
        for (let i = 0; i < numInstalments; i++) {
          const dueDate = new Date(baseDate);
          dueDate.setMonth(baseDate.getMonth() + i);
          // Converter para string YYYY-MM-DD
          const isoDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
          generatedDates.push(isoDate);
          console.log(`➕ Gerada nova data automática: ${isoDate}`);
        }
        
        // @ts-ignore - Atribuir ao objeto a ser enviado
        formattedData.installmentDates = generatedDates;
      }
      
      console.log("📆 Datas de parcelas finais:", formattedData.installmentDates);
      
      // 🚀🚀🚀 ULTRA BYPASS (27/04/2025): 
      // Usar o novo endpoint de bypass que ignora completamente o Zod/Drizzle e executa SQL diretamente
      console.log("🚀🚀🚀 ULTRA BYPASS: Verificando se é edição...");
      
      // Log para debug do payload
      console.log("Payload completo da venda:", JSON.stringify(formattedData, null, 2));

      // SOLUÇÃO DEFINITIVA V2 - 30/04/2025: Usar o mesmo critério que já usamos antes
      // Sem ambiguidade, baseado no editingExistingSale que é determinado 100% pelo parâmetro saleId
      const isSaleBeingEdited = editingExistingSale;
      
      // SUPER IMPORTANTE - Log para rastrear quando estamos em edição
      console.log("🔑🔑🔑 CONTROLE DE EDIÇÃO V2 - isSaleBeingEdited =", isSaleBeingEdited);
      console.log("🔑 ID de venda =", saleId);
      console.log("🔑 Modo 100% confirmado:", editingExistingSale ? "EDIÇÃO" : "CRIAÇÃO");
      
      if (!isSaleBeingEdited) {
        console.log("🚀 É uma NOVA venda, podemos tentar usar o ULTRA BYPASS...");
        try {
          // Primeiramente, tentar com o ULTRA BYPASS (APENAS PARA NOVAS VENDAS)
          const bypassResponse = await fetch("/api/ultra-bypass/sales", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedData),
          });
          
          if (bypassResponse.ok) {
            console.log("🚀🚀🚀 ULTRA BYPASS: Sucesso! Venda criada via bypass");
            const bypassSale = await bypassResponse.json();
            return bypassSale;
          } else {
            const error = await bypassResponse.json();
            console.error("🚀🚀🚀 ULTRA BYPASS: Erro:", error);
            console.log("Vamos tentar com a abordagem normal como fallback...");
          }
        } catch (bypassError) {
          console.error("🚀🚀🚀 ULTRA BYPASS: Exceção:", bypassError);
          console.log("Tentando abordagem normal como fallback devido à exceção...");
        }
      } else {
        console.log("⚠️⚠️⚠️ É uma EDIÇÃO, vamos usar OBRIGATORIAMENTE o método PATCH padrão");
      }
      
      // Fallback: usar a abordagem normal/original se o bypass falhar
      console.log("⚠️ Usando abordagem normal como fallback...");
      
      // SOLUÇÃO ULTRA-MEGA-RADICAL 30/04/2025: Simplificar completamente a lógica de edição
      // Se estamos editando, usar o ID que armazenamos anteriormente
      // Este é o ÚNICO local confiável para o ID da venda em edição
      const finalSaleId = editingExistingSale ? saleIdToUse : null;
      console.log("🔑 ID DA VENDA PARA EDIÇÃO (ULTRA-MEGA-SIMPLIFICADO):", finalSaleId);
      
      const url = finalSaleId ? `/api/sales/${finalSaleId}` : "/api/sales";
      const method = finalSaleId ? "PATCH" : "POST";
      
      console.log(`🛠️ MODO DE OPERAÇÃO: ${method} para URL ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao salvar venda");
      }
      
      const savedSale = await response.json();
      console.log("Venda salva via método normal (fallback):", savedSale);
      
      // IMPLEMENTAÇÃO RADICAL (27/04/2025): 
      // Não precisamos mais criar parcelas separadamente, já que a rota POST /api/sales agora cuida disso
      console.log("✅ IMPLEMENTAÇÃO RADICAL: Parcelas são criadas automaticamente pelo backend");
      
      return savedSale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: sale ? "Venda atualizada" : "Venda criada",
        description: sale ? "Venda atualizada com sucesso" : "Venda criada com sucesso",
      });
      setIsSubmitting(false);
      onSaveSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar venda",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });
  
  // Submit do formulário
  const onSubmit = (values: z.infer<typeof saleSchema>) => {
    try {
      // Logs detalhados para debug
      console.log("Formulário validado com sucesso!");
      console.log("Valores do formulário:", values);
      console.log("Número de itens:", values.items.length);
      
      // Verificação adicional do número de parcelas antes do envio
      console.log("⚠️ IMPORTANTE! Verificando número de parcelas no onSubmit:", values.installments);
      console.log("⚠️ Tipo do valor de parcelas:", typeof values.installments);
      
      // Verificação completa dos campos
      if (!values.orderNumber) {
        toast({
          title: "Número de OS obrigatório",
          description: "Por favor, preencha o número da OS",
          variant: "destructive",
        });
        return;
      }
      
      if (values.customerId <= 0) {
        toast({
          title: "Cliente não selecionado",
          description: "Selecione um cliente válido",
          variant: "destructive",
        });
        return;
      }
      
      if (values.sellerId <= 0) {
        toast({
          title: "Vendedor não selecionado",
          description: "Selecione um vendedor válido",
          variant: "destructive",
        });
        return;
      }
      
      if (values.items.length === 0) {
        toast({
          title: "Nenhum item adicionado",
          description: "Adicione pelo menos um item à venda",
          variant: "destructive",
        });
        return;
      }
      
      // CORREÇÃO CRÍTICA: Garante que o número de parcelas seja sempre um número inteiro válido
      // Este campo está sendo processado incorretamente no servidor, por isso estamos realizando
      // múltiplas validações e logs para diagnóstico do problema
      
      // SOLUÇÃO DEFINITIVA PARA PARCELAS
      console.log("🔴 SUPER-SOLUÇÃO INICIADA PARA PARCELAS 🔴");
      
      // Vamos FORÇAR um valor padrão seguro
      let validatedInstallments = 1; // Valor padrão absolutamente seguro
      const rawInstallments = values.installments;
      
      console.log("🔴 DIAGNÓSTICO DE PARCELAS 🔴");
      console.log("🔴 VALOR ORIGINAL:", rawInstallments);
      console.log("🔴 TIPO DO VALOR:", typeof rawInstallments);
      console.log("🔴 REPRESENTAÇÃO JSON:", JSON.stringify(rawInstallments));
      console.log("🔴 VALORES DISPONÍVEIS NO FORM:", form.getValues());
      
      // Nova abordagem ultra-agressiva para garantir um valor
      // Se não temos valor explícito no formulário, vamos buscar em outros lugares
      if (rawInstallments === undefined || rawInstallments === null) {
        console.log("🔴 ERRO CRÍTICO: Valor de parcelas ausente, implementando soluções alternativas");
        
        // Solução #1: Verificar o campo diretamente via DOM
        try {
          const selectInstallments = document.querySelector('select[name="installments"]');
          if (selectInstallments) {
            const domValue = (selectInstallments as HTMLSelectElement).value;
            console.log("🔴 SOLUÇÃO #1: Valor encontrado via DOM:", domValue);
            const parsedValue = parseInt(domValue, 10);
            if (!isNaN(parsedValue) && parsedValue > 0) {
              validatedInstallments = parsedValue;
              console.log("🔴 CORRIGIDO VIA DOM:", validatedInstallments);
            }
          }
        } catch (e) {
          console.error("🔴 Erro ao acessar DOM:", e);
        }
        
        // Solução #2: Verificar as datas de parcelas
        if (installmentDates && installmentDates.length > 0) {
          console.log("🔴 SOLUÇÃO #2: Usando número de datas de parcelas:", installmentDates.length);
          validatedInstallments = Math.max(installmentDates.length, 1);
        }
        
        // Solução #3: Verificar a última seleção conhecida do usuário
        const selectedInField = field => {
          try {
            const selectElement = document.getElementById(field) as HTMLSelectElement;
            return selectElement ? selectElement.value : null;
          } catch (e) {
            return null;
          }
        };
        
        // Força a definição do valor no formulário para evitar problemas
        // Esta é uma medida extrema de segurança
        form.setValue("installments", validatedInstallments, { shouldValidate: true });
        console.log("🔴 VALOR FORÇADO NO FORMULÁRIO:", validatedInstallments);
      } else {
        // Processamento normal se tivermos um valor
        if (typeof rawInstallments === 'number') {
          validatedInstallments = Math.floor(rawInstallments);
          console.log("🔴 CONVERSÃO DIRETA: Numérico para inteiro =", validatedInstallments);
        } else if (typeof rawInstallments === 'string') {
          const parsed = parseInt(rawInstallments, 10);
          if (!isNaN(parsed)) {
            validatedInstallments = parsed;
            console.log("🔴 CONVERSÃO: String para inteiro =", validatedInstallments);
          } else {
            console.log("🔴 ERRO DE CONVERSÃO: String inválida:", rawInstallments);
          }
        } else {
          console.log("🔴 TIPO INESPERADO:", typeof rawInstallments);
        }
      }
      
      // Garantir valor mínimo válido
      if (validatedInstallments < 1) {
        validatedInstallments = 1;
        console.log("⚠️ VALOR MENOR QUE 1, corrigido para:", validatedInstallments);
      }
      
      // Garantir que parcelas só pode ser um número inteiro (não decimal)
      validatedInstallments = Math.floor(validatedInstallments);
      
      console.log("⚠️ VALOR FINAL DE PARCELAS:", validatedInstallments);
      console.log("⚠️ TIPO FINAL:", typeof validatedInstallments);
      console.log("-------- FIM DA VALIDAÇÃO DE PARCELAS --------");
      
      // CORREÇÃO CRÍTICA: Trata e valida todos os campos numéricos para garantir tipos corretos
      // Objeto para envio ao servidor com valores convertidos e validados
      // SOLUÇÃO DEFINITIVA - 30/04/2025: Processamento com preservação de data original
      let formattedDate;
      
      // CASO ESPECIAL: Se estamos editando e temos a data original armazenada,
      // usamos ela diretamente em seu formato original para evitar conversões
      const isEditingExisting = !!(sale?.id);
      console.log("🔍 originalSaleDate =", originalSaleDate, "typeof =", typeof originalSaleDate);
      
      if (isEditingExisting && originalSaleDate) {
        console.log("🔴 CORREÇÃO CRÍTICA DE DATA: Usando a data original preservada:", originalSaleDate);
        formattedDate = originalSaleDate;
      }
      // Se a data já estiver no formato ISO (YYYY-MM-DD)
      else if (typeof values.date === 'string' && values.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDate = values.date;
      } 
      // Se estiver no formato brasileiro (DD/MM/YYYY)
      else if (typeof values.date === 'string' && values.date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = values.date.split('/');
        formattedDate = `${year}-${month}-${day}`;
      }
      // Se for um objeto Date
      else if (values.date instanceof Date && !isNaN(values.date.getTime())) {
        formattedDate = `${values.date.getFullYear()}-${String(values.date.getMonth() + 1).padStart(2, '0')}-${String(values.date.getDate()).padStart(2, '0')}`;
      }
      // Fallback para data atual se nenhum dos casos acima
      else {
        const now = new Date();
        formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      }
      
      console.log("📅 Data a ser enviada:", formattedDate, "Tipo:", typeof formattedDate);
      
      // Verifica se o campo de número da OS está preenchido
      if (!values.orderNumber || !values.orderNumber.trim()) {
        toast({
          title: "Número da OS obrigatório",
          description: "O número da ordem de serviço precisa ser informado.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Verifica se estamos editando uma venda devolvida e se as observações de correção foram preenchidas
      if ((originalStatus === "returned" || forceResendMode) && !correctionNotes.trim()) {
        toast({
          title: "Observações de correção obrigatórias",
          description: "Para reenviar uma venda devolvida, é necessário informar quais correções foram realizadas.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Se a venda estava com status "returned", vamos atualizar o status para "corrected"
      // e incluir as observações de correção no histórico
      let updatedStatus = undefined;
      let updatedNotes = values.notes;
      
      if (originalStatus === "returned" || forceResendMode) {
        updatedStatus = "corrected";
        
        // Formatar data atual para o registro
        const now = new Date();
        const formattedTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Adicionar observações de correção no formato de histórico
        if (values.notes) {
          updatedNotes = `${values.notes}\n\n==== Correções realizadas em ${formattedTimestamp} ====\n${correctionNotes}`;
        } else {
          updatedNotes = `==== Correções realizadas em ${formattedTimestamp} ====\n${correctionNotes}`;
        }
      }
      
      const correctedValues = {
        ...values,
        // CRITICAL FIX: Incluir ID da venda quando estiver editando
        ...(sale && { id: sale.id }),
        // O número da OS deve ser fornecido pelo usuário, sem fallback
        orderNumber: values.orderNumber.trim(),
        // Usa a data formatada
        date: formattedDate,
        // Garante que o valor total esteja sempre no formato correto (ponto, não vírgula)
        totalAmount: values.totalAmount ? values.totalAmount.replace(',', '.') : "0",
        // Atualiza o status e as observações se necessário
        ...(updatedStatus && { status: updatedStatus }),
        ...(updatedNotes !== values.notes && { notes: updatedNotes }),
        // CORREÇÃO CRÍTICA: A propriedade installments deve ser explicitamente um número inteiro
        // Observe que estamos usando validatedInstallments diretamente e não values.installments
        installments: Number(validatedInstallments),
        // Também garantimos que qualquer valor de parcela seja formato corretamente
        installmentValue: values.installmentValue ? String(values.installmentValue).replace(',', '.') : null,
        // ULTRA-MEGA-HYPER SOLUÇÃO RADICAL - 30/04/2025: Preservação garantida dos itens durante edição
        items: values.items.map(item => {
          console.log("🔄 Processando item para envio:", item);
          
          // PARTE 1: DETECÇÃO DE EDIÇÃO DE VENDA - 100% precisa
          // ULTRA-MEGA-HYPER SOLUÇÃO RADICAL DE ROBUSTEZ (30/04/2025)
          // Usar a variável correta para detectar edição (com duas camadas de segurança)
          const isEditingMode = !!sale?.id; // isEditingExisting definido anteriormente
          const currentSaleId = sale?.id; // saleId disponível diretamente via prop sale.id
          
          // PARTE 2: DETECÇÃO DE ITEM EXISTENTE - múltiplas camadas de segurança
          // Verificamos a presença de ID no item
          const hasItemId = !!item.id;
          
          console.log(`👽 ULTRA-MEGA-HYPER ANÁLISE DE ITEM:
            - Item: ${JSON.stringify(item)}
            - Modo: ${isEditingMode ? 'EDIÇÃO' : 'CRIAÇÃO'}
            - Item existente: ${hasItemId ? 'SIM' : 'NÃO'}
            - ID do item: ${hasItemId ? item.id : 'Nenhum'}
            - ID da venda: ${currentSaleId || 'Nova venda'}
          `);
          
          // SUPER SOLUÇÃO RADICAL: Se estamos editando e o item tem ID, mantemos 100% os dados originais
          // Isso é crucial para evitar duplicações, pois no servidor vamos fazer upsert dos itens
          if (isEditingMode && hasItemId) {
            console.log("🔒 PRESERVAÇÃO CRÍTICA: Item existente em venda existente - mantendo ID", {
              itemId: item.id,
              saleId: currentSaleId
            });
            
            return {
              ...item,
              // Campos cruciais para garantir consistência durante edição
              id: item.id, // CRÍTICO: Preservar o ID do item
              saleId: currentSaleId, // CRÍTICO: Garantir a associação à venda correta
              serviceTypeId: values.serviceTypeId, // Atualizar o tipo de serviço (pode ter mudado)
              quantity: Number(item.quantity) || 1, // Garantir tipo correto
              // Formatação de valores
              price: typeof item.price === 'string' ? item.price.replace(',', '.') : String(item.price || "0"),
              totalPrice: typeof item.totalPrice === 'string' ? item.totalPrice.replace(',', '.') : String(item.totalPrice || item.price || "0"),
            };
          }
          
          // Para itens novos ou sem ID, processamos normalmente
          // Construir item base com todas as propriedades necessárias
          const processedItem = {
            ...item,
            // Garantir campos críticos
            serviceTypeId: values.serviceTypeId, // Usa o serviceTypeId da venda para todos os itens
            quantity: Number(item.quantity) || 1, // Garante que quantidade seja número
            // Formatação de valores para garantir tipo correto
            price: typeof item.price === 'string' ? item.price.replace(',', '.') : String(item.price || "0"),
            totalPrice: typeof item.totalPrice === 'string' ? item.totalPrice.replace(',', '.') : String(item.totalPrice || item.price || "0"),
          };
          
          // CASO 2: Item novo em uma venda existente - ASSOCIAR À VENDA
          if (isEditingMode) {
            console.log("🔄 NOVO ITEM EM VENDA EXISTENTE: Associando à venda", {
              saleId: currentSaleId
            });
            
            return {
              ...processedItem,
              saleId: currentSaleId
            };
          }
          
          // CASO 3: Criando uma venda totalmente nova
          console.log("✨ ITEM PARA NOVA VENDA: Enviando sem IDs especiais");
          return processedItem;
        })
      };
      
      console.log("Valores corrigidos:", correctedValues);
      console.log("Itens da venda corrigidos:", JSON.stringify(correctedValues.items, null, 2));
      
      // Chama a mutação para salvar a venda com os valores corrigidos
      console.log("Chamando saveMutation...");
      saveMutation.mutate(correctedValues);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast({
        title: "Erro ao processar formulário",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  // Função para obter o nome do cliente pelo ID
  const getCustomerName = (id: number) => {
    const customer = customers.find((c: any) => c.id === id);
    return customer ? customer.name : `Cliente #${id}`;
  };

  // Função para obter o nome do vendedor pelo ID
  const getSellerName = (id: number) => {
    const seller = users.find((u: any) => u.id === id);
    return seller ? seller.username : `Vendedor #${id}`;
  };

  // Log para debug
  console.log('SaleDialog renderizado, open =', open, 'sale =', sale ? sale.id : null);
  console.log('🔴 RENDERIZAÇÃO: Status original =', originalStatus, '- forceResendMode:', forceResendMode, '- Condição campo correção:', (originalStatus === "returned" || forceResendMode));
  
  if (originalStatus === "returned" || forceResendMode) {
    console.log("🔴 CAMPO DE CORREÇÃO SENDO RENDERIZADO!");
  }

  // Se não estiver aberto, não renderizar o conteúdo para evitar problemas de performance
  if (!open) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => {
      console.log('Dialog onOpenChange: ', isOpen);
      if (!isOpen) onClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold">
            {sale ? ((originalStatus === "returned" || forceResendMode) ? "Corrigir Venda Devolvida" : "Editar Venda") : "Nova Venda"}
          </DialogTitle>
          <DialogDescription>
            {sale 
              ? ((originalStatus === "returned" || forceResendMode) 
                ? "Faça as correções necessárias e informe o que foi corrigido. Após salvar, a venda será reenviada." 
                : "Atualize os dados da venda conforme necessário")
              : "Preencha os dados para criar uma nova venda"}
          </DialogDescription>
          
          {/* Alerta especial para vendas devolvidas */}
          {(originalStatus === "returned" || forceResendMode) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Esta venda foi devolvida</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Faça as correções necessárias, explique o que foi corrigido no campo especial abaixo e reenvie a venda.
                    Após salvar, a venda terá seu status atualizado de "Devolvida" para "Corrigida".
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Número de OS */}
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Número da OS <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite o número da OS" 
                        {...field} 
                        className={!field.value ? "border-red-300 focus-visible:ring-red-400" : ""}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                    {!field.value && (
                      <p className="text-xs text-red-500 mt-1">
                        Este campo é obrigatório
                      </p>
                    )}
                  </FormItem>
                )}
              />
              
              {/* Data - Versão apenas com campo de texto */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="text"
                        placeholder="DD/MM/AAAA"
                        // SOLUÇÃO DEFINITIVA:
                        // 1. Se temos data original preservada, usar formato PT-BR
                        // 2. Se não, verificar o valor do field atual
                        // 3. Se nada funcionar, usar a data atual como fallback
                        defaultValue={(() => {
                          console.log("🗓️🗓️ SUPER IMPORTANTE - Data original preservada:", originalSaleDate);
                          
                          // Se temos uma data original preservada, usar ela com prioridade
                          if (originalSaleDate) {
                            // Converter o formato YYYY-MM-DD para DD/MM/AAAA se necessário
                            if (originalSaleDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                              // Extrair componentes da data
                              const [year, month, day] = originalSaleDate.split('-');
                              const formattedDate = `${day}/${month}/${year}`;
                              console.log("🎯 Data original convertida para DD/MM/AAAA:", formattedDate);
                              return formattedDate;
                            } else if (originalSaleDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                              // Já está no formato DD/MM/AAAA
                              console.log("🎯 Data original já está em DD/MM/AAAA:", originalSaleDate);
                              return originalSaleDate;
                            }
                          }
                          
                          // Se não tem data original, verificar o valor do field
                          const fieldValue = field.value;
                          console.log("🔍 Valor atual do campo date:", fieldValue, "tipo:", typeof fieldValue);
                          
                          if (fieldValue) {
                            if (typeof fieldValue === 'string') {
                              // Se é uma string no formato YYYY-MM-DD
                              if (fieldValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                const [year, month, day] = fieldValue.split('-');
                                return `${day}/${month}/${year}`;
                              } 
                              // Se já é DD/MM/AAAA
                              else if (fieldValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                                return fieldValue;
                              }
                            } 
                            // Se é um objeto Date
                            else if (fieldValue instanceof Date) {
                              return fieldValue.toLocaleDateString('pt-BR');
                            }
                          }
                          
                          // Fallback: Usar data atual
                          console.log("⚠️ Nenhuma data encontrada, usando data atual como fallback");
                          return new Date().toLocaleDateString('pt-BR');
                        })()}
                        onChange={(e) => {
                          const input = e.target.value;
                          console.log("Input data:", input);
                          
                          // Se o campo estiver vazio, define como null
                          if (!input || input.trim() === '') {
                            console.log("Campo vazio, definindo como null");
                            field.onChange(null);
                            return;
                          }
                          
                          // Formatação para permitir apenas números e barras
                          const formattedInput = input.replace(/[^\d\/]/g, '');
                          
                          // Se o usuário digitou no formato DD/MM/AAAA, converte para YYYY-MM-DD internamente
                          if (formattedInput.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                            const [day, month, year] = formattedInput.split('/');
                            const dateString = `${year}-${month}-${day}`;
                            console.log("Convertendo para formato ISO:", dateString);
                            
                            // SUPER IMPORTANTE: Salvar também na variável de data original
                            console.log("🔄 Atualizando originalSaleDate com novo valor:", dateString);
                            setOriginalSaleDate(dateString);
                            
                            field.onChange(dateString);
                          } else {
                            // Caso contrário, mantém o valor como string para permitir a digitação
                            console.log("Mantendo formato de digitação:", formattedInput);
                            field.onChange(formattedInput);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Cliente */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente
                    </FormLabel>
                    <div className="relative">
                      <Popover
                        open={showCustomerPopover}
                        onOpenChange={(open) => {
                          setShowCustomerPopover(open);
                          if (!open) {
                            // Se não houver cliente selecionado, limpa o termo de busca
                            if (!field.value) {
                              setCustomerSearchTerm("");
                            }
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <PopoverTrigger asChild className="flex-1">
                            <div className="relative w-full">
                              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Digite o nome ou CPF/CNPJ do cliente"
                                value={customerSearchTerm}
                                onChange={(e) => {
                                  setCustomerSearchTerm(e.target.value);
                                  setShowCustomerPopover(true);
                                }}
                                className="pl-9 pr-10"
                                onClick={() => setShowCustomerPopover(true)}
                              />
                              {field.value > 0 && (
                                <Badge variant="outline" className="absolute right-3 top-2 bg-primary/10 text-xs">
                                  {getCustomerName(field.value)}
                                </Badge>
                              )}
                            </div>
                          </PopoverTrigger>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            onClick={() => setShowCustomerDialog(true)}
                            className="h-10 w-10 shrink-0"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                        <PopoverContent className="p-0 w-[--radix-popover-trigger-width] max-h-[300px] overflow-y-auto">
                          <Command>
                            <CommandInput 
                              placeholder="Buscar cliente por nome ou CPF/CNPJ"
                              value={customerSearchTerm}
                              onValueChange={(value) => {
                                setCustomerSearchTerm(value);
                              }}
                              className="border-none focus:ring-0"
                            />
                            <CommandList>
                              <CommandEmpty className="py-6 text-center">
                                <div className="space-y-2">
                                  <p className="text-sm">Nenhum cliente encontrado</p>
                                  <Button 
                                    type="button" 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => {
                                      setShowCustomerDialog(true);
                                      setShowCustomerPopover(false);
                                    }}
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Cadastrar novo cliente
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredCustomers.map((customer: any) => (
                                  <CommandItem
                                    key={customer.id}
                                    value={`${customer.name} ${customer.document}`}
                                    onSelect={() => {
                                      field.onChange(customer.id);
                                      setCustomerSearchTerm(customer.name);
                                      setShowCustomerPopover(false);
                                    }}
                                    className="py-2"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{customer.name}</span>
                                      <span className="text-xs text-muted-foreground">{customer.document}</span>
                                    </div>
                                    {field.value === customer.id && (
                                      <Check className="ml-auto h-4 w-4 text-primary" />
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* O formulário simplificado foi removido e substituído pelo CustomerDialog */}
              
              {/* Vendedor */}
              <FormField
                control={form.control}
                name="sellerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Vendedor
                    </FormLabel>
                    <div className="relative">
                      <Popover
                        open={showSellerPopover}
                        onOpenChange={(open) => {
                          setShowSellerPopover(open);
                          if (!open && !field.value) {
                            setSellerSearchTerm("");
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <div className="relative w-full">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Digite o nome do vendedor"
                              value={sellerSearchTerm}
                              onChange={(e) => {
                                setSellerSearchTerm(e.target.value);
                                setShowSellerPopover(true);
                              }}
                              className="pl-9 pr-10"
                              onClick={() => setShowSellerPopover(true)}
                            />
                            {field.value > 0 && (
                              <Badge variant="outline" className="absolute right-3 top-2 bg-primary/10 text-xs">
                                {getSellerName(field.value)}
                              </Badge>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[--radix-popover-trigger-width] max-h-[300px] overflow-y-auto">
                          <Command>
                            <CommandInput 
                              placeholder="Buscar vendedor"
                              value={sellerSearchTerm}
                              onValueChange={(value) => setSellerSearchTerm(value)}
                              className="border-none focus:ring-0"
                            />
                            <CommandList>
                              <CommandEmpty className="py-6 text-center">
                                Nenhum vendedor encontrado
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredSellers.map((seller: any) => (
                                  <CommandItem
                                    key={seller.id}
                                    value={seller.username}
                                    onSelect={() => {
                                      field.onChange(seller.id);
                                      setSellerSearchTerm(seller.username);
                                      setShowSellerPopover(false);
                                    }}
                                  >
                                    <div className="flex items-center">
                                      <span>{seller.username}</span>
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        {seller.role}
                                      </Badge>
                                    </div>
                                    {field.value === seller.id && (
                                      <Check className="ml-auto h-4 w-4 text-primary" />
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Forma de Pagamento */}
              <FormField
                control={form.control}
                name="paymentMethodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Forma de Pagamento
                      {shouldBlockFinancialFields() && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 ml-2 text-[10px]">
                          Bloqueado
                        </Badge>
                      )}
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : "0"}
                      disabled={shouldBlockFinancialFields()}
                    >
                      <FormControl>
                        <SelectTrigger className={shouldBlockFinancialFields() ? "bg-gray-100" : ""}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((paymentMethod: any) => (
                          <SelectItem key={paymentMethod.id} value={paymentMethod.id.toString()}>
                            {paymentMethod.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {shouldBlockFinancialFields() && (
                      <FormDescription className="text-amber-600 text-xs mt-1">
                        Campo bloqueado - venda em processamento financeiro
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Tipo de Execução */}
              <FormField
                control={form.control}
                name="serviceTypeId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="flex items-center gap-2">
                      <Cog className="h-4 w-4" />
                      Tipo de Execução
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : "0"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceTypes.map((type: any) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Valor Total */}
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Valor Total
                      {shouldBlockFinancialFields() && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 ml-2 text-[10px]">
                          Bloqueado
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0,00" 
                        {...field} 
                        disabled={shouldBlockFinancialFields()}
                        className={shouldBlockFinancialFields() ? "bg-gray-100" : ""}
                      />
                    </FormControl>
                    {shouldBlockFinancialFields() && (
                      <FormDescription className="text-amber-600 text-xs mt-1">
                        Campo bloqueado - venda em processamento financeiro
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Número de Parcelas */}
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Parcelas
                      {shouldBlockFinancialFields() && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 ml-2 text-[10px]">
                          Bloqueado
                        </Badge>
                      )}
                    </FormLabel>
                    <Select 
                      disabled={shouldBlockFinancialFields()}
                      onValueChange={(value) => {
                        console.log("🔄 CORREÇÃO EXTREMA - Seleção de parcelas alterada para:", value, "tipo:", typeof value);
                        
                        // HIPER-CORREÇÃO - Garantia absoluta de que teremos um número inteiro válido
                        let numParcelas = 1; // Valor padrão super-seguro
                        
                        try {
                          // Converter para número com verificações múltiplas
                          if (value) {
                            const tempValue = parseInt(value, 10);
                            if (!isNaN(tempValue) && tempValue > 0) {
                              numParcelas = tempValue;
                            }
                          }
                        } catch (error) {
                          console.error("🔄 ERRO NA CONVERSÃO:", error);
                        }
                        
                        // Garantia absoluta de que é um número inteiro (não string)
                        console.log("🔄 CORREÇÃO EXTREMA - Valor após processamento:", numParcelas, "tipo:", typeof numParcelas);
                        
                        // MUDANÇA CRÍTICA: Garante que o número de parcelas seja definitivamente um número!
                        // Define o valor no campo como NUMBER, não string
                        field.onChange(numParcelas);
                        
                        // HIPER-VALIDAÇÃO: Verifica se realmente foi salvo como número
                        const valorAtual = form.getValues("installments");
                        console.log("🔄 VERIFICAÇÃO CRÍTICA - Valor atual no form:", valorAtual, "tipo:", typeof valorAtual);
                        
                        // Se por algum motivo ainda estiver como string, força novamente como número
                        if (typeof valorAtual === 'string') {
                          console.log("🔄 ALERTA MÁXIMO! Ainda é string, forçando novamente como número");
                          form.setValue("installments", numParcelas, { shouldValidate: true });
                        }
                        
                        // Log detalhado para debug
                        console.log(
                          "🔄 DADOS FINAIS DO FORMULÁRIO:",
                          "Parcelas:", numParcelas,
                          "Tipo esperado:", typeof numParcelas,
                          "Valor atual no form:", form.getValues("installments"),
                          "Tipo atual no form:", typeof form.getValues("installments")
                        );
                        
                        // Força atualização das datas de parcelas
                        if (firstDueDate) {
                          // Criar datas de vencimento baseadas no número de parcelas selecionado
                          const novasDatas = generateInstallmentDates(firstDueDate, numParcelas);
                          setInstallmentDates(novasDatas);
                          console.log(`🛑 SUPER CORREÇÃO - Geradas ${novasDatas.length} datas para ${numParcelas} parcelas`);
                        }
                      }}
                      value={field.value ? String(field.value) : "1"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((parcela) => (
                          <SelectItem key={parcela} value={String(parcela)}>
                            {parcela === 1 ? 'À vista' : `${parcela}x`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Datas de vencimento */}
            {form.watch("installments") > 1 && (
              <div className="mt-4 border rounded-md p-4 bg-muted/20">
                <div className="mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Datas de Vencimento
                    {shouldBlockFinancialFields() && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 ml-2 text-[10px]">
                        Bloqueado
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure as datas de vencimento para cada parcela
                    {shouldBlockFinancialFields() && (
                      <span className="text-amber-600 block mt-1">
                        Datas bloqueadas - venda em processamento financeiro
                      </span>
                    )}
                  </p>
                </div>
                
                {/* A seção "Primeira data de vencimento" foi removida conforme solicitado */}
                
                {installmentDates.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parcela</TableHead>
                        <TableHead>Data de Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {installmentDates.map((date, index) => {
                        const installmentAmount = form.getValues("totalAmount") 
                          ? (parseFloat(form.getValues("totalAmount").replace(",", ".")) / installmentDates.length).toFixed(2)
                          : "0.00";
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>{index + 1}ª parcela</TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                size={10}
                                data-installment-date
                                data-installment-number={index + 1}
                                placeholder="DD/MM/AAAA"
                                disabled={shouldBlockFinancialFields()}
                                className={shouldBlockFinancialFields() ? "bg-gray-100 w-28" : "w-28"}
                                defaultValue={typeof date === 'string' ? 
                                  // Se for string no formato ISO (YYYY-MM-DD), converter para DD/MM/YYYY
                                  date.includes('-') ? `${date.split('-')[2]}/${date.split('-')[1]}/${date.split('-')[0]}` : date 
                                  // Se for objeto Date, formatar normalmente
                                  : format(date, "dd/MM/yyyy")}
                                onChange={(e) => {
                                  try {
                                    console.log(`🔄 Processando entrada de data: "${e.target.value}"`);
                                    
                                    // Tentar converter a string para data
                                    const parts = e.target.value.split('/');
                                    if (parts.length === 3) {
                                      const day = parseInt(parts[0]);
                                      const month = parseInt(parts[1]) - 1; // Mês em JS é 0-indexed
                                      const year = parseInt(parts[2].length === 2 ? `20${parts[2]}` : parts[2]); // Permite anos com 2 ou 4 dígitos
                                      
                                      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                                        // APRIMORAMENTO 26/04/2025: Garantir datas no formato ISO
                                        // Armazena a data como string YYYY-MM-DD para evitar problemas de timezone
                                        const fixedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        console.log(`✅ SOLUÇÃO FINAL: Data preservada exatamente como digitada: ${fixedDate}`);
                                        
                                        // Marcador especial para debug no console
                                        console.log(`📋 DATA_DEBUG: parcela=${index+1}, valor=${fixedDate}, origem=input_direto`);
                                        
                                        // Atualiza apenas a data específica dessa parcela
                                        const newDates = [...installmentDates];
                                        // Armazenar como string, não como objeto Date
                                        newDates[index] = fixedDate;
                                        setInstallmentDates(newDates);
                                        
                                        // Atualizar diretamente o atributo para captura
                                        e.target.setAttribute('data-final-date', fixedDate);
                                      } else {
                                        console.log(`⚠️ Números inválidos: dia=${day}, mês=${month+1}, ano=${year}`);
                                      }
                                    } else if (e.target.value.includes('-')) {
                                      // Tenta processar formato YYYY-MM-DD
                                      const parts = e.target.value.split('-');
                                      if (parts.length === 3) {
                                        const year = parseInt(parts[0]);
                                        const month = parseInt(parts[1]) - 1;
                                        const day = parseInt(parts[2]);
                                        
                                        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                                          // APRIMORAMENTO 26/04/2025: Garantir datas no formato ISO
                                          const fixedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                          console.log(`✅ SOLUÇÃO FINAL: Data preservada do formato ISO: ${fixedDate}`);
                                          
                                          // Marcador especial para debug no console
                                          console.log(`📋 DATA_DEBUG: parcela=${index+1}, valor=${fixedDate}, origem=input_formato_iso`);
                                          
                                          // Atualiza apenas a data específica dessa parcela
                                          const newDates = [...installmentDates];
                                          newDates[index] = fixedDate;
                                          setInstallmentDates(newDates);
                                          
                                          // Atualizar diretamente o atributo para captura
                                          e.target.setAttribute('data-final-date', fixedDate);
                                        }
                                      }
                                    }
                                  } catch (error) {
                                    console.error("Erro ao converter data:", error);
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>R$ {installmentAmount.replace(".", ",")}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
            
            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4" />
                    Observações
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais sobre a venda"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Campo especial de observações para vendas devolvidas - DESTACADO E MELHORADO */}
            {console.log("🔴 RENDERIZAÇÃO: Status original =", originalStatus, "- forceResendMode:", forceResendMode, "- Condição campo correção:", originalStatus === "returned" || forceResendMode)}
            {(originalStatus === "returned" || forceResendMode) && (
              <div className="space-y-2 mt-4 border-2 border-blue-600 pl-4 pr-4 pt-3 pb-3 bg-blue-50 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-blue-700" />
                  <label className="text-base font-medium text-blue-800">
                    Correções da Devolução <span className="text-red-500">*</span>
                  </label>
                </div>
                {sale.returnReason && (
                  <div className="mb-3 border-l-4 border-red-400 pl-3 py-2 bg-red-50 rounded-sm">
                    <label className="text-sm font-medium text-red-800">Motivo da devolução:</label>
                    <p className="text-sm text-red-700 mt-1">{sale.returnReason}</p>
                  </div>
                )}
                {console.log("🔴 CAMPO DE CORREÇÃO SENDO RENDERIZADO!")}
                <FormLabel className="text-sm font-medium text-blue-800">
                  Observações sobre as correções realizadas:
                </FormLabel>
                <Textarea 
                  placeholder="Descreva as correções realizadas nesta venda antes de reenviar..."
                  className="min-h-[100px] border-blue-300 focus:border-blue-500"
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                />
                <p className="text-xs text-blue-700 mt-1">
                  <strong>Atenção:</strong> Este campo é obrigatório. Descreva todas as alterações realizadas para corrigir 
                  os problemas que levaram à devolução desta venda. Estas observações serão registradas permanentemente 
                  no histórico da venda.
                </p>
              </div>
            )}
            
            {/* Seção de Itens */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Itens da Venda</h3>
              </div>
              
              {/* Busca de serviços e adição por busca dinâmica */}
              <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
                <div className="flex-1">
                  <FormLabel className="text-xs mb-1.5 block">Buscar Serviço</FormLabel>
                  <div className="relative">
                    <Popover
                      open={showServicePopover}
                      onOpenChange={(open) => {
                        setShowServicePopover(open);
                        if (!open && selectedServiceId === 0) {
                          setServiceSearchTerm("");
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <div className="relative w-full">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Digite o nome do serviço"
                            value={serviceSearchTerm}
                            onChange={(e) => {
                              setServiceSearchTerm(e.target.value);
                              setShowServicePopover(true);
                            }}
                            className="pl-9 pr-4"
                            onClick={() => setShowServicePopover(true)}
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[--radix-popover-trigger-width] max-h-[300px] overflow-y-auto">
                        <Command>
                          <CommandInput 
                            id="service-search-input"
                            placeholder="Buscar serviço"
                            value={serviceSearchTerm}
                            onValueChange={(value) => {
                              setServiceSearchTerm(value);
                            }}
                            onKeyDown={(e) => {
                              // Navegar diretamente para CommandItem ao pressionar seta para baixo
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                const firstItem = document.querySelector('[cmdk-item]') as HTMLElement;
                                if (firstItem) {
                                  firstItem.focus();
                                }
                              }
                              // Fechar o popover e voltar ao input principal se pressionar Escape
                              else if (e.key === 'Escape') {
                                setShowServicePopover(false);
                              }
                            }}
                            className="border-none focus:ring-0"
                          />
                          <CommandList>
                            <CommandEmpty className="py-6 text-center">
                              Nenhum serviço encontrado
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredServices.map((service: any) => (
                                <CommandItem
                                  key={service.id}
                                  value={service.name}
                                  onSelect={() => {
                                    setSelectedServiceId(service.id);
                                    setServiceSearchTerm(service.name);
                                    setShowServicePopover(false);
                                    
                                    // Foco automático no campo de quantidade após selecionar o serviço
                                    setTimeout(() => {
                                      const quantityInput = document.getElementById('service-quantity');
                                      if (quantityInput) {
                                        quantityInput.focus();
                                      }
                                    }, 100);
                                  }}
                                  onKeyDown={(e) => {
                                    // Pressionar Tab ou Enter neste item fechará o popover e avançará para o campo quantidade
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setSelectedServiceId(service.id);
                                      setServiceSearchTerm(service.name);
                                      setShowServicePopover(false);
                                      
                                      setTimeout(() => {
                                        const quantityInput = document.getElementById('service-quantity');
                                        if (quantityInput) {
                                          quantityInput.focus();
                                        }
                                      }, 100);
                                    }
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{service.name}</span>
                                    <span className="text-xs text-muted-foreground">{service.description}</span>
                                  </div>
                                  {selectedServiceId === service.id && (
                                    <Check className="ml-auto h-4 w-4 text-primary" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="w-24">
                  <FormLabel className="text-xs mb-1.5 block">Quantidade</FormLabel>
                  <Input
                    id="service-quantity"
                    type="number"
                    min="1"
                    value={selectedServiceQuantity}
                    onChange={(e) => setSelectedServiceQuantity(parseInt(e.target.value) || 1)}
                    onKeyDown={(e) => {
                      // Pressionar Enter no campo de quantidade adiciona o item
                      if (e.key === 'Enter' && selectedServiceId > 0) {
                        e.preventDefault();
                        handleAddItem();
                        
                        // Reset e volta o foco para o campo de busca de serviço
                        setTimeout(() => {
                          setSelectedServiceId(0);
                          setSelectedServiceQuantity(1);
                          setServiceSearchTerm("");
                          
                          const serviceInput = document.getElementById('service-search-input');
                          if (serviceInput) {
                            serviceInput.focus();
                          }
                        }, 100);
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={selectedServiceId === 0}
                  size="sm"
                  className="h-10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Incluir
                </Button>
              </div>
              
              {/* Lista de itens da venda - SOLUÇÃO DEFINITIVA PARA FLICKERING */}
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {/* RENDERIZAÇÃO ESTÁTICA ANTI-FLICKERING: Usa React.useMemo para evitar re-renderizações */}
                {React.useMemo(() => {
                  console.log("🔵 RENDERIZANDO ITENS: total=" + (fields?.length || 0));
                  
                  if (fields.length === 0) {
                    return (
                      <div className="text-center py-6 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>Nenhum item adicionado</p>
                        <p className="text-xs">Utilize o formulário acima para adicionar itens</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-2">
                      {fields.map((field, index) => {
                        // Obtém o item do FormArray
                        const item = form.getValues(`items.${index}`) as SaleItem;
                        if (!item) return null;
                        
                        // Encontra o nome do serviço
                        const service = services.find((s: any) => s.id === item.serviceId);
                        const serviceName = service?.name || `Serviço #${item.serviceId}`;
                        
                        // Renderiza cada item como um card separado
                        return (
                          <div key={field.id} className="rounded-md border p-3 relative">
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{serviceName}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>Quantidade: {item.quantity}</span>
                                </div>
                                {item.notes && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <span className="font-medium">Observações:</span> {item.notes}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                                onClick={() => remove(index)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }, [fields, services, remove])}
              </div>
            </div>
            
            <DialogFooter className="mt-8 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log("Botão Cancelar clicado");
                  onClose();
                }}
              >
                Cancelar
              </Button>
              
              {/* Botão para salvar vendas */}
              <Button
                type="button"
                className="bg-green-600 hover:bg-green-700"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Botão alternativo clicado - Modo direto");
                  
                  const values = form.getValues();
                  console.log("Valores originais:", values);
                  
                  // Verifica campos críticos
                  if (!values.orderNumber || values.orderNumber.trim() === "") {
                    toast({
                      title: "Número de OS obrigatório",
                      description: "Digite um número de ordem de serviço válido",
                      variant: "destructive",
                    });
                    // Focar o campo de número de OS
                    const orderNumberField = document.querySelector('input[name="orderNumber"]');
                    if (orderNumberField) {
                      (orderNumberField as HTMLInputElement).focus();
                    }
                    return;
                  }
                  
                  if (!values.customerId || values.customerId <= 0) {
                    toast({
                      title: "Cliente obrigatório",
                      description: "Selecione um cliente válido",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  if (!values.serviceTypeId || values.serviceTypeId <= 0) {
                    toast({
                      title: "Tipo de execução obrigatório",
                      description: "Selecione um tipo de execução válido",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  if (!values.items || values.items.length === 0) {
                    toast({
                      title: "Itens obrigatórios",
                      description: "Adicione pelo menos um item à venda",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // Verifica se é uma venda devolvida sendo corrigida
                  // e se as observações de correção foram preenchidas
                  if ((originalStatus === "returned" || forceResendMode) && !correctionNotes.trim()) {
                    toast({
                      title: "Observações de correção obrigatórias",
                      description: "Descreva as correções realizadas antes de reenviar esta venda",
                      variant: "destructive",
                    });
                    
                    // Rolar para o campo de observações e destacá-lo
                    try {
                      setTimeout(() => {
                        const correctionField = document.querySelector(".border-blue-600");
                        if (correctionField) {
                          correctionField.scrollIntoView({ behavior: "smooth", block: "center" });
                          correctionField.classList.add("animate-pulse", "border-red-500");
                          setTimeout(() => {
                            correctionField.classList.remove("animate-pulse", "border-red-500");
                            correctionField.classList.add("border-blue-600");
                          }, 2000);
                        }
                      }, 100);
                    } catch (error) {
                      console.error("Erro ao destacar campo:", error);
                    }
                    
                    return;
                  }
                  
                  // Obter o número correto de parcelas
                  const numberOfInstallments = Number(values.installments) || 1;
                  
                  // SOLUÇÃO FINAL 26/04/2025: Priorizar os atributos data-final-date para máxima precisão
                  const datesForApi: string[] = [];
                  
                  // PRIORIDADE 1: Tentar obter as datas diretamente dos inputs com data-final-date
                  const dateInputs = document.querySelectorAll('[data-installment-date]');
                  const datesFromInputs: string[] = [];
                  
                  // Coletar datas dos inputs, priorizando o atributo data-final-date que contém o valor processado
                  dateInputs.forEach((input: Element) => {
                    const inputElement = input as HTMLInputElement;
                    const installmentNumber = inputElement.getAttribute('data-installment-number');
                    const finalDate = inputElement.getAttribute('data-final-date');
                    
                    if (installmentNumber && finalDate) {
                      const idx = parseInt(installmentNumber) - 1;
                      if (idx >= 0 && idx < numberOfInstallments) {
                        datesFromInputs[idx] = finalDate;
                        console.log(`🔍 SOLUÇÃO FINAL: Data obtida do atributo data-final-date para parcela #${idx+1}: ${finalDate}`);
                      }
                    }
                  });
                  
                  // Verificar se capturamos todas as datas dos inputs
                  const allDatesFromInputs = datesFromInputs.filter(Boolean).length === numberOfInstallments;
                  
                  if (allDatesFromInputs) {
                    console.log(`✅ SOLUÇÃO FINAL: Usando ${datesFromInputs.length} datas capturadas diretamente dos inputs`);
                    datesForApi.push(...datesFromInputs);
                  }
                  // PRIORIDADE 2: Cair para o estado do componente se não conseguimos capturar todas as datas
                  else if (installmentDates.length === numberOfInstallments) {
                    console.log(`✓ SOLUÇÃO FINAL: Usando ${installmentDates.length} datas do estado do componente`);
                    for (let i = 0; i < numberOfInstallments; i++) {
                      const date = installmentDates[i];
                      if (date instanceof Date) {
                        // Formato YYYY-MM-DD sem ajustes de timezone
                        const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        datesForApi.push(isoDate);
                        console.log(`📅 SOLUÇÃO FINAL: Data convertida de Date para parcela #${i+1}: ${isoDate}`);
                      } else {
                        datesForApi.push(date);
                        console.log(`📅 SOLUÇÃO FINAL: Data já em formato string para parcela #${i+1}: ${date}`);
                      }
                    }
                  } else {
                    // Se não tivermos o número correto de datas (caso raro), gerar automaticamente
                    console.log("⚠️ Gerando datas automaticamente porque o número não corresponde");
                    const currentDate = new Date();
                    for (let i = 0; i < numberOfInstallments; i++) {
                      const dueDate = new Date(currentDate);
                      dueDate.setMonth(currentDate.getMonth() + i);
                      // CORREÇÃO CRÍTICA: Formatar sem ajustes de timezone para preservar a data exata
                      const isoDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
                      datesForApi.push(isoDate);
                      console.log(`🛠️ Data gerada #${i+1}: ${isoDate}`);
                    }
                  }
                  
                  // Log para debug
                  console.log(`🔄 VERIFICANDO DATAS DE PARCELAS:
                  - Parcelas solicitadas: ${numberOfInstallments}
                  - Datas armazenadas na interface: ${installmentDates.length}
                  - Datas a serem enviadas: ${datesForApi.length}
                  `);
                  
                  // Verificar se o usuário forneceu um número de ordem
                  // CORREÇÃO CRÍTICA: Usar o número da ordem definido pelo usuário
                  const orderNumberToUse = values.orderNumber.trim();
                  
                  // Verificar novamente se o número de OS está preenchido
                  if (!orderNumberToUse) {
                    toast({
                      title: "Número de OS obrigatório",
                      description: "Digite um número de ordem de serviço válido",
                      variant: "destructive",
                    });
                    // Focar o campo de número de OS
                    const orderNumberField = document.querySelector('input[name="orderNumber"]');
                    if (orderNumberField) {
                      (orderNumberField as HTMLInputElement).focus();
                    }
                    return;
                  }
                  
                  console.log("✓ Usando número de ordem fornecido pelo usuário:", orderNumberToUse);
                  
                  // Monta o objeto manualmente ignorando a validação do Zod
                  const saleData = {
                    // CORREÇÃO CRÍTICA: Usar o número da ordem definido pelo usuário
                    orderNumber: orderNumberToUse,
                    date: values.date || new Date(),
                    customerId: values.customerId,
                    paymentMethodId: values.paymentMethodId || 1,
                    serviceTypeId: values.serviceTypeId,
                    sellerId: values.sellerId || user?.id,
                    totalAmount: values.totalAmount ? values.totalAmount.replace(",", ".") : "0",
                    notes: values.notes || "",
                    // CORREÇÃO CRÍTICA: Incluir o número de parcelas (installments)
                    installments: numberOfInstallments,
                    // CORREÇÃO CRÍTICA: Usar as datas efetivamente editadas pelo usuário
                    installmentDates: datesForApi,
                    // Se a venda estava com status "returned" ou forceResendMode, incluir observações de correção
                    ...((originalStatus === "returned" || forceResendMode) && {
                      correctionNotes: correctionNotes.trim(),
                      isResubmitted: true
                    }),
                    items: values.items.map(item => ({
                      serviceId: item.serviceId,
                      serviceTypeId: values.serviceTypeId, // Usa o serviceTypeId da venda
                      quantity: item.quantity || 1,
                      price: "0", // Preço unitário fixado em zero
                      totalPrice: "0", // Preço total do item fixado em zero - só usamos o valor total da venda
                      status: "pending",
                      notes: item.notes || ""
                    }))
                  };
                  
                  // Debug adicional para certificar que o número de parcelas está sendo enviado
                  console.log("🔎 VERIFICAÇÃO DE PARCELAS:", {
                    valorOriginal: values.installments,
                    tipoOriginal: typeof values.installments,
                    valorProcessado: Number(values.installments) || 1,
                    tipoProcessado: typeof (Number(values.installments) || 1)
                  });
                  
                  console.log("Dados de venda preparados:", saleData);
                  
                  // Determina se estamos reenviando uma venda devolvida ou criando uma nova
                  const isResending = (originalStatus === "returned" || forceResendMode) && sale?.id;
                  
                  // Adiciona notas de correção se for um reenvio
                  if (isResending && correctionNotes) {
                    console.log("🔄 REENVIO: Adicionando observações de correção à venda devolvida #" + sale.id);
                    saleData.correctionNotes = correctionNotes;
                    saleData.status = "pending"; // Forçar mudança do status para "pending"
                  }
                  
                  // Define o endpoint e método apropriados
                  const endpoint = isResending ? `/api/sales/${sale.id}/resend` : "/api/sales";
                  const method = isResending ? "PUT" : "POST";
                  
                  console.log(`🔄 ${isResending ? 'REENVIANDO venda #' + sale.id : 'Criando NOVA venda'} usando endpoint: ${endpoint}`);
                  
                  // Chama a API para salvar ou reenviar a venda
                  setIsSubmitting(true);
                  fetch(endpoint, {
                    method: method,
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(saleData),
                  })
                    .then(response => {
                      if (!response.ok) {
                        throw new Error("Erro ao salvar venda");
                      }
                      return response.json();
                    })
                    .then(data => {
                      console.log("Venda salva com sucesso:", data);
                      
                      // SOLUÇÃO ESPECIAL: Verificar se o valor total foi salvo corretamente
                      // Se não foi, vamos atualizá-lo usando a rota especial
                      if (data && data.id && 
                          (data.totalAmount === "0" || data.totalAmount === "0.00" || !data.totalAmount) && 
                          saleData.totalAmount && saleData.totalAmount !== "0" && saleData.totalAmount !== "0.00") {
                        
                        console.log(`Valor total da venda não foi salvo corretamente. Atualizando usando rota especial...`);
                        console.log(`Valor atual: ${data.totalAmount}, Valor esperado: ${saleData.totalAmount}`);
                        
                        // Chamar API especial para atualizar o valor total
                        fetch(`/api/sales/${data.id}/update-total`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ totalAmount: saleData.totalAmount }),
                        })
                          .then(response => {
                            if (!response.ok) {
                              console.error("Erro ao atualizar valor total:", response.statusText);
                              return;
                            }
                            return response.json();
                          })
                          .then(updatedSale => {
                            console.log("Valor total atualizado com sucesso:", updatedSale);
                            // Atualizar o cache para refletir o novo valor
                            queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
                          })
                          .catch(error => {
                            console.error("Erro ao atualizar valor total:", error);
                          });
                      }
                      
                      // Mensagem de sucesso específica para cada caso
                      if (originalStatus === "returned" || forceResendMode) {
                        toast({
                          title: "Venda corrigida e reenviada",
                          description: "As correções foram registradas e a venda foi reenviada para processamento",
                        });
                      } else if (sale && sale.id) {
                        toast({
                          title: "Venda atualizada",
                          description: "Alterações salvas com sucesso",
                        });
                      } else {
                        toast({
                          title: "Venda criada",
                          description: "Venda criada com sucesso",
                        });
                      }
                      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
                      onSaveSuccess();
                      onClose();
                    })
                    .catch(error => {
                      console.error("Erro ao salvar venda:", error);
                      toast({
                        title: "Erro ao salvar venda",
                        description: error.message,
                        variant: "destructive",
                      });
                    })
                    .finally(() => {
                      setIsSubmitting(false);
                    });
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {(originalStatus === "returned" || forceResendMode) ? "Reenviando..." : "Salvando..."}
                  </>
                ) : (
                  (originalStatus === "returned" || forceResendMode) ? "Reenviar" : "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      {/* CustomerDialog para cadastro completo de cliente */}
      <CustomerDialog 
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        onSuccess={handleCustomerDialogSuccess}
      />
    </Dialog>
  );
}
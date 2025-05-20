import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Customer, InsertCustomer, insertCustomerSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// Estendendo o schema para adicionar validações adicionais
const customerFormSchema = insertCustomerSchema.extend({
  name: z.string().min(3, "Nome/Razão Social deve ter pelo menos 3 caracteres"),
  documentType: z.enum(["cpf", "cnpj"], {
    required_error: "Selecione o tipo de documento",
  }),
  document: z.string()
    .refine(
      (val) => {
        // Verifica se é um CPF ou CNPJ válido (formato básico)
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
        return cpfRegex.test(val) || cnpjRegex.test(val);
      },
      {
        message: "Formato de documento inválido",
      }
    )
    .superRefine((val, ctx) => {
      // Valida algoritmo de CPF ou CNPJ
      const clean = val.replace(/\D/g, '');
      
      if (clean.length === 11) { // CPF
        // 11 dígitos repetidos são inválidos
        if (/^(\d)\1+$/.test(clean)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CPF inválido (dígitos repetidos)"
          });
          return false;
        }
        
        // Verificação dos dígitos do CPF
        let sum = 0;
        for (let i = 0; i < 9; i++) {
          sum += parseInt(clean.charAt(i)) * (10 - i);
        }
        let rest = 11 - (sum % 11);
        let digit1 = rest >= 10 ? 0 : rest;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
          sum += parseInt(clean.charAt(i)) * (11 - i);
        }
        rest = 11 - (sum % 11);
        let digit2 = rest >= 10 ? 0 : rest;
        
        if (!(digit1 === parseInt(clean.charAt(9)) && digit2 === parseInt(clean.charAt(10)))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CPF inválido (algorítmo de verificação)"
          });
          return false;
        }
      } 
      else if (clean.length === 14) { // CNPJ
        // 14 dígitos repetidos são inválidos
        if (/^(\d)\1+$/.test(clean)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CNPJ inválido (dígitos repetidos)"
          });
          return false;
        }
        
        // Verificação dos dígitos do CNPJ
        let size = clean.length - 2;
        let numbers = clean.substring(0, size);
        let digits = clean.substring(size);
        let sum = 0;
        let pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
          sum += parseInt(numbers.charAt(size - i)) * pos--;
          if (pos < 2) pos = 9;
        }
        
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CNPJ inválido (algorítmo de verificação)"
          });
          return false;
        }
        
        size = size + 1;
        numbers = clean.substring(0, size);
        sum = 0;
        pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
          sum += parseInt(numbers.charAt(size - i)) * pos--;
          if (pos < 2) pos = 9;
        }
        
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(1))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CNPJ inválido (algorítmo de verificação)"
          });
          return false;
        }
      }
      
      return true;
    }),
  contactName: z.string().optional(),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone deve estar no formato (00) 00000-0000"),
  phone2: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal('')),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  customer?: Customer | null;
  onSuccess?: (customer: Customer) => void;
  onSaveSuccess?: () => void;
}

export default function CustomerDialog({
  open,
  onOpenChange,
  onClose,
  customer = null,
  onSuccess,
  onSaveSuccess,
}: CustomerDialogProps) {
  const { toast } = useToast();
  const isEditing = !!customer;
  const [documentType, setDocumentType] = useState<"cpf" | "cnpj">(customer?.documentType as "cpf" | "cnpj" || "cpf");
  
  // Inicializar o formulário
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer ? {
      name: customer.name,
      documentType: customer.documentType as "cpf" | "cnpj",
      document: customer.document,
      contactName: customer.contactName || "",
      phone: customer.phone,
      phone2: customer.phone2 || "",
      email: customer.email || "",
    } : {
      name: "",
      documentType: "cpf",
      document: "",
      contactName: "",
      phone: "",
      phone2: "",
      email: "",
    },
  });

  // Monitorar a mudança do tipo de documento
  useEffect(() => {
    setDocumentType(form.watch("documentType"));
  }, [form.watch("documentType")]);
  
  // Atualizar o formulário quando o cliente mudar (importante para edição)
  useEffect(() => {
    if (customer) {
      console.log("Atualizando formulário com dados do cliente:", customer);
      form.reset({
        name: customer.name,
        documentType: customer.documentType as "cpf" | "cnpj",
        document: customer.document,
        contactName: customer.contactName || "",
        phone: customer.phone,
        phone2: customer.phone2 || "",
        email: customer.email || "",
      });
    } else {
      // Limpar o formulário para novo cadastro
      form.reset({
        name: "",
        documentType: "cpf",
        document: "",
        contactName: "",
        phone: "",
        phone2: "",
        email: "",
      });
    }
  }, [customer, form]);

  // Cadastrar novo cliente
  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      try {
        console.log("Enviando dados para cadastro:", data);
        // Verificar se o usuário está autenticado antes de enviar o formulário
        const userRes = await fetch("/api/user", { credentials: "include" });
        if (!userRes.ok) {
          throw new Error("Usuário não está autenticado. Faça login novamente.");
        }
        
        const res = await apiRequest("POST", "/api/customers", data);
        
        // Verificar se houve erro na resposta
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Erro na resposta do servidor:", errorData);
          
          // Se for erro de documento duplicado
          if (errorData.error === "Cliente já cadastrado") {
            throw new Error(errorData.message || "Já existe um cliente cadastrado com este documento.");
          }
          
          throw new Error(errorData.message || "Erro ao cadastrar cliente");
        }
        
        const jsonResponse = await res.json();
        console.log("Resposta do servidor:", jsonResponse);
        return jsonResponse;
      } catch (error) {
        console.error("Erro ao cadastrar cliente:", error);
        console.log("Erro detalhado:", JSON.stringify(error));
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Cliente cadastrado",
        description: "O cliente foi cadastrado com sucesso.",
        variant: "default",
        className: "top-toast",
      });
      
      // Chama o callback com o cliente criado
      if (onSuccess) {
        onSuccess(data);
      } else if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      // Fecha o diálogo
      if (onOpenChange) {
        onOpenChange(false);
      } else if (onClose) {
        onClose();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message || "Não foi possível cadastrar o cliente.",
        variant: "destructive",
        className: "whitespace-pre-line", // Permite quebras de linha na mensagem
      });
    },
  });

  // Atualizar cliente existente
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: { id: number; customer: CustomerFormValues }) => {
      try {
        console.log("Enviando dados para atualização:", data);
        // Verificar se o usuário está autenticado antes de enviar o formulário
        const userRes = await fetch("/api/user", { credentials: "include" });
        if (!userRes.ok) {
          throw new Error("Usuário não está autenticado. Faça login novamente.");
        }
        
        const res = await apiRequest("PUT", `/api/customers/${data.id}`, data.customer);
        
        // Verificar se houve erro na resposta
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Erro na resposta do servidor:", errorData);
          
          // Se for erro de documento duplicado
          if (errorData.error === "Documento já cadastrado") {
            throw new Error(errorData.message || "Já existe outro cliente cadastrado com este documento.");
          }
          
          throw new Error(errorData.message || "Erro ao atualizar cliente");
        }
        
        const jsonResponse = await res.json();
        console.log("Resposta do servidor:", jsonResponse);
        return jsonResponse;
      } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Cliente atualizado",
        description: "O cliente foi atualizado com sucesso.",
        variant: "default",
        className: "top-toast",
      });
      
      // Chama o callback com o cliente atualizado
      if (onSuccess) {
        onSuccess(data);
      } else if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      // Fecha o diálogo
      if (onOpenChange) {
        onOpenChange(false);
      } else if (onClose) {
        onClose();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message || "Não foi possível atualizar o cliente.",
        variant: "destructive",
        className: "whitespace-pre-line top-toast", // Permite quebras de linha na mensagem
      });
    },
  });

  // Verifica se um CPF é válido
  const isValidCPF = (cpf: string): boolean => {
    // Remove formatação
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Cálculo para verificação
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let rest = 11 - (sum % 11);
    let digit1 = rest >= 10 ? 0 : rest;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    rest = 11 - (sum % 11);
    let digit2 = rest >= 10 ? 0 : rest;
    
    return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
  };
  
  // Verifica se um CNPJ é válido
  const isValidCNPJ = (cnpj: string): boolean => {
    // Remove formatação
    cnpj = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Cálculo para verificação
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    let digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;
    
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    return result === parseInt(digits.charAt(1));
  };

  // Formatar os campos conforme o usuário digita
  const formatDocument = (value: string, type: "cpf" | "cnpj") => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    
    if (type === "cpf") {
      // Aplica a máscara: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    } else {
      // Aplica a máscara: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    }
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    
    // Aplica a máscara: (00) 00000-0000
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  // Verifica se o documento é válido para mostrar ícone verde
  // Verifica se o documento é válido e retorna o status (-1: inválido, 0: incompleto, 1: válido)
  const validateDocument = (value: string, type: "cpf" | "cnpj"): number => {
    if (!value) return 0;
    
    const cleanValue = value.replace(/\D/g, "");
    
    // Verifica se o documento está completo
    const isCompleteCpf = cleanValue.length === 11;
    const isCompleteCnpj = cleanValue.length === 14;
    
    if (type === "cpf") {
      if (!isCompleteCpf) return 0; // Incompleto
      return isValidCPF(cleanValue) ? 1 : -1; // Válido ou inválido
    } else {
      if (!isCompleteCnpj) return 0; // Incompleto
      return isValidCNPJ(cleanValue) ? 1 : -1; // Válido ou inválido
    }
  };

  // Handler para submit do formulário
  const onSubmit = (data: CustomerFormValues) => {
    console.log("Formulário enviado com dados:", data);
    console.log("Estado do formulário:", form.formState);
    
    try {
      if (isEditing && customer) {
        console.log("Executando atualização de cliente:", customer.id);
        updateCustomerMutation.mutate({
          id: customer.id,
          customer: data,
        });
      } else {
        console.log("Executando criação de novo cliente");
        createCustomerMutation.mutate(data);
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
    }
  };

  const isPending = createCustomerMutation.isPending || updateCustomerMutation.isPending;
  const document = form.watch("document");
  const documentStatus = document ? validateDocument(document, documentType) : 0; // 0 = incompleto

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange || (onClose ? () => onClose() : undefined)}
    >
      <DialogContent className="dialog-content w-[90vw] max-w-[90vw] sm:max-w-[520px] md:max-w-[580px] lg:max-w-[650px] h-auto overflow-y-auto max-h-[85vh] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {documentType === "cpf" 
              ? "Preencha os dados do cliente pessoa física" 
              : "Preencha os dados da empresa"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form 
            onSubmit={(e) => {
              console.log("Form onSubmit event triggered");
              form.handleSubmit((data) => {
                console.log("Form handleSubmit callback triggered", data);
                onSubmit(data);
              })(e);
            }} 
            className="space-y-5 pt-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{documentType === "cpf" ? "Nome completo" : "Razão Social"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={documentType === "cpf" ? "Nome completo" : "Razão Social da empresa"} 
                      {...field}
                      style={{ WebkitAppearance: "none" }}
                      className="py-2 px-3"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de documento</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cpf" id="cpf" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer" htmlFor="cpf">CPF</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cnpj" id="cnpj" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer" htmlFor="cnpj">CNPJ</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{documentType === "cpf" ? "CPF" : "CNPJ"}</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        placeholder={documentType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                        {...field} 
                        onChange={(e) => {
                          field.onChange(formatDocument(e.target.value, documentType));
                        }}
                        style={{ WebkitAppearance: "none" }}
                        className="py-2 px-3"
                        autoComplete="off"
                      />
                    </FormControl>
                    {document && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {documentStatus === 1 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : documentStatus === -1 ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {documentType === "cnpj" && (
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do contato</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome da pessoa para contato" 
                        {...field} 
                        style={{ WebkitAppearance: "none" }}
                        className="py-2 px-3"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone principal</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(formatPhone(e.target.value));
                        }}
                        style={{ WebkitAppearance: "none" }}
                        className="py-2 px-3"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone secundário (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(formatPhone(e.target.value));
                        }}
                        style={{ WebkitAppearance: "none" }}
                        className="py-2 px-3"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@exemplo.com" 
                      type="email" 
                      {...field} 
                      style={{ WebkitAppearance: "none" }}
                      className="py-2 px-3"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-5 pb-3 sm:pb-4 mb-1 sm:mb-2 flex flex-col sm:flex-row gap-3 mt-3 sm:mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (onOpenChange) {
                    onOpenChange(false);
                  } else if (onClose) {
                    onClose();
                  }
                }} 
                disabled={isPending}
                className="w-full sm:w-auto order-2 sm:order-1 h-11 sm:h-10 py-1 sm:py-2 px-4 sm:px-6"
                style={{ WebkitAppearance: "none" }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full sm:w-auto order-1 sm:order-2 h-11 sm:h-10 py-1 sm:py-2 px-4 sm:px-6"
                style={{ WebkitAppearance: "none" }}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span className="whitespace-nowrap">{isEditing ? "Atualizar" : "Cadastrar"}</span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
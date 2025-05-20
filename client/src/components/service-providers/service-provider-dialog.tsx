import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ServiceProvider } from '@shared/schema';
import { CheckCircle2, AlertCircle } from "lucide-react";

// Schema para validação do formulário
const serviceProviderFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
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
            message: "CPF inválido (algoritmo de verificação)"
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
            message: "CNPJ inválido (algoritmo de verificação)"
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
            message: "CNPJ inválido (algoritmo de verificação)"
          });
          return false;
        }
      }
      
      return true;
    }),
  documentType: z.enum(['cpf', 'cnpj'], { 
    required_error: "Selecione o tipo de documento",
    invalid_type_error: "Tipo de documento inválido" 
  }),
  contactName: z.string().optional(),
  phone: z.string().min(10, { message: 'Telefone deve ter pelo menos 10 dígitos' }),
  phone2: z.string().optional(),
  email: z.string().email({ message: 'E-mail inválido' }),
  active: z.boolean().default(true)
});

type ServiceProviderFormValues = z.infer<typeof serviceProviderFormSchema>;

interface ServiceProviderDialogProps {
  open: boolean;
  onClose: () => void;
  serviceProvider: ServiceProvider | null;
  onSaveSuccess: () => void;
}

export default function ServiceProviderDialog({
  open,
  onClose,
  serviceProvider,
  onSaveSuccess
}: ServiceProviderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!serviceProvider;
  const [document, setDocument] = useState<string>(serviceProvider?.document || '');
  const [documentStatus, setDocumentStatus] = useState<number>(0);

  // Inicializar formulário com react-hook-form e validação zod
  const form = useForm<ServiceProviderFormValues>({
    resolver: zodResolver(serviceProviderFormSchema),
    defaultValues: {
      name: '',
      document: '',
      documentType: 'cpf',
      contactName: '',
      phone: '',
      phone2: '',
      email: '',
      active: true
    },
  });

  // Monitorar a mudança do documento e validar em tempo real
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'document' || name === 'documentType' || !name) {
        const doc = value.document as string || '';
        const docType = value.documentType as 'cpf' | 'cnpj';
        setDocument(doc);
        setDocumentStatus(validateDocument(doc, docType));
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Carregar dados para edição
  useEffect(() => {
    if (serviceProvider) {
      form.reset({
        name: serviceProvider.name,
        document: serviceProvider.document,
        documentType: serviceProvider.documentType as 'cpf' | 'cnpj',
        contactName: serviceProvider.contactName || '',
        phone: serviceProvider.phone,
        phone2: serviceProvider.phone2 || '',
        email: serviceProvider.email,
        active: serviceProvider.active
      });
      setDocument(serviceProvider.document);
      setDocumentStatus(validateDocument(serviceProvider.document, serviceProvider.documentType as 'cpf' | 'cnpj'));
    } else {
      form.reset({
        name: '',
        document: '',
        documentType: 'cpf',
        contactName: '',
        phone: '',
        phone2: '',
        email: '',
        active: true
      });
      setDocument('');
      setDocumentStatus(0);
    }
  }, [serviceProvider, form]);

  // Mutation para criar um novo prestador de serviço
  const createMutation = useMutation({
    mutationFn: async (data: ServiceProviderFormValues) => {
      const res = await apiRequest('POST', '/api/service-providers', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Prestador de serviço criado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-providers'] });
      onClose();
      onSaveSuccess();
    },
    onError: (error: Error) => {
      console.error('Erro ao criar prestador de serviço:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar prestador de serviço",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar um prestador de serviço existente
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; serviceProvider: ServiceProviderFormValues }) => {
      const res = await apiRequest('PUT', `/api/service-providers/${data.id}`, data.serviceProvider);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Prestador de serviço atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-providers'] });
      onClose();
      onSaveSuccess();
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar prestador de serviço:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar prestador de serviço",
        variant: "destructive",
      });
    },
  });

  // Função para lidar com o submit do formulário
  const onSubmit = (data: ServiceProviderFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && serviceProvider) {
        updateMutation.mutate({
          id: serviceProvider.id,
          serviceProvider: data
        });
      } else {
        createMutation.mutate(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Formatar CPF/CNPJ ao digitar
  const formatDocument = (value: string, type: 'cpf' | 'cnpj'): string => {
    // Remover todos os caracteres não numéricos
    const onlyNumbers = value.replace(/\D/g, '');
    
    if (type === 'cpf') {
      // Formatar CPF: 000.000.000-00
      if (onlyNumbers.length <= 3) {
        return onlyNumbers;
      } else if (onlyNumbers.length <= 6) {
        return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3)}`;
      } else if (onlyNumbers.length <= 9) {
        return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3, 6)}.${onlyNumbers.slice(6)}`;
      } else {
        return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3, 6)}.${onlyNumbers.slice(6, 9)}-${onlyNumbers.slice(9, 11)}`;
      }
    } else {
      // Formatar CNPJ: 00.000.000/0000-00
      if (onlyNumbers.length <= 2) {
        return onlyNumbers;
      } else if (onlyNumbers.length <= 5) {
        return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2)}`;
      } else if (onlyNumbers.length <= 8) {
        return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5)}`;
      } else if (onlyNumbers.length <= 12) {
        return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5, 8)}/${onlyNumbers.slice(8)}`;
      } else {
        return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5, 8)}/${onlyNumbers.slice(8, 12)}-${onlyNumbers.slice(12, 14)}`;
      }
    }
  };

  // Formatar telefone ao digitar
  const formatPhone = (value: string): string => {
    // Remover todos os caracteres não numéricos
    const onlyNumbers = value.replace(/\D/g, '');
    
    // Formatar telefone: (00) 0000-0000 ou (00) 00000-0000
    if (onlyNumbers.length <= 2) {
      return onlyNumbers.length ? `(${onlyNumbers}` : '';
    } else if (onlyNumbers.length <= 6) {
      return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2)}`;
    } else if (onlyNumbers.length <= 10) {
      return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 6)}-${onlyNumbers.slice(6)}`;
    } else {
      return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 7)}-${onlyNumbers.slice(7, 11)}`;
    }
  };

  // Obter o tipo de documento atual e definir se mostra o campo de contato
  const currentDocumentType = form.watch('documentType') as 'cpf' | 'cnpj';
  const showContactName = currentDocumentType === 'cnpj';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Prestador de Serviço' : 'Novo Prestador de Serviço'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Tipo de Documento */}
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Tipo de Documento</FormLabel>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Limpar o documento ao trocar o tipo
                      form.setValue('document', '');
                      if (value === 'cnpj') {
                        form.setValue('contactName', '');
                      }
                    }}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cpf" id="cpf" />
                      <Label htmlFor="cpf">CPF</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cnpj" id="cnpj" />
                      <Label htmlFor="cnpj">CNPJ</Label>
                    </div>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Nome/Razão Social */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {currentDocumentType === 'cpf' ? 'Nome Completo' : 'Razão Social'}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={currentDocumentType === 'cpf' ? 'Nome completo do prestador' : 'Razão social da empresa'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Nome do Contato (apenas para CNPJ) */}
            {showContactName && (
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da pessoa de contato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Documento (CPF/CNPJ) */}
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{currentDocumentType.toUpperCase()}</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        placeholder={currentDocumentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'} 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(formatDocument(e.target.value, currentDocumentType));
                        }}
                        className={documentStatus === -1 ? "pr-10 border-red-500" : 
                                  documentStatus === 1 ? "pr-10 border-green-500" : 
                                  "pr-10"}
                      />
                    </FormControl>
                    {document && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
            
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Telefones - colocar lado a lado em telas maiores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone Principal</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000" 
                        {...field} 
                        value={formatPhone(field.value)}
                        onChange={(e) => {
                          // Limitar o número de caracteres
                          const maxLength = 15; // (00) 00000-0000
                          if (formatPhone(e.target.value).length <= maxLength) {
                            field.onChange(e);
                          }
                        }}
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
                    <FormLabel>Telefone Secundário</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000 (Opcional)" 
                        {...field} 
                        value={formatPhone(field.value || '')}
                        onChange={(e) => {
                          // Limitar o número de caracteres
                          const maxLength = 15; // (00) 00000-0000
                          if (formatPhone(e.target.value).length <= maxLength) {
                            field.onChange(e);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            

            
            {/* Status Ativo */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Prestador Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Marque se o prestador está ativo para prestação de serviços
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? 'Salvando...' 
                  : isEditing 
                    ? 'Atualizar' 
                    : 'Cadastrar'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
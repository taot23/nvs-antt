import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { type ServiceType } from '@shared/schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

// Schema para validação do formulário
const serviceTypeFormSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

// Tipo para os valores do formulário
type ServiceTypeFormValues = z.infer<typeof serviceTypeFormSchema>;

// Props do componente
interface ServiceTypeDialogProps {
  open: boolean;
  onClose: () => void;
  serviceType: ServiceType | null;
  onSaveSuccess: () => void;
}

export default function ServiceTypeDialog({
  open,
  onClose,
  serviceType,
  onSaveSuccess
}: ServiceTypeDialogProps) {
  const { toast } = useToast();
  const [showNameError, setShowNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');

  // Configuração do formulário
  const form = useForm<ServiceTypeFormValues>({
    resolver: zodResolver(serviceTypeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      active: true
    }
  });

  // Atualizar o formulário quando receber um tipo de execução para edição
  useEffect(() => {
    if (serviceType) {
      console.log('Atualizando formulário com dados do tipo de execução:', serviceType);
      form.reset({
        name: serviceType.name,
        description: serviceType.description || '',
        active: serviceType.active
      });
      setShowNameError(false);
    } else {
      form.reset({
        name: '',
        description: '',
        active: true
      });
      setShowNameError(false);
    }
  }, [serviceType, form]);

  // Mutation para criar um novo tipo de execução
  const createMutation = useMutation({
    mutationFn: async (data: ServiceTypeFormValues) => {
      const res = await apiRequest("POST", "/api/service-types", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao criar tipo de execução de serviço");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Tipo de execução de serviço criado com sucesso",
      });
      form.reset();
      onClose();
      onSaveSuccess();
    },
    onError: (error: Error) => {
      console.error("Erro ao criar tipo de execução de serviço:", error);
      // Verificar se o erro é de nome duplicado
      if (error.message.includes("com o nome")) {
        setShowNameError(true);
        setNameErrorMessage(error.message);
      } else {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // Mutation para atualizar um tipo de execução existente
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; serviceType: ServiceTypeFormValues }) => {
      const res = await apiRequest("PUT", `/api/service-types/${data.id}`, data.serviceType);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar tipo de execução de serviço");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Tipo de execução de serviço atualizado com sucesso",
      });
      form.reset();
      onClose();
      onSaveSuccess();
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar tipo de execução de serviço:", error);
      // Verificar se o erro é de nome duplicado
      if (error.message.includes("com o nome")) {
        setShowNameError(true);
        setNameErrorMessage(error.message);
      } else {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // Manipulador para envio do formulário
  const onSubmit = (data: ServiceTypeFormValues) => {
    setShowNameError(false);
    
    if (serviceType) {
      // Atualizar tipo de execução existente
      updateMutation.mutate({ id: serviceType.id, serviceType: data });
    } else {
      // Criar novo tipo de execução
      createMutation.mutate(data);
    }
  };

  // Verificar se está enviando o formulário
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isSubmitting && !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {serviceType ? 'Editar Tipo de Execução de Serviço' : 'Novo Tipo de Execução de Serviço'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o nome do tipo de execução" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        setShowNameError(false);
                      }}
                      className={showNameError ? "border-destructive" : ""}
                    />
                  </FormControl>
                  {showNameError && (
                    <p className="text-sm text-destructive mt-1">{nameErrorMessage}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva este tipo de execução de serviço (opcional)"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Uma breve descrição deste tipo de execução de serviço.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status</FormLabel>
                    <FormDescription>
                      Defina se este tipo de execução de serviço está ativo ou inativo.
                    </FormDescription>
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
            
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {serviceType ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
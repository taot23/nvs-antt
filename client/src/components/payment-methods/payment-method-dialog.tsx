import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertPaymentMethodSchema, type PaymentMethod } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Componentes UI
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

// Esquema de validação do formulário
const paymentMethodFormSchema = insertPaymentMethodSchema.extend({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodFormSchema>;

interface PaymentMethodDialogProps {
  open: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethod | null;
  onSaveSuccess: () => void;
}

export default function PaymentMethodDialog({
  open,
  onClose,
  paymentMethod,
  onSaveSuccess
}: PaymentMethodDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!paymentMethod;

  // Configuração do formulário
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: {
      name: '',
      description: '',
      active: true
    }
  });

  // Efeito para preencher o formulário quando estiver editando
  useEffect(() => {
    if (paymentMethod) {
      form.reset({
        name: paymentMethod.name,
        description: paymentMethod.description || '',
        active: paymentMethod.active
      });
    } else {
      form.reset({
        name: '',
        description: '',
        active: true
      });
    }
  }, [paymentMethod, form]);

  // Mutação para criar forma de pagamento
  const createMutation = useMutation({
    mutationFn: async (data: PaymentMethodFormValues) => {
      const res = await apiRequest('POST', '/api/payment-methods', data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao criar forma de pagamento');
      }
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar forma de pagamento',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Forma de pagamento criada com sucesso!',
      });
      setIsSubmitting(false);
      form.reset();
      onClose();
      onSaveSuccess();
    }
  });

  // Mutação para atualizar forma de pagamento
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; paymentMethod: PaymentMethodFormValues }) => {
      const res = await apiRequest('PUT', `/api/payment-methods/${data.id}`, data.paymentMethod);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao atualizar forma de pagamento');
      }
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar forma de pagamento',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Forma de pagamento atualizada com sucesso!',
      });
      setIsSubmitting(false);
      onClose();
      onSaveSuccess();
    }
  });

  // Função para enviar o formulário
  const onSubmit = (data: PaymentMethodFormValues) => {
    setIsSubmitting(true);

    if (isEditing && paymentMethod) {
      updateMutation.mutate({ id: paymentMethod.id, paymentMethod: data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados da forma de pagamento abaixo.'
              : 'Preencha os dados para criar uma nova forma de pagamento.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo: Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Cartão de Crédito"
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes adicionais sobre a forma de pagamento..."
                      {...field}
                      value={field.value || ''}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional. Informações adicionais sobre a forma de pagamento.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Status */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status</FormLabel>
                    <FormDescription>
                      {field.value ? 'Esta forma de pagamento está ativa' : 'Esta forma de pagamento está inativa'}
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

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Atualizando...' : 'Salvando...'}
                  </>
                ) : (
                  <>{isEditing ? 'Atualizar' : 'Salvar'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
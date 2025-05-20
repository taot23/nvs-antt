import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Service } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Schema para o formulário de serviço
const serviceFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
  onSaveSuccess: () => void;
}

export default function ServiceDialog({
  open,
  onClose,
  service,
  onSaveSuccess,
}: ServiceDialogProps) {
  const { toast } = useToast();
  const isEditMode = !!service;

  // Inicializa o formulário
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      active: service?.active !== undefined ? service.active : true,
    },
  });
  
  // Atualizar o formulário quando o serviço mudar (importante para edição)
  useEffect(() => {
    if (service) {
      console.log("Atualizando formulário com dados do serviço:", service);
      // Tentar corrigir os tipos nos dados do serviço
      const formData = {
        name: service.name,
        description: service.description || "",
        active: service.active !== undefined ? service.active : true,
      };
      form.reset(formData); 
    } else {
      // Limpar o formulário para novo cadastro
      const emptyForm = {
        name: "",
        description: "",
        active: true,
      };
      form.reset(emptyForm);
    }
  }, [service, form]);

  // Mutation para criar serviço
  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      const res = await apiRequest("POST", "/api/services", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao criar serviço");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso",
      });
      onSaveSuccess();
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar serviço
  const updateServiceMutation = useMutation({
    mutationFn: async (data: { id: number; service: ServiceFormValues }) => {
      const res = await apiRequest(
        "PUT",
        `/api/services/${data.id}`,
        data.service
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao atualizar serviço");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso",
      });
      onSaveSuccess();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Função para lidar com o envio do formulário
  const onSubmit = (data: ServiceFormValues) => {
    if (isEditMode && service) {
      updateServiceMutation.mutate({ id: service.id, service: data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome do serviço"
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
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
                      placeholder="Descreva o serviço"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de preço removido conforme solicitação */}

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Serviço Ativo
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Defina se este serviço está disponível
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mt-4"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="mt-4"
                disabled={
                  createServiceMutation.isPending ||
                  updateServiceMutation.isPending
                }
              >
                {createServiceMutation.isPending ||
                updateServiceMutation.isPending
                  ? "Salvando..."
                  : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Schema de validação baseado no insertCostTypeSchema
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "O nome não pode ter mais de 100 caracteres" }),
  description: z
    .string()
    .max(500, { message: "A descrição não pode ter mais de 500 caracteres" })
    .optional(),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface CostTypeDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  costType?: {
    id: number;
    name: string;
    description?: string;
    active: boolean;
  };
}

export default function CostTypeDialog({
  open,
  setOpen,
  costType,
}: CostTypeDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!costType;

  // Inicializar formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: costType?.name || "",
      description: costType?.description || "",
      active: costType?.active ?? true,
    },
  });

  // Mutation para criar/editar tipo de custo
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEditing
        ? `/api/cost-types/${costType.id}`
        : "/api/cost-types";
      const method = isEditing ? "PATCH" : "POST";
      const response = await apiRequest(method, url, values);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao salvar tipo de custo");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Tipo de custo atualizado" : "Tipo de custo criado",
        description: isEditing
          ? "Tipo de custo atualizado com sucesso"
          : "Novo tipo de custo criado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cost-types"] });
      form.reset({
        name: "",
        description: "",
        active: true,
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Função para enviar o formulário
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Tipo de Custo" : "Novo Tipo de Custo"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere as informações do tipo de custo."
              : "Preencha os dados para criar um novo tipo de custo operacional."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Tipo de Custo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Combustível" {...field} />
                  </FormControl>
                  <FormDescription>
                    Informe um nome descritivo para o tipo de custo.
                  </FormDescription>
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
                      placeholder="Descrição detalhada do tipo de custo..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Adicione detalhes sobre quando usar este tipo de custo.
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
                    <FormLabel className="text-base">Ativo</FormLabel>
                    <FormDescription>
                      Tipos de custo inativos não aparecem na lista de seleção.
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
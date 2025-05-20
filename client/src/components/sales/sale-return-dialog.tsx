import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Schema de validação
const returnFormSchema = z.object({
  reason: z.string().min(5, { message: "O motivo da devolução é obrigatório e deve ter pelo menos 5 caracteres" }),
});

interface SaleReturnDialogProps {
  open: boolean;
  onClose: () => void;
  saleId?: number | null;
  onReturnSuccess: () => void;
}

export default function SaleReturnDialog({ open, onClose, saleId, onReturnSuccess }: SaleReturnDialogProps) {
  const { toast } = useToast();
  
  // Form
  const form = useForm<z.infer<typeof returnFormSchema>>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      reason: "",
    },
  });
  
  // Consulta da venda para exibir algumas informações
  const { data: sale } = useQuery({
    queryKey: ["/api/sales", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const response = await fetch(`/api/sales/${saleId}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar detalhes da venda");
      }
      return response.json();
    },
    enabled: !!saleId
  });
  
  // Mutation para retornar a venda
  const returnMutation = useMutation({
    mutationFn: async (data: z.infer<typeof returnFormSchema>) => {
      if (!saleId) throw new Error("ID da venda não informado");
      
      const response = await fetch(`/api/sales/${saleId}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: data.reason }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao devolver venda");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Venda devolvida",
        description: "A venda foi devolvida para correção com sucesso",
      });
      form.reset();
      onReturnSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao devolver venda",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Submit do formulário
  const onSubmit = (values: z.infer<typeof returnFormSchema>) => {
    returnMutation.mutate(values);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Devolver Venda para Correção</span>
          </DialogTitle>
          <DialogDescription>
            {sale && (
              <span>
                Venda OS: <strong>{sale.orderNumber}</strong>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da Devolução</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informe o motivo para devolução desta venda ao vendedor..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                variant="destructive"
                disabled={returnMutation.isPending}
              >
                {returnMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Devolver para Correção
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
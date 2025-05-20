import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

// Definindo a tipagem para a venda
interface Sale {
  id: number;
  orderNumber: string;
  date: string;
  customerId: number;
  customerName?: string;
  paymentMethodId: number;
  paymentMethodName?: string;
  sellerId: number;
  sellerName?: string;
  totalAmount: string;
  status: string;
  executionStatus: string;
  financialStatus: string;
  notes: string | null;
  returnReason: string | null;
  responsibleOperationalId: number | null;
  responsibleFinancialId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface DevolveButtonProps {
  sale: Sale;
}

// Componente que renderiza um botão para devolver vendas em estado corrigido
export default function DevolveButton({ sale }: DevolveButtonProps) {
  const [open, setOpen] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  console.log('DevolveButton - sale:', sale?.id, 'status:', sale?.status, 'open:', open, 'userRole:', user?.role);

  // Log mais detalhado para depuração
  console.log('DEPURAÇÃO COMPLETA DevolveButton:', {
    id: sale?.id,
    status: sale?.status,
    userRole: user?.role,
    sellerId: sale?.sellerId,
    userId: user?.id,
    isCorrected: sale?.status === 'corrected',
    isAdmin: user?.role === 'admin',
    isOperacional: user?.role === 'operacional',
    shouldShow: sale?.status === 'corrected' && (
      user?.role === 'admin' || 
      user?.role === 'operacional'
    )
  });

  const devolverMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', `/api/sales/${sale.id}/return`, {
        reason: observacoes,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Venda devolvida com sucesso',
        description: 'A venda foi devolvida para o vendedor com suas observações.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      setOpen(false);
      setObservacoes('');
    },
    onError: (error) => {
      toast({
        title: 'Erro ao devolver venda',
        description: error.message || 'Ocorreu um erro ao devolver a venda.',
        variant: 'destructive',
      });
    },
  });

  const handleDevolver = () => {
    if (!observacoes.trim()) {
      toast({
        title: 'Observação obrigatória',
        description: 'Por favor, informe o motivo da devolução.',
        variant: 'destructive',
      });
      return;
    }
    devolverMutation.mutate();
  };

  // Não mostrar o botão se a venda não estiver em status "corrected"
  // Verificar permissões: apenas administrador ou operacional podem devolver
  console.log("VERIFICANDO RENDERIZAÇÃO, venda:", sale.id, "status:", sale.status, "role:", user?.role);
  
  // Verificação simplificada para depuração
  if (sale.status !== 'corrected') {
    console.log("Botão não mostrado: venda não está com status 'corrected'");
    return null;
  }
  
  // Verificação de permissão
  if (user?.role !== 'admin' && user?.role !== 'operacional') {
    console.log("Botão não mostrado: sem permissão. Role:", user?.role);
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-8 w-8 text-amber-500 hover:text-amber-700 hover:bg-amber-50"
        title="Devolver venda para correção"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Devolver Venda Para Correção</DialogTitle>
            <DialogDescription>
              Você está devolvendo uma venda já corrigida para nova revisão pelo vendedor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número OS</Label>
                <div className="font-medium">{sale.orderNumber}</div>
              </div>
              <div>
                <Label>Data</Label>
                <div className="font-medium">
                  {sale.date ? format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                </div>
              </div>
              <div>
                <Label>Cliente</Label>
                <div className="font-medium">{sale.customerName}</div>
              </div>
              <div>
                <Label>Valor Total</Label>
                <div className="font-medium">
                  R$ {parseFloat(sale.totalAmount).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="col-span-2">
                <Label>Vendedor</Label>
                <div className="font-medium">{sale.sellerName}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-base">
                Motivo da Devolução *
              </Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva por que esta venda precisa ser novamente corrigida..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Informe detalhadamente quais problemas foram identificados nesta venda.
                Estas informações serão registradas no histórico completo da venda.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={devolverMutation.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleDevolver} disabled={devolverMutation.isPending} variant="destructive">
              {devolverMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Devolvendo...
                </>
              ) : (
                'Devolver Venda'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
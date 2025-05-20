import React, { useState } from 'react';
import { CornerUpRight, Loader2 } from 'lucide-react';
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

interface ReenvioButtonProps {
  sale: Sale;
}

// Componente que renderiza um botão para reenviar vendas devolvidas
export default function ReenvioButton({ sale }: ReenvioButtonProps) {
  const [open, setOpen] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  console.log('ReenvioButton - sale:', sale?.id, 'status:', sale?.status, 'open:', open, 'userRole:', user?.role);

  // Log mais detalhado para depuração
  console.log('DEPURAÇÃO COMPLETA ReenvioButton:', {
    id: sale?.id,
    status: sale?.status,
    userRole: user?.role,
    sellerId: sale?.sellerId,
    userId: user?.id,
    isReturned: sale?.status === 'returned',
    isAdmin: user?.role === 'admin',
    isSupervisor: user?.role === 'supervisor',
    isVendedor: user?.role === 'vendedor',
    isYourSale: sale?.sellerId === user?.id,
    shouldShow: sale?.status === 'returned' && (
      user?.role === 'admin' || 
      user?.role === 'supervisor' || 
      (user?.role === 'vendedor' && sale?.sellerId === user?.id)
    )
  });

  const reenviarMutation = useMutation({
    mutationFn: async () => {
      // Corrigido para usar método correto (primeiro método, depois URL)
      const response = await apiRequest('POST', `/api/sales/${sale.id}/resubmit`, {
        correctionNotes: observacoes,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Venda reenviada com sucesso',
        description: 'A venda foi corrigida e reenviada para análise operacional.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      setOpen(false);
      setObservacoes('');
    },
    onError: (error) => {
      toast({
        title: 'Erro ao reenviar venda',
        description: error.message || 'Ocorreu um erro ao reenviar a venda.',
        variant: 'destructive',
      });
    },
  });

  const handleReenviar = () => {
    if (!observacoes.trim()) {
      toast({
        title: 'Observação obrigatória',
        description: 'Por favor, descreva as correções realizadas.',
        variant: 'destructive',
      });
      return;
    }
    reenviarMutation.mutate();
  };

  // Não mostrar o botão se a venda não estiver em status "returned"
  // Verificar permissões: apenas admin, supervisor ou o próprio vendedor podem reenviar
  if (sale.status !== 'returned') {
    console.log("Botão não mostrado: venda não está com status 'returned'");
    return null;
  }
  
  // Verificação de permissão
  if (
    user?.role !== 'admin' && 
    user?.role !== 'supervisor' && 
    !(user?.role === 'vendedor' && sale.sellerId === user?.id)
  ) {
    console.log("Botão não mostrado: sem permissão. Role:", user?.role);
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
        title="Reenviar venda corrigida"
      >
        <CornerUpRight className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reenviar Venda Corrigida</DialogTitle>
            <DialogDescription>
              Você está reenviando uma venda após realizar as correções solicitadas.
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
                <Label>Motivo da Devolução</Label>
                <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                  {sale.returnReason || 'Não especificado'}
                </div>
                {/* Log para depuração */}
                {console.log("Propriedades da venda no ReenvioButton:", Object.keys(sale), "Valor do returnReason:", sale.returnReason)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-base">
                Descrição das Correções Realizadas *
              </Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva detalhadamente as correções que foram feitas..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Descreva todas as alterações e correções que você realizou para resolver os problemas apontados.
                Estas informações serão registradas no histórico completo da venda.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={reenviarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleReenviar} disabled={reenviarMutation.isPending} variant="default">
              {reenviarMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                'Reenviar Venda Corrigida'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
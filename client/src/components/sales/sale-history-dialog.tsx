import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Clock, AlertTriangle, CheckCircle2, CornerDownRight, ArrowUpRight, MessageSquare, SendHorizontal, FileCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SaleHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  saleId?: number;
}

type HistoryEntry = {
  id: number;
  saleId: number;
  fromStatus: string;
  toStatus: string;
  userId: number;
  userName: string;
  notes: string | null;
  createdAt: string;
};

export default function SaleHistoryDialog({ open, onClose, saleId }: SaleHistoryDialogProps) {
  // Carregar os dados da venda
  const { data: sale, isLoading: isLoadingSale } = useQuery({
    queryKey: ['/api/sales', saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const response = await fetch(`/api/sales/${saleId}`);
      if (!response.ok) throw new Error('Erro ao carregar venda');
      return response.json();
    },
    enabled: !!saleId && open,
  });

  // Carregar o histórico
  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/sales', saleId, 'history'],
    queryFn: async () => {
      if (!saleId) return [];
      console.log(`Tentando carregar histórico da venda #${saleId}`);
      const response = await fetch(`/api/sales/${saleId}/history`);
      console.log(`Resposta do histórico: status=${response.status}`);
      if (!response.ok) {
        console.error('Erro ao carregar histórico:', response.statusText);
        throw new Error('Erro ao carregar histórico');
      }
      const data = await response.json();
      console.log('Histórico carregado com sucesso:', data);
      return data;
    },
    enabled: !!saleId && open,
  });

  if (!open) return null;

  // Função para obter a cor do status
  function getStatusVariant(status: string) {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'secondary';
      case 'returned': return 'destructive';
      case 'completed': return 'success';
      case 'canceled': return 'outline';
      case 'corrected': return 'primary';
      default: return 'default';
    }
  }

  // Função para obter a descrição do status
  function getStatusLabel(status: string) {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'returned': return 'Devolvida';
      case 'completed': return 'Concluída';
      case 'canceled': return 'Cancelada';
      case 'corrected': return 'Corrigida Aguardando Operacional';
      default: return status;
    }
  }

  // Função para obter o ícone do status
  function getStatusIcon(fromStatus: string, toStatus: string) {
    if (toStatus === 'pending') return <Clock className="h-5 w-5 text-yellow-500" />;
    if (toStatus === 'in_progress') return <CornerDownRight className="h-5 w-5 text-blue-500" />;
    if (toStatus === 'returned') return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (toStatus === 'completed') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (toStatus === 'canceled') return <ArrowUpRight className="h-5 w-5 text-gray-500" />;
    if (toStatus === 'corrected') return <FileCheck className="h-5 w-5 text-indigo-500" />;
    
    // Para novos registros
    if (fromStatus === '' && toStatus === '') return <MessageSquare className="h-5 w-5 text-purple-500" />;
    
    // Para reenvios
    if (fromStatus === 'returned' && toStatus === 'corrected') return <FileCheck className="h-5 w-5 text-indigo-500" />;
    if (fromStatus === 'returned' && toStatus === 'pending') return <SendHorizontal className="h-5 w-5 text-blue-500" />;
    
    return <MessageSquare className="h-5 w-5" />;
  }

  const isLoading = isLoadingSale || isLoadingHistory;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Histórico da Venda</DialogTitle>
          <DialogDescription>
            Acompanhe todo o histórico de status, correções e transições da venda
            {sale && <span className="font-medium"> #{sale.orderNumber}</span>}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="flex-grow pr-4 my-4 max-h-[70vh] overflow-auto">
            <div className="space-y-6">
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum registro de histórico encontrado para esta venda.
                </div>
              ) : (
                <div className="relative space-y-0">
                  {/* Linha do tempo */}
                  <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-muted"></div>

                  {/* Status atual */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10 mt-1">
                      {getStatusIcon('current', sale?.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">Status Atual:</h4>
                        <Badge variant={getStatusVariant(sale?.status) as any}>
                          {getStatusLabel(sale?.status)}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Atualizado em: {format(new Date(sale?.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  {/* Histórico */}
                  {history.map((entry: HistoryEntry) => (
                    <div key={entry.id} className="flex items-start gap-4 pb-6">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted mt-1">
                        {getStatusIcon(entry.fromStatus, entry.toStatus)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-sm">
                            {entry.fromStatus ? (
                              <>
                                De <Badge variant={getStatusVariant(entry.fromStatus) as any} className="mr-1">
                                  {getStatusLabel(entry.fromStatus)}
                                </Badge>
                                para <Badge variant={getStatusVariant(entry.toStatus) as any}>
                                  {getStatusLabel(entry.toStatus)}
                                </Badge>
                              </>
                            ) : (
                              <>
                                Venda criada como <Badge variant={getStatusVariant(entry.toStatus) as any}>
                                  {getStatusLabel(entry.toStatus)}
                                </Badge>
                              </>
                            )}
                          </h4>
                        </div>

                        <div className="flex items-center text-sm">
                          <span className="font-medium">Por:</span>
                          <span className="ml-1">{entry.userName}</span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>

                        {entry.notes && (
                          <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                            <p className="font-medium mb-1">Observações:</p>
                            <div className="whitespace-pre-wrap break-words">
                              {(() => {
                                try {
                                  // Verifica se as notas contêm JSON estruturado com dados adicionais
                                  if (entry.notes.includes('{"isResubmitted":true') || 
                                      entry.notes.includes('| Dados adicionais:')) {
                                    // Extrai apenas a parte textual antes do JSON
                                    const mainNotes = entry.notes.split(/\s*\|\s*Dados adicionais:/)[0];
                                    return mainNotes.trim();
                                  }
                                  return entry.notes;
                                } catch (error) {
                                  console.error("Erro ao processar notas:", error);
                                  return entry.notes;
                                }
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
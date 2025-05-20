import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clearHistoryCache } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertTriangle, Receipt, BadgeCheck, Clock, FileSpreadsheet, ArrowDownToLine, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Função para obter a descrição do status
function getStatusLabel(status: string) {
  switch (status) {
    case 'pending': return 'Pendente';
    case 'in_progress': return 'Em Andamento';
    case 'returned': return 'Devolvida';
    case 'completed': return 'Concluída';
    case 'canceled': return 'Cancelada';
    case 'paid': return 'Pago';
    case 'corrected': return 'Corrigida Aguardando Operacional';
    default: return status;
  }
}

// Função para obter a cor do status
function getStatusVariant(status: string) {
  switch (status) {
    case 'pending': return 'warning';
    case 'in_progress': return 'secondary';
    case 'returned': return 'destructive';
    case 'completed': return 'success';
    case 'canceled': return 'outline';
    case 'paid': return 'success';
    case 'corrected': return 'primary';
    default: return 'default';
  }
}

interface SaleDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  saleId?: number | null;
}

export default function SaleDetailsDialog({ open, onClose, saleId }: SaleDetailsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("geral");
  
  // Limpar o cache do histórico quando o diálogo é aberto
  useEffect(() => {
    if (open && saleId) {
      clearHistoryCache(saleId);
      console.log(`[SaleDetailsDialog] Cache de histórico limpo para venda #${saleId}`);
    }
  }, [open, saleId]);
  
  // Consulta para obter os detalhes da venda
  const { data: sale, isLoading: isLoadingSale } = useQuery({
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
  
  // Consulta para obter os itens da venda
  const { data: saleItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["/api/sales", saleId, "items"],
    queryFn: async () => {
      if (!saleId) return [];
      const response = await fetch(`/api/sales/${saleId}/items`);
      if (!response.ok) {
        throw new Error("Erro ao carregar itens da venda");
      }
      return response.json();
    },
    enabled: !!saleId
  });
  
  // Consulta para obter os prestadores de serviço da venda
  const { data: serviceProviders = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ["/api/sales", saleId, "service-providers"],
    queryFn: async () => {
      if (!saleId) return [];
      const response = await fetch(`/api/sales/${saleId}/service-providers`);
      if (!response.ok) {
        console.error(`[SaleDetailsDialog] Erro ao carregar prestadores: ${response.status}`);
        return [];
      }
      return response.json();
    },
    enabled: !!saleId
  });
  
  // Consulta para obter o histórico de status da venda
  const { data: statusHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/sales", saleId, "history"],
    queryFn: async () => {
      if (!saleId) return [];
      console.log(`[SaleDetailsDialog] Carregando histórico da venda #${saleId}`);
      const response = await fetch(`/api/sales/${saleId}/history`);
      if (!response.ok) {
        console.error(`[SaleDetailsDialog] Erro ao carregar histórico: ${response.status}`);
        throw new Error("Erro ao carregar histórico da venda");
      }
      const data = await response.json();
      console.log(`[SaleDetailsDialog] Histórico carregado: ${data.length} registros`);
      return data;
    },
    enabled: !!saleId
  });
  
  // Consultas para obter dados relacionados
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error("Erro ao carregar clientes");
      }
      return response.json();
    }
  });
  
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Erro ao carregar usuários");
      }
      return response.json();
    }
  });
  
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["/api/payment-methods"],
    queryFn: async () => {
      const response = await fetch("/api/payment-methods");
      if (!response.ok) {
        throw new Error("Erro ao carregar formas de pagamento");
      }
      return response.json();
    }
  });
  
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error("Erro ao carregar serviços");
      }
      return response.json();
    }
  });
  
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["/api/service-types"],
    queryFn: async () => {
      const response = await fetch("/api/service-types");
      if (!response.ok) {
        throw new Error("Erro ao carregar tipos de serviço");
      }
      return response.json();
    }
  });
  
  // Encontra os nomes dos objetos relacionados
  const findCustomerName = (id: number) => {
    const customer = customers.find((c: any) => c.id === id);
    return customer?.name || `Cliente #${id}`;
  };
  
  const findUserName = (id: number) => {
    const user = users.find((u: any) => u.id === id);
    return user?.username || `Usuário #${id}`;
  };
  
  const findPaymentMethodName = (id: number) => {
    const paymentMethod = paymentMethods.find((p: any) => p.id === id);
    return paymentMethod?.name || `Forma de Pagamento #${id}`;
  };
  
  const findServiceName = (id: number) => {
    const service = services.find((s: any) => s.id === id);
    return service?.name || `Serviço #${id}`;
  };
  
  const findServiceTypeName = (id: number) => {
    const serviceType = serviceTypes.find((t: any) => t.id === id);
    return serviceType?.name || `Tipo de Serviço #${id}`;
  };
  
  // Verifica se está carregando os dados
  const isLoading = isLoadingSale || isLoadingItems || isLoadingHistory || isLoadingProviders;
  
  // Verifica se há dados de venda para mostrar
  if (!isLoading && !sale) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            <span>Detalhes da Venda</span>
          </DialogTitle>
          {sale && (
            <DialogDescription>
              OS: <strong>{sale.orderNumber}</strong> | 
              Data: <strong>{
                sale.date && new Date(sale.date).getFullYear() > 1970 
                  ? format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR }) 
                  : format(new Date(), 'dd/MM/yyyy', { locale: ptBR })
              }</strong>
            </DialogDescription>
          )}
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando detalhes...</span>
          </div>
        ) : (
          <>
            <Tabs defaultValue="geral" value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="itens">Itens</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
              </TabsList>
              
              {/* Aba Geral */}
              <TabsContent value="geral" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Status da Venda</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Badge variant={getStatusVariant(sale.status) as any} className="mt-1">
                        {getStatusLabel(sale.status)}
                      </Badge>
                      
                      {sale.returnReason && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-destructive flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Motivo da devolução:
                          </span>
                          <p className="text-muted-foreground mt-1">{sale.returnReason}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Status de Execução</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Badge variant={getStatusVariant(sale.executionStatus) as any} className="mt-1">
                        {getStatusLabel(sale.executionStatus)}
                      </Badge>
                      
                      {sale.responsibleOperationalId && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-muted-foreground">Responsável:</span>
                          <div>{findUserName(sale.responsibleOperationalId)}</div>
                        </div>
                      )}
                      
                      {serviceProviders && serviceProviders.length > 0 && (
                        <div className="mt-3 text-sm">
                          <span className="font-medium text-muted-foreground">Prestadores:</span>
                          <div className="mt-1">
                            {serviceProviders.map((provider: any) => (
                              <div key={provider.id} className="flex items-center gap-1 mb-1">
                                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                                  {provider.name}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Status Financeiro</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Badge variant={getStatusVariant(sale.financialStatus) as any} className="mt-1">
                        {getStatusLabel(sale.financialStatus)}
                      </Badge>
                      
                      {sale.responsibleFinancialId && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-muted-foreground">Responsável:</span>
                          <div>{findUserName(sale.responsibleFinancialId)}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Informações Gerais</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <dl className="space-y-2 text-sm">
                        {/* Informações do Cliente com CPF/CNPJ */}
                        <div className="flex flex-col">
                          <dt className="font-medium text-muted-foreground">Cliente</dt>
                          <dd>{sale.customer?.name || sale.customerName || findCustomerName(sale.customerId) || "Não informado"}</dd>
                        </div>
                        
                        {/* Documento do cliente (CPF/CNPJ) */}
                        {(() => {
                          // Buscar o cliente pelo ID para acessar os dados completos
                          const customer = customers.find((c: any) => c.id === sale.customerId);
                          if (customer?.document) {
                            const documentType = customer.documentType === 'cnpj' ? 'CNPJ' : 'CPF';
                            return (
                              <div className="flex flex-col">
                                <dt className="font-medium text-muted-foreground">{documentType}</dt>
                                <dd>{customer.document}</dd>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Telefones do cliente */}
                        {(() => {
                          // Buscar o cliente pelo ID para acessar os dados completos
                          const customer = customers.find((c: any) => c.id === sale.customerId);
                          if (customer?.phone) {
                            return (
                              <>
                                <div className="flex flex-col">
                                  <dt className="font-medium text-muted-foreground">Telefone</dt>
                                  <dd>{customer.phone}</dd>
                                </div>
                                {customer.phone2 && (
                                  <div className="flex flex-col">
                                    <dt className="font-medium text-muted-foreground">Telefone 2</dt>
                                    <dd>{customer.phone2}</dd>
                                  </div>
                                )}
                              </>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Vendedor */}
                        <div className="flex flex-col">
                          <dt className="font-medium text-muted-foreground">Vendedor</dt>
                          <dd>{sale.seller?.username || sale.sellerName || findUserName(sale.sellerId) || "Não informado"}</dd>
                        </div>
                        
                        {/* Forma de Pagamento */}
                        <div className="flex flex-col">
                          <dt className="font-medium text-muted-foreground">Forma de Pagamento</dt>
                          <dd>{findPaymentMethodName(sale.paymentMethodId)}</dd>
                        </div>
                        
                        {/* Valor Total */}
                        <div className="flex flex-col">
                          <dt className="font-medium text-muted-foreground">Valor Total</dt>
                          <dd className="font-medium text-lg text-primary">
                            {(() => {
                              try {
                                // Manipulador de visualização segura do valor total
                                const totalAmount = sale.totalAmount || "0";
                                
                                // Verificar se o valor é numérico
                                if (isNaN(parseFloat(totalAmount))) {
                                  console.log("Valor não numérico:", totalAmount);
                                  return "R$ 0,00";
                                }
                                
                                // Formatar para exibir como moeda brasileira
                                return `R$ ${parseFloat(totalAmount).toFixed(2).replace('.', ',')}`;
                              } catch (error) {
                                console.error("Erro ao formatar valor total:", error, sale.totalAmount);
                                return `R$ ${sale.totalAmount || "0,00"}`;
                              }
                            })()}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Prestadores de Serviço</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {serviceProviders && serviceProviders.length > 0 ? (
                        <div className="space-y-2">
                          {serviceProviders.map((provider: any) => (
                            <div key={provider.id} className="flex items-center gap-2">
                              <BadgeCheck className="h-4 w-4 text-primary" />
                              <span className="text-sm">{provider.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Nenhum prestador de serviço associado</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Observações</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {sale.notes ? (
                        <p className="text-sm">{sale.notes}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Nenhuma observação registrada</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {sale.status === "returned" && (
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" /> 
                          Motivo da Devolução
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {sale.returnReason ? (
                          <p className="text-sm">{sale.returnReason}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Motivo não especificado</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Datas e Registros</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col">
                        <dt className="font-medium text-muted-foreground">Data de Registro</dt>
                        <dd>{format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="font-medium text-muted-foreground">Última Atualização</dt>
                        <dd>{format(new Date(sale.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Aba Itens */}
              <TabsContent value="itens" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Itens da Venda</span>
                    </CardTitle>
                    <CardDescription>
                      Total: {saleItems.length} {saleItems.length === 1 ? 'item' : 'itens'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {saleItems.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhum item encontrado para esta venda
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Qtd</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {saleItems.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {findServiceName(item.serviceId)}
                                {item.notes && (
                                  <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                                )}
                              </TableCell>
                              <TableCell>{findServiceTypeName(item.serviceTypeId)}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Card className="w-full md:w-1/3">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Valor Total</span>
                        <span className="text-lg font-bold">
                          {(() => {
                            try {
                              // Manipulador de visualização segura do valor total
                              const totalAmount = sale.totalAmount || "0";
                              
                              // Verificar se o valor é numérico
                              if (isNaN(parseFloat(totalAmount))) {
                                console.log("Valor não numérico:", totalAmount);
                                return "R$ 0,00";
                              }
                              
                              // Formatar para exibir como moeda brasileira
                              return `R$ ${parseFloat(totalAmount).toFixed(2).replace('.', ',')}`;
                            } catch (error) {
                              console.error("Erro ao formatar valor total:", error, sale.totalAmount);
                              return `R$ ${sale.totalAmount || "0,00"}`;
                            }
                          })()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Aba Histórico */}
              <TabsContent value="historico" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Histórico de Status</span>
                    </CardTitle>
                    <CardDescription>
                      Registro completo de todas as mudanças na venda
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {statusHistory.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhum registro de alteração para esta venda
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {statusHistory.map((history: any) => (
                          <div key={history.id} className="border-l-2 pl-4 pb-4 relative">
                            <div className="absolute w-3 h-3 rounded-full bg-primary -left-[7px] top-0"></div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(history.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {findUserName(history.userId)}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium">
                                Status alterado de{" "}
                                <Badge variant={getStatusVariant(history.fromStatus) as any} className="ml-1">
                                  {getStatusLabel(history.fromStatus)}
                                </Badge>{" "}
                                para{" "}
                                <Badge variant={getStatusVariant(history.toStatus) as any} className="ml-1">
                                  {getStatusLabel(history.toStatus)}
                                </Badge>
                              </p>
                              {history.notes && (
                                <p className="text-sm text-muted-foreground">{history.notes}</p>
                              )}
                              
                              {/* Mostrar motivo da devolução se o status for alterado para "returned" */}
                              {history.toStatus === "returned" && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                  <p className="text-sm font-medium flex items-center gap-1 text-red-600 mb-1">
                                    <AlertTriangle className="h-3 w-3" /> 
                                    Motivo da Devolução
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {sale.returnReason || "Não especificado"}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
        
        <DialogFooter className="mt-4 sm:justify-between">
          <div className="hidden sm:block text-xs text-muted-foreground">
            Criado em: {sale && format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </div>
          <Button type="button" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
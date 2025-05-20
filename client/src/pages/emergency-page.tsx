// Página de emergência para cadastro de vendas simplificado
// Criada em 27/04/2025 para resolver problemas persistentes

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2, ArrowLeft, Save, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function EmergencyPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dados para os selects
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    orderNumber: "",
    customerId: "",
    sellerId: "",
    serviceTypeId: "",
    paymentMethodId: "",
    totalAmount: "",
    installments: "1",
    notes: ""
  });
  
  // Dados de itens
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({
    serviceId: "",
    quantity: "1",
    price: "0",
    notes: ""
  });
  
  // Dados de parcelas
  const [installmentDates, setInstallmentDates] = useState<string[]>([]);
  
  // Buscar dados iniciais
  useEffect(() => {
    async function fetchData() {
      try {
        const [
          customersRes, 
          servicesRes, 
          serviceTypesRes, 
          paymentMethodsRes,
          usersRes
        ] = await Promise.all([
          fetch('/api/customers').then(res => res.json()),
          fetch('/api/services').then(res => res.json()),
          fetch('/api/service-types').then(res => res.json()),
          fetch('/api/payment-methods').then(res => res.json()),
          fetch('/api/users').then(res => res.json())
        ]);
        
        setCustomers(customersRes);
        setServices(servicesRes);
        setServiceTypes(serviceTypesRes);
        setPaymentMethods(paymentMethodsRes);
        setUsers(usersRes);
        
        // Definir vendedor padrão como o usuário atual
        if (user) {
          setFormData(prev => ({
            ...prev,
            sellerId: String(user.id),
            orderNumber: `OS-${new Date().getTime()}`
          }));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados necessários.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [user, toast]);
  
  // Atualizar datas das parcelas quando o número de parcelas mudar
  useEffect(() => {
    const numInstallments = parseInt(formData.installments, 10) || 1;
    
    // Gerar datas mensais a partir da data atual
    const dates = [];
    const baseDate = new Date();
    
    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(baseDate.getMonth() + i);
      
      // Formatar como YYYY-MM-DD
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(dueDate.getDate()).padStart(2, '0');
      
      dates.push(`${year}-${month}-${day}`);
    }
    
    setInstallmentDates(dates);
  }, [formData.installments]);
  
  // Atualizar campo formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Atualizar select
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Atualizar campo item
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };
  
  // Adicionar item
  const handleAddItem = () => {
    if (!newItem.serviceId) {
      toast({
        title: "Serviço obrigatório",
        description: "Selecione um serviço para adicionar.",
        variant: "destructive"
      });
      return;
    }
    
    // Buscar nome do serviço
    const service = services.find(s => s.id === parseInt(newItem.serviceId, 10));
    
    setItems(prev => [
      ...prev,
      {
        ...newItem,
        serviceName: service?.name || `Serviço #${newItem.serviceId}`,
        totalPrice: (parseFloat(newItem.price) * parseInt(newItem.quantity, 10)).toString()
      }
    ]);
    
    // Resetar novo item
    setNewItem({
      serviceId: "",
      quantity: "1",
      price: "0",
      notes: ""
    });
    
    // Recalcular total
    recalculateTotal();
  };
  
  // Remover item
  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    
    // Recalcular total
    recalculateTotal();
  };
  
  // Recalcular valor total
  const recalculateTotal = () => {
    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * parseInt(item.quantity, 10));
    }, 0);
    
    setFormData(prev => ({ ...prev, totalAmount: total.toFixed(2) }));
  };
  
  // Atualizar data de parcela
  const handleInstallmentDateChange = (index: number, value: string) => {
    setInstallmentDates(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };
  
  // Salvar venda
  const handleSave = async () => {
    // Validações básicas
    if (!formData.customerId) {
      toast({
        title: "Cliente obrigatório",
        description: "Selecione um cliente para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.sellerId) {
      toast({
        title: "Vendedor obrigatório",
        description: "Selecione um vendedor para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.serviceTypeId) {
      toast({
        title: "Tipo de serviço obrigatório",
        description: "Selecione um tipo de serviço para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.paymentMethodId) {
      toast({
        title: "Forma de pagamento obrigatória",
        description: "Selecione uma forma de pagamento para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Itens obrigatórios",
        description: "Adicione pelo menos um item à venda.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Preparar dados para envio
      const payload = {
        ...formData,
        // Converter IDs para números
        customerId: parseInt(formData.customerId, 10),
        sellerId: parseInt(formData.sellerId, 10),
        serviceTypeId: parseInt(formData.serviceTypeId, 10),
        paymentMethodId: parseInt(formData.paymentMethodId, 10),
        // Dados adicionais
        items: items.map(item => ({
          serviceId: parseInt(item.serviceId, 10),
          serviceTypeId: parseInt(formData.serviceTypeId, 10),
          quantity: parseInt(item.quantity, 10),
          price: item.price,
          totalPrice: item.totalPrice,
          notes: item.notes
        })),
        installmentDates
      };
      
      console.log("Enviando dados para rota de emergência:", JSON.stringify(payload, null, 2));
      
      // Enviar para o endpoint de emergência
      const response = await fetch('/api/emergency/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar venda");
      }
      
      const result = await response.json();
      
      toast({
        title: "Venda criada com sucesso!",
        description: `A venda foi criada com o código ${result.sale.orderNumber}.`,
        variant: "default"
      });
      
      // Redirecionar para a página de vendas
      setTimeout(() => {
        navigate('/sales');
      }, 2000);
      
    } catch (error) {
      console.error("Erro ao salvar venda:", error);
      toast({
        title: "Erro ao criar venda",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando...</span>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/sales')} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Cadastro de Venda (Emergência)</h1>
          <p className="text-muted-foreground">
            Esta é uma versão simplificada para resolver problemas de cadastro.
          </p>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Preencha os dados básicos da venda
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <Label htmlFor="orderNumber">Número da OS</Label>
            <Input
              id="orderNumber"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleInputChange}
              placeholder="Número da ordem de serviço"
            />
          </div>
          
          <div>
            <Label htmlFor="customerId">Cliente</Label>
            <Select 
              value={formData.customerId}
              onValueChange={(value) => handleSelectChange('customerId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="sellerId">Vendedor</Label>
            <Select 
              value={formData.sellerId}
              onValueChange={(value) => handleSelectChange('sellerId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um vendedor" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="serviceTypeId">Tipo de Serviço</Label>
            <Select 
              value={formData.serviceTypeId}
              onValueChange={(value) => handleSelectChange('serviceTypeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map(type => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="paymentMethodId">Forma de Pagamento</Label>
            <Select 
              value={formData.paymentMethodId}
              onValueChange={(value) => handleSelectChange('paymentMethodId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.id} value={String(method.id)}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="installments">Número de Parcelas</Label>
            <Select 
              value={formData.installments}
              onValueChange={(value) => handleSelectChange('installments', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o número de parcelas" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                  <SelectItem key={num} value={String(num)}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="totalAmount">Valor Total</Label>
            <Input
              id="totalAmount"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Observações adicionais"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Itens da Venda</CardTitle>
          <CardDescription>
            Adicione os produtos/serviços desta venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-4">
            <div className="md:col-span-2">
              <Label htmlFor="serviceId">Serviço</Label>
              <Select
                value={newItem.serviceId}
                onValueChange={(value) => setNewItem(prev => ({ ...prev, serviceId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={String(service.id)}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={handleItemChange}
              />
            </div>
            
            <div>
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                name="price"
                value={newItem.price}
                onChange={handleItemChange}
                placeholder="0.00"
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleAddItem} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
          </div>
          
          {items.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Serviço</th>
                    <th className="p-2 text-right">Qtd</th>
                    <th className="p-2 text-right">Preço</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">{item.serviceName}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">R$ {parseFloat(item.price).toFixed(2)}</td>
                      <td className="p-2 text-right">R$ {parseFloat(item.totalPrice).toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border rounded-md p-8 text-center bg-muted/50">
              <p className="text-muted-foreground">Nenhum item adicionado à venda</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {parseInt(formData.installments, 10) > 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Parcelas</CardTitle>
            <CardDescription>
              Defina as datas de vencimento das parcelas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {installmentDates.map((date, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 flex-shrink-0">
                    <span className="font-medium text-sm">
                      Parcela {index + 1}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => handleInstallmentDateChange(index, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/sales')}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Venda
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
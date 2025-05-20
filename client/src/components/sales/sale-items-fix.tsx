import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SaleItemsFixProps {
  fields: any[];
  form: any;
  remove: (index: number) => void;
  services: any[];
  serviceTypes: any[];
  saleItems: any[];
  isLoadingItems: boolean;
  readOnly?: boolean;
  updateFormItems: (items: any[]) => void;
}

export function SaleItemsFix({
  fields, 
  form, 
  remove, 
  services, 
  serviceTypes, 
  saleItems,
  isLoadingItems,
  readOnly = false,
  updateFormItems
}: SaleItemsFixProps) {
  // Estado para forçar renderização
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  
  // Efeito que roda sempre que os saleItems mudarem ou o componente for montado
  useEffect(() => {
    if (saleItems && saleItems.length > 0) {
      console.log("🔄 Itens disponíveis, atualizando formulário");
      updateFormItems(saleItems);
    }
  }, [saleItems, updateFormItems]);
  
  return (
    <div className="border rounded-md p-4 mt-4">
      <h3 className="font-medium mb-2">Itens da Venda</h3>
      
      {/* Cabeçalho de Itens da Venda - simplificado */}
      <div className="text-xs text-muted-foreground text-right mb-2">
        {isLoadingItems ? "Carregando itens..." : `${fields.length} ${fields.length === 1 ? 'item' : 'itens'}`}
      </div>
      
      {fields.length === 0 ? (
        <div className="flex justify-center items-center p-4 text-muted-foreground">
          Nenhum item adicionado. Adicione um serviço abaixo.
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="font-medium">
                    {services.find((s: any) => s.id === field.serviceId)?.name || "Serviço não encontrado"}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Qtd: {field.quantity} | Tipo: {serviceTypes.find((t: any) => t.id === (field.serviceTypeId || form.getValues().serviceTypeId))?.name || "Tipo não encontrado"}
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {!readOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { SaleInstallment, SaleOperationalCost } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface SaleFinancialSummaryProps {
  totalAmount: string | number;
  operationalCosts: SaleOperationalCost[];
  installments: SaleInstallment[];
}

export default function SaleFinancialSummary({
  totalAmount,
  operationalCosts,
  installments,
}: SaleFinancialSummaryProps) {
  // Converter totalAmount para número se for string
  const totalAmountNumber = typeof totalAmount === "string" 
    ? parseFloat(totalAmount) 
    : totalAmount;

  // Calcular o valor total dos custos operacionais
  const totalOperationalCosts = operationalCosts.reduce(
    (sum, cost) => sum + parseFloat(cost.amount.toString()),
    0
  );

  // Calcular o valor total pago (parcelas com status "paid")
  const totalPaid = installments
    .filter(installment => installment.status === "paid")
    .reduce(
      (sum, installment) => sum + parseFloat(installment.amount.toString()),
      0
    );

  // Calcular valor em aberto (total - pago)
  const openAmount = totalAmountNumber - totalPaid;

  // Calcular resultado líquido (total - custos)
  const netResult = totalAmountNumber - totalOperationalCosts;

  // Determinar se o resultado é positivo ou negativo
  const resultType = netResult >= 0 ? "increase" : "decrease";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Financeiro</CardTitle>
        <CardDescription>Visão geral dos valores da venda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Valor Total:</span>
              <span className="font-bold">{formatCurrency(totalAmountNumber)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Valor Pago:</span>
              <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
            </div>
            
            <div className="flex justify-between items-center border-t border-border pt-2 mt-2">
              <span className="text-sm font-medium">Valor em Aberto:</span>
              <span className={`font-bold ${openAmount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {formatCurrency(openAmount)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Valor Total:</span>
              <span className="font-bold">{formatCurrency(totalAmountNumber)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Custos Operacionais:</span>
              <span className="font-medium text-red-600">{formatCurrency(totalOperationalCosts)}</span>
            </div>
            
            <div className="flex justify-between items-center border-t border-border pt-2 mt-2">
              <span className="text-sm font-medium">Resultado Líquido:</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netResult)}
                </span>
                <Badge 
                  variant="outline" 
                  className={`${
                    netResult >= 0 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}
                >
                  {netResult >= 0 
                    ? <><ArrowUp className="h-3 w-3 mr-1" /> Positivo</> 
                    : <><ArrowDown className="h-3 w-3 mr-1" /> Negativo</>
                  }
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
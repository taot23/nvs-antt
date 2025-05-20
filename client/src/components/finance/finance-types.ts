import { Sale } from "@shared/schema";

export interface SafeUser {
  id: number;
  username: string;
  role: string;
}

export interface FinancialSummary {
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  totalToReceive: number; // Valor a receber (soma das parcelas não pagas)
  totalCosts: number;
  netResult: number;
}

export interface FinanceSale extends Sale {
  sellerName?: string;
  customerName?: string;
  financialSummary?: FinancialSummary;
}

export function convertToSafeUser(user: any): SafeUser | null {
  if (!user) return null;
  
  return {
    id: user.id,
    username: user.username,
    role: user.role || "vendedor" // Garante um valor padrão para o role
  };
}
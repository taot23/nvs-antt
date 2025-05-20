/**
 * Este script contém correções para o campo paymentDate nos custos operacionais.
 * Ele corrige as funções que manipulam custos operacionais para incluir corretamente
 * o campo de data de pagamento.
 * 
 * Correções necessárias:
 * 
 * 1. Incluir paymentDate no objeto retornado por createSaleOperationalCost
 * Localização: server/storage.ts ~ linha 2524
 * Solução: Adicionar o campo paymentDate logo após o campo date
 * 
 * 2. Adicionar suporte para atualizar paymentDate no método updateSaleOperationalCost
 * Localização: server/storage.ts ~ linha 2595
 * Solução: Adicionar uma verificação para o campo paymentDate antes da atualização do updated_at
 * 
 * 3. Incluir paymentDate no objeto retornado por updateSaleOperationalCost
 * Localização: server/storage.ts ~ linha 2620
 * Solução: Adicionar o campo paymentDate logo após o campo date
 */

// Código sugerido para a correção 2 (atualização de paymentDate):
if (data.paymentDate !== undefined) {
  updates.push(`payment_date = $${paramIndex++}`);
  values.push(data.paymentDate);
}

// Posição: adicionar antes do bloco "Sempre atualizar o updated_at"
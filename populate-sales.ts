import { db } from "./server/db";
import { sales, saleItems, salesStatusHistory } from "./shared/schema";
import { randomUUID } from "crypto";

async function createSale(
  orderNumber: string,
  customerId: number,
  sellerId: number,
  paymentMethodId: number,
  status: string = "pending",
  executionStatus: string = "pending",
  financialStatus: string = "pending",
  totalAmount: string = "0"
) {
  const [sale] = await db
    .insert(sales)
    .values({
      orderNumber,
      date: new Date(), // Adicionando data atual
      customerId,
      sellerId,
      paymentMethodId,
      status,
      executionStatus,
      financialStatus,
      totalAmount,
    })
    .returning();

  // Criar histórico de status
  await db.insert(salesStatusHistory).values({
    saleId: sale.id,
    fromStatus: "",
    toStatus: status,
    userId: sellerId,
    notes: "Venda criada automaticamente",
  });

  // Adicionar um item de serviço para cada venda
  const serviceId = Math.floor(Math.random() * 4) + 1; // Serviços de 1 a 4
  await db.insert(saleItems).values({
    saleId: sale.id,
    serviceId: serviceId,
    serviceTypeId: Math.floor(Math.random() * 2) + 1, // Tipos de 1 a 2
    quantity: 1,
    price: "100",
    totalPrice: "100",
  });

  console.log(`Venda #${sale.orderNumber} criada com ID ${sale.id} para vendedor ${sellerId}`);
  return sale;
}

export async function populateSales() {
  try {
    console.log("Iniciando população de 30 vendas...");
    
    // IDs dos vendedores
    const sellerIds = [3, 5, 8]; // vendedor, vendedor2, supervisor
    const sellerRoles = {
      3: "vendedor",
      5: "vendedor2",
      8: "supervisor"
    };
    
    // Distribuir 10 vendas para cada vendedor
    for (let i = 0; i < 30; i++) {
      const sellerIndex = i % 3;
      const sellerId = sellerIds[sellerIndex];
      const orderNumber = `OS-${100 + i}`; // Numeração única para ordens de serviço
      
      // Criar a venda com status variados
      const statuses = ["pending", "in_progress", "completed", "returned", "corrected"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      await createSale(
        orderNumber,
        1, // cliente id
        sellerId,
        1, // método de pagamento
        randomStatus,
        randomStatus === "completed" ? "completed" : "pending",
        randomStatus === "completed" ? "pending" : "pending",
        (Math.floor(Math.random() * 10) * 100 + 100).toString() // valor entre 100 e 1000
      );
    }
    
    console.log("População concluída com sucesso!");
    return { success: true, message: "30 vendas criadas com sucesso" };
  } catch (error: any) {
    console.error("Erro ao popular vendas:", error);
    return { success: false, message: error.message || String(error) };
  }
}

// Para execução direta via ESM
// Não mantemos a verificação de execução direta, pois será sempre importado
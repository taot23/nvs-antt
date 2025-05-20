import { db } from './server/db';
import { sales, services, serviceTypes, salesItems, customers, users, saleInstallments } from './shared/schema';
import { eq } from 'drizzle-orm';

async function createSaleForVendedor() {
  // 1. Verificar se temos o vendedor
  const vendedor = await db.query.users.findFirst({
    where: eq(users.username, 'vendedor')
  });
  
  if (!vendedor) {
    console.error('Usuário vendedor não encontrado!');
    return;
  }
  
  console.log('Vendedor encontrado com ID:', vendedor.id);
  
  // 2. Verificar se temos um tipo de serviço
  const serviceType = await db.query.serviceTypes.findFirst();
  if (!serviceType) {
    console.error('Nenhum tipo de serviço encontrado!');
    return;
  }
  
  console.log('Tipo de serviço encontrado:', serviceType.name);
  
  // 3. Verificar se temos um cliente
  const customer = await db.query.customers.findFirst();
  if (!customer) {
    console.error('Nenhum cliente encontrado!');
    return;
  }
  
  console.log('Cliente encontrado:', customer.name);
  
  // 4. Criar uma venda para hoje
  const [todaySale] = await db.insert(sales).values({
    orderNumber: `V-${Date.now().toString().slice(-5)}`,
    date: new Date(),
    customerId: customer.id,
    sellerId: vendedor.id,
    serviceTypeId: serviceType.id,
    totalAmount: '1500.00',
    status: 'pending',
    financialStatus: 'pending',
    notes: 'Venda de teste para hoje',
    installmentsCount: 1,
    paymentMethodId: 1
  }).returning();
  
  console.log('Venda criada para hoje:', todaySale.id);
  
  // 5. Criar parcela para a venda
  await db.insert(saleInstallments).values({
    saleId: todaySale.id,
    installmentNumber: 1,
    dueDate: new Date(),
    amount: '1500.00',
    status: 'pending'
  });
  
  console.log('Parcela criada para venda de hoje');
  
  // 6. Criar uma venda para ontem
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const [yesterdaySale] = await db.insert(sales).values({
    orderNumber: `V-${Date.now().toString().slice(-5)}`,
    date: yesterday,
    customerId: customer.id,
    sellerId: vendedor.id,
    serviceTypeId: serviceType.id,
    totalAmount: '2500.00',
    status: 'completed',
    financialStatus: 'paid',
    notes: 'Venda de teste para ontem',
    installmentsCount: 1,
    paymentMethodId: 1
  }).returning();
  
  console.log('Venda criada para ontem:', yesterdaySale.id);
  
  // 7. Criar parcela para a venda de ontem
  await db.insert(saleInstallments).values({
    saleId: yesterdaySale.id,
    installmentNumber: 1,
    dueDate: yesterday,
    amount: '2500.00',
    status: 'paid'
  });
  
  console.log('Parcela criada para venda de ontem');
  
  // 8. Criar uma venda para o admin (usuário 1)
  const [adminSale] = await db.insert(sales).values({
    orderNumber: `V-${Date.now().toString().slice(-5)}`,
    date: new Date(),
    customerId: customer.id,
    sellerId: 1, // admin
    serviceTypeId: serviceType.id,
    totalAmount: '3000.00',
    status: 'pending',
    financialStatus: 'pending',
    notes: 'Venda de teste para admin',
    installmentsCount: 1,
    paymentMethodId: 1
  }).returning();
  
  console.log('Venda criada para admin:', adminSale.id);
  
  // 9. Criar parcela para a venda do admin
  await db.insert(saleInstallments).values({
    saleId: adminSale.id,
    installmentNumber: 1,
    dueDate: new Date(),
    amount: '3000.00',
    status: 'pending'
  });
  
  console.log('Parcela criada para venda do admin');
  
  console.log('Vendas de teste criadas com sucesso!');
}

createSaleForVendedor().catch(error => {
  console.error('Erro ao criar vendas de teste:', error);
});

import {
  users,
  type User,
  type InsertUser,
  customers,
  type Customer,
  type InsertCustomer,
  services,
  type Service,
  type InsertService,
  paymentMethods,
  type PaymentMethod,
  type InsertPaymentMethod,
  serviceTypes,
  type ServiceType,
  type InsertServiceType,
  serviceProviders,
  type ServiceProvider,
  type InsertServiceProvider,
  saleServiceProviders,
  type SaleServiceProvider,
  type InsertSaleServiceProvider,
  sales,
  type Sale,
  type InsertSale,
  saleItems,
  type SaleItem,
  type InsertSaleItem,
  salesStatusHistory,
  type SalesStatusHistory,
  type InsertSalesStatusHistory,
  saleInstallments,
  type SaleInstallment,
  type InsertSaleInstallment,
  saleOperationalCosts,
  type SaleOperationalCost,
  type InsertSaleOperationalCost,
  salePaymentReceipts,
  type SalePaymentReceipt,
  type InsertSalePaymentReceipt,
  costTypes,
  type CostType,
  type InsertCostType,
  reports,
  type Report,
  type InsertReport,
  reportExecutions,
  type ReportExecution,
  type InsertReportExecution,
  saleServiceProviders,
  type SaleServiceProvider,
  type InsertSaleServiceProvider,
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { eq, desc } from "drizzle-orm";
import { db, pool } from "./db";

const PostgresSessionStore = connectPg(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Report methods
  getReports(userRole: string): Promise<any[]>;
  getReport(id: number): Promise<any | undefined>;
  createReport(report: any): Promise<any>;
  updateReport(id: number, report: any): Promise<any | undefined>;
  deleteReport(id: number): Promise<boolean>;
  executeReport(reportId: number, userId: number, parameters: any): Promise<any>;
  getReportExecutions(reportId: number, limit?: number): Promise<any[]>;
  getReportExecution(id: number): Promise<any | undefined>;
  getRecentExecutions(userId: number, userRole: string, limit?: number): Promise<any[]>;

  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByDocument(document: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(
    id: number,
    customer: Partial<InsertCustomer>,
  ): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Service methods
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  getServiceByName(name: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(
    id: number,
    service: Partial<InsertService>,
  ): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Payment Method methods
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  getPaymentMethodByName(name: string): Promise<PaymentMethod | undefined>;
  createPaymentMethod(
    paymentMethod: InsertPaymentMethod,
  ): Promise<PaymentMethod>;
  updatePaymentMethod(
    id: number,
    paymentMethod: Partial<InsertPaymentMethod>,
  ): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;

  // Service Type methods
  getServiceTypes(): Promise<ServiceType[]>;
  getServiceType(id: number): Promise<ServiceType | undefined>;
  getServiceTypeByName(name: string): Promise<ServiceType | undefined>;
  createServiceType(serviceType: InsertServiceType): Promise<ServiceType>;
  updateServiceType(
    id: number,
    serviceType: Partial<InsertServiceType>,
  ): Promise<ServiceType | undefined>;
  deleteServiceType(id: number): Promise<boolean>;

  // Service Provider methods
  getServiceProviders(): Promise<ServiceProvider[]>;
  getServiceProvider(id: number): Promise<ServiceProvider | undefined>;
  getServiceProviderByDocument(
    document: string,
  ): Promise<ServiceProvider | undefined>;
  createServiceProvider(
    serviceProvider: InsertServiceProvider,
  ): Promise<ServiceProvider>;
  updateServiceProvider(
    id: number,
    serviceProvider: Partial<InsertServiceProvider>,
  ): Promise<ServiceProvider | undefined>;
  deleteServiceProvider(id: number): Promise<boolean>;

  // Sale methods
  getSales(): Promise<Sale[]>;
  getSalesByStatus(status: string): Promise<Sale[]>;
  getSalesBySellerAndStatus(sellerId: number, status: string): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  getSaleByOrderNumber(orderNumber: string): Promise<Sale | undefined>;
  getLatestSales(limit: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined>;
  deleteSale(id: number): Promise<boolean>;

  // Paginação de vendas
  getSalesPaginated(options: {
    page: number;
    limit: number;
    status?: string;
    sellerId?: number;
    searchTerm?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<{
    data: Sale[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  // Sale Items methods
  getSaleItems(saleId: number): Promise<SaleItem[]>;
  getSaleItem(id: number): Promise<SaleItem | undefined>;
  createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem>;
  updateSaleItem(
    id: number,
    saleItem: Partial<InsertSaleItem>,
  ): Promise<SaleItem | undefined>;
  deleteSaleItem(id: number): Promise<boolean>;

  // Sales Status History methods
  getSalesStatusHistory(saleId: number): Promise<SalesStatusHistory[]>;
  createSalesStatusHistory(
    statusHistory: InsertSalesStatusHistory,
  ): Promise<SalesStatusHistory>;
  
  // Sale Service Providers methods
  getSaleServiceProviders(saleId: number): Promise<SaleServiceProvider[]>;
  createSaleServiceProvider(relation: InsertSaleServiceProvider): Promise<SaleServiceProvider>;
  updateSaleServiceProviders(saleId: number, serviceProviderIds: number[]): Promise<SaleServiceProvider[]>;
  deleteSaleServiceProviders(saleId: number): Promise<boolean>;

  // Sale Installments methods
  getSaleInstallments(saleId: number): Promise<SaleInstallment[]>;
  getSaleInstallment(id: number): Promise<SaleInstallment | undefined>;
  createSaleInstallment(
    installment: InsertSaleInstallment,
  ): Promise<SaleInstallment>;
  createSaleInstallments(
    installments: InsertSaleInstallment[],
  ): Promise<SaleInstallment[]>;
  updateSaleInstallment(
    id: number,
    installment: Partial<InsertSaleInstallment>,
  ): Promise<SaleInstallment | undefined>;
  deleteSaleInstallments(saleId: number): Promise<boolean>;

  // Operational Costs methods
  getSaleOperationalCosts(saleId: number): Promise<SaleOperationalCost[]>;
  getSaleOperationalCost(id: number): Promise<SaleOperationalCost | undefined>;
  createSaleOperationalCost(
    cost: InsertSaleOperationalCost,
  ): Promise<SaleOperationalCost>;
  updateSaleOperationalCost(
    id: number,
    cost: Partial<InsertSaleOperationalCost>,
  ): Promise<SaleOperationalCost | undefined>;
  deleteSaleOperationalCost(id: number): Promise<boolean>;

  // Payment Receipt methods
  getSalePaymentReceipts(installmentId: number): Promise<SalePaymentReceipt[]>;
  getSalePaymentReceipt(id: number): Promise<SalePaymentReceipt | undefined>;
  createSalePaymentReceipt(
    receipt: InsertSalePaymentReceipt,
  ): Promise<SalePaymentReceipt>;
  updateSalePaymentReceipt(
    id: number,
    receipt: Partial<InsertSalePaymentReceipt>,
  ): Promise<SalePaymentReceipt | undefined>;
  deleteSalePaymentReceipt(id: number): Promise<boolean>;

  // Cost Types methods
  getCostTypes(): Promise<CostType[]>;
  getCostType(id: number): Promise<CostType | undefined>;
  getCostTypeByName(name: string): Promise<CostType | undefined>;
  createCostType(costType: InsertCostType): Promise<CostType>;
  updateCostType(
    id: number,
    costType: Partial<InsertCostType>,
  ): Promise<CostType | undefined>;
  deleteCostType(id: number): Promise<boolean>;

  // Gerenciar confirmação de pagamentos de parcelas
  confirmInstallmentPayment(
    installmentId: number,
    userId: number,
    paymentDate: string, // Alterado para string para preservar exatamente o formato digitado pelo usuário
    receiptData?: { type: string; url?: string; data?: any; notes?: string },
    paymentMethodId?: number,
    splitPayments?: Array<{methodId: number, amount: number}>
  ): Promise<SaleInstallment | undefined>;
  
  // Editar pagamento já confirmado de uma parcela (exclusivo para administradores)
  editInstallmentPayment(
    installmentId: number,
    userId: number,
    paymentDate: string,
    paymentMethodId: number,
    notes?: string,
    receiptData?: { detail: string; paymentMethod: string },
  ): Promise<SaleInstallment | undefined>;

  // Special Sale operations
  returnSaleToSeller(
    saleId: number,
    userId: number,
    reason: string,
  ): Promise<Sale | undefined>;
  markSaleInProgress(
    saleId: number,
    operationalId: number,
    serviceTypeId?: number,
    serviceProviderId?: number,
  ): Promise<Sale | undefined>;
  completeSaleExecution(
    saleId: number,
    operationalId: number,
  ): Promise<Sale | undefined>;
  markSaleAsPaid(
    saleId: number,
    financialId: number,
  ): Promise<Sale | undefined>;
  
  // Atualizar status de uma venda e registrar no histórico
  updateSaleStatus(
    saleId: number, 
    fromStatus: string, 
    toStatus: string, 
    notes: string, 
    userId: number | null,
    additionalData?: Record<string, any>,
  ): Promise<Sale | undefined>;

  // Métodos para Relatórios
  getReport(id: number): Promise<Report | undefined>;
  getReports(userRole: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, report: Partial<Report>): Promise<Report | undefined>;
  deleteReport(id: number): Promise<boolean>;
  executeReport(reportId: number, userId: number, parameters?: any): Promise<{data: any[], execution: ReportExecution}>;
  getReportExecutions(reportId: number, limit?: number): Promise<ReportExecution[]>;
  getReportExecution(id: number): Promise<ReportExecution | undefined>;
  
  // Métodos para Análise de Dados
  getSalesSummary(filters?: {
    startDate?: string;
    endDate?: string;
    sellerId?: number;
    status?: string;
    financialStatus?: string;
  }): Promise<{
    totalSales: number;
    totalAmount: string;
    averageAmount: string;
    completedSales: number;
    pendingSales: number;
    returnedSales: number;
  }>;
  
  getSellerPerformance(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    sellerId: number;
    sellerName: string;
    totalSales: number;
    totalAmount: string;
    returnRate: number;
    completionRate: number;
  }[]>;
  
  getFinancialOverview(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalRevenue: string;
    pendingRevenue: string;
    paidRevenue: string;
    totalCost: string;
    profit: string;
    margin: number;
  }>;
  
  getRecentExecutions(userId: number, userRole: string, limit?: number): Promise<any[]>;

  sessionStore: any; // Using any to avoid type errors
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any to avoid type errors

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(
    id: number,
    userData: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!deletedUser;
  }

  // Customer methods implementation
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByDocument(document: string): Promise<Customer | undefined> {
    // Remover caracteres especiais para comparação
    const normalizedDocument = document.replace(/[^\d]/g, "");

    // Buscar todos os clientes para verificar
    const allCustomers = await db.select().from(customers);

    // Encontrar cliente com o mesmo documento (ignorando formatação)
    const foundCustomer = allCustomers.find(
      (customer) =>
        customer.document.replace(/[^\d]/g, "") === normalizedDocument,
    );

    return foundCustomer;
  }

  async createCustomer(customerData: any): Promise<Customer> {
    // Usando any para evitar problemas de tipo temporariamente
    const [createdCustomer] = await db
      .insert(customers)
      .values([
        {
          name: customerData.name,
          document: customerData.document,
          phone: customerData.phone,
          email: customerData.email,
          documentType: customerData.documentType,
          userId: customerData.userId,
          contactName: customerData.contactName || null,
          phone2: customerData.phone2 || null,
        },
      ])
      .returning();
    return createdCustomer;
  }

  async updateCustomer(
    id: number,
    customer: Partial<InsertCustomer>,
  ): Promise<Customer | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer || undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const [deletedCustomer] = await db
      .delete(customers)
      .where(eq(customers.id, id))
      .returning();
    return !!deletedCustomer;
  }

  // Service methods implementation
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, id));
    return service || undefined;
  }

  async getServiceByName(name: string): Promise<Service | undefined> {
    // Buscar todos os serviços para verificar (usando lowercase para comparação insensitiva)
    const allServices = await db.select().from(services);

    // Encontrar serviço com o mesmo nome (comparação case-insensitive)
    const foundService = allServices.find(
      (service) => service.name.toLowerCase() === name.toLowerCase(),
    );

    return foundService;
  }

  async createService(serviceData: InsertService): Promise<Service> {
    const [createdService] = await db
      .insert(services)
      .values({
        name: serviceData.name,
        description: serviceData.description,
        active: serviceData.active,
      })
      .returning();
    return createdService;
  }

  async updateService(
    id: number,
    serviceData: Partial<InsertService>,
  ): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(serviceData)
      .where(eq(services.id, id))
      .returning();
    return updatedService || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const [deletedService] = await db
      .delete(services)
      .where(eq(services.id, id))
      .returning();
    return !!deletedService;
  }

  // Payment Methods methods implementation
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods);
  }

  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    const [paymentMethod] = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id));
    return paymentMethod || undefined;
  }

  async getPaymentMethodByName(
    name: string,
  ): Promise<PaymentMethod | undefined> {
    // Buscar todas as formas de pagamento para verificar (usando lowercase para comparação insensitiva)
    const allPaymentMethods = await db.select().from(paymentMethods);

    // Encontrar forma de pagamento com o mesmo nome (comparação case-insensitive)
    const foundPaymentMethod = allPaymentMethods.find(
      (paymentMethod) =>
        paymentMethod.name.toLowerCase() === name.toLowerCase(),
    );

    return foundPaymentMethod;
  }

  async createPaymentMethod(
    paymentMethodData: InsertPaymentMethod,
  ): Promise<PaymentMethod> {
    const [createdPaymentMethod] = await db
      .insert(paymentMethods)
      .values({
        name: paymentMethodData.name,
        description: paymentMethodData.description,
        active: paymentMethodData.active,
      })
      .returning();
    return createdPaymentMethod;
  }

  async updatePaymentMethod(
    id: number,
    paymentMethodData: Partial<InsertPaymentMethod>,
  ): Promise<PaymentMethod | undefined> {
    const [updatedPaymentMethod] = await db
      .update(paymentMethods)
      .set(paymentMethodData)
      .where(eq(paymentMethods.id, id))
      .returning();
    return updatedPaymentMethod || undefined;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    const [deletedPaymentMethod] = await db
      .delete(paymentMethods)
      .where(eq(paymentMethods.id, id))
      .returning();
    return !!deletedPaymentMethod;
  }

  // Service Type methods implementation
  async getServiceTypes(): Promise<ServiceType[]> {
    return await db.select().from(serviceTypes);
  }

  async getServiceType(id: number): Promise<ServiceType | undefined> {
    const [serviceType] = await db
      .select()
      .from(serviceTypes)
      .where(eq(serviceTypes.id, id));
    return serviceType || undefined;
  }

  async getServiceTypeByName(name: string): Promise<ServiceType | undefined> {
    // Buscar todos os tipos de serviço para verificar (usando lowercase para comparação insensitiva)
    const allServiceTypes = await db.select().from(serviceTypes);

    // Encontrar tipo de serviço com o mesmo nome (comparação case-insensitive)
    const foundServiceType = allServiceTypes.find(
      (serviceType) => serviceType.name.toLowerCase() === name.toLowerCase(),
    );

    return foundServiceType;
  }

  async createServiceType(
    serviceTypeData: InsertServiceType,
  ): Promise<ServiceType> {
    const [createdServiceType] = await db
      .insert(serviceTypes)
      .values({
        name: serviceTypeData.name,
        description: serviceTypeData.description,
        active: serviceTypeData.active,
      })
      .returning();
    return createdServiceType;
  }

  async updateServiceType(
    id: number,
    serviceTypeData: Partial<InsertServiceType>,
  ): Promise<ServiceType | undefined> {
    const [updatedServiceType] = await db
      .update(serviceTypes)
      .set(serviceTypeData)
      .where(eq(serviceTypes.id, id))
      .returning();
    return updatedServiceType || undefined;
  }

  async deleteServiceType(id: number): Promise<boolean> {
    const [deletedServiceType] = await db
      .delete(serviceTypes)
      .where(eq(serviceTypes.id, id))
      .returning();
    return !!deletedServiceType;
  }

  // Service Provider methods implementation
  async getServiceProviders(): Promise<ServiceProvider[]> {
    return await db.select().from(serviceProviders);
  }

  async getServiceProvider(id: number): Promise<ServiceProvider | undefined> {
    const [serviceProvider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.id, id));
    return serviceProvider || undefined;
  }

  async getServiceProviderByDocument(
    document: string,
  ): Promise<ServiceProvider | undefined> {
    // Remover caracteres especiais para comparação
    const normalizedDocument = document.replace(/[^\d]/g, "");

    // Buscar todos os prestadores para verificar
    const allServiceProviders = await db.select().from(serviceProviders);

    // Encontrar prestador com o mesmo documento (ignorando formatação)
    const foundServiceProvider = allServiceProviders.find(
      (serviceProvider) =>
        serviceProvider.document.replace(/[^\d]/g, "") === normalizedDocument,
    );

    return foundServiceProvider;
  }

  async createServiceProvider(
    serviceProviderData: InsertServiceProvider,
  ): Promise<ServiceProvider> {
    const [createdServiceProvider] = await db
      .insert(serviceProviders)
      .values({
        name: serviceProviderData.name,
        document: serviceProviderData.document,
        documentType: serviceProviderData.documentType,
        contactName: serviceProviderData.contactName,
        phone: serviceProviderData.phone,
        phone2: serviceProviderData.phone2,
        email: serviceProviderData.email,
        address: serviceProviderData.address,
        active: serviceProviderData.active,
      })
      .returning();
    return createdServiceProvider;
  }

  async updateServiceProvider(
    id: number,
    serviceProviderData: Partial<InsertServiceProvider>,
  ): Promise<ServiceProvider | undefined> {
    const [updatedServiceProvider] = await db
      .update(serviceProviders)
      .set(serviceProviderData)
      .where(eq(serviceProviders.id, id))
      .returning();
    return updatedServiceProvider || undefined;
  }

  async deleteServiceProvider(id: number): Promise<boolean> {
    const [deletedServiceProvider] = await db
      .delete(serviceProviders)
      .where(eq(serviceProviders.id, id))
      .returning();
    return !!deletedServiceProvider;
  }

  // Implementação dos métodos de vendas
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales);
  }

  async getSalesByStatus(status: string): Promise<Sale[]> {
    const allSales = await db.select().from(sales);
    return allSales.filter((sale) => sale.status === status);
  }

  async getSalesBySellerAndStatus(
    sellerId: number,
    status: string,
  ): Promise<Sale[]> {
    const allSales = await db.select().from(sales);
    return allSales.filter(
      (sale) =>
        sale.sellerId === sellerId && (status ? sale.status === status : true),
    );
  }

  async getSale(id: number): Promise<Sale | undefined> {
    try {
      console.log(`Consultando venda ${id} com informações de cliente e vendedor`);
      
      // Obter a venda primeiro para garantir que ela existe
      const [saleBase] = await db.select().from(sales).where(eq(sales.id, id));
      
      if (!saleBase) {
        console.log(`Venda ${id} não encontrada`);
        return undefined;
      }
      
      // Obter dados de cliente e vendedor separadamente
      const [customer] = saleBase.customerId 
        ? await db.select().from(customers).where(eq(customers.id, saleBase.customerId))
        : [];
        
      const [seller] = saleBase.sellerId
        ? await db.select().from(users).where(eq(users.id, saleBase.sellerId))
        : [];
      
      console.log(`Venda ${id} encontrada:`, {
        hasCustomer: !!customer,
        customerName: customer?.name,
        hasSeller: !!seller,
        sellerName: seller?.username,
        returnReason: saleBase.returnReason || null
      });
      
      // Logando motivo da devolução para depuração
      if (saleBase.status === "returned") {
        console.log(`Motivo da devolução para venda ${id}: ${saleBase.returnReason || "Não especificado"}`);
      }
      
      // Criar objeto de saída com estrutura aninhada
      const enrichedSale = {
        ...saleBase,
        // Adicionar campos aninhados para cliente e vendedor
        seller: seller ? {
          id: seller.id,
          username: seller.username,
          role: seller.role
        } : null,
        customer: customer ? {
          id: customer.id,
          name: customer.name,
          document: customer.document,
          contact: customer.phone, // Usar phone como contact
          address: customer.email  // Usar email como address temporariamente
        } : null
      };
      
      return enrichedSale as any;
    } catch (error) {
      console.error("Erro ao obter venda:", error);
      return undefined;
    }
  }

  async getSaleByOrderNumber(orderNumber: string): Promise<Sale | undefined> {
    const allSales = await db.select().from(sales);
    return allSales.find((sale) => sale.orderNumber === orderNumber);
  }

  async getLatestSales(limit: number): Promise<Sale[]> {
    try {
      // Busca as vendas mais recentes com base na data de criação
      const result = await db
        .select()
        .from(sales)
        .orderBy(desc(sales.createdAt))
        .limit(limit);

      return result;
    } catch (error) {
      console.error("Erro ao buscar vendas mais recentes:", error);
      return []; // Retorna array vazio em caso de erro
    }
  }

  async createSale(saleData: InsertSale): Promise<Sale> {
    console.log("Criando venda com dados:", JSON.stringify(saleData, null, 2));

    // Verificar se o número da ordem de serviço já existe
    const orderNumberExists = await this.getSaleByOrderNumber(
      saleData.orderNumber,
    );

    if (orderNumberExists) {
      console.log(
        `🔄 ATENÇÃO: Número de ordem de serviço '${saleData.orderNumber}' já existe. Gerando novo número...`,
      );

      try {
        // Buscar as últimas vendas para encontrar o maior número
        const latestSales = await this.getLatestSales(10);

        // Tentar encontrar o maior número numérico
        let highestNumber = 0;

        for (const sale of latestSales) {
          // Verificar se o número da ordem é numérico
          const numericValue = parseInt(sale.orderNumber);
          if (!isNaN(numericValue) && numericValue > highestNumber) {
            highestNumber = numericValue;
          }
        }

        // Gerar novo número incrementando o maior encontrado
        const newOrderNumber = (highestNumber + 1).toString();
        console.log(`🔄 Gerado novo número sequencial: ${newOrderNumber}`);

        // Atualizar o número da ordem na venda
        saleData.orderNumber = newOrderNumber;
      } catch (error) {
        console.error("🔄 Erro ao gerar novo número de ordem:", error);
        // Gerar um número baseado em timestamp como fallback
        saleData.orderNumber = `${Date.now()}`;
        console.log(
          `🔄 Gerado número de emergência baseado em timestamp: ${saleData.orderNumber}`,
        );
      }
    }

    // Precisamos garantir que o totalAmount seja preservado
    // Vamos extrair ele antes da inserção
    const userTotalAmount = saleData.totalAmount;

    // Extraímos as datas de instalações se existirem (propriedade customizada)
    // @ts-ignore - Esta propriedade vem do frontend
    const installmentDates = saleData.installmentDates;
    
    // SUPER DEBUG 26/04/2025
    console.log('🔄 SOLUÇÃO FINAL - Datas de parcelas recebidas:', 
                JSON.stringify(installmentDates || [], null, 2));
    
    // @ts-ignore - Removemos para não causar erro na inserção
    delete saleData.installmentDates;

    const [createdSale] = await db.insert(sales).values(saleData).returning();

    console.log(
      "Venda criada inicialmente:",
      JSON.stringify(createdSale, null, 2),
    );

    // Se houver um valor total definido, devemos preservá-lo
    // com uma verificação mais rigorosa
    if (userTotalAmount) {
      console.log(`Atualizando o valor total para: ${userTotalAmount}`);

      try {
        // Vamos fazer a atualização diretamente via SQL para garantir
        const { pool } = await import("./db");
        await pool.query(
          "UPDATE sales SET total_amount = $1, updated_at = $2 WHERE id = $3",
          [userTotalAmount, new Date(), createdSale.id],
        );

        // Atualizar o objeto para refletir o valor correto
        createdSale.totalAmount = userTotalAmount;

        console.log(
          "Venda atualizada com valor correto:",
          JSON.stringify(createdSale, null, 2),
        );
      } catch (error) {
        console.error("Erro ao atualizar valor total:", error);
      }
    }

    // 🔄🔄🔄 SUPER-CORREÇÃO V3 (26/04/2025) 🔄🔄🔄
    // OBJETIVO: Garantir ABSOLUTA consistência entre o número de parcelas e as parcelas criadas

    // 1. Primeiro, extraímos e validamos o número de parcelas informado
    let requestedInstallments = createdSale.installments;

    // Validação extrema do número de parcelas
    if (
      typeof requestedInstallments !== "number" ||
      isNaN(requestedInstallments) ||
      requestedInstallments <= 0
    ) {
      console.log(
        `🔄 ALERTA: Número de parcelas inválido [${requestedInstallments}], tipo: ${typeof requestedInstallments}`,
      );
      requestedInstallments = 1; // Valor padrão seguro
    } else {
      // Garantir que é um inteiro
      requestedInstallments = Math.floor(requestedInstallments);
    }

    console.log(
      `🔄 SUPER CORREÇÃO V3: Processando venda ${createdSale.id} com ${requestedInstallments} parcelas (número validado)`,
    );

    // 2. Atualizar o valor na venda (para garantir consistência absoluta)
    try {
      await db
        .update(sales)
        .set({ installments: requestedInstallments })
        .where(eq(sales.id, createdSale.id));

      // Atualizar também o objeto em memória
      createdSale.installments = requestedInstallments;

      console.log(
        `🔄 SUPER CORREÇÃO V3: Número de parcelas atualizado para ${requestedInstallments} na venda ${createdSale.id}`,
      );
    } catch (error) {
      console.error("🔄 ERRO ao atualizar número de parcelas:", error);
    }

    // 3. Verificar se já existem parcelas e removê-las
    try {
      const existingInstallments = await this.getSaleInstallments(
        createdSale.id,
      );
      if (existingInstallments.length > 0) {
        console.log(
          `🔄 SUPER CORREÇÃO V3: Removendo ${existingInstallments.length} parcelas existentes da venda ${createdSale.id}`,
        );
        await this.deleteSaleInstallments(createdSale.id);
      }
    } catch (error) {
      console.error("🔄 ERRO ao verificar/remover parcelas existentes:", error);
    }

    // 4. Processar datas de vencimento e criar parcelas
    if (installmentDates && Array.isArray(installmentDates)) {
      try {
        console.log(
          `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA (28/04/2025): Usando ${installmentDates.length} datas definidas pelo usuário`,
        );

        // Verificar o formato das datas para debug
        installmentDates.forEach((date, idx) => {
          console.log(
            `⚠️⚠️⚠️ DATA DEFINIDA PELO USUÁRIO #${idx + 1}:`,
            date,
            "tipo:",
            typeof date,
          );
        });

        // Calcular o valor de cada parcela (valor igual para todas as parcelas)
        const totalAmount = parseFloat(createdSale.totalAmount);
        const installmentAmount = (
          totalAmount / installmentDates.length
        ).toFixed(2); // Usar o número de datas recebidas

        console.log(
          `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA: Total ${totalAmount} dividido em ${installmentDates.length} parcelas de ${installmentAmount}`,
        );

        // Usar EXATAMENTE as datas fornecidas pelo usuário
        let datesToUse = [...installmentDates];

        // Importante: não modificamos as datas escolhidas pelo usuário
        console.log(
          `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA: Usando ${datesToUse.length} datas EXATAMENTE como definido pelo usuário`,
        );

        // SOLUÇÃO DEFINITIVA: Se o número de datas for diferente do número de parcelas, ajustamos o número de parcelas
        // para corresponder às datas fornecidas pelo usuário
        if (datesToUse.length !== requestedInstallments) {
          console.log(
            `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA: Número de datas (${datesToUse.length}) é diferente do número de parcelas (${requestedInstallments})`,
          );
          console.log(
            `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA: Ajustando o número de parcelas para ${datesToUse.length} para corresponder às datas fornecidas`,
          );

          // Atualizar o número de parcelas na venda para corresponder às datas fornecidas
          requestedInstallments = datesToUse.length;

          // Atualizar também no banco de dados
          await db
            .update(sales)
            .set({ installments: requestedInstallments })
            .where(eq(sales.id, createdSale.id));

          // E atualizar também o objeto em memória
          createdSale.installments = requestedInstallments;
        }

        // REVISÃO FINAL ABSOLUTA (26/04/2025): Garantir formato YYYY-MM-DD sem nenhuma informação de timezone
        const installmentsToCreate = datesToUse.map(
          (dueDate: string | Date, index: number) => {
            // Verificar se a data já está no formato ISO YYYY-MM-DD
            // Se já estiver nesse formato, usamos diretamente sem conversão adicional
            let formattedDate = "";

            console.log(
              `🚨 REVISÃO FINAL ABSOLUTA - Parcela ${index + 1}: Data recebida: [${String(dueDate)}], tipo: ${typeof dueDate}`,
            );

            // Tratamento por tipo de dados
            if (typeof dueDate === "string") {
              // Remover qualquer parte T00:00:00.000Z da data
              if (dueDate.includes("T")) {
                formattedDate = dueDate.split("T")[0];
                console.log(
                  `🚨 REVISÃO FINAL ABSOLUTA - Removido T00:00:00.000Z da data: [${formattedDate}]`,
                );
              } else {
                // Já está no formato desejado
                formattedDate = dueDate;
                console.log(
                  `🚨 REVISÃO FINAL ABSOLUTA - Data já está no formato correto: [${formattedDate}]`,
                );
              }
            }
            // Se for um objeto Date, converter para YYYY-MM-DD manualmente
            else if (dueDate instanceof Date) {
              formattedDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;
              console.log(
                `🚨 REVISÃO FINAL ABSOLUTA - Convertido Date para string: [${formattedDate}]`,
              );
            }
            // Para outros tipos ou valores inválidos (como undefined/null)
            else {
              // Usar data atual como fallback
              const today = new Date();
              formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
              console.log(
                `🚨 REVISÃO FINAL ABSOLUTA - Usando data atual como fallback: [${formattedDate}]`,
              );
            }

            console.log(
              `🔍 Parcela ${index + 1}: Data original: [${dueDate}], Data final: [${formattedDate}]`,
            );

            return {
              saleId: createdSale.id,
              installmentNumber: index + 1,
              dueDate: formattedDate, // Usar a data exatamente como recebida (ou com T removido)
              amount: installmentAmount,
              status: "pending",
              notes: null,
            };
          },
        );

        // Sempre criamos as parcelas
        await this.createSaleInstallments(installmentsToCreate);
        console.log(
          `💰 CORREÇÃO V2: ${installmentsToCreate.length} parcelas criadas com sucesso para a venda ${createdSale.id}`,
        );
      } catch (error) {
        console.error("💰 CORREÇÃO V2: Erro ao criar parcelas:", error);
      }
    } else {
      // Se não temos datas de vencimento, criamos com datas automáticas
      try {
        console.log(
          `🔄 SUPER CORREÇÃO V3: Sem datas de vencimento, criando ${requestedInstallments} parcelas automaticamente`,
        );

        const totalAmount = parseFloat(createdSale.totalAmount);
        const installmentAmount = (totalAmount / requestedInstallments).toFixed(
          2,
        );

        // Criar parcelas com vencimentos mensais
        const installmentsToCreate = [];
        const baseDate = new Date();

        for (let i = 0; i < requestedInstallments; i++) {
          // Criar data de vencimento para a parcela
          const dueDate = new Date(baseDate);
          dueDate.setMonth(baseDate.getMonth() + i);

          // Formatar em YYYY-MM-DD sem componente de tempo
          const formattedDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;

          console.log(
            `🔍 Parcela automática ${i + 1}: Data formatada: ${formattedDate}`,
          );

          installmentsToCreate.push({
            saleId: createdSale.id,
            installmentNumber: i + 1,
            dueDate: formattedDate,
            amount: installmentAmount,
            status: "pending",
            notes: null,
          });
        }

        await this.createSaleInstallments(installmentsToCreate);
        console.log(
          `🔄 SUPER CORREÇÃO V3: ${installmentsToCreate.length} parcelas automáticas criadas com sucesso para a venda ${createdSale.id}`,
        );
      } catch (error) {
        console.error(
          "🔄 SUPER CORREÇÃO V3: Erro ao criar parcelas automáticas:",
          error,
        );
      }
    }

    return createdSale;
  }

  async updateSale(
    id: number,
    saleData: Partial<InsertSale>,
  ): Promise<Sale | undefined> {
    try {
      console.log(`🔴 SUPER SOLUÇÃO RADICAL (30/04/2025): Início da atualização da venda #${id}`);
      
      // Verificar se a venda existe antes da atualização
      const [existingSale] = await db
        .select()
        .from(sales)
        .where(eq(sales.id, id));

      if (!existingSale) {
        console.log(`🔴 SUPER SOLUÇÃO RADICAL: Venda #${id} não encontrada`);
        return undefined;
      }

      console.log(`🔴 SUPER SOLUÇÃO RADICAL: Encontrada venda existente #${id} com data: ${existingSale.date}`);

      // SUPER SOLUÇÃO RADICAL: Sempre preservar a data original
      if (existingSale.date && saleData.date) {
        console.log(`🔴 SUPER SOLUÇÃO RADICAL: PRESERVANDO data original: ${existingSale.date} (ignorando nova data: ${saleData.date})`);
        saleData.date = existingSale.date;
      }

      // Extraímos as datas de instalações se existirem (propriedade customizada)
      // @ts-ignore - Esta propriedade vem do frontend
      const installmentDates = saleData.installmentDates;
      // @ts-ignore - Removemos para não causar erro na inserção
      delete saleData.installmentDates;
      
      // ULTRA-MEGA-HYPER SOLUÇÃO RADICAL (30/04/2025): Gerenciamento completo de itens
      // @ts-ignore - Esta propriedade vem do frontend
      const items = saleData.items;
      // @ts-ignore - Removemos da requisição principal para processamento separado
      delete saleData.items;
      
      // Se temos itens enviados, vamos processá-los adequadamente
      if (items && Array.isArray(items) && items.length > 0) {
        console.log(`🔴🔴 ULTRA-MEGA-HYPER SOLUÇÃO: Processando ${items.length} itens para venda #${id}`);
        
        try {
          // Verificar quais itens têm ID (já existentes) versus novos itens
          const existingItems = items.filter(item => item.id);
          const newItems = items.filter(item => !item.id);
          
          console.log(`🔴🔴 ULTRA-MEGA-HYPER SOLUÇÃO: ${existingItems.length} itens existentes, ${newItems.length} novos itens`);
          
          // PARTE 1: Processar itens existentes - Atualizar sem duplicar
          if (existingItems.length > 0) {
            console.log(`🔴🔴 ULTRA-MEGA-HYPER SOLUÇÃO: Atualizando ${existingItems.length} itens existentes`);
            
            for (const item of existingItems) {
              // Garantir que o item sempre esteja associado a esta venda
              item.saleId = id;
              
              console.log(`🔴🔴 ULTRA-MEGA-HYPER SOLUÇÃO: Atualizando item #${item.id}`);
              await this.updateSaleItem(item.id, item);
            }
          }
          
          // PARTE 2: Processar novos itens - Adicionar sem duplicar
          if (newItems.length > 0) {
            console.log(`🔴🔴 ULTRA-MEGA-HYPER SOLUÇÃO: Adicionando ${newItems.length} novos itens`);
            
            for (const item of newItems) {
              // Garantir que o item sempre esteja associado a esta venda
              item.saleId = id;
              
              console.log(`🔴🔴 ULTRA-MEGA-HYPER SOLUÇÃO: Adicionando novo item`);
              await this.createSaleItem(item);
            }
          }
        } catch (error) {
          console.error("❌ ERRO AO PROCESSAR ITENS:", error);
        }
      }

      // Se estiver tentando atualizar o valor total, garantimos que ele seja preservado
      if (saleData.totalAmount) {
        // Formatar o valor total (substituir vírgula por ponto)
        if (typeof saleData.totalAmount === "string") {
          saleData.totalAmount = saleData.totalAmount.replace(",", ".");
        }

        console.log(
          `🔴 SUPER SOLUÇÃO RADICAL: Atualizando valor total da venda #${id} para ${saleData.totalAmount}`,
        );
      }

      // Atualizar também o updatedAt
      const dataWithTimestamp = {
        ...saleData,
        updatedAt: new Date(),
      };

      const [updatedSale] = await db
        .update(sales)
        .set(dataWithTimestamp)
        .where(eq(sales.id, id))
        .returning();

      // Verificar se a atualização foi bem-sucedida
      if (updatedSale && saleData.totalAmount) {
        // Garantir que o valor total foi atualizado corretamente
        const { pool } = await import("./db");
        const checkResult = await pool.query(
          "SELECT id, total_amount FROM sales WHERE id = $1",
          [id],
        );

        if (checkResult.rows.length > 0) {
          console.log(
            `Valor total após atualização: ${checkResult.rows[0].total_amount}`,
          );
        }
      }

      // ⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA (28/04/2025): Se temos datas de parcelas, sempre usamos elas independente de outras condições
      if (installmentDates && Array.isArray(installmentDates)) {
        try {
          // Remover parcelas existentes
          await this.deleteSaleInstallments(id);

          console.log(
            `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA: Recriando ${installmentDates.length} parcelas para a venda ${id} com as datas definidas pelo usuário`,
          );

          // ⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA: Sempre ajustar o número de parcelas para corresponder às datas fornecidas
          if (installmentDates.length !== updatedSale.installments) {
            console.log(
              `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA: Número de datas (${installmentDates.length}) é diferente do número de parcelas (${updatedSale.installments})`,
            );
            console.log(
              `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA: Ajustando o número de parcelas para ${installmentDates.length} para corresponder às datas fornecidas`,
            );

            // Atualizar o número de parcelas na venda para corresponder às datas fornecidas
            await db
              .update(sales)
              .set({ installments: installmentDates.length })
              .where(eq(sales.id, id));

            // Atualizar também o objeto em memória para refletir a correção
            updatedSale.installments = installmentDates.length;
          }

          // Calcular o valor de cada parcela (valor igual para todas as parcelas)
          const totalAmount = parseFloat(updatedSale.totalAmount);
          const installmentAmount = (
            totalAmount / installmentDates.length
          ).toFixed(2);

          console.log(
            `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA: Total ${totalAmount} dividido em ${installmentDates.length} parcelas de ${installmentAmount}`,
          );

          console.log(
            `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA: Usando ${installmentDates.length} datas EXATAMENTE como definido pelo usuário (atualização)`,
          );

          // SOLUÇÃO DEFINITIVA (28/04/2025): Garantir formato YYYY-MM-DD sem nenhuma informação de timezone
          const installmentsToCreate = installmentDates.map(
            (dueDate: string | Date, index: number) => {
              // Verificar se a data já está no formato ISO YYYY-MM-DD
              let formattedDate = "";

              console.log(
                `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA - Parcela ${index + 1}: Data recebida: [${String(dueDate)}], tipo: ${typeof dueDate}`,
              );

              // Tratamento por tipo de dados
              if (typeof dueDate === "string") {
                // Remover qualquer parte T00:00:00.000Z da data
                if (dueDate.includes("T")) {
                  formattedDate = dueDate.split("T")[0];
                  console.log(
                    `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA - Removido T00:00:00.000Z da data: [${formattedDate}]`,
                  );
                } else {
                  // Já está no formato desejado
                  formattedDate = dueDate;
                  console.log(
                    `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA - Data já está no formato correto: [${formattedDate}]`,
                  );
                }
              }
              // Se for um objeto Date, converter para YYYY-MM-DD manualmente
              else if (dueDate instanceof Date) {
                formattedDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;
                console.log(
                  `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA - Convertido Date para string: [${formattedDate}]`,
                );
              }
              // Para outros tipos ou valores inválidos (como undefined/null)
              else {
                // Usar data atual como fallback
                const today = new Date();
                formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                console.log(
                  `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA - Usando data atual como fallback: [${formattedDate}]`,
                );
              }

              console.log(
                `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA - Parcela ${index + 1} (atualização): Data original: ${dueDate}, Data final: ${formattedDate}`,
              );

              return {
                saleId: id,
                installmentNumber: index + 1,
                dueDate: formattedDate, // Usar a data exatamente como formatada
                amount: installmentAmount,
                status: "pending",
                notes: null,
              };
            },
          );

          // Criar as parcelas se tiver alguma
          if (installmentsToCreate.length > 0) {
            await this.createSaleInstallments(installmentsToCreate);
            console.log(
              `⚠️⚠️⚠️ SOLUÇÃO DEFINITIVA: ${installmentsToCreate.length} parcelas recriadas com sucesso para a venda ${id}`,
            );
          }
        } catch (error) {
          console.error(
            `⚠️⚠️⚠️ ERRO: Falha ao atualizar parcelas da venda #${id}:`,
            error,
          );
        }
      }

      return updatedSale || undefined;
    } catch (error) {
      console.error(`Erro ao atualizar venda #${id}:`, error);
      return undefined;
    }
  }

  async deleteSale(id: number): Promise<boolean> {
    try {
      const { pool } = await import("./db");
      
      // Usar SQL diretamente para excluir todos os registros relacionados
      console.log(`Tentando excluir venda #${id} usando SQL direto`);
      
      // Excluir histórico de status
      await pool.query('DELETE FROM sales_status_history WHERE sale_id = $1', [id]);
      console.log(`Excluído histórico de status da venda #${id}`);
      
      // Excluir recibos de pagamento das parcelas
      await pool.query(`
        DELETE FROM sale_payment_receipts 
        WHERE installment_id IN (SELECT id FROM sale_installments WHERE sale_id = $1)
      `, [id]);
      console.log(`Excluídos recibos de pagamento da venda #${id}`);
      
      // Excluir parcelas
      await pool.query('DELETE FROM sale_installments WHERE sale_id = $1', [id]);
      console.log(`Excluídas parcelas da venda #${id}`);
      
      // Excluir itens da venda
      await pool.query('DELETE FROM sale_items WHERE sale_id = $1', [id]);
      console.log(`Excluídos itens da venda #${id}`);
      
      // Excluir custos operacionais
      await pool.query('DELETE FROM sale_operational_costs WHERE sale_id = $1', [id]);
      console.log(`Excluídos custos operacionais da venda #${id}`);
      
      // Excluir relações com prestadores de serviço
      await pool.query('DELETE FROM sale_service_providers WHERE sale_id = $1', [id]);
      console.log(`Excluídas relações com prestadores da venda #${id}`);
      
      // Finalmente excluir a venda
      const result = await pool.query('DELETE FROM sales WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length > 0) {
        console.log(`Venda #${id} excluída com sucesso!`);
        return true;
      } else {
        console.log(`Venda #${id} não encontrada para exclusão.`);
        return false;
      }
    } catch (error) {
      console.error(`Erro ao excluir venda #${id}:`, error);
      return false;
    }
  }

  async getSalesPaginated(options: {
    page: number;
    limit: number;
    status?: string;
    financialStatus?: string; // Novo parâmetro para filtrar por status financeiro
    sellerId?: number;
    searchTerm?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
    startDate?: string;
    endDate?: string;
  }): Promise<{
    data: (Sale & { customerName?: string })[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      financialStatus, // Novo parâmetro extraído das opções
      sellerId,
      searchTerm,
      sortField = "createdAt",
      sortDirection = "desc",
      startDate,
      endDate,
    } = options;

    console.log(
      `Buscando vendas paginadas: página ${page}, limite ${limit}, status operacional: ${status || "não definido"}, status financeiro: ${financialStatus || "não definido"}, intervalo de datas: ${startDate || "não definido"} a ${endDate || "não definido"}`,
    );

    // Usar SQL direto para obter vendas com informações de cliente
    const { pool } = await import("./db");

    // Construir a consulta base que inclui o join com clientes
    let queryText = `
      SELECT s.*, c.name as customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
    `;

    const queryParams: any[] = [];
    let whereConditions: string[] = [];

    // Adicionar condições de filtro
    if (status) {
      queryParams.push(status);
      whereConditions.push(`s.status = $${queryParams.length}`);
    }

    if (financialStatus && financialStatus !== 'all') {
      queryParams.push(financialStatus);
      whereConditions.push(`s.financial_status = $${queryParams.length}`);
    }

    if (sellerId) {
      queryParams.push(sellerId);
      whereConditions.push(`s.seller_id = $${queryParams.length}`);
    }

    // Adicionar busca por termo se foi fornecido
    if (searchTerm && searchTerm.trim() !== "") {
      const term = `%${searchTerm.toLowerCase().trim()}%`;
      // Fix para garantir que o mesmo valor seja usado em ambos os parâmetros
      whereConditions.push(
        `(LOWER(s.order_number) LIKE $${queryParams.length + 1} OR LOWER(c.name) LIKE $${queryParams.length + 2})`
      );
      queryParams.push(term);
      queryParams.push(term);
    }

    // Adicionar cláusula WHERE se houver condições
    if (whereConditions.length > 0) {
      queryText += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Converter nomes de campos camelCase para snake_case para SQL
    const fieldMapping: Record<string, string> = {
      createdAt: "created_at",
      updatedAt: "updated_at",
      totalAmount: "total_amount",
      orderNumber: "order_number",
      customerId: "customer_id",
      paymentMethodId: "payment_method_id",
      sellerId: "seller_id",
      serviceTypeId: "service_type_id",
      serviceProviderId: "service_provider_id",
      financialStatus: "financial_status",
      customerName: "customer_name",
      date: "date"
    };

    // Usar o nome do campo mapeado ou o original se não tiver mapeamento
    const sqlFieldName = fieldMapping[sortField] || sortField;

    // Tratar campos especiais que não pertencem diretamente à tabela sales
    if (sortField === "customerName") {
      // customer_name vem da tabela customers
      queryText += ` ORDER BY c.name ${sortDirection.toUpperCase()}`;
    } else {
      queryText += ` ORDER BY s.${sqlFieldName} ${sortDirection.toUpperCase()}`;
    }

    // Adicionar paginação
    queryParams.push(limit);
    queryParams.push((page - 1) * limit);
    queryText += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

    // Executar a consulta
    const result = await pool.query(queryText, queryParams);

    // Obter o total de registros para calcular a paginação
    let countQuery = `
      SELECT COUNT(*) AS total 
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
    `;

    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Usar somente os parâmetros necessários para a contagem (excluir os 2 últimos, que são limit e offset)
    const countResult = await pool.query(
      countQuery,
      queryParams.slice(0, queryParams.length - 2),
    );
    const totalRecords = parseInt(countResult.rows[0].total);

    // Mapear os resultados para o formato esperado
    const salesWithCustomerNames = result.rows.map((row) => {
      return {
        id: row.id,
        orderNumber: row.order_number,
        customerId: row.customer_id,
        customerName: row.customer_name,
        paymentMethodId: row.payment_method_id,
        sellerId: row.seller_id,
        serviceTypeId: row.service_type_id,
        serviceProviderId: row.service_provider_id,
        totalAmount: row.total_amount,
        installments: row.installments,
        installmentValue: row.installment_value,
        status: row.status,
        financialStatus: row.financial_status,
        notes: row.notes,
        date: row.date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    // Calcular paginação
    const totalPages = Math.ceil(totalRecords / limit);

    console.log(
      `Retornando ${salesWithCustomerNames.length} vendas de um total de ${totalRecords}`,
    );

    return {
      data: salesWithCustomerNames,
      total: totalRecords,
      page,
      totalPages,
    };
  }

  // Implementação dos métodos de itens da venda
  async getSaleItems(saleId: number): Promise<SaleItem[]> {
    try {
      // Importar o pool do banco de dados diretamente
      const { pool } = await import("./db");

      // Usar SQL puro para obter todas as colunas, incluindo as novas total_price e status
      const result = await pool.query(
        `SELECT * FROM sale_items WHERE sale_id = $1`,
        [saleId],
      );

      console.log("Resultado da consulta de itens:", result.rows);

      if (!result.rows || result.rows.length === 0) {
        return [];
      }

      // Mapeia os resultados para o tipo esperado
      return result.rows.map((row) => {
        // Calcular o preço total para cada item se não existir na tabela
        const itemPrice = Number(row.price) || 0;
        const itemQuantity = Number(row.quantity) || 1;

        return {
          id: row.id,
          saleId: row.sale_id,
          serviceId: row.service_id,
          serviceTypeId: row.service_type_id,
          quantity: row.quantity,
          price: row.price,
          // Usar o total_price da tabela se existir, senão calcular
          totalPrice: row.total_price || (itemPrice * itemQuantity).toString(),
          notes: row.notes || null,
          // Usar o status da tabela se existir, senão usar "pending"
          status: row.status || "pending",
          createdAt: row.created_at,
        } as unknown as SaleItem;
      });
    } catch (error) {
      console.error("Erro ao buscar itens da venda:", error);
      return []; // Retorna lista vazia em caso de erro para não interromper a execução
    }
  }

  async getSaleItem(id: number): Promise<SaleItem | undefined> {
    const [item] = await db
      .select()
      .from(saleItems)
      .where(eq(saleItems.id, id));
    return item || undefined;
  }

  async createSaleItem(saleItemData: InsertSaleItem): Promise<SaleItem> {
    console.log("📦 VERSÃO ULTRA-ROBUSTA (02/05/2025): Criando item de venda com dados:", 
                JSON.stringify(saleItemData, null, 2));
    
    // Verificar campos obrigatórios
    if (!saleItemData.saleId) {
      console.error("📦 ERRO: ID da venda não fornecido");
      throw new Error("ID da venda é obrigatório");
    }
    
    if (!saleItemData.serviceId) {
      console.error("📦 ERRO: ID do serviço não fornecido");
      throw new Error("ID do serviço é obrigatório");
    }

    // Verificar se os dados incluem totalPrice e status, e adicionar se não existirem
    const completeData = {
      ...saleItemData,
      // Garantir que o preço seja zero de acordo com o padrão da aplicação
      price: "0",
      // Calcular totalPrice como 0 - apenas como formalidade já que não usamos
      totalPrice: "0",
      // Definir status padrão se não fornecido
      status: saleItemData.status || "pending",
      // Garantir que temos um tipo de serviço
      serviceTypeId: saleItemData.serviceTypeId || null,
      // Garantir que temos uma quantidade
      quantity: saleItemData.quantity || 1
    };

    console.log("📦 VERSÃO ULTRA-ROBUSTA: Dados completos do item:", 
                JSON.stringify(completeData, null, 2));
    
    try {
      // Inserir o item com os dados completos usando drizzle
      const [createdItem] = await db
        .insert(saleItems)
        .values(completeData)
        .returning();
  
      console.log("📦 VERSÃO ULTRA-ROBUSTA: Item criado com sucesso:", 
                  JSON.stringify(createdItem, null, 2));
      
      // Atualizar o valor total da venda
      await this.updateSaleTotalAmount(createdItem.saleId);
  
      return createdItem;
    } catch (error) {
      // Se falhar com Drizzle, tentar diretamente com SQL
      console.error("📦 ERRO ao criar item com Drizzle:", error);
      console.log("📦 Tentando alternativa com SQL direto");
      
      try {
        const result = await pool.query(`
          INSERT INTO sale_items (
            sale_id, service_id, service_type_id, quantity, price, 
            total_price, status, notes, created_at, updated_at
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *
        `, [
          completeData.saleId,
          completeData.serviceId,
          completeData.serviceTypeId,
          completeData.quantity,
          completeData.price,
          completeData.totalPrice,
          completeData.status,
          completeData.notes || null
        ]);
        
        if (result.rows && result.rows.length > 0) {
          console.log("📦 SUCESSO: Item criado via SQL direto");
          
          // Atualizar o valor total da venda
          await this.updateSaleTotalAmount(completeData.saleId);
          
          // Mapear o resultado para o formato esperado
          const item: SaleItem = {
            id: result.rows[0].id,
            saleId: result.rows[0].sale_id,
            serviceId: result.rows[0].service_id,
            serviceTypeId: result.rows[0].service_type_id,
            quantity: result.rows[0].quantity,
            price: result.rows[0].price,
            totalPrice: result.rows[0].total_price,
            status: result.rows[0].status,
            notes: result.rows[0].notes,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at
          };
          
          return item;
        } else {
          throw new Error("Item criado, mas não retornado");
        }
      } catch (sqlError) {
        console.error("📦 ERRO FINAL: Não foi possível criar o item, mesmo com SQL direto:", sqlError);
        throw new Error("Falha ao criar item da venda");
      }
    }
  }

  async updateSaleItem(
    id: number,
    saleItemData: Partial<InsertSaleItem>,
  ): Promise<SaleItem | undefined> {
    const [updatedItem] = await db
      .update(saleItems)
      .set(saleItemData)
      .where(eq(saleItems.id, id))
      .returning();

    if (updatedItem) {
      // Atualizar o valor total da venda
      await this.updateSaleTotalAmount(updatedItem.saleId);
    }

    return updatedItem || undefined;
  }

  async deleteSaleItem(id: number): Promise<boolean> {
    // Obter o item antes de excluir para ter o saleId
    const item = await this.getSaleItem(id);

    if (!item) {
      return false;
    }

    const [deletedItem] = await db
      .delete(saleItems)
      .where(eq(saleItems.id, id))
      .returning();

    if (deletedItem) {
      // Atualizar o valor total da venda
      await this.updateSaleTotalAmount(item.saleId);
    }

    return !!deletedItem;
  }

  // Método auxiliar para atualizar o valor total da venda
  private async updateSaleTotalAmount(saleId: number): Promise<void> {
    console.log(
      `Este método foi desativado. A venda ${saleId} deve manter seu valor total original.`,
    );
    return; // Não faz nada - preservamos sempre o valor definido pelo usuário
  }

  // Implementação dos métodos de histórico de status
  async getSalesStatusHistory(saleId: number): Promise<SalesStatusHistory[]> {
    try {
      // Buscar o histórico da venda específica (filtro diretamente no SQL)
      const history = await db
        .select()
        .from(salesStatusHistory)
        .where(eq(salesStatusHistory.saleId, saleId));

      // Recuperar os usuários relacionados a cada entrada
      const result = [];

      for (const entry of history) {
        // Buscar informações do usuário
        const user = await this.getUser(entry.userId);

        // Adicionar ao resultado com o nome do usuário
        result.push({
          ...entry,
          userName: user ? user.username : `Usuário #${entry.userId}`,
        });
      }

      // Ordenar por data de criação (mais recente primeiro)
      return result.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return []; // Retorna array vazio em caso de erro
    }
  }

  async createSalesStatusHistory(
    historyData: InsertSalesStatusHistory,
  ): Promise<SalesStatusHistory> {
    const [createdHistory] = await db
      .insert(salesStatusHistory)
      .values(historyData)
      .returning();
    return createdHistory;
  }

  // Implementação dos métodos de relacionamento Sale-ServiceProvider
  async getSaleServiceProviders(saleId: number): Promise<SaleServiceProvider[]> {
    return await db
      .select()
      .from(saleServiceProviders)
      .where(eq(saleServiceProviders.saleId, saleId));
  }
  
  async createSaleServiceProvider(relation: InsertSaleServiceProvider): Promise<SaleServiceProvider> {
    const [createdRelation] = await db
      .insert(saleServiceProviders)
      .values(relation)
      .returning();
    return createdRelation;
  }
  
  async updateSaleServiceProviders(saleId: number, serviceProviderIds: number[]): Promise<SaleServiceProvider[]> {
    try {
      // Iniciar transação
      const result = await db.transaction(async (tx) => {
        // 1. Remover todas as relações existentes
        await tx
          .delete(saleServiceProviders)
          .where(eq(saleServiceProviders.saleId, saleId));
        
        // 2. Se não há novos prestadores, apenas retornar array vazio
        if (!serviceProviderIds || serviceProviderIds.length === 0) {
          return [];
        }
        
        // 3. Inserir novas relações
        const relations = serviceProviderIds.map((providerId) => ({
          saleId,
          serviceProviderId: providerId
        }));
        
        return await tx
          .insert(saleServiceProviders)
          .values(relations)
          .returning();
      });
      
      return result;
    } catch (error) {
      console.error("Erro ao atualizar prestadores da venda:", error);
      throw error;
    }
  }
  
  async deleteSaleServiceProviders(saleId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(saleServiceProviders)
        .where(eq(saleServiceProviders.saleId, saleId))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error("Erro ao excluir prestadores da venda:", error);
      return false;
    }
  }

  // Métodos de gerenciamento de parcelas
  async getSaleInstallments(saleId: number): Promise<SaleInstallment[]> {
    try {
      console.log(`🔵 Buscando parcelas via SQL direto para venda #${saleId}`);
      
      // Usar SQL nativo para buscar parcelas e detalhes de método de pagamento
      const { pool } = await import("./db");
      
      // Fazemos duas operações:
      // 1. Buscamos os dados das parcelas
      const installmentsResult = await pool.query(`
        SELECT * FROM sale_installments 
        WHERE sale_id = $1
        ORDER BY installment_number
      `, [saleId]);
      
      // 2. Para cada parcela, buscamos seus pagamentos divididos
      const parsedInstallments = [];
      
      for (const row of installmentsResult.rows) {
        // Buscar pagamentos divididos para esta parcela
        const splitPaymentsResult = await pool.query(`
          SELECT * FROM sale_payment_receipts 
          WHERE installment_id = $1 
          AND receipt_type = 'split_payment'
        `, [row.id]);
        
        // Formatar os pagamentos divididos para o formato esperado
        const splitPayments = splitPaymentsResult.rows.map(receipt => {
          try {
            const data = receipt.receipt_data || {};
            return {
              methodId: data.methodId || '',
              methodName: data.methodName || '',
              amount: data.amount || '0'
            };
          } catch (e) {
            console.error(`Erro ao processar pagamento dividido:`, e);
            return null;
          }
        }).filter(item => item !== null);
        
        console.log(`💰 Parcela #${row.id} tem ${splitPayments.length} pagamentos divididos`);
        
        // Se tivermos um método de pagamento principal, incluir também
        if (row.payment_method_id) {
          // Buscar informações do método principal
          const methodResult = await pool.query(`
            SELECT name FROM payment_methods WHERE id = $1
          `, [row.payment_method_id]);
          
          const methodName = methodResult.rows.length > 0 ? methodResult.rows[0].name : `Método ${row.payment_method_id}`;
          
          // Adicionar o método principal à lista de pagamentos
          splitPayments.unshift({
            methodId: String(row.payment_method_id),
            methodName: methodName,
            amount: row.amount || '0',
            isPrimary: true
          });
        }
        
        // Mapear para o formato esperado
        parsedInstallments.push({
          id: row.id,
          saleId: row.sale_id,
          installmentNumber: row.installment_number,
          dueDate: row.due_date,
          paymentDate: row.payment_date,
          amount: row.amount,
          status: row.status,
          notes: row.notes,
          paymentMethodId: row.payment_method_id,
          paymentNotes: row.payment_notes,
          splitPayments: splitPayments,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        });
      }
      
      console.log(`🔵 Encontradas ${parsedInstallments.length} parcelas para a venda #${saleId}`);
      console.log(`🔵 Retornando parcelas encontradas no banco`);
      return parsedInstallments;
    } catch (error) {
      console.error("Erro ao buscar parcelas da venda:", error);
      // Em caso de erro, voltar para o método padrão
      return await db
        .select()
        .from(saleInstallments)
        .where(eq(saleInstallments.saleId, saleId))
        .orderBy(saleInstallments.installmentNumber);
    }
  }

  async getSaleInstallment(id: number): Promise<SaleInstallment | undefined> {
    const [installment] = await db
      .select()
      .from(saleInstallments)
      .where(eq(saleInstallments.id, id));
    return installment || undefined;
  }

  async createSaleInstallment(
    installmentData: InsertSaleInstallment,
  ): Promise<SaleInstallment> {
    const [createdInstallment] = await db
      .insert(saleInstallments)
      .values(installmentData)
      .returning();
    return createdInstallment;
  }

  async createSaleInstallments(
    installmentsData: InsertSaleInstallment[],
  ): Promise<SaleInstallment[]> {
    try {
      console.log(
        "🔧 SOLUÇÃO DEFINITIVA: CRIANDO PARCELAS COM DATAS EXATAMENTE PRESERVADAS",
      );

      if (installmentsData.length === 0) {
        console.log("⚠️ ERRO: Nenhuma parcela fornecida para criação");
        return [];
      }

      // Verificar a venda associada e atualizar o número de parcelas no banco se necessário
      const saleId = installmentsData[0].saleId;
      const numInstallments = installmentsData.length;

      console.log(
        `🔍 Parcelas a criar para venda #${saleId}: ${numInstallments}`,
      );

      // Debug extensivo das datas para garantir a preservação
      installmentsData.forEach((installment, index) => {
        console.log(
          `📆 Parcela #${index + 1}, data original: ${installment.dueDate}, tipo: ${typeof installment.dueDate}`,
        );
      });

      // Atualizar o campo de parcelas na venda para garantir consistência
      try {
        // Usar SQL nativo para atualizar a venda
        const { pool } = await import("./db");
        await pool.query(`
          UPDATE sales 
          SET installments = $1, updated_at = NOW() 
          WHERE id = $2
        `, [numInstallments, saleId]);

        console.log(
          `✅ Venda #${saleId} atualizada com ${numInstallments} parcelas via SQL nativo`,
        );
      } catch (updateError) {
        console.error(
          "❌ ERRO ao atualizar número de parcelas na venda:",
          updateError,
        );
      }

      // SOLUÇÃO DEFINITIVA: Usar SQL nativo para garantir 100% que as datas sejam preservadas
      // sem nenhuma conversão automática pelo ORM ou driver de banco
      try {
        // Importar pool para usar SQL nativo
        const { pool } = await import("./db");

        // Deletar parcelas existentes
        await pool.query("DELETE FROM sale_installments WHERE sale_id = $1", [
          saleId,
        ]);
        console.log(`🗑️ Parcelas existentes removidas para venda #${saleId}`);

        // Criar as novas parcelas uma a uma para ter controle total
        const createdInstallments = [];
        
        for (let i = 0; i < installmentsData.length; i++) {
          const installment = installmentsData[i];
          
          // Forçar a data como texto para evitar qualquer conversão automática
          let dateTxt = String(installment.dueDate);
          
          // Se a data contém T, remover a parte do timezone para preservar apenas YYYY-MM-DD
          if (dateTxt.includes('T')) {
            dateTxt = dateTxt.split('T')[0];
            console.log(`📊 CORREÇÃO FINAL: Removendo T e timezone da data: ${dateTxt}`);
          }
          
          console.log(`📊 DEBUG: Salvando parcela #${i + 1} com data: ${dateTxt}`);
          
          // Usar CAST explicito para ::text para evitar qualquer conversão
          // Importante: Usamos $3 DIRETAMENTE (sem ::text) porque a coluna já é texto
          const insertResult = await pool.query(`
            INSERT INTO sale_installments 
              (sale_id, installment_number, due_date, amount, status, notes, created_at, updated_at) 
            VALUES 
              ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
          `, [
            installment.saleId,
            installment.installmentNumber,
            dateTxt, // Forçado como texto simples
            installment.amount,
            installment.status || "pending",
            installment.notes
          ]);
          
          // Registrar cada parcela criada para verificação
          if (insertResult.rows.length > 0) {
            const created = insertResult.rows[0];
            console.log(`✓ Parcela #${created.installment_number} criada com data: ${created.due_date}`);
            createdInstallments.push(created);
          }
        }
        
        console.log(`✅ ${createdInstallments.length} parcelas criadas com sucesso via SQL individualizado`);

        console.log(
          `✅ ${createdInstallments.length} parcelas criadas com sucesso via SQL`,
        );
        console.log(
          `📅 Datas salvas no banco:`,
          createdInstallments.map((i) => i.due_date),
        );

        // Mapear para o formato esperado
        return createdInstallments.map((row) => ({
          id: row.id,
          saleId: row.sale_id,
          installmentNumber: row.installment_number,
          dueDate: row.due_date, // A data está exatamente como fornecida pelo usuário
          amount: row.amount,
          status: row.status,
          notes: row.notes,
          createdAt: row.created_at,
        }));
      } catch (sqlError) {
        console.error("🛑 ERRO CRÍTICO na abordagem SQL:", sqlError);

        // NUNCA voltamos para o ORM, pois ele vai converter as datas
        // Em vez disso, lançamos um erro para que o problema seja visível
        throw new Error(
          `Falha ao salvar parcelas com datas exatas: ${sqlError.message}`,
        );
      }
    } catch (error) {
      console.error("❌ ERRO ao criar parcelas:", error);
      throw error;
    }
  }

  async updateSaleInstallment(
    id: number,
    installmentData: Partial<InsertSaleInstallment>,
  ): Promise<SaleInstallment | undefined> {
    try {
      console.log("🔧 SOLUÇÃO DEFINITIVA: Atualizando parcela com proteção de datas");
      
      // Proteção contra casos onde não há dados para atualizar
      if (!installmentData || Object.keys(installmentData).length === 0) {
        console.log("⚠️ ERRO: Nenhum dado fornecido para atualização da parcela");
        return undefined;
      }
      
      // Usar SQL nativo para atualizar a parcela preservando as datas exatas
      const { pool } = await import("./db");
      
      // Construir a query SQL dinamicamente
      let updateQuery = `UPDATE sale_installments SET updated_at = NOW()`;
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Adicionar campos de data com tratamento especial
      if (installmentData.dueDate !== undefined) {
        updateQuery += `, due_date = $${paramIndex++}::text`;
        queryParams.push(String(installmentData.dueDate));
        console.log(`📆 Preservando data de vencimento: ${installmentData.dueDate}`);
      }
      
      if (installmentData.paymentDate !== undefined) {
        updateQuery += `, payment_date = $${paramIndex++}::text`;
        queryParams.push(String(installmentData.paymentDate));
        console.log(`📆 Preservando data de pagamento: ${installmentData.paymentDate}`);
      }
      
      // Adicionar outros campos não relacionados a datas
      if (installmentData.amount !== undefined) {
        updateQuery += `, amount = $${paramIndex++}`;
        queryParams.push(installmentData.amount);
      }
      
      if (installmentData.status !== undefined) {
        updateQuery += `, status = $${paramIndex++}`;
        queryParams.push(installmentData.status);
      }
      
      if (installmentData.notes !== undefined) {
        updateQuery += `, notes = $${paramIndex++}`;
        queryParams.push(installmentData.notes);
      }
      
      // Condição para o ID
      updateQuery += ` WHERE id = $${paramIndex++} RETURNING *`;
      queryParams.push(id);
      
      // Executar a query
      console.log(`🔄 Executando SQL para atualizar parcela #${id}`);
      const result = await pool.query(updateQuery, queryParams);
      
      if (result.rows.length === 0) {
        console.log(`⚠️ Parcela #${id} não encontrada`);
        return undefined;
      }
      
      const updatedInstallment = result.rows[0];
      console.log(`✅ Parcela #${id} atualizada com sucesso via SQL`);
      
      // Log da data após atualização para verificação
      if (installmentData.dueDate) {
        console.log(`📅 Data de vencimento após atualização: ${updatedInstallment.due_date}`);
      }
      
      if (installmentData.paymentDate) {
        console.log(`📅 Data de pagamento após atualização: ${updatedInstallment.payment_date}`);
      }
      
      // Mapear para o formato esperado
      return {
        id: updatedInstallment.id,
        saleId: updatedInstallment.sale_id,
        installmentNumber: updatedInstallment.installment_number,
        dueDate: updatedInstallment.due_date,
        paymentDate: updatedInstallment.payment_date,
        amount: updatedInstallment.amount,
        status: updatedInstallment.status,
        notes: updatedInstallment.notes,
        createdAt: updatedInstallment.created_at,
      };
    } catch (error) {
      console.error(`❌ ERRO ao atualizar parcela #${id}:`, error);
      return undefined;
    }
  }

  async deleteSaleInstallments(saleId: number): Promise<boolean> {
    const result = await db
      .delete(saleInstallments)
      .where(eq(saleInstallments.saleId, saleId))
      .returning();
    return result.length > 0;
  }

  // Operações especiais de vendas
  async returnSaleToSeller(
    saleId: number,
    userId: number,
    reason: string,
  ): Promise<Sale | undefined> {
    const sale = await this.getSale(saleId);

    if (!sale) {
      return undefined;
    }

    // Registrar no histórico
    await this.createSalesStatusHistory({
      saleId,
      fromStatus: sale.status,
      toStatus: "returned",
      userId,
      notes: reason,
    });

    // Atualizar status da venda
    return await this.updateSale(saleId, {
      status: "returned",
      returnReason: reason,
    });
  }

  async markSaleInProgress(
    saleId: number,
    operationalId: number,
    serviceTypeId?: number,
    serviceProviderId?: number,
  ): Promise<Sale | undefined> {
    const sale = await this.getSale(saleId);

    if (!sale) {
      return undefined;
    }

    // Verificar se houve mudança no tipo de serviço
    let notesText = "Execução iniciada";

    // Se foi fornecido um tipo de serviço diferente do atual (ou pela primeira vez)
    if (serviceTypeId) {
      if (!sale.serviceTypeId) {
        // Primeira atribuição de tipo de serviço
        const newType = await this.getServiceType(serviceTypeId);
        if (newType) {
          notesText += ` - Tipo de execução definido como ${newType.name}`;
        } else {
          notesText += " - Tipo de execução definido";
        }
      } else if (serviceTypeId !== sale.serviceTypeId) {
        // Alteração de tipo existente
        const oldType = await this.getServiceType(sale.serviceTypeId);
        const newType = await this.getServiceType(serviceTypeId);

        if (oldType && newType) {
          notesText += ` - Tipo de execução alterado de ${oldType.name} para ${newType.name}`;
        } else {
          notesText += " - Tipo de execução alterado";
        }
      }
    }

    // Registrar no histórico
    await this.createSalesStatusHistory({
      saleId,
      fromStatus: sale.status,
      toStatus: "in_progress",
      userId: operationalId,
      notes: notesText,
    });

    // Preparar dados para atualização
    const updateData: Partial<InsertSale> = {
      status: "in_progress",
      executionStatus: "in_progress",
      responsibleOperationalId: operationalId,
    };

    // Adicionar o tipo de serviço se fornecido
    if (serviceTypeId) {
      // @ts-ignore - O type está correto mas o TypeScript não reconhece pois foi adicionado dinamicamente
      updateData.serviceTypeId = serviceTypeId;
    }

    // Adicionar o prestador de serviço parceiro se fornecido
    if (serviceProviderId) {
      // @ts-ignore - O type está correto mas o TypeScript não reconhece pois foi adicionado dinamicamente
      updateData.serviceProviderId = serviceProviderId;
    }

    // Atualizar status da venda
    return await this.updateSale(saleId, updateData);
  }

  async completeSaleExecution(
    saleId: number,
    operationalId: number,
  ): Promise<Sale | undefined> {
    try {
      const sale = await this.getSale(saleId);
      if (!sale) {
        return undefined;
      }
      
      // Capturar prestadores de serviço ANTES da transação para garantir que não sejam perdidos
      const providersBeforeTransaction = await this.getSaleServiceProviders(saleId);
      console.log(`[Storage] Iniciando conclusão da venda #${saleId} com ${providersBeforeTransaction.length} prestadores de serviço antes da transação`);
      
      // Lista de IDs de prestadores para preservar durante a transação
      const serviceProviderIds = providersBeforeTransaction.map(p => p.serviceProviderId);

      // Executar em transação para garantir a consistência
      const result = await db.transaction(async (tx) => {
        // 1. Registrar no histórico
        await this.createSalesStatusHistory({
          saleId,
          fromStatus: sale.status,
          toStatus: "completed",
          userId: operationalId,
          notes: "Execução concluída",
        });
        
        // 2. Atualizar status da venda
        const updatedSale = await this.updateSale(saleId, {
          status: "completed",
          executionStatus: "completed",
          responsibleOperationalId: operationalId,
        });
        
        // 3. Se havia prestadores antes da transação, garantir que sejam preservados
        if (serviceProviderIds.length > 0) {
          // Remover e recriar as relações dentro da mesma transação
          await tx
            .delete(saleServiceProviders)
            .where(eq(saleServiceProviders.saleId, saleId));
            
          // Criar array de objetos para inserção
          const relations = serviceProviderIds.map((providerId) => ({
            saleId,
            serviceProviderId: providerId
          }));
          
          // Inserir todas as relações de uma vez
          if (relations.length > 0) {
            await tx
              .insert(saleServiceProviders)
              .values(relations);
              
            console.log(`[Storage] Preservados ${serviceProviderIds.length} prestadores durante a conclusão da venda #${saleId}`);
          }
        }
        
        return updatedSale;
      });
      
      // Verificar se os prestadores foram mantidos após a transação
      const providersAfterTransaction = await this.getSaleServiceProviders(saleId);
      console.log(`[Storage] Concluída venda #${saleId} com ${providersAfterTransaction.length} prestadores de serviço após a transação`);
      
      // Se os prestadores foram perdidos, tentar restaurá-los
      if (providersBeforeTransaction.length > 0 && providersAfterTransaction.length === 0) {
        console.log(`[Storage] ALERTA: Prestadores perdidos durante a transação. Tentando restaurar...`);
        
        await this.updateSaleServiceProviders(saleId, serviceProviderIds);
        
        // Verificar novamente após tentativa de restauração
        const providersAfterRecovery = await this.getSaleServiceProviders(saleId);
        console.log(`[Storage] Após tentativa de restauração: ${providersAfterRecovery.length} prestadores de serviço`);
      }
      
      return result;
    } catch (error) {
      console.error(`[Storage] Erro ao concluir execução da venda #${saleId}:`, error);
      throw error;
    }
  }

  async markSaleAsPaid(
    saleId: number,
    financialId: number,
  ): Promise<Sale | undefined> {
    const sale = await this.getSale(saleId);

    if (!sale) {
      return undefined;
    }

    // Registrar no histórico
    await this.createSalesStatusHistory({
      saleId,
      fromStatus: sale.financialStatus || "pending",
      toStatus: "paid",
      userId: financialId,
      notes: "Pagamento confirmado",
    });

    // Atualizar status da venda
    return await this.updateSale(saleId, {
      financialStatus: "paid",
      responsibleFinancialId: financialId,
    });
  }

  // Implementação dos métodos de custos operacionais
  async getSaleOperationalCosts(
    saleId: number,
  ): Promise<SaleOperationalCost[]> {
    return db
      .select()
      .from(saleOperationalCosts)
      .where(eq(saleOperationalCosts.saleId, saleId));
  }

  async getSaleOperationalCost(
    id: number,
  ): Promise<SaleOperationalCost | undefined> {
    const [cost] = await db
      .select()
      .from(saleOperationalCosts)
      .where(eq(saleOperationalCosts.id, id));
    return cost || undefined;
  }

  // Implementação removida para evitar duplicação
  // O método createSaleOperationalCost é implementado mais abaixo com SQL nativo

  // Implementação removida para evitar duplicação
  // O método updateSaleOperationalCost é implementado mais abaixo com SQL nativo
  
  // Implementação removida para evitar duplicação
  // O método deleteSaleOperationalCost é implementado mais abaixo com SQL nativo

  // Implementação dos métodos de comprovantes de pagamento
  async getSalePaymentReceipts(
    installmentId: number,
  ): Promise<SalePaymentReceipt[]> {
    return db
      .select()
      .from(salePaymentReceipts)
      .where(eq(salePaymentReceipts.installmentId, installmentId));
  }

  async getSalePaymentReceipt(
    id: number,
  ): Promise<SalePaymentReceipt | undefined> {
    const [receipt] = await db
      .select()
      .from(salePaymentReceipts)
      .where(eq(salePaymentReceipts.id, id));
    return receipt || undefined;
  }

  async createSalePaymentReceipt(
    receiptData: InsertSalePaymentReceipt,
  ): Promise<SalePaymentReceipt> {
    const [createdReceipt] = await db
      .insert(salePaymentReceipts)
      .values(receiptData)
      .returning();
    return createdReceipt;
  }

  async updateSalePaymentReceipt(
    id: number,
    receiptData: Partial<InsertSalePaymentReceipt>,
  ): Promise<SalePaymentReceipt | undefined> {
    const [updatedReceipt] = await db
      .update(salePaymentReceipts)
      .set(receiptData)
      .where(eq(salePaymentReceipts.id, id))
      .returning();
    return updatedReceipt || undefined;
  }

  async deleteSalePaymentReceipt(id: number): Promise<boolean> {
    const [deletedReceipt] = await db
      .delete(salePaymentReceipts)
      .where(eq(salePaymentReceipts.id, id))
      .returning();
    return !!deletedReceipt;
  }

  // Método para confirmar pagamento de parcela
  async editInstallmentPayment(
    installmentId: number,
    userId: number,
    paymentDate: string,
    paymentMethodId: number,
    notes?: string,
    receiptData?: { detail: string; paymentMethod: string },
  ): Promise<SaleInstallment | undefined> {
    // Obter parcela
    const installment = await this.getSaleInstallment(installmentId);
    if (!installment) return undefined;

    // Verificar se a parcela já está paga (só pode editar parcelas pagas)
    if (installment.status !== 'paid') {
      console.log(`⚠️ Tentativa de editar parcela não paga: #${installmentId} (status: ${installment.status})`);
      return undefined;
    }

    // Processar a data de pagamento para garantir formato correto
    // Mantemos a data exatamente como foi enviada do frontend
    // apenas removendo a parte do timezone se existir (T00:00:00.000Z)
    let formattedPaymentDate: string = paymentDate;

    // Se a data contiver o caractere 'T' (formato ISO), remover a parte do timezone
    if (paymentDate.includes("T")) {
      formattedPaymentDate = paymentDate.split("T")[0];
      console.log(`📅 Removendo parte timezone da data: ${formattedPaymentDate}`);
    }

    console.log(
      `🔧 EDIÇÃO DE PAGAMENTO: Data original recebida: ${paymentDate}, Data formatada: ${formattedPaymentDate}`,
    );

    console.log(`🔄 USANDO SQL NATIVO para garantir preservação exata de data: ${formattedPaymentDate}`);
    
    // Registrar que esta é uma edição de administrador no histórico
    const editDetails = {
      previousPaymentDate: installment.paymentDate,
      previousPaymentMethodId: installment.paymentMethodId,
      updatedByUserId: userId
    };

    try {
      // Usar SQL nativo para atualizar a parcela com a data exata
      const { pool } = await import("./db");
      const result = await pool.query(
        `UPDATE sale_installments 
         SET payment_date = $1, 
             payment_method_id = $2, 
             payment_notes = $3, 
             updated_at = NOW(),
             admin_edit_history = COALESCE(admin_edit_history, '[]')::jsonb || $4::jsonb
         WHERE id = $5
         RETURNING *`,
        [
          formattedPaymentDate,
          paymentMethodId,
          notes || installment.paymentNotes,
          JSON.stringify([{ timestamp: new Date().toISOString(), ...editDetails }]),
          installmentId
        ]
      );

      if (result.rows.length === 0) {
        console.log(`❌ Falha ao atualizar parcela #${installmentId}`);
        return undefined;
      }

      // Se existir um recibo anterior, criar um novo recibo indicando a edição
      if (receiptData) {
        // Criar um novo recibo para registrar a edição
        await pool.query(
          `INSERT INTO sale_payment_receipts 
           (installment_id, confirmed_by, receipt_type, receipt_data, created_at, notes)
           VALUES ($1, $2, $3, $4, NOW(), $5)`,
          [
            installmentId,
            userId,
            "admin_edit",
            JSON.stringify({ 
              ...receiptData, 
              editDetails: { 
                previousPaymentDate: installment.paymentDate,
                newPaymentDate: formattedPaymentDate
              }
            }),
            `Edição administrativa de pagamento realizada por usuário ID ${userId}`
          ]
        );
      }

      // Mapear para o formato esperado
      const updatedInstallment = result.rows[0];
      return {
        id: updatedInstallment.id,
        saleId: updatedInstallment.sale_id,
        installmentNumber: updatedInstallment.installment_number,
        dueDate: updatedInstallment.due_date,
        paymentDate: updatedInstallment.payment_date,
        amount: updatedInstallment.amount,
        status: updatedInstallment.status,
        notes: updatedInstallment.notes,
        createdAt: updatedInstallment.created_at,
        updatedAt: updatedInstallment.updated_at,
        paymentMethodId: updatedInstallment.payment_method_id,
        paymentNotes: updatedInstallment.payment_notes
      };
    } catch (error) {
      console.error(`❌ ERRO ao editar pagamento da parcela #${installmentId}:`, error);
      throw error;
    }
  }
  
  async confirmInstallmentPayment(
    installmentId: number,
    userId: number,
    paymentDate: string, // Aceitar apenas string para evitar conversões automáticas
    receiptData?: { type: string; url?: string; data?: any; notes?: string },
    paymentMethodId?: number,
    splitPayments: Array<{methodId: number, amount: number}> = [],
    createSplitReceipts: boolean = false // Nova flag para forçar criação de recibos para pagamentos divididos
  ): Promise<SaleInstallment | undefined> {
    // Obter parcela
    const installment = await this.getSaleInstallment(installmentId);
    if (!installment) return undefined;

    // Processar a data de pagamento para garantir formato correto
    // Importante: Mantemos a data exatamente como foi enviada do frontend
    // apenas removendo a parte do timezone se existir (T00:00:00.000Z)
    let formattedPaymentDate: string = paymentDate;

    // Se a data contiver o caractere 'T' (formato ISO), remover a parte do timezone
    if (paymentDate.includes("T")) {
      formattedPaymentDate = paymentDate.split("T")[0];
      console.log(`📅 Removendo parte timezone da data: ${formattedPaymentDate}`);
    }

    console.log(
      `🔍 SOLUÇÃO FINAL: Confirmação de pagamento: Data original recebida: ${paymentDate}, Data formatada: ${formattedPaymentDate}`,
    );

    console.log(`🔄 USANDO SQL NATIVO para garantir preservação exata de data: ${formattedPaymentDate}`);
    
    let parsedInstallment: SaleInstallment | undefined;
    
    try {
      // Importar pool para usar SQL nativo
      const { pool } = await import("./db");
      
      // Atualizar a parcela com SQL nativo para garantir preservação exata do formato da data
      // O SQL precisa ser construído de forma diferente dependendo de se temos um método de pagamento
      let sql;
      let params;
      
      if (paymentMethodId) {
        // Com método de pagamento
        sql = `
          UPDATE sale_installments 
          SET status = 'paid', 
              payment_date = $1,
              payment_method_id = $3,
              updated_at = NOW()
          WHERE id = $2
          RETURNING *
        `;
        params = [formattedPaymentDate, installmentId, paymentMethodId];
      } else {
        // Sem método de pagamento
        sql = `
          UPDATE sale_installments 
          SET status = 'paid', 
              payment_date = $1,
              updated_at = NOW()
          WHERE id = $2
          RETURNING *
        `;
        params = [formattedPaymentDate, installmentId];
      }
      
      console.log("SQL para atualização de parcela:", sql);
      const result = await pool.query(sql, params);
      
      if (result.rows.length === 0) {
        console.log(`⚠️ Parcela #${installmentId} não encontrada durante atualização via SQL`);
        return undefined;
      }
      
      const updatedInstallment = result.rows[0];
      
      console.log(`✅ Parcela #${installmentId} marcada como paga via SQL nativo`);
      console.log(`📅 Data de pagamento salva: ${updatedInstallment.payment_date}`);
      
      // Mapear para o formato esperado
      parsedInstallment = {
        id: updatedInstallment.id,
        saleId: updatedInstallment.sale_id,
        installmentNumber: updatedInstallment.installment_number,
        dueDate: updatedInstallment.due_date,
        paymentDate: updatedInstallment.payment_date,
        amount: updatedInstallment.amount,
        status: updatedInstallment.status,
        notes: updatedInstallment.notes,
        paymentMethodId: updatedInstallment.payment_method_id,
        createdAt: updatedInstallment.created_at,
        updatedAt: updatedInstallment.updated_at
      };
      
      // Se temos dados de comprovante, registrá-lo
      if (receiptData) {
        // Adicionar informações sobre pagamento dividido no receiptData se aplicável
        let enhancedReceiptData = { ...receiptData.data || {} };
        
        if (splitPayments && splitPayments.length > 0) {
          enhancedReceiptData.splitPayments = splitPayments;
          enhancedReceiptData.paymentType = "split";
        }
        
        await this.createSalePaymentReceipt({
          installmentId,
          receiptType: receiptData.type,
          receiptUrl: receiptData.url || null,
          receiptData: enhancedReceiptData,
          confirmedBy: userId,
          notes: receiptData.notes || null,
        });
        
        // Se temos pagamentos divididos, registrar cada método de pagamento em separado
        if (splitPayments && splitPayments.length > 0) {
          console.log(`💰 Registrando ${splitPayments.length} pagamentos parciais`);
          
          // Criar um registro de pagamento para cada método adicional (exceto o principal)
          for (let i = 0; i < splitPayments.length; i++) {
            const splitPayment = splitPayments[i];
            
            // Se este é o método principal que já registramos na parcela, pular (mas só se não forçamos a criação)
            if (!createSplitReceipts && paymentMethodId && splitPayment.methodId === paymentMethodId && i === 0) {
              console.log(`⏭️ Pulando registro do método principal ${paymentMethodId} que já foi registrado na parcela`);
              continue;
            }
            
            // Buscar nome do método de pagamento
            const paymentMethod = await this.getPaymentMethod(splitPayment.methodId);
            const methodName = paymentMethod ? paymentMethod.name : `Método ${splitPayment.methodId}`;
            
            console.log(`📝 Registrando comprovante de pagamento parcial: ${methodName}, Valor: ${splitPayment.amount}`);
            
            // Registrar um comprovante adicional para este método de pagamento
            await this.createSalePaymentReceipt({
              installmentId,
              receiptType: "split_payment",
              receiptUrl: null,
              receiptData: {
                methodId: splitPayment.methodId,
                methodName: methodName,
                amount: splitPayment.amount,
                isPartial: true
              },
              confirmedBy: userId,
              notes: `Pagamento parcial - ${methodName}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(splitPayment.amount)}`
            });
          }
        }
      }
      // Se não temos dados de comprovante mas a flag createSplitReceipts está ativa,
      // vamos criar recibos de pagamento dividido automaticamente
      else if (createSplitReceipts && splitPayments && splitPayments.length > 0) {
        console.log(`🔄 Criando recibos de pagamento dividido automaticamente (${splitPayments.length} métodos)`);
        
        // Processar cada método de pagamento
        for (const splitPayment of splitPayments) {
          // Buscar nome do método de pagamento
          const paymentMethod = await this.getPaymentMethod(splitPayment.methodId);
          const methodName = paymentMethod ? paymentMethod.name : `Método ${splitPayment.methodId}`;
          
          console.log(`📝 Criando recibo automático: ${methodName}, Valor: ${splitPayment.amount}`);
          
          // Criar um recibo para este método de pagamento
          await this.createSalePaymentReceipt({
            installmentId,
            receiptType: "split_payment", 
            receiptUrl: null,
            receiptData: {
              methodId: splitPayment.methodId,
              methodName: methodName,
              amount: splitPayment.amount,
              isPartial: true,
              autoCreated: true
            },
            confirmedBy: userId,
            notes: `Pagamento parcial - ${methodName}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(splitPayment.amount)}`
          });
        }
      }

      // Verificar se todas as parcelas desta venda estão pagas
      const saleId = installment.saleId;
      const allInstallments = await this.getSaleInstallments(saleId);
      const allPaid = allInstallments.every((inst) => inst.status === "paid");

      // Se todas estiverem pagas, atualizar o status financeiro da venda
      if (allPaid) {
        // Todas as parcelas estão pagas
        console.log(`✅ Todas as parcelas da venda #${saleId} estão pagas. Marcando venda como paga.`);
        await this.markSaleAsPaid(saleId, userId);
      } else {
        // Algumas parcelas ainda estão pendentes - definir como parcialmente pago
        // e MANTER o status de tratativa em andamento
        console.log(`⏳ Algumas parcelas da venda #${saleId} ainda estão pendentes. Marcando venda como parcialmente paga.`);
        
        // Buscar venda atual para verificar seu status
        const currentSale = await this.getSale(saleId);
        
        let targetStatus = "partial";
        // Se a venda já estava em andamento, preservar esse status para permitir
        // confirmações futuras
        if (currentSale && currentSale.financialStatus === "in_progress") {
          targetStatus = "in_progress";
        }
        
        await db
          .update(sales)
          .set({
            financialStatus: targetStatus,
            updatedAt: new Date(),
          })
          .where(eq(sales.id, saleId));
      }
      
    } catch (sqlError: any) {
      console.error(`❌ Erro ao confirmar pagamento de parcela via SQL nativo:`, sqlError);
      throw new Error(`Falha ao confirmar pagamento de parcela: ${sqlError.message}`);
    }

    return parsedInstallment;
  }

  // Cost Types methods implementation
  async getCostTypes(): Promise<CostType[]> {
    return await db.select().from(costTypes);
  }

  async getCostType(id: number): Promise<CostType | undefined> {
    const [costType] = await db
      .select()
      .from(costTypes)
      .where(eq(costTypes.id, id));
    return costType || undefined;
  }

  async getCostTypeByName(name: string): Promise<CostType | undefined> {
    // Buscar todos os tipos de custo para verificar (usando lowercase para comparação insensitiva)
    const allCostTypes = await db.select().from(costTypes);

    // Encontrar tipo de custo com o mesmo nome (comparação case-insensitive)
    const foundCostType = allCostTypes.find(
      (costType) => costType.name.toLowerCase() === name.toLowerCase(),
    );

    return foundCostType;
  }

  async createCostType(costTypeData: InsertCostType): Promise<CostType> {
    const [createdCostType] = await db
      .insert(costTypes)
      .values({
        name: costTypeData.name,
        description: costTypeData.description,
        active: costTypeData.active,
      })
      .returning();
    return createdCostType;
  }

  async updateCostType(
    id: number,
    costTypeData: Partial<InsertCostType>,
  ): Promise<CostType | undefined> {
    const [updatedCostType] = await db
      .update(costTypes)
      .set(costTypeData)
      .where(eq(costTypes.id, id))
      .returning();
    return updatedCostType || undefined;
  }

  async deleteCostType(id: number): Promise<boolean> {
    const [deletedCostType] = await db
      .delete(costTypes)
      .where(eq(costTypes.id, id))
      .returning();
    return !!deletedCostType;
  }

  // Métodos para gerenciar custos operacionais - usando SQL nativo para compatibilidade com o banco de dados
  async getSaleOperationalCosts(
    saleId: number,
  ): Promise<SaleOperationalCost[]> {
    try {
      // Usar SQL puro para lidar com a tabela recém-criada
      const result = await pool.query(
        `SELECT * FROM sale_operational_costs WHERE sale_id = $1 ORDER BY created_at DESC`,
        [saleId],
      );

      return result.rows.map((row) => ({
        id: row.id,
        saleId: row.sale_id,
        description: row.description,
        costTypeId: row.cost_type_id,
        amount: row.amount,
        date: row.date, // Mantendo como string para compatibilidade
        paymentDate: row.payment_date, // Adicionando campo de data de pagamento
        responsibleId: row.responsible_id || null,
        serviceProviderId: row.service_provider_id || null,
        notes: row.notes || null,
        paymentReceiptUrl: row.payment_receipt_url || null,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
    } catch (error) {
      console.error("Erro ao buscar custos operacionais:", error);
      return [];
    }
  }

  async getSaleOperationalCost(
    id: number,
  ): Promise<SaleOperationalCost | undefined> {
    try {
      const result = await pool.query(
        `SELECT * FROM sale_operational_costs WHERE id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        return undefined;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        saleId: row.sale_id,
        description: row.description,
        costTypeId: row.cost_type_id,
        amount: row.amount,
        date: row.date, // Mantendo como string para compatibilidade
        paymentDate: row.payment_date, // Adicionando o campo de data de pagamento
        responsibleId: row.responsible_id || null,
        serviceProviderId: row.service_provider_id || null,
        notes: row.notes || null,
        paymentReceiptUrl: row.payment_receipt_url || null,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      console.error("Erro ao buscar custo operacional:", error);
      return undefined;
    }
  }

  async createSaleOperationalCost(
    data: Partial<InsertSaleOperationalCost>,
  ): Promise<SaleOperationalCost> {
    try {
      // Garantir que temos o ID do usuário atual (responsável)
      const responsibleId = data.responsibleId || 1; // Usar ID 1 (admin) como fallback

      // Garantir que temos uma data
      const date = data.date || new Date().toISOString().split("T")[0];
      
      // Verificar se temos data de pagamento
      const paymentDate = data.paymentDate || null;

      const result = await pool.query(
        `INSERT INTO sale_operational_costs 
         (sale_id, description, cost_type_id, amount, date, payment_date, responsible_id, 
          service_provider_id, notes, payment_receipt_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          data.saleId,
          data.description || " ", // Usando espaço em branco em vez de string vazia
          data.costTypeId,
          data.amount,
          date,
          paymentDate,
          responsibleId,
          data.serviceProviderId || null,
          data.notes || null,
          data.paymentReceiptUrl || null,
        ],
      );

      const row = result.rows[0];
      return {
        id: row.id,
        saleId: row.sale_id,
        description: row.description,
        costTypeId: row.cost_type_id,
        amount: row.amount,
        paymentDate: row.payment_date, // Adicionando o campo de data de pagamento
        date: row.date, // Mantendo como string para compatibilidade
        responsibleId: row.responsible_id,
        serviceProviderId: row.service_provider_id || null,
        notes: row.notes || null,
        paymentReceiptUrl: row.payment_receipt_url || null,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      console.error("Erro ao criar custo operacional:", error);
      throw error;
    }
  }

  async updateSaleOperationalCost(
    id: number,
    data: Partial<InsertSaleOperationalCost>,
  ): Promise<SaleOperationalCost | undefined> {
    try {
      // Construir a query de atualização com base nos campos fornecidos
      const updates = [];
      const values = [];
      let paramIndex = 1;

      // Para cada campo que pode ser atualizado
      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(data.description || " "); // Usando espaço em branco em vez de string vazia
      }

      if (data.costTypeId !== undefined) {
        updates.push(`cost_type_id = $${paramIndex++}`);
        values.push(data.costTypeId);
      }

      if (data.amount !== undefined) {
        updates.push(`amount = $${paramIndex++}`);
        values.push(data.amount);
      }

      if (data.date !== undefined) {
        updates.push(`date = $${paramIndex++}`);
        values.push(data.date);
      }

      if (data.responsibleId !== undefined) {
        updates.push(`responsible_id = $${paramIndex++}`);
        values.push(data.responsibleId);
      }

      if (data.serviceProviderId !== undefined) {
        updates.push(`service_provider_id = $${paramIndex++}`);
        values.push(data.serviceProviderId);
      }

      if (data.notes !== undefined) {
        updates.push(`notes = $${paramIndex++}`);
        values.push(data.notes);
      }

      if (data.paymentReceiptUrl !== undefined) {
        updates.push(`payment_receipt_url = $${paramIndex++}`);
        values.push(data.paymentReceiptUrl);
      }
 
      if (data.paymentDate !== undefined) {
        updates.push(`payment_date = $${paramIndex++}`);
        values.push(data.paymentDate);
      }

      // Sempre atualizar o updated_at
      updates.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());

      // Se não há nada para atualizar, retornar undefined
      if (updates.length === 0) {
        return undefined;
      }

      // Adicionar o ID ao final dos valores
      values.push(id);

      const result = await pool.query(
        `UPDATE sale_operational_costs 
         SET ${updates.join(", ")}
         WHERE id = $${paramIndex}
         RETURNING *`,
        values,
      );

      if (result.rows.length === 0) {
        return undefined;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        saleId: row.sale_id,
        description: row.description,
        costTypeId: row.cost_type_id,
        amount: row.amount,
        date: row.date, // Mantendo como string para compatibilidade
        paymentDate: row.payment_date, // Adicionando o campo de data de pagamento
        responsibleId: row.responsible_id,
        serviceProviderId: row.service_provider_id || null,
        notes: row.notes || null,
        paymentReceiptUrl: row.payment_receipt_url || null,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      console.error("Erro ao atualizar custo operacional:", error);
      return undefined;
    }
  }

  async deleteSaleOperationalCost(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        `DELETE FROM sale_operational_costs WHERE id = $1 RETURNING id`,
        [id],
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Erro ao excluir custo operacional:", error);
      return false;
    }
  }
  
  /**
   * Atualiza o status de uma venda e registra a mudança no histórico
   * @param saleId - ID da venda
   * @param fromStatus - Status atual da venda
   * @param toStatus - Novo status da venda
   * @param notes - Observações sobre a mudança de status
   * @param userId - ID do usuário que está fazendo a alteração
   * @param additionalData - Dados adicionais para salvar no histórico (como notas de correção)
   * @returns Venda atualizada ou undefined se não encontrada
   */
  async updateSaleStatus(
    saleId: number, 
    fromStatus: string, 
    toStatus: string, 
    notes: string, 
    userId: number | null,
    additionalData: Record<string, any> = {}
  ): Promise<Sale | undefined> {
    try {
      // Verificar se a venda existe e está no status esperado
      const sale = await this.getSale(saleId);
      if (!sale) {
        return undefined;
      }
      
      if (sale.status !== fromStatus) {
        throw new Error(`A venda não está no status esperado. Status atual: ${sale.status}, esperado: ${fromStatus}`);
      }
      
      // Iniciar uma transação SQL
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // 1. Atualizar o status da venda
        const updateQuery = `
          UPDATE sales
          SET status = $1, updated_at = NOW()
          WHERE id = $2
          RETURNING *
        `;
        const updateResult = await client.query(updateQuery, [toStatus, saleId]);
        
        if (updateResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return undefined;
        }
        
        // 2. Registrar a mudança no histórico
        // Incorporar informações adicionais nas notas, já que não temos uma coluna metadata
        let notesWithAdditional = notes;
        if (Object.keys(additionalData).length > 0) {
          // Adicionar informações extras nas notas
          notesWithAdditional += ` | Dados adicionais: ${JSON.stringify(additionalData)}`;
        }
        
        const historyQuery = `
          INSERT INTO sales_status_history (
            sale_id, from_status, to_status, user_id, notes, created_at
          )
          VALUES (
            $1, $2, $3, $4, $5, NOW()
          )
          RETURNING *
        `;
        
        await client.query(historyQuery, [
          saleId, 
          fromStatus, 
          toStatus, 
          userId, 
          notesWithAdditional
        ]);
        
        await client.query('COMMIT');
        
        // Buscar a venda atualizada com todos os relacionamentos
        return await this.getSale(saleId);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar status da venda:', error);
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao atualizar status da venda:', error);
      throw error;
    }
  }

  // Métodos para Relatórios
  async getReports(userRole: string): Promise<any[]> {
    try {
      // Buscar relatórios e filtrar pelos que o usuário tem permissão
      const result = await pool.query(
        `SELECT * FROM reports WHERE permissions LIKE $1 ORDER BY id ASC`,
        [`%${userRole}%`]
      );
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
      throw new Error("Não foi possível buscar os relatórios. Tente novamente mais tarde.");
    }
  }

  async getReport(id: number): Promise<any | undefined> {
    try {
      const result = await pool.query(`SELECT * FROM reports WHERE id = $1`, [id]);
      return result.rows.length > 0 ? result.rows[0] : undefined;
    } catch (error) {
      console.error(`Erro ao buscar relatório ${id}:`, error);
      throw new Error("Não foi possível buscar as informações do relatório.");
    }
  }

  async createReport(report: any): Promise<any> {
    try {
      const { name, description, type, query, parameters, permissions, created_by } = report;
      const result = await pool.query(
        `INSERT INTO reports (name, description, type, query, parameters, permissions, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, description, type, query, parameters, permissions, created_by]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar relatório:", error);
      throw new Error("Não foi possível criar o relatório.");
    }
  }

  async updateReport(id: number, report: any): Promise<any | undefined> {
    try {
      const { name, description, type, query, parameters, permissions } = report;
      const result = await pool.query(
        `UPDATE reports 
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             type = COALESCE($3, type),
             query = COALESCE($4, query),
             parameters = COALESCE($5, parameters),
             permissions = COALESCE($6, permissions),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING *`,
        [name, description, type, query, parameters, permissions, id]
      );
      return result.rows.length > 0 ? result.rows[0] : undefined;
    } catch (error) {
      console.error(`Erro ao atualizar relatório ${id}:`, error);
      throw new Error("Não foi possível atualizar o relatório.");
    }
  }

  async deleteReport(id: number): Promise<boolean> {
    try {
      // Primeiro apagar todas as execuções desse relatório
      await pool.query(
        `DELETE FROM report_executions WHERE report_id = $1`,
        [id]
      );
      
      // Depois apagar o relatório
      const result = await pool.query(
        `DELETE FROM reports WHERE id = $1 RETURNING id`,
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Erro ao excluir relatório ${id}:`, error);
      throw new Error("Não foi possível excluir o relatório.");
    }
  }

  async executeReport(reportId: number, userId: number, parameters?: any): Promise<{data: any[], execution: any}> {
    try {
      // 1. Buscar informações do relatório
      const report = await this.getReport(reportId);
      if (!report) {
        throw new Error(`Relatório com ID ${reportId} não encontrado.`);
      }

      // 2. Buscar informações do usuário
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`Usuário com ID ${userId} não encontrado.`);
      }

      // 3. Preparar e executar a consulta com parâmetros
      let query = report.query;
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Verificar se é o relatório "Minhas Vendas do Período" (id = 2) e usuário é vendedor
      if (reportId === 2 && user.role === 'vendedor') {
        // Adicionar filtro de vendedor para o usuário atual
        if (query.includes('WHERE')) {
          query = query.replace('WHERE', `WHERE s.seller_id = $${paramIndex} AND`);
          queryParams.push(userId);
          paramIndex++;
        } else {
          query = query + ` WHERE s.seller_id = $${paramIndex}`;
          queryParams.push(userId);
          paramIndex++;
        }
      }

      // Substituir parâmetros nomeados no formato :paramName por $1, $2, etc.
      if (parameters) {
        // Para cada parâmetro definido no relatório
        Object.keys(report.parameters || {}).forEach(key => {
          const pattern = new RegExp(`:${key}\\b`, 'g');
          
          if (query.match(pattern)) {
            // Se o parâmetro é uma data, converter para o formato do banco
            if (report.parameters[key].type === 'date' && parameters[key]) {
              const date = new Date(parameters[key]);
              queryParams.push(date.toISOString().split('T')[0]);
            } else {
              queryParams.push(parameters[key]);
            }
            
            // Substituir o marcador nomeado pelo posicional
            query = query.replace(pattern, `$${paramIndex}`);
            paramIndex++;
          }
        });
      }

      // 3. Registrar início da execução
      const startTime = performance.now();
      
      // 4. Executar a consulta SQL
      const queryResult = await pool.query(query, queryParams);
      
      // 5. Calcular tempo de execução
      const endTime = performance.now();
      const executionTime = (endTime - startTime) / 1000; // em segundos
      
      // 6. Salvar execução no histórico
      const executionResult = await pool.query(
        `INSERT INTO report_executions 
         (report_id, user_id, parameters, execution_time, status, results, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [reportId, userId, parameters, executionTime, 'completed', JSON.stringify(queryResult.rows)]
      );
      
      return {
        data: queryResult.rows,
        execution: executionResult.rows[0]
      };
    } catch (error) {
      console.error(`Erro ao executar relatório ${reportId}:`, error);
      
      // Registrar erro na execução
      try {
        await pool.query(
          `INSERT INTO report_executions 
           (report_id, user_id, parameters, status, error_message, created_at) 
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
          [reportId, userId, parameters, 'error', error instanceof Error ? error.message : String(error)]
        );
      } catch (insertError) {
        console.error("Erro ao registrar falha de execução:", insertError);
      }
      
      throw new Error("Erro ao executar relatório: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  async getReportExecutions(reportId: number, limit: number = 20): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT e.*, u.username 
         FROM report_executions e
         JOIN users u ON e.user_id = u.id
         WHERE e.report_id = $1 
         ORDER BY e.created_at DESC 
         LIMIT $2`,
        [reportId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error(`Erro ao buscar execuções do relatório ${reportId}:`, error);
      throw new Error("Não foi possível buscar o histórico de execuções do relatório.");
    }
  }

  async getReportExecution(id: number): Promise<any | undefined> {
    try {
      console.log(`Buscando execução de relatório com ID ${id}`);
      const result = await pool.query(
        `SELECT e.*, u.username, r.name as report_name
         FROM report_executions e
         JOIN reports r ON e.report_id = r.id
         JOIN users u ON e.user_id = u.id
         WHERE e.id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        console.log(`Nenhuma execução encontrada para o ID ${id}`);
        return undefined;
      }
      
      console.log(`Execução encontrada para relatório ${result.rows[0].report_id}`);
      return result.rows[0];
    } catch (error) {
      console.error(`Erro ao buscar execução de relatório ${id}:`, error);
      throw new Error("Não foi possível buscar os detalhes da execução do relatório.");
    }
  }

  // Métodos para Análise de Dados
  async getSalesSummary(filters?: {
    startDate?: string;
    endDate?: string;
    sellerId?: number;
    status?: string;
    financialStatus?: string;
  }): Promise<{
    totalSales: number;
    totalAmount: string;
    averageAmount: string;
    completedSales: number;
    pendingSales: number;
    returnedSales: number;
  }> {
    try {
      // Preparar a consulta SQL com filtros opcionais
      let query = `
        SELECT 
          COUNT(*) as total_sales,
          COALESCE(SUM(total_amount::numeric), 0) as total_amount,
          COUNT(*) FILTER (WHERE status IN ('completed', 'paid')) as completed_sales,
          COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress', 'processing')) as pending_sales,
          COUNT(*) FILTER (WHERE status IN ('returned', 'returned_to_seller')) as returned_sales
        FROM sales
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Adicionar filtros se fornecidos
      if (filters?.startDate) {
        query += ` AND date >= $${paramIndex++}`;
        queryParams.push(filters.startDate);
      } else {
        // Por padrão, filtrar últimos 30 dias
        query += ` AND date >= $${paramIndex++}`;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        queryParams.push(thirtyDaysAgo.toISOString().split('T')[0]);
      }
      
      if (filters?.endDate) {
        query += ` AND date <= $${paramIndex++}`;
        queryParams.push(filters.endDate);
      }
      
      if (filters?.sellerId) {
        query += ` AND seller_id = $${paramIndex++}`;
        queryParams.push(filters.sellerId);
      }
      
      if (filters?.status) {
        query += ` AND status = $${paramIndex++}`;
        queryParams.push(filters.status);
      }
      
      if (filters?.financialStatus) {
        if (filters.financialStatus === 'paid') {
          query += ` AND status = 'paid'`;
        } else if (filters.financialStatus === 'pending') {
          query += ` AND status != 'paid' AND status != 'returned' AND status != 'returned_to_seller'`;
        }
      }
      
      // Executar consulta
      const result = await pool.query(query, queryParams);
      const summary = result.rows[0];
      
      // Calcular média do valor de vendas
      const averageAmount = summary.total_sales > 0 
        ? (Number(summary.total_amount) / Number(summary.total_sales)).toFixed(2)
        : "0.00";
      
      return {
        totalSales: Number(summary.total_sales),
        totalAmount: summary.total_amount,
        averageAmount,
        completedSales: Number(summary.completed_sales),
        pendingSales: Number(summary.pending_sales),
        returnedSales: Number(summary.returned_sales)
      };
    } catch (error) {
      console.error("Erro ao buscar resumo de vendas:", error);
      throw new Error("Não foi possível gerar o resumo de vendas.");
    }
  }
  
  async getSellerPerformance(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    sellerId: number;
    sellerName: string;
    totalSales: number;
    totalAmount: string;
    returnRate: number;
    completionRate: number;
  }[]> {
    try {
      // Preparar a consulta SQL com filtros opcionais
      let query = `
        SELECT 
          seller_id,
          u.username as seller_name,
          COUNT(*) as total_sales,
          COALESCE(SUM(total_amount::numeric), 0) as total_amount,
          COUNT(*) FILTER (WHERE status IN ('completed', 'paid')) as completed_sales,
          COUNT(*) FILTER (WHERE status IN ('returned', 'returned_to_seller')) as returned_sales
        FROM sales s
        JOIN users u ON s.seller_id = u.id
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Adicionar filtros se fornecidos
      if (filters?.startDate) {
        query += ` AND date >= $${paramIndex++}`;
        queryParams.push(filters.startDate);
      } else {
        // Por padrão, filtrar últimos 30 dias
        query += ` AND date >= $${paramIndex++}`;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        queryParams.push(thirtyDaysAgo.toISOString().split('T')[0]);
      }
      
      if (filters?.endDate) {
        query += ` AND date <= $${paramIndex++}`;
        queryParams.push(filters.endDate);
      }
      
      // Agrupar e ordenar resultados
      query += ` 
        GROUP BY seller_id, u.username
        ORDER BY total_amount DESC
      `;
      
      // Executar consulta
      const result = await pool.query(query, queryParams);
      
      // Calcular taxas de devolução e conclusão
      return result.rows.map(row => {
        const totalSales = Number(row.total_sales);
        const completedSales = Number(row.completed_sales);
        const returnedSales = Number(row.returned_sales);
        
        const completionRate = totalSales > 0 ? (completedSales / totalSales) * 100 : 0;
        const returnRate = totalSales > 0 ? (returnedSales / totalSales) * 100 : 0;
        
        return {
          sellerId: row.seller_id,
          sellerName: row.seller_name,
          totalSales,
          totalAmount: row.total_amount,
          returnRate,
          completionRate
        };
      });
    } catch (error) {
      console.error("Erro ao buscar desempenho dos vendedores:", error);
      throw new Error("Não foi possível gerar o relatório de desempenho dos vendedores.");
    }
  }
  
  async getFinancialOverview(filters?: {
    startDate?: string;
    endDate?: string;
    sellerId?: number;
  }): Promise<{
    totalRevenue: string;
    pendingRevenue: string;
    paidRevenue: string;
    totalCost: string;
    profit: string;
    margin: number;
  }> {
    try {
      // Importar o pool
      const { pool } = await import('./db');
      
      // Data inicial padrão: 30 dias atrás
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      let startDateStr = startDate.toISOString().split('T')[0];
      
      // Substituir por filtro fornecido, se existir
      if (filters?.startDate) {
        startDateStr = filters.startDate;
      }
      
      // Data final padrão: hoje
      let endDateStr = new Date().toISOString().split('T')[0];
      
      // Substituir por filtro fornecido, se existir
      if (filters?.endDate) {
        endDateStr = filters.endDate;
      }
      
      // Verificar se há filtro de vendedor
      const hasSellerFilter = filters?.sellerId !== undefined;
      let sellerCondition = '';
      let params = [startDateStr, endDateStr];
      
      if (hasSellerFilter) {
        sellerCondition = 'AND s.seller_id = $3';
        params.push(filters.sellerId);
      }
      
      // Consulta 1: Valor total das vendas no período (usando o total_amount das vendas)
      const totalSalesQuery = `
        SELECT COALESCE(SUM(total_amount::numeric), 0) as total_revenue
        FROM sales s
        WHERE s.date BETWEEN $1 AND $2 ${sellerCondition}
      `;
      
      // Consulta 2: Valor total já PAGO no período (da venda)
      const paidAmountQuery = `
        SELECT COALESCE(SUM(i.amount::numeric), 0) as paid_revenue
        FROM sale_installments i
        JOIN sales s ON i.sale_id = s.id
        WHERE i.status = 'paid'
        AND s.date BETWEEN $1 AND $2
        ${sellerCondition}
      `;
      
      // Consulta 3: Valor total PENDENTE no período (considerando a data da venda)
      const pendingAmountQuery = `
        SELECT COALESCE(SUM(i.amount::numeric), 0) as pending_revenue
        FROM sale_installments i
        JOIN sales s ON i.sale_id = s.id
        WHERE i.status = 'pending'
        AND s.date BETWEEN $1 AND $2
        ${sellerCondition}
      `;
      
      // Consulta 4: Custos operacionais PAGOS no período
      const costQuery = `
        SELECT COALESCE(SUM(c.amount::numeric), 0) as total_cost
        FROM sale_operational_costs c
        JOIN sales s ON c.sale_id = s.id
        WHERE c.payment_date IS NOT NULL
        AND s.date BETWEEN $1 AND $2
        ${sellerCondition}
      `;
      
      // Executar consultas individualmente para identificar problemas específicos
      const totalResult = await pool.query(totalSalesQuery, params);
      const paidResult = await pool.query(paidAmountQuery, params);
      const pendingResult = await pool.query(pendingAmountQuery, params);
      const costResult = await pool.query(costQuery, params);
      
      // Extrair valores com segurança
      const totalRevenue = totalResult.rows[0]?.total_revenue || "0";
      const paidRevenue = paidResult.rows[0]?.paid_revenue || "0";
      const pendingRevenue = pendingResult.rows[0]?.pending_revenue || "0";
      const totalCost = costResult.rows[0]?.total_cost || "0";
      
      // Calcular valores sem logging excessivo
      
      // Calcular lucro e margem
      // Lucro é calculado com base no que foi REALMENTE RECEBIDO menos os custos REALMENTE PAGOS
      const profit = (Number(paidRevenue) - Number(totalCost)).toFixed(2);
      
      // Margem é o percentual do lucro em relação à receita RECEBIDA (não à receita total)
      const margin = Number(paidRevenue) > 0 
        ? (Number(profit) / Number(paidRevenue)) * 100 
        : 0;
      
      return {
        totalRevenue,
        pendingRevenue,
        paidRevenue,
        totalCost,
        profit,
        margin
      };
    } catch (error) {
      console.error("Erro ao buscar visão geral financeira:", error);
      throw new Error("Não foi possível gerar a visão geral financeira.");
    }
  }
  
  async getSalesByDate(filters?: {
    startDate?: string;
    endDate?: string;
    sellerId?: number;
  }) {
    try {
      // Validar filtros e definir valores padrão
      const startDate = filters?.startDate
        ? new Date(filters.startDate)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
      const endDate = filters?.endDate 
        ? new Date(filters.endDate) 
        : new Date();
      
      // Preparar condições SQL
      let conditions = "WHERE s.date BETWEEN $1 AND $2";
      const params = [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];
      
      if (filters?.sellerId) {
        conditions += " AND s.seller_id = $3";
        params.push(filters.sellerId);
      }
      
      // Consulta para obter vendas agrupadas por data
      const query = `
        SELECT 
          TO_CHAR(s.date, 'YYYY-MM-DD') as date,
          COUNT(*) as count,
          COALESCE(SUM(s.total_amount::numeric), 0) as amount
        FROM sales s
        ${conditions}
        GROUP BY TO_CHAR(s.date, 'YYYY-MM-DD')
        ORDER BY date
      `;
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar vendas por data:", error);
      throw new Error("Não foi possível obter as vendas por data");
    }
  }

  async getRecentActivities(filters?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      // Validar filtros e definir valores padrão
      const limit = filters?.limit || 10;
      const startDate = filters?.startDate
        ? new Date(filters.startDate)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
      const endDate = filters?.endDate 
        ? new Date(filters.endDate) 
        : new Date();
      
      // Consulta para obter vendas recentes
      const salesQuery = `
        SELECT 
          s.id,
          'Venda' as type,
          c.name as description,
          s.status,
          s.date,
          s.total_amount::numeric as amount,
          u.username as user
        FROM sales s
        JOIN customers c ON s.customer_id = c.id
        JOIN users u ON s.seller_id = u.id
        WHERE s.date BETWEEN $1 AND $2
        ORDER BY s.date DESC
        LIMIT $3
      `;
      
      // Consulta para obter pagamentos recentes
      const paymentsQuery = `
        SELECT 
          i.id,
          'Pagamento' as type,
          CONCAT('Parcela #', i.installment_number, ' da venda #', s.order_number) as description,
          i.status,
          i.payment_date as date,
          i.amount::numeric as amount,
          u.username as user
        FROM sale_installments i
        JOIN sales s ON i.sale_id = s.id
        JOIN users u ON s.seller_id = u.id
        WHERE i.payment_date BETWEEN $1 AND $2 AND i.status = 'paid'
        ORDER BY i.payment_date DESC
        LIMIT $3
      `;
      
      // Consulta para obter atualizações de status recentes
      const statusUpdateQuery = `
        SELECT 
          sh.id,
          'Atualização de Status' as type,
          CONCAT('Venda #', s.order_number, ' atualizada para ', sh.to_status) as description,
          s.status,
          sh.created_at as date,
          s.total_amount::numeric as amount,
          u.username as user
        FROM sales_status_history sh
        JOIN sales s ON sh.sale_id = s.id
        JOIN users u ON sh.user_id = u.id
        WHERE sh.created_at BETWEEN $1 AND $2
        ORDER BY sh.created_at DESC
        LIMIT $3
      `;
      
      // Executar consultas
      const [salesResult, paymentsResult, statusResult] = await Promise.all([
        pool.query(salesQuery, [startDate.toISOString(), endDate.toISOString(), limit]),
        pool.query(paymentsQuery, [startDate.toISOString(), endDate.toISOString(), limit]),
        pool.query(statusUpdateQuery, [startDate.toISOString(), endDate.toISOString(), limit]),
      ]);
      
      // Combinar resultados e ordenar por data (mais recente primeiro)
      const allActivities = [
        ...salesResult.rows,
        ...paymentsResult.rows,
        ...statusResult.rows,
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Retornar apenas os primeiros 'limit' resultados
      return allActivities.slice(0, limit);
    } catch (error) {
      console.error("Erro ao buscar atividades recentes:", error);
      return [];
    }
  }

  async getRecentExecutions(userId: number, userRole: string, limit: number = 10): Promise<any[]> {
    try {
      let executions;
      // Se não for admin ou supervisor, só pode ver suas próprias execuções
      if (userRole === 'admin' || userRole === 'supervisor' || userRole === 'financeiro') {
        executions = await pool.query(
          `SELECT e.*, r.name as report_name, u.username 
           FROM report_executions e
           JOIN reports r ON e.report_id = r.id
           JOIN users u ON e.user_id = u.id
           ORDER BY e.created_at DESC
           LIMIT $1`,
          [limit]
        );
      } else {
        // Usuários normais só veem suas próprias execuções
        executions = await pool.query(
          `SELECT e.*, r.name as report_name, u.username 
           FROM report_executions e
           JOIN reports r ON e.report_id = r.id
           JOIN users u ON e.user_id = u.id
           WHERE e.user_id = $1 OR r.permissions LIKE $2
           ORDER BY e.created_at DESC
           LIMIT $3`,
          [userId, `%${userRole}%`, limit]
        );
      }
      
      return executions.rows;
    } catch (error) {
      console.error("Erro ao buscar execuções recentes:", error);
      throw new Error("Não foi possível buscar as execuções recentes de relatórios.");
    }
  }

  // Método para registrar atividades do sistema (log de atividades)
  async createActivityLog(data: {
    userId: number;
    action: string;
    description: string;
    details?: string;
    entityId?: number;
    entityType?: string;
  }): Promise<void> {
    try {
      const { userId, action, description, details, entityId, entityType } = data;

      await pool.query(
        `INSERT INTO activity_logs 
         (user_id, action, description, details, entity_id, entity_type, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [userId, action, description, details, entityId, entityType]
      );
    } catch (error) {
      console.error("Erro ao criar log de atividade:", error);
      // Não propagar o erro para não interromper o fluxo principal
    }
  }
}

export const storage = new DatabaseStorage();

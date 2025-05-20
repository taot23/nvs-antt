import { pgTable, text, serial, integer, boolean, numeric, timestamp, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user"), // "user", "admin", "supervisor", "operacional", "vendedor", "financeiro"
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Nome ou Razão Social
  document: text("document").notNull(), // CPF ou CNPJ
  documentType: text("document_type").notNull().default("cpf"), // 'cpf' ou 'cnpj'
  contactName: text("contact_name"), // Nome do contato (para CNPJ)
  phone: text("phone").notNull(), // Telefone principal
  phone2: text("phone2"), // Telefone secundário
  email: text("email"), // Email (opcional)
  userId: integer("user_id").notNull().references(() => users.id),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  userId: true,
});

// Tabela de serviços
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  // Campo price removido conforme solicitado
  active: boolean("active").default(true).notNull(),
  createdAt: integer("created_at").default(Math.floor(Date.now() / 1000)).notNull() // timestamp em Unix
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true
});

// Tabela de formas de pagamento
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: integer("created_at").default(Math.floor(Date.now() / 1000)).notNull() // timestamp em Unix
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true
});

// Definição da tabela de tipos de execução de serviço
export const serviceTypes = pgTable("service_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schema para inserção de tipo de execução de serviço
export const insertServiceTypeSchema = createInsertSchema(serviceTypes).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
// Definição da tabela de prestadores de serviço parceiros
export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  document: text("document").notNull(), // CPF ou CNPJ
  documentType: text("document_type").notNull().default("cpf"), // 'cpf' ou 'cnpj'
  contactName: text("contact_name"), // Nome do contato (para CNPJ)
  phone: text("phone").notNull(), // Telefone principal
  phone2: text("phone2"), // Telefone secundário
  email: text("email").notNull(), // Email
  address: text("address"), // Endereço completo
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tabela de relação entre vendas e prestadores de serviço (muitos para muitos)
export const saleServiceProviders = pgTable("sale_service_providers", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),
  serviceProviderId: integer("service_provider_id").notNull().references(() => serviceProviders.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schema para inserção de prestadores de serviço parceiros
export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
});

// Schema para inserção na tabela de relação entre vendas e prestadores
export const insertSaleServiceProviderSchema = createInsertSchema(saleServiceProviders).omit({
  id: true,
  createdAt: true,
});

// Tabela de vendas
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // Número da ordem de serviço
  date: timestamp("date").notNull().defaultNow(), // Data da venda
  customerId: integer("customer_id").notNull().references(() => customers.id), // Cliente
  paymentMethodId: integer("payment_method_id").notNull().references(() => paymentMethods.id), // Forma de pagamento
  sellerId: integer("seller_id").notNull().references(() => users.id), // Vendedor responsável
  serviceTypeId: integer("service_type_id").references(() => serviceTypes.id), // Tipo de execução do serviço
  serviceProviderId: integer("service_provider_id").references(() => serviceProviders.id), // Prestador de serviço parceiro (para SINDICATO)
  totalAmount: numeric("total_amount").notNull().default("0"), // Valor total
  installments: integer("installments").notNull().default(1), // Número de parcelas
  installmentValue: numeric("installment_value"), // Valor de cada parcela (calculado automaticamente)
  status: text("status").notNull().default("pending"), // Status: pending, in_progress, returned, completed, canceled
  executionStatus: text("execution_status").default("waiting"), // Status de execução: waiting, in_progress, completed
  financialStatus: text("financial_status").default("pending"), // Status financeiro: pending, partial, paid
  notes: text("notes"), // Observações gerais
  returnReason: text("return_reason"), // Motivo de devolução
  responsibleOperationalId: integer("responsible_operational_id").references(() => users.id), // Responsável operacional
  responsibleFinancialId: integer("responsible_financial_id").references(() => users.id), // Responsável financeiro
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de itens da venda (serviços incluídos)
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id), // Venda relacionada
  serviceId: integer("service_id").notNull().references(() => services.id), // Serviço
  serviceTypeId: integer("service_type_id").notNull().references(() => serviceTypes.id), // Tipo de serviço
  quantity: integer("quantity").notNull().default(1), // Quantidade
  price: numeric("price").notNull(), // Valor unitário
  totalPrice: numeric("total_price").notNull(), // Valor total (quantidade * preço)
  notes: text("notes"), // Observações específicas do item
  status: text("status").notNull().default("pending"), // Status específico do item
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schema para inserção de vendas
export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema para inserção de itens de venda
export const insertSaleItemSchema = createInsertSchema(saleItems).omit({
  id: true,
  createdAt: true,
});

// Tabela de histórico de status das vendas
export const salesStatusHistory = pgTable("sales_status_history", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id), // Venda relacionada
  fromStatus: text("from_status").notNull(), // Status anterior
  toStatus: text("to_status").notNull(), // Novo status
  userId: integer("user_id").notNull().references(() => users.id), // Usuário que alterou
  notes: text("notes"), // Observações
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schema para inserção no histórico de status
export const insertSalesStatusHistorySchema = createInsertSchema(salesStatusHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;
export type ServiceType = typeof serviceTypes.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SaleItem = typeof saleItems.$inferSelect;
// Tabela de parcelas da venda
export const saleInstallments = pgTable("sale_installments", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id), // Venda relacionada
  installmentNumber: integer("installment_number").notNull(), // Número da parcela (1, 2, 3...)
  amount: numeric("amount").notNull(), // Valor da parcela
  dueDate: text("due_date").notNull(), // Data de vencimento como texto para preservar formato exato
  status: text("status").notNull().default("pending"), // Status: pending, paid
  paymentDate: text("payment_date"), // Data do pagamento como texto para preservar formato exato
  notes: text("notes"), // Observações
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schema para inserção de parcelas
export const insertSaleInstallmentSchema = createInsertSchema(saleInstallments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tabela de tipos de custo operacional
export const costTypes = pgTable("cost_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Nome do tipo de custo
  description: text("description"), // Descrição opcional
  active: boolean("active").notNull().default(true), // Indica se o tipo está ativo
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schema para inserção de tipos de custo
export const insertCostTypeSchema = createInsertSchema(costTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tabela de custos operacionais da venda
export const saleOperationalCosts = pgTable("sale_operational_costs", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id), // Venda relacionada
  description: text("description").notNull(), // Descrição do custo
  costTypeId: integer("cost_type_id").references(() => costTypes.id), // Tipo de custo padronizado
  amount: numeric("amount").notNull(), // Valor do custo
  date: date("date").notNull(), // Data do custo
  paymentDate: date("payment_date"), // Data em que o custo foi pago
  responsibleId: integer("responsible_id").notNull().references(() => users.id), // Responsável pelo registro
  serviceProviderId: integer("service_provider_id").references(() => serviceProviders.id), // Prestador de serviço (para SINDICATO)
  notes: text("notes"), // Observações adicionais
  paymentReceiptUrl: text("payment_receipt_url"), // URL do comprovante de pagamento
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schema para inserção de custos operacionais
export const insertSaleOperationalCostSchema = createInsertSchema(saleOperationalCosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tabela de comprovantes de pagamento das parcelas
export const salePaymentReceipts = pgTable("sale_payment_receipts", {
  id: serial("id").primaryKey(),
  installmentId: integer("installment_id").notNull().references(() => saleInstallments.id), // Parcela relacionada
  receiptType: text("receipt_type").notNull(), // Tipo de comprovante: "bank_transfer", "credit_card", "pix", "other"
  receiptUrl: text("receipt_url"), // URL do comprovante
  receiptData: json("receipt_data"), // Dados adicionais do comprovante em formato JSON
  confirmedBy: integer("confirmed_by").notNull().references(() => users.id), // Usuário que confirmou
  confirmationDate: timestamp("confirmation_date").notNull().defaultNow(), // Data da confirmação
  notes: text("notes"), // Observações
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schema para inserção de comprovantes de pagamento
export const insertSalePaymentReceiptSchema = createInsertSchema(salePaymentReceipts).omit({
  id: true,
  createdAt: true,
});

export type InsertSalesStatusHistory = z.infer<typeof insertSalesStatusHistorySchema>;
export type SalesStatusHistory = typeof salesStatusHistory.$inferSelect;
export type InsertSaleInstallment = z.infer<typeof insertSaleInstallmentSchema>;
export type SaleInstallment = typeof saleInstallments.$inferSelect;
export type InsertCostType = z.infer<typeof insertCostTypeSchema>;
export type CostType = typeof costTypes.$inferSelect;
export type InsertSaleOperationalCost = z.infer<typeof insertSaleOperationalCostSchema>;
export type SaleOperationalCost = typeof saleOperationalCosts.$inferSelect;
export type InsertSalePaymentReceipt = z.infer<typeof insertSalePaymentReceiptSchema>;
export type SalePaymentReceipt = typeof salePaymentReceipts.$inferSelect;
export type InsertSaleServiceProvider = z.infer<typeof insertSaleServiceProviderSchema>;
export type SaleServiceProvider = typeof saleServiceProviders.$inferSelect;

// Tabela de relatórios
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // sales, financial, operational, performance
  permissions: text("permissions").notNull(), // Roles que podem acessar este relatório (formato: admin,financeiro,vendedor)
  parameters: json("parameters"), // Parâmetros configuráveis do relatório em formato JSON
  query: text("query").notNull(), // Query SQL ou lógica do relatório
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schema para inserção de relatórios
export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tabela de histórico de execução de relatórios
export const reportExecutions = pgTable("report_executions", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => reports.id),
  userId: integer("user_id").notNull().references(() => users.id),
  parameters: json("parameters"), // Parâmetros usados na execução
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  rowCount: integer("row_count"), // Número de linhas no resultado
  error: text("error"), // Mensagem de erro, se houver
});

// Schema para inserção de execuções de relatórios
export const insertReportExecutionSchema = createInsertSchema(reportExecutions).omit({
  id: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReportExecution = z.infer<typeof insertReportExecutionSchema>;
export type ReportExecution = typeof reportExecutions.$inferSelect;

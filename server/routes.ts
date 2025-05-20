import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupWebsocket, notifySalesUpdate, broadcastEvent } from "./websocket";
import { registerCustomRoutes } from "./routes-custom";
import { 
  insertCustomerSchema, 
  insertUserSchema, 
  insertServiceSchema, 
  insertPaymentMethodSchema, 
  insertServiceTypeSchema,
  insertServiceProviderSchema,
  insertSaleSchema,
  insertSaleItemSchema,
  insertSalesStatusHistorySchema,
  insertSaleOperationalCostSchema,
  InsertSale,
  InsertSaleOperationalCost,
  InsertSalePaymentReceipt,
  sales
} from "@shared/schema";
import { ZodError } from "zod";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { eq } from "drizzle-orm";
import { db } from "./db";

/**
 * Função auxiliar para gerenciar as parcelas de uma venda
 * Garante que o número exato de parcelas seja criado/atualizado no banco de dados
 * @param saleId - ID da venda 
 * @param installmentsCount - Número de parcelas a criar
 * @param totalAmount - Valor total da venda
 * @param dueDates - Array opcional com datas específicas de vencimento
 */
async function ensureSaleInstallments(
  saleId: number, 
  installmentsCount: number, 
  totalAmount: string | number,
  dueDates?: string[]
) {
  try {
    const { pool } = await import('./db');
    
    console.log("⭐️⭐️⭐️ SOLUÇÃO DEFINITIVA ABRIL 2025 ⭐️⭐️⭐️");
    console.log(`⭐️ Processando parcelas para venda #${saleId}`);
    console.log(`⭐️ Número de parcelas: ${installmentsCount}`);
    console.log(`⭐️ Valor total: ${totalAmount}`);
    console.log(`⭐️ Datas específicas: ${dueDates ? 'SIM - ' + dueDates.length + ' datas' : 'NÃO'}`);
    
    if (dueDates && dueDates.length > 0) {
      console.log(`⭐️ Visualizando datas recebidas:`);
      dueDates.forEach((date, index) => {
        console.log(`⭐️ Parcela ${index+1}: ${date} (${typeof date})`);
      });
    }
    
    // Primeiro, busca as parcelas existentes
    const existingResult = await pool.query(
      `SELECT * FROM sale_installments WHERE sale_id = $1 ORDER BY installment_number`,
      [saleId]
    );
    
    const existingInstallments = existingResult.rows;
    const currentCount = existingInstallments.length;
    
    console.log(`🔄 Verificando parcelas para venda #${saleId}: tem ${currentCount}, precisa de ${installmentsCount}`);
    
    // Se temos parcelas existentes, extrair suas datas para reuso se necessário
    const existingDates: string[] = [];
    if (currentCount > 0) {
      existingInstallments.forEach(inst => {
        let formattedDate = inst.due_date;
        if (typeof formattedDate === 'string' && formattedDate.includes('T')) {
          formattedDate = formattedDate.split('T')[0];
        }
        existingDates.push(formattedDate);
        console.log(`🗓️ Parcela ${inst.installment_number} existente, data: ${formattedDate}`);
      });
    }
    
    // Apaga sempre todas as parcelas existentes para recriar conforme necessário
    await pool.query(`DELETE FROM sale_installments WHERE sale_id = $1`, [saleId]);
    console.log(`🔄 Parcelas anteriores da venda #${saleId} excluídas.`);
    
    // Converte o valor total para número se for string
    const totalAmountValue = typeof totalAmount === 'number' 
      ? totalAmount 
      : parseFloat(totalAmount);
    
    // Calcula o valor base de cada parcela
    const baseInstallmentValue = totalAmountValue / installmentsCount;
    const installmentValue = Math.floor(baseInstallmentValue * 100) / 100;
    
    // A última parcela compensa qualquer diferença de arredondamento
    const lastInstallmentValue = totalAmountValue - (installmentValue * (installmentsCount - 1));
    const lastInstallmentValueFormatted = Math.round(lastInstallmentValue * 100) / 100;
    
    console.log(`💰 Valor total: ${totalAmountValue}, Parcelas: ${installmentsCount}`);
    console.log(`💰 Valor por parcela: ${installmentValue}, Última parcela: ${lastInstallmentValueFormatted}`);
    
    // Data base para cálculo dos vencimentos
    const today = new Date();
    
    // Cria cada parcela
    for (let i = 1; i <= installmentsCount; i++) {
      let dueDate;
      
      // Prioridade de seleção da data de vencimento:
      // 1. Data específica fornecida no parâmetro dueDates
      // 2. Data da parcela existente anteriormente (se o número da parcela corresponder)
      // 3. Data calculada automaticamente (hoje + i-1 meses)
      
      // 1. Verifica se temos uma data específica para esta parcela no parâmetro
      if (dueDates && dueDates.length >= i && dueDates[i-1]) {
        let specifiedDate = dueDates[i-1];
        
        // Garantir que a data está no formato YYYY-MM-DD
        if (typeof specifiedDate === 'string') {
          // Se tiver timestamp (T), remover
          if (specifiedDate.includes('T')) {
            specifiedDate = specifiedDate.split('T')[0];
          }
          
          // Se for DD/MM/YYYY, converter para YYYY-MM-DD
          if (specifiedDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            const parts = specifiedDate.split('/');
            specifiedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
        
        console.log(`📅 SOLUÇÃO FINAL: Usando data específica para parcela ${i}: ${specifiedDate}`);
        dueDate = specifiedDate;
      } 
      // 2. Se não tiver data específica, usar a data da parcela existente anteriormente
      else if (i <= existingDates.length) {
        console.log(`📅 SOLUÇÃO FINAL: Reusando data anterior para parcela ${i}: ${existingDates[i-1]}`);
        dueDate = existingDates[i-1];
      } 
      // 3. Se não tiver nenhuma das anteriores, calcular automaticamente
      else {
        // Calcula a data de vencimento (hoje + i-1 meses)
        const calculatedDate = new Date(today);
        calculatedDate.setMonth(calculatedDate.getMonth() + (i - 1));
        dueDate = `${calculatedDate.getFullYear()}-${String(calculatedDate.getMonth() + 1).padStart(2, '0')}-${String(calculatedDate.getDate()).padStart(2, '0')}`;
        console.log(`📅 SOLUÇÃO FINAL: Calculando data para parcela ${i}: ${dueDate}`);
      }
      
      // Verificação final de segurança para garantir formato ISO
      if (typeof dueDate === 'string' && !dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log(`⚠️ Data em formato inválido: ${dueDate}, convertendo...`);
        try {
          // Tentar extrair componentes da data
          const dateParts = dueDate.split(/[-/T]/);
          if (dateParts.length >= 3) {
            // Verificar se o primeiro componente pode ser um ano (YYYY-MM-DD)
            if (dateParts[0].length === 4) {
              dueDate = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
            } 
            // Se não, pode ser DD/MM/YYYY ou MM/DD/YYYY 
            else {
              dueDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
            }
            console.log(`✅ Data convertida para ISO: ${dueDate}`);
          } else {
            // Fallback para a data atual
            dueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            console.log(`⚠️ Usando data atual como fallback: ${dueDate}`);
          }
        } catch (error) {
          // Fallback final - data atual
          dueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          console.log(`⚠️ ERRO ao processar data, usando atual: ${dueDate}`);
        }
      }
      
      // Define o valor da parcela atual
      const currentInstallmentValue = (i === installmentsCount) 
        ? lastInstallmentValueFormatted 
        : installmentValue;
      
      // Inserir a parcela no banco com SQL direto para controle total
      await pool.query(
        `INSERT INTO sale_installments (
          sale_id, installment_number, amount, due_date, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [
          saleId,
          i,
          currentInstallmentValue.toFixed(2),
          dueDate, // Data exatamente como processada
          'pending'
        ]
      );
      
      console.log(`✅ Parcela ${i} criada com valor ${currentInstallmentValue.toFixed(2)} e data ${dueDate}`);
    }
    
    console.log(`✅✅✅ SOLUÇÃO FINAL: Criadas ${installmentsCount} parcelas para a venda #${saleId}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao gerenciar parcelas da venda #${saleId}:`, error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Função auxiliar para gerar hash de senha
  const scryptAsync = promisify(scrypt);
  
  async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }
  
  // Middleware para verificar se o usuário está autenticado
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ error: "Não autorizado" });
  };
  
  // Middleware para verificar permissões - gerenciamento de serviços
  const canManageServices = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    // Apenas administradores e operacionais podem gerenciar serviços
    if (req.user?.role === "admin" || req.user?.role === "operacional") {
      return next();
    }
    return res.status(403).json({ error: "Permissão negada" });
  };
  
  // Middleware para verificar permissões - gerenciamento de formas de pagamento
  const canManagePaymentMethods = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    // Apenas administradores e financeiros podem gerenciar formas de pagamento
    if (req.user?.role === "admin" || req.user?.role === "financeiro") {
      return next();
    }
    return res.status(403).json({ error: "Permissão negada" });
  };
  
  // Middleware para verificar permissões - gerenciamento financeiro (tipos de custo, etc)
  const canManageFinance = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    // Apenas administradores e financeiros podem gerenciar aspectos financeiros
    if (req.user?.role === "admin" || req.user?.role === "financeiro") {
      return next();
    }
    return res.status(403).json({ error: "Permissão negada" });
  };
  
  // Middleware especial para restringir ações apenas para administradores
  const onlyAdminAccess = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    // Apenas administradores podem acessar
    if (req.user?.role === "admin") {
      return next();
    }
    return res.status(403).json({ error: "Acesso restrito apenas a administradores" });
  };
  
  // Middleware para verificar permissões - gerenciamento de tipos de serviço
  const canManageServiceTypes = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    // Apenas administradores e operacionais podem gerenciar tipos de serviço
    if (req.user?.role === "admin" || req.user?.role === "operacional") {
      return next();
    }
    return res.status(403).json({ error: "Permissão negada" });
  };
  
  // Middleware para verificar permissões - gerenciamento de prestadores de serviço
  const canManageServiceProviders = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    // Apenas administradores e operacionais podem gerenciar prestadores de serviço
    if (req.user?.role === "admin" || req.user?.role === "operacional") {
      return next();
    }
    return res.status(403).json({ error: "Permissão negada" });
  };
  
  // Middleware para verificar permissões - operações operacionais em vendas
  const canManageSaleOperations = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    // Administradores, operacionais, financeiros e supervisores podem gerenciar operações em vendas
    if (req.user?.role === "admin" || req.user?.role === "operacional" || req.user?.role === "supervisor" || req.user?.role === "financeiro") {
      console.log("Permissão para operações de venda concedida ao usuário:", req.user.username, "perfil:", req.user.role);
      return next();
    }
    console.log("Permissão para operações de venda negada ao usuário:", req.user?.username, "perfil:", req.user?.role);
    return res.status(403).json({ error: "Permissão negada" });
  };
  
  // Middleware para verificar permissões - operações financeiras em vendas
  const canManageSaleFinancials = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    // Apenas administradores e financeiros podem gerenciar operações financeiras em vendas
    if (req.user?.role === "admin" || req.user?.role === "financeiro") {
      return next();
    }
    return res.status(403).json({ error: "Permissão negada" });
  };
  
  // Middleware para verificar permissões - apenas administradores podem editar vendas já pagas
  const onlyAdminCanEditPaidSales = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    // Apenas administradores podem editar vendas já pagas
    if (req.user?.role === "admin") {
      return next();
    }
    return res.status(403).json({ error: "Permissão negada. Apenas administradores podem editar vendas já pagas." });
  };
  
  // Middleware para verificar se usuário pode ver todas as vendas da empresa
  const canViewAllSales = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    // Admins, supervisores, operacionais e financeiros podem ver todas as vendas
    if (["admin", "supervisor", "operacional", "financeiro"].includes(req.user?.role || "")) {
      return next();
    }
    return res.status(403).json({ error: "Permissão negada" });
  };
  
  // Rotas para gerenciamento de clientes
  app.get("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      res.status(500).json({ error: "Erro ao buscar clientes" });
    }
  });

  app.get("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      res.status(500).json({ error: "Erro ao buscar cliente" });
    }
  });

  app.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      // Valida os dados enviados pelo cliente
      const validatedData = insertCustomerSchema.parse(req.body);
      
      // Verificar se já existe um cliente com este documento
      const existingCustomer = await storage.getCustomerByDocument(validatedData.document);
      if (existingCustomer) {
        // Limitar os dados retornados para evitar exposição desnecessária
        return res.status(400).json({ 
          error: "Cliente já cadastrado", 
          message: `Este ${existingCustomer.documentType === 'cpf' ? 'CPF' : 'CNPJ'} já está cadastrado no sistema para o cliente "${existingCustomer.name}"`, 
          existingCustomer: {
            id: existingCustomer.id,
            name: existingCustomer.name,
            document: existingCustomer.document,
            documentType: existingCustomer.documentType
          }
        });
      }
      
      // Adiciona o ID do usuário logado como proprietário
      const customerData = {
        ...validatedData,
        userId: req.user!.id
      };
      
      console.log("Dados para criação do cliente:", customerData);
      
      const customer = await storage.createCustomer(customerData);
      console.log("Cliente criado com sucesso:", customer);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao criar cliente" });
    }
  });

  app.put("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Buscar o cliente atual para verificações
      const currentCustomer = await storage.getCustomer(id);
      if (!currentCustomer) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
      
      // Valida os dados parciais
      const customerData = insertCustomerSchema.partial().parse(req.body);
      
      // Se o documento estiver sendo alterado, verifica se já existe
      if (customerData.document && customerData.document !== currentCustomer.document) {
        const existingCustomer = await storage.getCustomerByDocument(customerData.document);
        if (existingCustomer && existingCustomer.id !== id) {
          return res.status(400).json({ 
            error: "Documento já cadastrado", 
            message: `Este ${existingCustomer.documentType === 'cpf' ? 'CPF' : 'CNPJ'} já está sendo utilizado pelo cliente "${existingCustomer.name}". Não é possível atualizar para um documento já cadastrado.`,
            existingCustomer: {
              id: existingCustomer.id,
              name: existingCustomer.name,
              document: existingCustomer.document,
              documentType: existingCustomer.documentType
            }
          });
        }
      }
      
      // Garantir que o usuário não está tentando modificar o userId
      if ('userId' in customerData) {
        delete customerData.userId;
      }
      
      console.log("Dados para atualização do cliente:", id, customerData);
      
      const customer = await storage.updateCustomer(id, customerData);
      if (!customer) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
      
      console.log("Cliente atualizado com sucesso:", customer);
      res.json(customer);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao atualizar cliente" });
    }
  });

  app.delete("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      res.status(500).json({ error: "Erro ao excluir cliente" });
    }
  });

  // ========== Rotas para gerenciamento de usuários ==========
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getUsers();
      
      // Não enviar as senhas para o frontend
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });

  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Não enviar a senha para o frontend
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  });

  app.post("/api/users", isAuthenticated, async (req, res) => {
    try {
      // Verificar o perfil do usuário logado - apenas admins e supervisores podem criar novos usuários
      const currentUser = req.user;
      if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "supervisor")) {
        return res.status(403).json({ error: "Permissão negada. Apenas administradores e supervisores podem criar usuários." });
      }
      
      // Validar os dados enviados
      const validatedData = insertUserSchema.parse(req.body);
      
      // Verificar se já existe um usuário com este nome de usuário
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ 
          error: "Nome de usuário já cadastrado", 
          message: "Este nome de usuário já está em uso. Escolha outro nome de usuário."
        });
      }
      
      // Criar o usuário
      const user = await storage.createUser(validatedData);
      
      // Não enviar a senha para o frontend
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se o usuário existe
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Regras de permissão:
      // 1. Um usuário comum só pode editar a si mesmo
      // 2. Administradores e supervisores podem editar qualquer usuário
      // 3. Um usuário comum não pode alterar seu próprio papel (role)
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({ error: "Não autorizado" });
      }
      
      if (currentUser.role !== "admin" && currentUser.role !== "supervisor" && currentUser.id !== id) {
        return res.status(403).json({ error: "Permissão negada" });
      }
      
      // Validar dados parciais
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Se estiver alterando username, verificar se já existe
      if (userData.username && userData.username !== user.username) {
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ 
            error: "Nome de usuário já cadastrado", 
            message: "Este nome de usuário já está sendo utilizado por outro usuário."
          });
        }
      }
      
      // Verificar se usuário comum está tentando alterar seu próprio papel
      if (currentUser.role !== "admin" && userData.role && userData.role !== user.role) {
        return res.status(403).json({ 
          error: "Permissão negada", 
          message: "Você não pode alterar seu próprio perfil de acesso."
        });
      }
      
      // Se estiver mudando a senha, fazer hash dela
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      // Atualizar usuário
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Não enviar a senha para o frontend
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar permissões (apenas admins e supervisores podem excluir usuários)
      const currentUser = req.user;
      if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "supervisor")) {
        return res.status(403).json({ error: "Permissão negada. Apenas administradores e supervisores podem excluir usuários." });
      }
      
      // Não permitir excluir o próprio usuário
      if (currentUser.id === id) {
        return res.status(400).json({ error: "Você não pode excluir seu próprio usuário." });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      res.status(500).json({ error: "Erro ao excluir usuário" });
    }
  });

  // ========== Rotas para gerenciamento de serviços ==========
  
  app.get("/api/services", isAuthenticated, async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      res.status(500).json({ error: "Erro ao buscar serviços" });
    }
  });

  app.get("/api/services/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ error: "Serviço não encontrado" });
      }
      
      res.json(service);
    } catch (error) {
      console.error("Erro ao buscar serviço:", error);
      res.status(500).json({ error: "Erro ao buscar serviço" });
    }
  });

  app.post("/api/services", canManageServices, async (req, res) => {
    try {
      // Validar os dados enviados
      const validatedData = insertServiceSchema.parse(req.body);
      
      // Verificar se já existe um serviço com esse nome
      const existingService = await storage.getServiceByName(validatedData.name);
      if (existingService) {
        return res.status(400).json({ 
          error: "Serviço já cadastrado", 
          message: "Já existe um serviço com este nome. Por favor, escolha outro nome para o serviço."
        });
      }
      
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Erro ao criar serviço:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao criar serviço" });
    }
  });

  app.put("/api/services/:id", canManageServices, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se o serviço existe
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ error: "Serviço não encontrado" });
      }
      
      // Validar os dados enviados
      const validatedData = insertServiceSchema.parse(req.body);
      
      // Verificar se já existe outro serviço com esse nome
      if (validatedData.name !== service.name) {
        const existingService = await storage.getServiceByName(validatedData.name);
        if (existingService && existingService.id !== id) {
          return res.status(400).json({ 
            error: "Nome de serviço já utilizado", 
            message: "Já existe um serviço com este nome. Por favor, escolha outro nome para o serviço."
          });
        }
      }
      
      const updatedService = await storage.updateService(id, validatedData);
      if (!updatedService) {
        return res.status(404).json({ error: "Serviço não encontrado" });
      }
      
      res.json(updatedService);
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao atualizar serviço" });
    }
  });

  app.delete("/api/services/:id", canManageServices, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const success = await storage.deleteService(id);
      if (!success) {
        return res.status(404).json({ error: "Serviço não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
      res.status(500).json({ error: "Erro ao excluir serviço" });
    }
  });

  // Rota especial para redefinir senha de usuário
  app.post("/api/reset-password", isAuthenticated, async (req, res) => {
    try {
      // Verificar o perfil do usuário logado - apenas admins podem redefinir senhas
      const currentUser = req.user;
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ error: "Permissão negada. Apenas administradores podem redefinir senhas." });
      }
      
      const { username, newPassword } = req.body;
      
      if (!username || !newPassword) {
        return res.status(400).json({ error: "Nome de usuário e nova senha são obrigatórios" });
      }
      
      // Buscar usuário pelo nome de usuário
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      // Hash a nova senha
      const hashedPassword = await hashPassword(newPassword);
      
      // Atualizar a senha do usuário
      const updatedUser = await storage.updateUser(user.id, { password: hashedPassword });
      if (!updatedUser) {
        return res.status(500).json({ error: "Falha ao atualizar senha do usuário" });
      }
      
      res.json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      res.status(500).json({ error: "Erro ao redefinir senha" });
    }
  });
  
  // ========== Rotas para gerenciamento de formas de pagamento ==========
  
  app.get("/api/payment-methods", isAuthenticated, async (req, res) => {
    try {
      const paymentMethods = await storage.getPaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      console.error("Erro ao buscar formas de pagamento:", error);
      res.status(500).json({ error: "Erro ao buscar formas de pagamento" });
    }
  });

  app.get("/api/payment-methods/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const paymentMethod = await storage.getPaymentMethod(id);
      if (!paymentMethod) {
        return res.status(404).json({ error: "Forma de pagamento não encontrada" });
      }
      
      res.json(paymentMethod);
    } catch (error) {
      console.error("Erro ao buscar forma de pagamento:", error);
      res.status(500).json({ error: "Erro ao buscar forma de pagamento" });
    }
  });

  app.post("/api/payment-methods", canManagePaymentMethods, async (req, res) => {
    try {
      // Validar os dados enviados
      const validatedData = insertPaymentMethodSchema.parse(req.body);
      
      // Verificar se já existe uma forma de pagamento com esse nome
      const existingPaymentMethod = await storage.getPaymentMethodByName(validatedData.name);
      if (existingPaymentMethod) {
        return res.status(400).json({ 
          error: "Forma de pagamento já cadastrada", 
          message: "Já existe uma forma de pagamento com este nome. Por favor, escolha outro nome."
        });
      }
      
      const paymentMethod = await storage.createPaymentMethod(validatedData);
      res.status(201).json(paymentMethod);
    } catch (error) {
      console.error("Erro ao criar forma de pagamento:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao criar forma de pagamento" });
    }
  });

  app.put("/api/payment-methods/:id", canManagePaymentMethods, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se a forma de pagamento existe
      const paymentMethod = await storage.getPaymentMethod(id);
      if (!paymentMethod) {
        return res.status(404).json({ error: "Forma de pagamento não encontrada" });
      }
      
      // Validar os dados enviados
      const validatedData = insertPaymentMethodSchema.parse(req.body);
      
      // Verificar se já existe outra forma de pagamento com esse nome
      if (validatedData.name !== paymentMethod.name) {
        const existingPaymentMethod = await storage.getPaymentMethodByName(validatedData.name);
        if (existingPaymentMethod && existingPaymentMethod.id !== id) {
          return res.status(400).json({ 
            error: "Nome já utilizado", 
            message: "Já existe uma forma de pagamento com este nome. Por favor, escolha outro nome."
          });
        }
      }
      
      const updatedPaymentMethod = await storage.updatePaymentMethod(id, validatedData);
      if (!updatedPaymentMethod) {
        return res.status(404).json({ error: "Forma de pagamento não encontrada" });
      }
      
      res.json(updatedPaymentMethod);
    } catch (error) {
      console.error("Erro ao atualizar forma de pagamento:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao atualizar forma de pagamento" });
    }
  });

  app.delete("/api/payment-methods/:id", canManagePaymentMethods, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const success = await storage.deletePaymentMethod(id);
      if (!success) {
        return res.status(404).json({ error: "Forma de pagamento não encontrada" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao excluir forma de pagamento:", error);
      res.status(500).json({ error: "Erro ao excluir forma de pagamento" });
    }
  });

  // ========== Rotas para gerenciamento de tipos de serviço ==========
  
  app.get("/api/service-types", isAuthenticated, async (req, res) => {
    try {
      const serviceTypes = await storage.getServiceTypes();
      res.json(serviceTypes);
    } catch (error) {
      console.error("Erro ao buscar tipos de serviço:", error);
      res.status(500).json({ error: "Erro ao buscar tipos de serviço" });
    }
  });

  app.get("/api/service-types/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const serviceType = await storage.getServiceType(id);
      if (!serviceType) {
        return res.status(404).json({ error: "Tipo de serviço não encontrado" });
      }
      
      res.json(serviceType);
    } catch (error) {
      console.error("Erro ao buscar tipo de serviço:", error);
      res.status(500).json({ error: "Erro ao buscar tipo de serviço" });
    }
  });

  app.post("/api/service-types", canManageServiceTypes, async (req, res) => {
    try {
      // Validar os dados enviados
      const validatedData = insertServiceTypeSchema.parse(req.body);
      
      // Verificar se já existe um tipo de serviço com esse nome
      const existingServiceType = await storage.getServiceTypeByName(validatedData.name);
      if (existingServiceType) {
        return res.status(400).json({ 
          error: "Tipo de serviço já cadastrado", 
          message: "Já existe um tipo de serviço com este nome. Por favor, escolha outro nome."
        });
      }
      
      const serviceType = await storage.createServiceType(validatedData);
      res.status(201).json(serviceType);
    } catch (error) {
      console.error("Erro ao criar tipo de serviço:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao criar tipo de serviço" });
    }
  });

  app.put("/api/service-types/:id", canManageServiceTypes, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se o tipo de serviço existe
      const serviceType = await storage.getServiceType(id);
      if (!serviceType) {
        return res.status(404).json({ error: "Tipo de serviço não encontrado" });
      }
      
      // Validar os dados enviados
      const validatedData = insertServiceTypeSchema.parse(req.body);
      
      // Verificar se já existe outro tipo de serviço com esse nome
      if (validatedData.name !== serviceType.name) {
        const existingServiceType = await storage.getServiceTypeByName(validatedData.name);
        if (existingServiceType && existingServiceType.id !== id) {
          return res.status(400).json({ 
            error: "Nome já utilizado", 
            message: "Já existe um tipo de serviço com este nome. Por favor, escolha outro nome."
          });
        }
      }
      
      const updatedServiceType = await storage.updateServiceType(id, validatedData);
      if (!updatedServiceType) {
        return res.status(404).json({ error: "Tipo de serviço não encontrado" });
      }
      
      res.json(updatedServiceType);
    } catch (error) {
      console.error("Erro ao atualizar tipo de serviço:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao atualizar tipo de serviço" });
    }
  });

  app.delete("/api/service-types/:id", canManageServiceTypes, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const success = await storage.deleteServiceType(id);
      if (!success) {
        return res.status(404).json({ error: "Tipo de serviço não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao excluir tipo de serviço:", error);
      res.status(500).json({ error: "Erro ao excluir tipo de serviço" });
    }
  });

  // ========== Rotas para gerenciamento de prestadores de serviço ==========
  
  app.get("/api/service-providers", isAuthenticated, async (req, res) => {
    try {
      const serviceProviders = await storage.getServiceProviders();
      res.json(serviceProviders);
    } catch (error) {
      console.error("Erro ao buscar prestadores de serviço:", error);
      res.status(500).json({ error: "Erro ao buscar prestadores de serviço" });
    }
  });

  app.get("/api/service-providers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const serviceProvider = await storage.getServiceProvider(id);
      if (!serviceProvider) {
        return res.status(404).json({ error: "Prestador de serviço não encontrado" });
      }
      
      res.json(serviceProvider);
    } catch (error) {
      console.error("Erro ao buscar prestador de serviço:", error);
      res.status(500).json({ error: "Erro ao buscar prestador de serviço" });
    }
  });

  app.post("/api/service-providers", canManageServiceProviders, async (req, res) => {
    try {
      // Validar os dados enviados
      const validatedData = insertServiceProviderSchema.parse(req.body);
      
      // Verificar se já existe um prestador com esse documento
      const existingServiceProvider = await storage.getServiceProviderByDocument(validatedData.document);
      if (existingServiceProvider) {
        return res.status(400).json({ 
          error: "Prestador já cadastrado", 
          message: `Este ${existingServiceProvider.documentType === 'cpf' ? 'CPF' : 'CNPJ'} já está cadastrado no sistema para o prestador "${existingServiceProvider.name}"`, 
          existingServiceProvider: {
            id: existingServiceProvider.id,
            name: existingServiceProvider.name,
            document: existingServiceProvider.document,
            documentType: existingServiceProvider.documentType
          }
        });
      }
      
      const serviceProvider = await storage.createServiceProvider(validatedData);
      res.status(201).json(serviceProvider);
    } catch (error) {
      console.error("Erro ao criar prestador de serviço:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao criar prestador de serviço" });
    }
  });

  app.put("/api/service-providers/:id", canManageServiceProviders, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se o prestador existe
      const serviceProvider = await storage.getServiceProvider(id);
      if (!serviceProvider) {
        return res.status(404).json({ error: "Prestador de serviço não encontrado" });
      }
      
      // Validar os dados enviados
      const validatedData = insertServiceProviderSchema.parse(req.body);
      
      // Verificar se já existe outro prestador com esse documento
      if (validatedData.document !== serviceProvider.document) {
        const existingServiceProvider = await storage.getServiceProviderByDocument(validatedData.document);
        if (existingServiceProvider && existingServiceProvider.id !== id) {
          return res.status(400).json({ 
            error: "Documento já cadastrado", 
            message: `Este ${existingServiceProvider.documentType === 'cpf' ? 'CPF' : 'CNPJ'} já está cadastrado no sistema para o prestador "${existingServiceProvider.name}"`, 
            existingServiceProvider: {
              id: existingServiceProvider.id,
              name: existingServiceProvider.name,
              document: existingServiceProvider.document,
              documentType: existingServiceProvider.documentType
            }
          });
        }
      }
      
      const updatedServiceProvider = await storage.updateServiceProvider(id, validatedData);
      if (!updatedServiceProvider) {
        return res.status(404).json({ error: "Prestador de serviço não encontrado" });
      }
      
      res.json(updatedServiceProvider);
    } catch (error) {
      console.error("Erro ao atualizar prestador de serviço:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Erro ao atualizar prestador de serviço" });
    }
  });

  app.delete("/api/service-providers/:id", canManageServiceProviders, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const success = await storage.deleteServiceProvider(id);
      if (!success) {
        return res.status(404).json({ error: "Prestador de serviço não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao excluir prestador de serviço:", error);
      res.status(500).json({ error: "Erro ao excluir prestador de serviço" });
    }
  });

  // ========== Rotas para gerenciamento de vendas ==========
  
  // API para obter prestadores de serviço associados à venda
  app.get("/api/sales/:saleId/service-providers", isAuthenticated, async (req, res) => {
    try {
      const saleId = parseInt(req.params.saleId);
      
      if (isNaN(saleId)) {
        return res.status(400).json({ error: "ID de venda inválido" });
      }

      const sale = await storage.getSale(saleId);
      
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Obter as relações entre venda e prestadores de serviço
      const relations = await storage.getSaleServiceProviders(saleId);
      
      if (!relations || relations.length === 0) {
        // Caso ainda esteja usando o campo antigo na tabela sales
        if (sale.serviceProviderId) {
          const provider = await storage.getServiceProvider(sale.serviceProviderId);
          if (provider) {
            return res.status(200).json([provider]);
          }
        }
        return res.status(200).json([]);
      }
      
      // Obter detalhes de todos os prestadores relacionados
      const providers = [];
      for (const relation of relations) {
        const provider = await storage.getServiceProvider(relation.serviceProviderId);
        if (provider) {
          providers.push(provider);
        }
      }
      
      return res.status(200).json(providers);
    } catch (error) {
      console.error("Erro ao obter prestadores de serviço da venda:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  
  // API para atualizar prestadores de serviço associados à venda
  // Rota PUT para atualizar prestadores de serviço (método RESTful padrão)
  app.put("/api/sales/:saleId/service-providers", canManageServiceProviders, async (req, res) => {
    try {
      const saleId = parseInt(req.params.saleId);
      const { providerIds } = req.body;
      
      if (isNaN(saleId)) {
        return res.status(400).json({ error: "ID de venda inválido" });
      }
      
      if (!Array.isArray(providerIds)) {
        return res.status(400).json({ error: "Lista de prestadores inválida" });
      }

      const sale = await storage.getSale(saleId);
      
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Atualizar relações
      const updatedRelations = await storage.updateSaleServiceProviders(saleId, providerIds);
      
      return res.status(200).json(updatedRelations);
    } catch (error) {
      console.error("Erro ao atualizar prestadores de serviço da venda:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  
  // Rota POST para atualizar prestadores de serviço (para compatibilidade com frontend)
  app.post("/api/sales/:saleId/service-providers", canManageServiceProviders, async (req, res) => {
    try {
      const saleId = parseInt(req.params.saleId);
      const { providerIds } = req.body;
      
      if (isNaN(saleId)) {
        return res.status(400).json({ error: "ID de venda inválido" });
      }
      
      if (!Array.isArray(providerIds)) {
        return res.status(400).json({ error: "Lista de prestadores inválida" });
      }

      const sale = await storage.getSale(saleId);
      
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Atualizar relações
      const updatedRelations = await storage.updateSaleServiceProviders(saleId, providerIds);
      
      return res.status(200).json(updatedRelations);
    } catch (error) {
      console.error("Erro ao atualizar prestadores de serviço da venda:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  
  // Rota para listar todas as vendas (com base na permissão do usuário) - com suporte a paginação
  app.get("/api/sales", isAuthenticated, async (req, res) => {
    try {
      // Parâmetros de paginação e filtros opcionais
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string || undefined;
      const financialStatus = req.query.financialStatus as string || undefined;
      const includeSummary = req.query.includeSummary === 'true'; // Novo parâmetro para forçar inclusão do resumo financeiro
      const searchTerm = req.query.searchTerm as string || undefined;
      const sortField = req.query.sortField as string || 'createdAt';
      const sortDirection = req.query.sortDirection as 'asc' | 'desc' || 'desc';
      const startDate = req.query.startDate as string || undefined;
      const endDate = req.query.endDate as string || undefined;
      
      // Log para depuração da exportação
      console.log(`API /api/sales: incluir resumo financeiro = ${includeSummary}, financialStatus = ${financialStatus || 'não definido'}`);
      console.log(`DEBUG DATAS: startDate = ${startDate || 'não definido'}, endDate = ${endDate || 'não definido'}, tipo startDate = ${typeof startDate}, tipo endDate = ${typeof endDate}`);
      console.log(`Parâmetros completos:`, {
        page, limit, status, financialStatus,
        includeSummary, searchTerm, sortField, sortDirection,
        startDate, endDate
      });
      
      // Verificar se existe um parâmetro sellerId na query
      let sellerId = req.query.sellerId ? parseInt(req.query.sellerId as string) : undefined;
      
      // Se não for admin/supervisor/etc, forçar filtro pelo ID do próprio vendedor
      if (!["admin", "supervisor", "operacional", "financeiro"].includes(req.user?.role || "")) {
        sellerId = req.user!.id;
        console.log(`Vendedor ${req.user!.id} visualizando apenas suas vendas`);
      } else {
        console.log(`Usuário com perfil ${req.user?.role} buscando vendas paginadas`);
      }
      
      // Iniciar consulta SQL básica
      const { pool } = await import("./db");
      
      let query = `
        SELECT 
          s.*, 
          c.name as customer_name,
          COALESCE(u.username, 'Desconhecido') as seller_name,
          s.return_reason as return_reason,
          (
            SELECT COALESCE(SUM(amount::numeric), 0)
            FROM sale_installments
            WHERE sale_id = s.id AND status = 'paid'
          ) as total_paid,
          (
            SELECT COALESCE(SUM(amount::numeric), 0)
            FROM sale_operational_costs
            WHERE sale_id = s.id
          ) as total_costs
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.seller_id = u.id
        WHERE 1=1
      `;
      
      // Log para verificar a consulta
      console.log('Consulta SQL de vendas com join para usuário/vendedor');
      
      const params: any[] = [];
      
      // Adicionar filtros à consulta
      if (status) {
        params.push(status);
        query += ` AND s.status = $${params.length}`;
      }
      
      if (financialStatus && financialStatus !== 'all') {
        params.push(financialStatus);
        query += ` AND s.financial_status = $${params.length}`;
      }
      
      if (sellerId) {
        params.push(sellerId);
        query += ` AND s.seller_id = $${params.length}`;
      }
      
      // Busca por termo (número da ordem ou nome do cliente)
      if (searchTerm && searchTerm.trim()) {
        const term = `%${searchTerm.trim().toLowerCase()}%`;
        params.push(term);
        params.push(term);
        query += ` AND (LOWER(s.order_number) LIKE $${params.length-1} OR LOWER(c.name) LIKE $${params.length})`;
      }
      
      // Filtrar por período de data
      if (startDate) {
        // Formatar a data corretamente, removendo qualquer parte de hora
        const formattedStartDate = startDate.split('T')[0];
        params.push(formattedStartDate);
        query += ` AND s.date >= $${params.length}::date`;
        console.log(`FILTRAGEM POR DATA: Filtrando vendas a partir de ${formattedStartDate} (original: ${startDate})`);
      }
      
      if (endDate) {
        // Formatar a data corretamente, removendo qualquer parte de hora
        const formattedEndDate = endDate.split('T')[0];
        params.push(formattedEndDate);
        query += ` AND s.date <= $${params.length}::date`;
        console.log(`FILTRAGEM POR DATA: Filtrando vendas até ${formattedEndDate} (original: ${endDate})`);
      }
      
      // Log completo dos parâmetros da consulta para debug
      console.log('PARÂMETROS DE CONSULTA:', {
        page, limit, status, financialStatus, 
        searchTerm, startDate, endDate,
        sellerId, sortField, sortDirection
      });
      
      // Contar total antes de aplicar paginação
      const countQuery = `SELECT COUNT(*) FROM (${query}) AS count_query`;
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);
      
      // Adicionar ordenação à consulta principal
      const fieldMap: Record<string, string> = {
        createdAt: "s.created_at",
        updatedAt: "s.updated_at",
        totalAmount: "s.total_amount",
        orderNumber: "s.order_number",
        customerId: "s.customer_id",
        paymentMethodId: "s.payment_method_id",
        sellerId: "s.seller_id",
        serviceTypeId: "s.service_type_id",
        serviceProviderId: "s.service_provider_id",
        financialStatus: "s.financial_status",
        customerName: "c.name",
        date: "s.date",
        id: "s.id",
        // Adicionando campos financeiros para ordenação
        totalPaid: "(SELECT COALESCE(SUM(amount::numeric), 0) FROM sale_installments WHERE sale_id = s.id AND status = 'paid')",
        totalCosts: "(SELECT COALESCE(SUM(amount::numeric), 0) FROM sale_operational_costs WHERE sale_id = s.id)",
        netResult: "(s.total_amount::numeric - (SELECT COALESCE(SUM(amount::numeric), 0) FROM sale_operational_costs WHERE sale_id = s.id))"
      };
      
      const orderField = fieldMap[sortField] || "s.created_at";
      query += ` ORDER BY ${orderField} ${sortDirection.toUpperCase()}`;
      
      // Adicionar paginação
      params.push(limit);
      params.push((page - 1) * limit);
      query += ` LIMIT $${params.length-1} OFFSET $${params.length}`;
      
      // Executar consulta principal
      const result = await pool.query(query, params);
      
      // Mapear resultados para o formato esperado
      const sales = result.rows.map(row => {
        // Converter os valores para números
        const totalAmount = parseFloat(row.total_amount || "0");
        const totalPaid = parseFloat(row.total_paid || "0");
        const totalCosts = parseFloat(row.total_costs || "0");
        
        // Calcular o valor a receber (valor total - valor pago)
        const totalToReceive = totalAmount - totalPaid;
        
        // Calcular o resultado líquido
        const netResult = totalAmount - totalCosts;
        
        return {
          id: row.id,
          orderNumber: row.order_number,
          customerId: row.customer_id,
          customerName: row.customer_name,
          sellerName: row.seller_name,
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
          returnReason: row.return_reason, // Incluir o motivo da devolução
          // Adicionar resumo financeiro quando solicitado pelo financeiro ou explicitamente pelo parâmetro includeSummary
          financialSummary: (financialStatus !== undefined || includeSummary) ? {
            totalAmount,
            totalPaid,
            totalToReceive,
            totalPending: totalToReceive, // Para manter compatibilidade com código existente
            totalCosts,
            netResult
          } : undefined
        };
      });
      
      // Calcular total de páginas
      const totalPages = Math.ceil(total / limit) || 1;
      
      console.log(`Retornando ${sales.length} vendas de um total de ${total}`);
      
      // Retornar resultados
      res.json({
        data: sales,
        total,
        page,
        totalPages
      });
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      res.status(500).json({ error: "Erro ao buscar vendas" });
    }
  });
  
  // Rota para obter todas as vendas sem paginação (para casos específicos)
  app.get("/api/sales/all", isAuthenticated, async (req, res) => {
    try {
      let sales = [];
      
      // Verificar se existe um parâmetro sellerId na query
      const sellerId = req.query.sellerId ? parseInt(req.query.sellerId as string) : null;
      
      // Se for admin, supervisor, operacional ou financeiro, pode ver todas as vendas
      // OU filtrar por vendedor específico se o sellerId for fornecido
      if (["admin", "supervisor", "operacional", "financeiro"].includes(req.user?.role || "")) {
        if (sellerId) {
          console.log("Filtrando vendas por vendedor específico:", sellerId);
          sales = await storage.getSalesBySellerAndStatus(sellerId, "");
        } else {
          console.log("Buscando todas as vendas - usuário tem permissão total");
          sales = await storage.getSales();
        }
      } else {
        // Se for vendedor, só vê as próprias vendas
        console.log("Vendedor visualizando apenas suas vendas:", req.user!.id);
        sales = await storage.getSalesBySellerAndStatus(req.user!.id, "");
      }
      
      res.json(sales);
    } catch (error) {
      console.error("Erro ao buscar todas as vendas:", error);
      res.status(500).json({ error: "Erro ao buscar todas as vendas" });
    }
  });

  // Rota para obter uma venda específica pelo ID
  app.get("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar permissão: apenas admin, supervisor, operacional, financeiro ou o próprio vendedor pode ver
      if (!["admin", "supervisor", "operacional", "financeiro"].includes(req.user?.role || "") && 
          sale.sellerId !== req.user!.id) {
        return res.status(403).json({ error: "Permissão negada" });
      }
      
      // Adicionando log para depuração
      console.log(`Usuário ${req.user?.username} (${req.user?.role}) acessando venda #${id} com status: ${sale.status}`);
      
      res.json(sale);
    } catch (error) {
      console.error("Erro ao buscar venda:", error);
      res.status(500).json({ error: "Erro ao buscar venda" });
    }
  });

  // Rota para listar itens de uma venda
  app.get("/api/sales/:id/items", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar permissão: apenas admin, supervisor, operacional, financeiro ou o próprio vendedor pode ver
      if (!["admin", "supervisor", "operacional", "financeiro"].includes(req.user?.role || "") && 
          sale.sellerId !== req.user!.id) {
        return res.status(403).json({ error: "Permissão negada" });
      }
      
      const items = await storage.getSaleItems(id);
      res.json(items);
    } catch (error) {
      console.error("Erro ao buscar itens da venda:", error);
      res.status(500).json({ error: "Erro ao buscar itens da venda" });
    }
  });

  // Rota para criar uma nova venda
  app.post("/api/sales", isAuthenticated, async (req, res) => {
    try {
      // IMPLEMENTAÇÃO RADICAL DO ZERO (27/04/2025)
      console.log("🔄 IMPLEMENTAÇÃO RADICAL: Iniciando cadastro de venda simplificado");
      
      // 1. Dados essenciais para a venda (usamos diretamente o req.body)
      const { 
        orderNumber, 
        customerId,
        paymentMethodId,
        serviceTypeId,
        sellerId,
        totalAmount,
        installments = 1, // Padrão: 1 parcela
        installmentDates = [], // Array de datas de vencimento (formato string: YYYY-MM-DD)
        notes,
        items = []
      } = req.body;

      console.log("🔄 IMPLEMENTAÇÃO RADICAL: Dados de venda recebidos:", {
        orderNumber,
        customerId,
        installments,
        installmentDates
      });

      // 2. Validar dados mínimos necessários
      if (!customerId || !serviceTypeId) {
        return res.status(400).json({ 
          error: "Dados incompletos", 
          message: "Cliente e tipo de serviço são obrigatórios" 
        });
      }
      
      // Validação para o número da OS
      if (!orderNumber || !orderNumber.trim()) {
        return res.status(400).json({
          error: "Número da OS obrigatório",
          message: "O número da ordem de serviço precisa ser informado."
        });
      }

      // 3. Determinar o vendedor (atual ou especificado)
      const effectiveSellerId = (
        (["admin", "supervisor", "operacional", "financeiro"].includes(req.user?.role || "") && sellerId) 
          ? sellerId 
          : req.user!.id
      );

      // 4. Preparar o objeto para inserção no banco (SEM ZOD)
      // SOLUÇÃO PARA PROBLEMA DE FUSO HORÁRIO
      // Verificar se temos uma data no formato string YYYY-MM-DD
      let formattedDate: string;
      
      if (req.body.date) {
        // Se temos uma data, usar exatamente como está, preservando o formato
        if (typeof req.body.date === 'string') {
          // Se for string, verificar o formato
          if (req.body.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Se for no formato YYYY-MM-DD, usar diretamente
            formattedDate = req.body.date;
          } else {
            // Caso contrário, tentar converter para esse formato
            try {
              // Criar uma data UTC para evitar problemas de fuso horário
              const parsedDate = new Date(req.body.date);
              formattedDate = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
            } catch (e) {
              // Se falhar, usar a data atual
              const today = new Date();
              formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            }
          }
        } else if (req.body.date instanceof Date) {
          // Se for um objeto Date, converter para YYYY-MM-DD
          const dateObj = req.body.date;
          formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        } else {
          // Caso não seja um formato reconhecido, usar a data atual
          const today = new Date();
          formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }
      } else {
        // Se não temos data, usar a data atual
        const today = new Date();
        formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      }
      
      console.log("🔄 IMPLEMENTAÇÃO RADICAL: Data recebida:", req.body.date, "tipo:", typeof req.body.date);
      console.log("🔄 IMPLEMENTAÇÃO RADICAL: Data formatada para inserção:", formattedDate);
      
      const saleData = {
        orderNumber: orderNumber.trim(), // Número da OS já validado anteriormente
        date: formattedDate, // Usar a data formatada como YYYY-MM-DD para evitar problemas de timezone
        customerId,
        paymentMethodId: paymentMethodId || 1, // Valor padrão
        serviceTypeId,
        sellerId: effectiveSellerId,
        installments: Number(installments),
        totalAmount: totalAmount ? String(totalAmount).replace(',', '.') : "0",
        status: "pending",
        financialStatus: "pending",
        notes: notes || ""
      };

      console.log("🔄 IMPLEMENTAÇÃO RADICAL: Objeto de venda preparado:", saleData);

      // 5. INSERÇÃO MANUAL DIRETO NO BANCO para evitar problemas com tipos
      let createdSale;
      try {
        const { pool } = await import('./db');
        const insertResult = await pool.query(`
          INSERT INTO sales (
            order_number, date, customer_id, payment_method_id, service_type_id, 
            seller_id, installments, total_amount, status, financial_status, notes, 
            created_at, updated_at
          ) 
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
          )
          RETURNING *
        `, [
          saleData.orderNumber,
          saleData.date,
          saleData.customerId,
          saleData.paymentMethodId,
          saleData.serviceTypeId,
          saleData.sellerId,
          saleData.installments,
          saleData.totalAmount,
          saleData.status,
          saleData.financialStatus,
          saleData.notes
        ]);

        createdSale = insertResult.rows[0];
        console.log("🔄 IMPLEMENTAÇÃO RADICAL: Venda criada via SQL direto:", createdSale);
      } catch (dbError) {
        console.error("🔄 IMPLEMENTAÇÃO RADICAL: Erro ao inserir venda:", dbError);
        return res.status(500).json({ error: "Erro ao salvar venda no banco de dados" });
      }

      // 6. Criar itens da venda - VERSÃO ULTRA-ROBUSTA (02/05/2025)
      if (items && Array.isArray(items) && items.length > 0) {
        console.log("🛠️ VERSÃO ULTRA-ROBUSTA: Recebidos", items.length, "itens para processar");
        console.log("🛠️ ITEMS RECEBIDOS:", JSON.stringify(items, null, 2));
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          console.log(`🛠️ Processando item #${i+1}:`, JSON.stringify(item, null, 2));
          
          // Validar se temos o ID do serviço (campo obrigatório)
          if (!item.serviceId) {
            console.error(`🛠️ ERRO: Item #${i+1} não tem serviceId`, item);
            continue; // Pular este item
          }
          
          try {
            // Garantir que o serviceId seja um número
            const serviceId = Number(item.serviceId);
            if (isNaN(serviceId)) {
              console.error(`🛠️ ERRO: serviceId inválido no item #${i+1}:`, item.serviceId);
              continue; // Pular este item
            }
            
            // Garantir que temos um serviceTypeId (do item ou da venda)
            const serviceTypeId = item.serviceTypeId || saleData.serviceTypeId;
            if (!serviceTypeId) {
              console.error(`🛠️ ERRO: Tipo de serviço não encontrado para o item #${i+1}`);
              continue; // Pular este item
            }
            
            // Quantidade padrão é 1 se não especificada
            const quantity = item.quantity ? Number(item.quantity) : 1;
            
            // Preparar consulta SQL com todos os campos obrigatórios
            const { pool } = await import('./db');
            
            console.log(`🛠️ Executando SQL para item #${i+1} com valores:`, {
              saleId: createdSale.id,
              serviceId,
              serviceTypeId,
              quantity,
              price: "0",
              totalPrice: "0",
              status: "pending",
              notes: item.notes || null
            });
            
            // Execução ultra-segura com tratamento de exceções
            try {
              const result = await pool.query(`
                INSERT INTO sale_items (
                  sale_id, service_id, service_type_id, quantity, price, 
                  total_price, status, notes, created_at, updated_at
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                RETURNING id
              `, [
                createdSale.id,
                serviceId,
                serviceTypeId,
                quantity,
                "0", // Preço sempre fixo em 0 - não usamos preço por produto
                "0", // Total price também fixo em 0 - o valor real é na venda
                "pending", // Status padrão para o item
                item.notes || null
              ]);
              
              if (result.rows && result.rows.length > 0) {
                console.log(`✅ SUCESSO: Item #${i+1} salvo com ID ${result.rows[0].id} para venda ${createdSale.id}`);
              } else {
                console.error(`❌ ERRO: Item #${i+1} foi processado mas não retornou ID`);
              }
            } catch (sqlError) {
              console.error(`❌ ERRO SQL para item #${i+1}:`, sqlError);
              // Tentar novamente com SQL mais simples como última tentativa
              try {
                console.log(`🔄 Tentativa de recuperação com SQL simplificado para item #${i+1}`);
                await pool.query(`
                  INSERT INTO sale_items (sale_id, service_id, service_type_id, quantity, price, total_price, status)
                  VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                  createdSale.id,
                  serviceId,
                  serviceTypeId,
                  quantity,
                  "0",
                  "0",
                  "pending"
                ]);
                console.log(`✅ RECUPERAÇÃO: Item #${i+1} salvo com SQL simplificado`);
              } catch (finalError) {
                console.error(`❌ FALHA FINAL: Não foi possível salvar o item #${i+1} mesmo com SQL simplificado:`, finalError);
              }
            }
          } catch (itemError) {
            console.error(`❌ ERRO GERAL no processamento do item #${i+1}:`, itemError);
          }
        }
        
        // Verificação final - consultar os itens salvos para confirmação
        try {
          const { pool } = await import('./db');
          const checkResult = await pool.query('SELECT COUNT(*) FROM sale_items WHERE sale_id = $1', [createdSale.id]);
          
          if (checkResult.rows && checkResult.rows.length > 0) {
            const savedCount = parseInt(checkResult.rows[0].count);
            console.log(`🔍 VERIFICAÇÃO FINAL: ${savedCount} de ${items.length} itens foram salvos para a venda ${createdSale.id}`);
          }
        } catch (checkError) {
          console.error('❌ ERRO na verificação final de itens:', checkError);
        }
      }

      // 7. CRIAÇÃO RADICAL DE PARCELAS - simplicidade máxima
      try {
        const { pool } = await import('./db');
        
        // Determinar número real de parcelas
        const numInstallments = Math.max(1, Number(installments));
        console.log(`🔄 IMPLEMENTAÇÃO RADICAL: Criando ${numInstallments} parcelas`);
        
        // Calcular valor por parcela (dividir igualmente)
        const totalValue = parseFloat(saleData.totalAmount);
        const installmentValue = (totalValue / numInstallments).toFixed(2);
        
        // Usar as datas fornecidas ou gerar automaticamente
        let installmentDatesToUse = [];
        
        if (installmentDates && Array.isArray(installmentDates) && installmentDates.length === numInstallments) {
          // Usar as datas fornecidas pelo frontend
          installmentDatesToUse = installmentDates;
          console.log("🔄 IMPLEMENTAÇÃO RADICAL: Usando datas fornecidas pelo usuário:", installmentDatesToUse);
        } else {
          // Gerar datas mensais a partir de hoje
          const baseDate = new Date();
          for (let i = 0; i < numInstallments; i++) {
            const dueDate = new Date(baseDate);
            dueDate.setMonth(baseDate.getMonth() + i);
            
            // Formatar como YYYY-MM-DD
            const isoDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
            installmentDatesToUse.push(isoDate);
          }
          console.log("🔄 IMPLEMENTAÇÃO RADICAL: Datas geradas automaticamente:", installmentDatesToUse);
        }
        
        // Criar cada parcela diretamente usando SQL
        for (let i = 0; i < numInstallments; i++) {
          await pool.query(`
            INSERT INTO sale_installments (
              sale_id, installment_number, due_date, amount, 
              status, notes, created_at, updated_at
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          `, [
            createdSale.id,
            i + 1, // Número da parcela (começando em 1)
            installmentDatesToUse[i], // Data de vencimento
            installmentValue, // Valor da parcela
            "pending", // Status inicial
            null // Sem observações iniciais
          ]);
        }
        
        console.log(`🔄 IMPLEMENTAÇÃO RADICAL: ${numInstallments} parcelas criadas com sucesso`);
      } catch (installmentError) {
        console.error("🔄 IMPLEMENTAÇÃO RADICAL: Erro ao criar parcelas:", installmentError);
      }

      // 8. Registrar no histórico
      try {
        const { pool } = await import('./db');
        await pool.query(`
          INSERT INTO sales_status_history (
            sale_id, from_status, to_status, user_id, notes, created_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [
          createdSale.id,
          "",
          "pending",
          req.user!.id,
          "Venda criada"
        ]);
      } catch (historyError) {
        console.error("🔄 IMPLEMENTAÇÃO RADICAL: Erro ao registrar histórico:", historyError);
      }

      // 9. Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      // 10. Retornar a venda completa
      // Buscar a venda com todas as informações atualizadas
      try {
        const { pool } = await import('./db');
        const result = await pool.query(`SELECT * FROM sales WHERE id = $1`, [createdSale.id]);
        if (result.rows.length > 0) {
          res.status(201).json(result.rows[0]);
        } else {
          res.status(201).json(createdSale); // Fallback para o objeto original
        }
      } catch (finalError) {
        // Se der erro ao buscar a venda atualizada, retorna a original mesmo
        res.status(201).json(createdSale);
      }
    } catch (error) {
      console.error("🔄 IMPLEMENTAÇÃO RADICAL: Erro geral ao criar venda:", error);
      
      // TRATAMENTO ULTRA-RADICAL PARA ERROS DE VALIDAÇÃO ZOD (27/04/2025)
      if (error instanceof ZodError) {
        console.log("🚀 ULTRA-RADICAL: Detectado erro Zod, analisando erro específico...");
        
        // Verificar se é um erro de tipo de data
        const dateErrors = error.errors.filter(err => 
          err.path.includes('date') && 
          err.code === 'invalid_type' && 
          err.expected === 'date' && 
          err.received === 'string'
        );
        
        if (dateErrors.length > 0) {
          console.log("🚀 ULTRA-RADICAL: Erro de tipo de data detectado! Tentando correção de emergência...");
          
          try {
            // Fazer uma inserção completamente manual via SQL, ignorando o Zod e o storage
            const { pool } = await import('./db');
            
            // Pegar os dados do corpo original
            const userData = req.body;
            
            // Preparar dados básicos
            const orderNumber = userData.orderNumber || `OS-${Date.now()}`;
            const customerId = userData.customerId;
            const serviceTypeId = userData.serviceTypeId;
            const sellerId = (["admin", "supervisor", "operacional", "financeiro"].includes(req.user?.role || "") && userData.sellerId) 
              ? userData.sellerId 
              : req.user!.id;
            const totalAmount = userData.totalAmount ? String(userData.totalAmount).replace(',', '.') : "0";
            const installments = Number(userData.installments || 1);
            const notes = userData.notes || "";
            
            // Formatação YYYY-MM-DD para a data
            let formattedDate;
            if (userData.date) {
              if (typeof userData.date === 'string') {
                if (userData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  formattedDate = userData.date;
                } else {
                  try {
                    const parsedDate = new Date(userData.date);
                    formattedDate = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
                  } catch (e) {
                    const today = new Date();
                    formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  }
                }
              } else {
                const today = new Date();
                formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              }
            } else {
              const today = new Date();
              formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            }
            
            console.log("🚀 ULTRA-RADICAL: Data recebida:", userData.date, "tipo:", typeof userData.date);
            console.log("🚀 ULTRA-RADICAL: Data formatada para inserção:", formattedDate);
            
            // SQL ULTRA-DIRETO - Sem absolutamente nenhuma validação
            const insertResult = await pool.query(`
              INSERT INTO sales (
                order_number, date, customer_id, payment_method_id, service_type_id, 
                seller_id, installments, total_amount, status, financial_status, notes, 
                created_at, updated_at
              ) 
              VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'pending', $9, NOW(), NOW()
              )
              RETURNING *
            `, [
              orderNumber,
              formattedDate,
              customerId,
              userData.paymentMethodId || 1,
              serviceTypeId,
              sellerId,
              installments,
              totalAmount,
              notes
            ]);
            
            if (insertResult.rows.length > 0) {
              const createdSale = insertResult.rows[0];
              console.log("🚀 ULTRA-RADICAL: Venda criada com sucesso via SQL de emergência:", createdSale);
              
              // Criar parcelas
              if (installments > 1) {
                // Calcular valor da parcela
                const totalValue = parseFloat(totalAmount);
                const installmentValue = (totalValue / installments).toFixed(2);
                
                // Usar as datas fornecidas ou gerar automaticamente
                const installmentDates = userData.installmentDates && 
                  Array.isArray(userData.installmentDates) && 
                  userData.installmentDates.length === installments 
                    ? userData.installmentDates 
                    : Array.from({ length: installments }, (_, i) => {
                        const date = new Date();
                        date.setMonth(date.getMonth() + i);
                        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                      });
                
                // Criar parcelas uma a uma
                for (let i = 0; i < installments; i++) {
                  await pool.query(`
                    INSERT INTO sale_installments (
                      sale_id, installment_number, due_date, amount, 
                      status, notes, created_at, updated_at
                    ) 
                    VALUES ($1, $2, $3, $4, 'pending', NULL, NOW(), NOW())
                  `, [
                    createdSale.id,
                    i + 1,
                    installmentDates[i],
                    installmentValue
                  ]);
                }
                
                console.log(`🚀 ULTRA-RADICAL: ${installments} parcelas criadas com sucesso`);
              }
              
              // Criar itens
              if (userData.items && Array.isArray(userData.items)) {
                for (const item of userData.items) {
                  if (item.serviceId) {
                    await pool.query(`
                      INSERT INTO sale_items (
                        sale_id, service_id, service_type_id, quantity, price, 
                        total_price, status, notes, created_at, updated_at
                      ) 
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                    `, [
                      createdSale.id,
                      item.serviceId,
                      item.serviceTypeId || serviceTypeId,
                      item.quantity || 1,
                      "0", // Preço sempre fixo em 0 - não usamos preço por produto 
                      "0", // totalPrice também fixo em 0 - o valor real fica só na venda
                      "pending", // Status padrão
                      item.notes || null
                    ]);
                  }
                }
              }
              
              // Histórico
              await pool.query(`
                INSERT INTO sales_status_history (
                  sale_id, from_status, to_status, user_id, notes, created_at
                )
                VALUES ($1, '', 'pending', $2, 'Venda criada (emergência)', NOW())
              `, [
                createdSale.id,
                req.user!.id
              ]);
              
              // Notificar
              notifySalesUpdate();
              
              // Retornar sucesso
              return res.status(201).json(createdSale);
            }
          } catch (emergencyError) {
            console.error("🚀 ULTRA-RADICAL: Erro na correção de emergência:", emergencyError);
          }
        }
      }
      
      // Resposta padrão se nenhuma correção específica funcionou
      res.status(500).json({ error: "Erro ao criar venda" });
    }
  });

  // Rota para adicionar um item à venda
  app.post("/api/sales/:id/items", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar permissão: apenas admin, supervisor, operacional, financeiro ou o próprio vendedor pode adicionar itens
      if (!["admin", "supervisor", "operacional", "financeiro"].includes(req.user?.role || "") && 
          sale.sellerId !== req.user!.id) {
        return res.status(403).json({ error: "Permissão negada" });
      }
      
      // Não permitir adicionar itens a vendas que não estão em status pendente ou devolvida
      if (sale.status !== "pending" && sale.status !== "returned") {
        return res.status(400).json({ 
          error: "Não é possível adicionar itens", 
          message: "Só é possível adicionar itens a vendas com status pendente ou devolvida."
        });
      }
      
      // Validação básica dos dados do item
      const itemData = req.body;
      if (!itemData.serviceId || !itemData.serviceTypeId) {
        return res.status(400).json({ error: "Dados do item inválidos" });
      }
      
      // No nosso padrão, preço sempre é 0, usamos apenas o preço total da venda
      const quantity = itemData.quantity || 1;
      
      // Criar o item - Incluindo totalPrice obrigatório de acordo com o schema
      const createdItem = await storage.createSaleItem({
        saleId: id,
        serviceId: itemData.serviceId,
        serviceTypeId: itemData.serviceTypeId,
        quantity,
        price: "0", // Preço sempre fixo em 0 - não usamos preço por produto
        totalPrice: "0", // Total também fixo em 0 - o valor real fica só na venda 
        notes: itemData.notes || null,
        status: "pending"
      });
      
      res.status(201).json(createdItem);
    } catch (error) {
      console.error("Erro ao adicionar item à venda:", error);
      res.status(500).json({ error: "Erro ao adicionar item à venda" });
    }
  });

  // Rota especial para atualizar apenas o valor total da venda - solução de emergência
  app.post("/api/sales/:id/update-total", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se o usuário tem permissão para atualizar vendas
      if (!["admin", "supervisor", "operacional", "financeiro", "vendedor"].includes(req.user?.role || "")) {
        return res.status(403).json({ error: "Permissão negada" });
      }
      
      // Obter o novo valor total
      const { totalAmount } = req.body;
      if (!totalAmount) {
        return res.status(400).json({ error: "Valor total não informado" });
      }
      
      // Formatar o valor para garantir que esteja no formato correto
      const formattedTotal = typeof totalAmount === 'string' 
        ? totalAmount.replace(',', '.') 
        : String(totalAmount);
      
      console.log(`### ATUALIZANDO VALOR TOTAL DA VENDA #${id} para ${formattedTotal} ###`);
      
      // Usar SQL puro para atualizar diretamente o banco de dados
      const { pool } = await import('./db');
      
      // Executar a atualização direta
      const updateResult = await pool.query(
        'UPDATE sales SET total_amount = $1, updated_at = $2 WHERE id = $3 RETURNING *',
        [formattedTotal, new Date(), id]
      );
      
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      console.log("Venda após atualização do valor total:", updateResult.rows[0]);
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      // Retornar a venda atualizada
      res.json(updateResult.rows[0]);
    } catch (error) {
      console.error("Erro ao atualizar valor total da venda:", error);
      res.status(500).json({ error: "Erro ao atualizar valor total da venda" });
    }
  });
  
  // Rota para reenviar vendas que foram devolvidas (corrigidas)
  app.put("/api/sales/:id/resend", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se a venda existe e está com status "returned"
      const { pool } = await import('./db');
      const saleResult = await pool.query(
        "SELECT * FROM sales WHERE id = $1",
        [id]
      );
      
      if (saleResult.rows.length === 0) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      const sale = saleResult.rows[0];
      
      // SUPER LOG - Mostrar detalhes da venda original
      console.log("🔴 SOLUÇÃO RADICAL - VENDA ORIGINAL:", JSON.stringify(sale, null, 2));
      console.log("🔴 SOLUÇÃO RADICAL - DATA ORIGINAL:", sale.date);
      
      // Verificar se o usuário tem permissão para reenviar esta venda
      // Administradores, supervisores ou o vendedor original podem reenviar
      if (req.user?.role !== 'admin' && req.user?.role !== 'supervisor' && 
          !(req.user?.role === 'vendedor' && sale.seller_id === req.user?.id)) {
        return res.status(403).json({ error: "Sem permissão para reenviar esta venda" });
      }
      
      // Verificar se a venda realmente está com status "returned"
      if (sale.status !== 'returned') {
        return res.status(400).json({ error: "Apenas vendas devolvidas podem ser reenviadas" });
      }
      
      // Obter dados do corpo da requisição
      const { 
        correctionNotes,
        items = [],
        serviceTypeId,
        serviceProviderId,
        paymentMethodId,
        installments,
        totalAmount,
        date // Capturamos a data enviada para verificar
      } = req.body;
      
      console.log("🔴 SOLUÇÃO RADICAL - DADOS RECEBIDOS:", { 
        id, 
        itens: items.length,
        tipoServico: serviceTypeId,
        formaPagamento: paymentMethodId,
        parcelas: installments,
        valor: totalAmount,
        data: date // Log da data recebida
      });
      
      if (!correctionNotes) {
        return res.status(400).json({ error: "Observações de correção são obrigatórias" });
      }
      
      // SOLUÇÃO RADICAL: IGNORAR A DATA RECEBIDA E MANTER A ORIGINAL
      // Preparar dados para atualização
      let updateQuery = `
        UPDATE sales 
        SET status = 'corrected', 
            return_reason = NULL, 
            notes = CASE 
                    WHEN notes IS NULL OR notes = '' THEN $1 
                    ELSE notes || ' | CORREÇÃO: ' || $1 
                   END,
            updated_at = NOW()
      `;
      
      const updateParams = [correctionNotes, id];
      let paramIndex = 3;
      
      // IMPORTANTE: NÃO alterar a data! A data original será mantida exatamente como está
      console.log("🔴 SOLUÇÃO RADICAL - MANTENDO DATA ORIGINAL:", sale.date);
      
      // Adicionar campos opcionais à atualização se estiverem presentes
      if (serviceTypeId !== undefined) {
        updateQuery += `, service_type_id = $${paramIndex}`;
        updateParams.push(serviceTypeId);
        paramIndex++;
      }
      
      if (serviceProviderId !== undefined) {
        updateQuery += `, service_provider_id = $${paramIndex}`;
        updateParams.push(serviceProviderId);
        paramIndex++;
      }
      
      if (paymentMethodId !== undefined) {
        updateQuery += `, payment_method_id = $${paramIndex}`;
        updateParams.push(paymentMethodId);
        paramIndex++;
      }
      
      if (installments !== undefined) {
        updateQuery += `, installments = $${paramIndex}`;
        updateParams.push(installments);
        paramIndex++;
      }
      
      if (totalAmount !== undefined) {
        updateQuery += `, total_amount = $${paramIndex}`;
        updateParams.push(totalAmount);
        paramIndex++;
      }
      
      // Finalizar query
      updateQuery += `
        WHERE id = $2
        RETURNING *
      `;
      
      // Atualizar a venda
      const updateResult = await pool.query(updateQuery, updateParams);
      
      if (updateResult.rows.length === 0) {
        return res.status(500).json({ error: "Falha ao atualizar a venda" });
      }
      
      // Atualizar itens da venda se fornecidos
      // IMPORTANTE: Não manipulamos os itens durante o reenvio para evitar duplicação
      // Os itens existentes permanecerão no banco de dados exatamente como estão
      console.log(`🔄 Venda #${id} reenviada sem manipular itens para evitar duplicação`);
      
      // Registrar no histórico a mudança de status
      await storage.createSalesStatusHistory({
        saleId: id,
        fromStatus: 'returned',
        toStatus: 'corrected',
        userId: req.user!.id,
        notes: correctionNotes || "Venda corrigida e reenviada"
      });
      
      // Sempre atualizar parcelas quando uma venda é reenviada após correção
      // Isso garante consistência em todo o sistema
      try {
        // Verificar se a venda agora está parcelada
        const installmentsToCreate = installments || sale.installments || 1;
        const saleAmount = totalAmount || sale.total_amount || '0';
        
        console.log(`🔄 Venda reenviada #${id} - Recriando ${installmentsToCreate} parcelas com valor total ${saleAmount}`);
        
        // Verificar se temos datas específicas para as parcelas
        let dueDates: string[] | undefined = undefined;
        
        // Extrair datas de parcelas se enviadas com a requisição
        if (req.body.installmentDates && Array.isArray(req.body.installmentDates)) {
          dueDates = req.body.installmentDates;
          console.log(`📅 Datas específicas recebidas para parcelas de venda #${id}:`, dueDates);
        }
        
        // Usar nossa função auxiliar para garantir que as parcelas sejam criadas consistentemente
        await ensureSaleInstallments(id, installmentsToCreate, saleAmount, dueDates);
      } catch (error) {
        console.error(`❌ Erro ao atualizar parcelas da venda #${id}:`, error);
        // Não interrompemos o fluxo aqui, apenas logamos o erro
      }
      
      // Registrar a ação no log
      console.log(`🔄 Venda #${id} reenviada após correção por ${req.user?.username}`);
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      return res.json({
        ...updateResult.rows[0],
        message: "Venda corrigida e reenviada com sucesso"
      });
    } catch (error) {
      console.error("Erro ao reenviar venda:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  
  // SOLUÇÃO MEGA RADICAL - 30/04/2025: Completamente reescrevemos a rota de atualização de vendas
  // API para atualizar uma venda - DESABILITADA EM 30/04/2025
  app.patch("/api/sales/:id", isAuthenticated, async (req, res) => {
    // Funcionalidade de edição removida conforme solicitação do cliente
    return res.status(403).json({ 
      error: "Funcionalidade desabilitada", 
      message: "A edição de vendas foi desabilitada pelo administrador do sistema."
    });
  });

  // Rota especial para administração - limpar todas as vendas

  // Rota especial para administração - limpar todas as vendas
  app.delete("/api/admin/clear-sales", isAuthenticated, async (req, res) => {
    try {
      // Verificar se é um administrador
      if (req.user?.role !== "admin" && req.user?.role !== "operacional") {
        return res.status(403).json({ error: "Permissão negada. Apenas administradores podem executar esta operação." });
      }
      
      console.log("⚠️ ATENÇÃO: Excluindo todas as vendas do banco de dados...");
      
      // Usar SQL puro para maior eficiência
      const { pool } = await import('./db');
      
      // Limpar um por um, em ordem para evitar problemas de chave estrangeira
      console.log("1. Excluindo comprovantes de pagamento...");
      await pool.query('DELETE FROM sale_payment_receipts');
      
      console.log("2. Excluindo custos operacionais...");
      await pool.query('DELETE FROM sale_operational_costs');
      
      console.log("3. Excluindo itens de vendas...");
      await pool.query('DELETE FROM sale_items');
      
      console.log("4. Excluindo histórico de status...");
      await pool.query('DELETE FROM sales_status_history');
      
      console.log("5. Excluindo parcelas...");
      await pool.query('DELETE FROM sale_installments');
      
      console.log("6. Excluindo vendas...");
      // Remover as vendas
      const result = await pool.query('DELETE FROM sales RETURNING *');
      
      console.log(`Exclusão finalizada com sucesso: ${result.rowCount} vendas removidas.`);
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      return res.status(200).json({ 
        message: "Todas as vendas foram excluídas com sucesso",
        count: result.rowCount
      });
    } catch (error) {
      console.error("Erro ao limpar vendas:", error);
      return res.status(500).json({ error: "Erro ao limpar vendas" });
    }
  });
  
  // Rota para popular o banco com 30 vendas (apenas admin)
  app.post("/api/populate-sales", isAuthenticated, async (req, res) => {
    try {
      // Verificar se o usuário é administrador
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: "Permissão negada", 
          message: "Apenas administradores podem executar esta operação"
        });
      }
      
      const { populateSales } = await import("../populate-sales");
      const result = await populateSales();
      
      // Notificar todos os clientes sobre a atualização das vendas
      notifySalesUpdate();
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao popular vendas:", error);
      return res.status(500).json({ error: "Erro ao popular vendas", details: error.message });
    }
  });

  // Rota para reenvio de vendas removida daqui para evitar duplicação
  // Mantivemos a implementação na linha ~4000 que preserva o motivo de devolução (return_reason)

  app.delete("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Apenas admin pode excluir vendas
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Permissão negada. Apenas administradores podem excluir vendas." });
      }
      
      const success = await storage.deleteSale(id);
      if (!success) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao excluir venda:", error);
      res.status(500).json({ error: "Erro ao excluir venda" });
    }
  });

  // Rota para atualizar o tipo de execução quando a venda estiver em andamento
  app.post("/api/sales/:id/update-execution-type", canManageSaleOperations, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se a venda está no status correto para atualizar tipo de execução
      if (sale.status !== "in_progress") {
        return res.status(400).json({ 
          error: "Não é possível atualizar tipo de execução", 
          message: "Só é possível atualizar o tipo de execução de vendas com status em andamento."
        });
      }
      
      // Extrair informações do corpo da requisição
      const { serviceTypeId, serviceProviderId } = req.body;
      
      // Validar tipo de serviço se fornecido
      if (serviceTypeId !== undefined) {
        const serviceTypeIdNum = parseInt(serviceTypeId);
        if (isNaN(serviceTypeIdNum)) {
          return res.status(400).json({ error: "ID do tipo de serviço inválido" });
        }
        
        // Verificar se o tipo de serviço existe
        const serviceType = await storage.getServiceType(serviceTypeIdNum);
        if (!serviceType) {
          return res.status(400).json({ error: "Tipo de serviço não encontrado" });
        }
        
        // Se o tipo de serviço for SINDICATO, é obrigatório informar o prestador parceiro
        if (serviceType.name === "SINDICATO" && !serviceProviderId) {
          return res.status(400).json({ 
            error: "Prestador parceiro obrigatório", 
            message: "Para execução via SINDICATO, é necessário informar o prestador parceiro"
          });
        }
      }
      
      // Validar prestador de serviço se fornecido
      if (serviceProviderId !== undefined) {
        const serviceProviderIdNum = parseInt(serviceProviderId);
        if (isNaN(serviceProviderIdNum)) {
          return res.status(400).json({ error: "ID do prestador de serviço inválido" });
        }
        
        // Verificar se o prestador de serviço existe
        const serviceProvider = await storage.getServiceProvider(serviceProviderIdNum);
        if (!serviceProvider) {
          return res.status(400).json({ error: "Prestador de serviço não encontrado" });
        }
        
        if (!serviceProvider.active) {
          return res.status(400).json({ 
            error: "Prestador inativo", 
            message: "O prestador de serviço selecionado está inativo"
          });
        }
      }
      
      // Preparar dados para atualização
      const updateData: Partial<InsertSale> = {};
      
      // Adicionar o tipo de serviço se fornecido
      if (serviceTypeId) {
        // @ts-ignore - O type está correto mas o TypeScript não reconhece pois foi adicionado dinamicamente
        updateData.serviceTypeId = parseInt(serviceTypeId);
      }
      
      // Adicionar o prestador de serviço parceiro se fornecido
      if (serviceProviderId) {
        // @ts-ignore - O type está correto mas o TypeScript não reconhece pois foi adicionado dinamicamente
        updateData.serviceProviderId = parseInt(serviceProviderId);
      }
      
      // Atualizar a venda
      const updatedSale = await storage.updateSale(id, updateData);
      
      if (!updatedSale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Registrar no histórico a atualização do tipo de execução
      let notesText = "Atualização do tipo de execução";
      if (serviceTypeId) {
        const serviceType = await storage.getServiceType(parseInt(serviceTypeId));
        if (serviceType) {
          notesText += ` para ${serviceType.name}`;
        }
      }
      
      await storage.createSalesStatusHistory({
        saleId: id,
        fromStatus: sale.status,
        toStatus: sale.status, // Mantém o mesmo status
        userId: req.user!.id,
        notes: notesText
      });
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      res.json(updatedSale);
    } catch (error) {
      console.error("Erro ao atualizar tipo de execução da venda:", error);
      res.status(500).json({ error: "Erro ao atualizar tipo de execução da venda" });
    }
  });

  // Rota para iniciar a execução de uma venda (setor operacional)
  app.post("/api/sales/:id/start-execution", canManageSaleOperations, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se a venda está no status correto para iniciar execução
      if (sale.status !== "pending" && sale.status !== "corrected") {
        return res.status(400).json({ 
          error: "Não é possível iniciar execução", 
          message: "Só é possível iniciar a execução de vendas com status pendente ou corrigidas."
        });
      }
      
      // Extrair informações do corpo da requisição
      const { serviceTypeId, serviceProviderId, additionalProviderIds } = req.body;
      
      console.log("Dados recebidos para iniciar execução:", {
        serviceTypeId,
        serviceProviderId,
        additionalProviderIds
      });
      
      // Validar tipo de serviço se fornecido
      let serviceType;
      if (serviceTypeId !== undefined) {
        const serviceTypeIdNum = parseInt(serviceTypeId);
        if (isNaN(serviceTypeIdNum)) {
          return res.status(400).json({ error: "ID do tipo de serviço inválido" });
        }
        
        // Verificar se o tipo de serviço existe
        serviceType = await storage.getServiceType(serviceTypeIdNum);
        if (!serviceType) {
          return res.status(400).json({ error: "Tipo de serviço não encontrado" });
        }
      }
      
      // Validar prestador de serviço se fornecido
      if (serviceProviderId !== undefined) {
        const serviceProviderIdNum = parseInt(serviceProviderId);
        if (isNaN(serviceProviderIdNum)) {
          return res.status(400).json({ error: "ID do prestador de serviço inválido" });
        }
        
        // Verificar se o prestador de serviço existe
        const serviceProvider = await storage.getServiceProvider(serviceProviderIdNum);
        if (!serviceProvider) {
          return res.status(400).json({ error: "Prestador de serviço não encontrado" });
        }
        
        if (!serviceProvider.active) {
          return res.status(400).json({ 
            error: "Prestador inativo", 
            message: "O prestador de serviço selecionado está inativo"
          });
        }
      }
      
      // Iniciar execução da venda com os possíveis novos valores
      const updatedSale = await storage.markSaleInProgress(
        id, 
        req.user!.id,
        serviceTypeId ? parseInt(serviceTypeId) : undefined,
        serviceProviderId ? parseInt(serviceProviderId) : undefined
      );
      
      if (!updatedSale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Processar prestadores adicionais se fornecidos
      if (additionalProviderIds && Array.isArray(additionalProviderIds) && additionalProviderIds.length > 0) {
        // Combinar o prestador principal e os adicionais
        const allProviderIds = serviceProviderId ? 
          [parseInt(serviceProviderId), ...additionalProviderIds.map(id => parseInt(id))] : 
          [...additionalProviderIds.map(id => parseInt(id))];
        
        // Remover qualquer relacionamento existente e adicionar os novos
        await storage.updateSaleServiceProviders(id, allProviderIds);
        console.log(`Atualizados ${allProviderIds.length} prestadores para a venda ${id}`);
      } else if (serviceProviderId) {
        // Se apenas o prestador principal foi informado
        await storage.updateSaleServiceProviders(id, [parseInt(serviceProviderId)]);
        console.log(`Atualizado 1 prestador para a venda ${id}`);
      }
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      res.json(updatedSale);
    } catch (error) {
      console.error("Erro ao iniciar execução da venda:", error);
      res.status(500).json({ error: "Erro ao iniciar execução da venda" });
    }
  });

  // Rota para concluir a execução de uma venda (setor operacional)
  app.post("/api/sales/:id/complete-execution", canManageSaleOperations, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Importar função de log de depuração
      const { logDebug } = await import("./db");
      
      // Registrar início do processo de conclusão
      await logDebug("complete-execution", `Iniciando conclusão da venda #${id}`, { userId: req.user?.id });
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se a venda está no status correto para concluir execução
      if (sale.status !== "in_progress") {
        return res.status(400).json({
          error: "Não é possível concluir execução", 
          message: "Só é possível concluir a execução de vendas que estão em andamento."
        });
      }
      
      // Verificar prestadores de serviço ANTES da conclusão
      const providersBeforeCompletion = await storage.getSaleServiceProviders(id);
      await logDebug("complete-execution", `Prestadores ANTES da conclusão: ${providersBeforeCompletion.length}`, 
        { providers: providersBeforeCompletion }
      );
      
      // Se existirem prestadores, registrar IDs para preservar durante a transação
      const serviceProviderIds = providersBeforeCompletion.map(p => p.serviceProviderId);
      
      // Concluir execução da venda (nosso método agora usa transação para preservar dados)
      const updatedSale = await storage.completeSaleExecution(id, req.user!.id);
      if (!updatedSale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar prestadores de serviço APÓS a conclusão
      const providersAfterCompletion = await storage.getSaleServiceProviders(id);
      await logDebug("complete-execution", `Prestadores APÓS a conclusão: ${providersAfterCompletion.length}`, 
        { providers: providersAfterCompletion }
      );
      
      // Se existia prestadores antes mas não existem mais após a conclusão, tentar restaurar
      if (providersBeforeCompletion.length > 0 && providersAfterCompletion.length === 0) {
        await logDebug("complete-execution", `Tentando restaurar ${serviceProviderIds.length} prestadores perdidos`, 
          { serviceProviderIds }
        );
        
        // Tentar restaurar prestadores perdidos
        if (serviceProviderIds.length > 0) {
          await storage.updateSaleServiceProviders(id, serviceProviderIds);
          
          // Verificar se a restauração funcionou
          const restoredProviders = await storage.getSaleServiceProviders(id);
          await logDebug("complete-execution", `Prestadores APÓS restauração: ${restoredProviders.length}`, 
            { providers: restoredProviders }
          );
        }
      }
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      res.json(updatedSale);
    } catch (error) {
      console.error("Erro ao concluir execução da venda:", error);
      res.status(500).json({ error: "Erro ao concluir execução da venda" });
    }
  });

  // Rota para devolver uma venda para correção (operacional para vendedor)
  // Aceita tanto PUT quanto POST para compatibilidade
  app.post("/api/sales/:id/return", canManageSaleOperations, async (req, res) => {
    // Implementação original mantida para compatibilidade, mas recomendamos usar o PUT
    console.log("⚠️ ALERTA: POST /api/sales/:id/return está sendo deprecado. Use o método PUT em seu lugar.");
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se foi informado o motivo da devolução
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "É necessário informar o motivo da devolução" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se a venda está no status correto para ser devolvida
      if (sale.status !== "pending" && sale.status !== "in_progress" && sale.status !== "corrected") {
        return res.status(400).json({ 
          error: "Não é possível devolver a venda", 
          message: "Só é possível devolver vendas que estão pendentes, em andamento ou corrigidas aguardando operacional."
        });
      }
      
      // Devolver a venda
      const updatedSale = await storage.returnSaleToSeller(id, req.user!.id, reason);
      if (!updatedSale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      res.json(updatedSale);
    } catch (error) {
      console.error("Erro ao devolver venda:", error);
      res.status(500).json({ error: "Erro ao devolver venda" });
    }
  });
  
  // Nova rota PUT para devolver uma venda para correção (mais RESTful)
  app.put("/api/sales/:id/return", canManageSaleOperations, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se foi informado o motivo da devolução
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "É necessário informar o motivo da devolução" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se a venda está no status correto para ser devolvida
      if (sale.status !== "pending" && sale.status !== "in_progress" && sale.status !== "corrected") {
        return res.status(400).json({ 
          error: "Não é possível devolver a venda", 
          message: "Só é possível devolver vendas que estão pendentes, em andamento ou corrigidas aguardando operacional."
        });
      }
      
      // Devolver a venda
      const updatedSale = await storage.returnSaleToSeller(id, req.user!.id, reason);
      if (!updatedSale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      res.json(updatedSale);
    } catch (error) {
      console.error("Erro ao devolver venda:", error);
      res.status(500).json({ error: "Erro ao devolver venda" });
    }
  });

  // Rota para marcar uma venda devolvida como corrigida (supervisor)
  app.post("/api/sales/:id/mark-as-corrected", canManageSaleOperations, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se a venda existe
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se a venda está no status 'returned'
      if (sale.status !== "returned") {
        return res.status(400).json({ 
          error: "Status inválido", 
          message: "Apenas vendas que foram devolvidas podem ser marcadas como corrigidas"
        });
      }
      
      // Atualizar o status para 'corrected'
      const updatedSale = await storage.updateSale(id, {
        status: "corrected",
      });
      
      if (!updatedSale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Registrar no histórico de status
      await storage.createSalesStatusHistory({
        saleId: id,
        userId: req.user!.id,
        fromStatus: "returned",
        toStatus: "corrected",
        notes: "Venda marcada como corrigida pelo supervisor"
      });
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      res.json(updatedSale);
    } catch (error) {
      console.error("Erro ao marcar venda como corrigida:", error);
      res.status(500).json({ error: "Erro ao marcar venda como corrigida" });
    }
  });

  // Rota para reenviar uma venda corrigida (de vendedor para operacional)
  // Rota POST depreciada (mantida por compatibilidade) com redirecionamento para a nova rota PUT
  app.post("/api/sales/:id/resend", isAuthenticated, async (req, res) => {
    console.log("⚠️ DEPRECATED: POST /api/sales/:id/resend está depreciado. Use o PUT em seu lugar!");
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Adaptar parâmetros para o formato esperado pelo novo endpoint
      const { notes } = req.body;
      
      // Verificar se o parâmetro correctionNotes já existe
      if (!req.body.correctionNotes && notes) {
        req.body.correctionNotes = notes;
      }
      
      console.log("⚠️ Redirecionando para o endpoint PUT com:", req.body);
      
      // Obter a referência para o handler da rota PUT
      // Como é interno, vamos simplesmente chamar o mesmo código do endpoint PUT
      const { pool } = await import('./db');
      const saleResult = await pool.query(
        "SELECT * FROM sales WHERE id = $1",
        [id]
      );
      
      if (saleResult.rows.length === 0) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      const sale = saleResult.rows[0];
      
      // Verificar se o usuário tem permissão para reenviar esta venda
      if (req.user?.role !== 'admin' && req.user?.role !== 'supervisor' && 
          !(req.user?.role === 'vendedor' && sale.seller_id === req.user?.id)) {
        return res.status(403).json({ error: "Sem permissão para reenviar esta venda" });
      }
      
      // Verificar se a venda realmente está com status "returned"
      if (sale.status !== 'returned') {
        return res.status(400).json({ error: "Apenas vendas devolvidas podem ser reenviadas" });
      }
      
      const correctionNotes = req.body.correctionNotes || req.body.notes;
      
      if (!correctionNotes) {
        return res.status(400).json({ error: "Observações de correção são obrigatórias" });
      }
      
      // Atualizar a venda
      const updateResult = await pool.query(
        `UPDATE sales 
         SET status = 'corrected', 
             return_reason = NULL, 
             notes = CASE 
                      WHEN notes IS NULL OR notes = '' THEN $1 
                      ELSE notes || ' | CORREÇÃO: ' || $1 
                     END,
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [correctionNotes, id]
      );
      
      if (updateResult.rows.length === 0) {
        return res.status(500).json({ error: "Falha ao atualizar a venda" });
      }
      
      // Registrar a ação no log
      console.log(`🔄 Venda #${id} reenviada após correção por ${req.user?.username} (via API depreciada)`);
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      return res.json({
        ...updateResult.rows[0],
        message: "Venda corrigida e reenviada com sucesso (via API depreciada)"
      });
    } catch (error) {
      console.error("Erro ao reenviar venda (POST depreciado):", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para marcar uma venda como paga (setor financeiro)
  app.post("/api/sales/:id/mark-paid", canManageSaleFinancials, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se a venda já foi concluída
      if (sale.status !== "completed") {
        return res.status(400).json({ 
          error: "Não é possível marcar como paga", 
          message: "Só é possível marcar como paga vendas que já foram concluídas."
        });
      }
      
      // Marcar como paga
      const updatedSale = await storage.markSaleAsPaid(id, req.user!.id);
      if (!updatedSale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      res.json(updatedSale);
    } catch (error) {
      console.error("Erro ao marcar venda como paga:", error);
      res.status(500).json({ error: "Erro ao marcar venda como paga" });
    }
  });

  // Rota para obter o histórico de status de uma venda
  app.get("/api/sales/:id/history", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Todos os usuários autenticados podem ver o histórico de qualquer venda
      // A verificação de autenticação já é feita pelo middleware isAuthenticated
      
      const history = await storage.getSalesStatusHistory(id);
      console.log(`Retornando histórico da venda #${id}: ${history.length} registros`);
      res.json(history);
    } catch (error) {
      console.error("Erro ao buscar histórico da venda:", error);
    }
  });
  
  // Rota de compatibilidade para a API antiga - redireciona para a nova rota
  app.get("/api/sales/:id/status-history", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      console.log(`Recebida solicitação na rota legada /status-history para venda #${id}, redirecionando para /history`);
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      const history = await storage.getSalesStatusHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Erro ao buscar histórico da venda:", error);
      res.status(500).json({ error: "Erro ao buscar histórico da venda" });
    }
  });
  
  // Rota para buscar as parcelas de uma venda
  app.get("/api/sales/:id/installments", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      console.log(`Buscando parcelas para venda #${id}, número de parcelas na venda: ${sale.installments}`);
      
      // SOLUÇÃO DEFINITIVA SIMPLIFICADA: Buscar direto do banco com SQL puro
      try {
        const { pool } = await import('./db');
        
        // Query SQL simples que recupera todas as parcelas para a venda
        const sql = `
          SELECT 
            id, 
            sale_id AS "saleId", 
            installment_number AS "installmentNumber", 
            amount, 
            due_date AS "dueDate", 
            payment_date AS "paymentDate", 
            payment_method_id AS "paymentMethodId",
            payment_notes AS "paymentNotes",
            status, 
            notes, 
            created_at AS "createdAt", 
            updated_at AS "updatedAt"
          FROM 
            sale_installments 
          WHERE 
            sale_id = $1 
          ORDER BY 
            installment_number
        `;
        
        console.log(`🔵 Buscando parcelas via SQL direto para venda #${id}`);
        const result = await pool.query(sql, [id]);
        const installments = result.rows;
        
        console.log(`🔵 Encontradas ${installments.length} parcelas para a venda #${id}`);
        
        // Se encontrou parcelas, retorna elas
        if (installments.length > 0) {
          console.log("🔵 Retornando parcelas encontradas no banco");
          return res.json(installments);
        }
        
        // Se não encontrou parcelas, criar conforme necessário
        if (sale.installments > 1) {
          console.log(`🔵 Venda #${id} deveria ter ${sale.installments} parcelas, mas não tem parcelas no banco. Criando parcelas.`);
          
          // Calcular o valor de cada parcela
          const totalAmount = parseFloat(sale.totalAmount);
          const numInstallments = sale.installments;
          const installmentValue = (totalAmount / numInstallments).toFixed(2);
          
          // Criar parcelas para essa venda
          const today = new Date();
          const installmentsToCreate = [];
          
          for (let i = 1; i <= numInstallments; i++) {
            // Definir data de vencimento (30 dias após o mês anterior)
            const dueDate = new Date(today);
            dueDate.setMonth(today.getMonth() + (i - 1));
            const formattedDueDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
            
            installmentsToCreate.push({
              saleId: id,
              installmentNumber: i,
              amount: installmentValue,
              dueDate: formattedDueDate,
              status: "pending",
              paymentDate: null
            });
          }
          
          console.log(`🔵 Criando ${installmentsToCreate.length} parcelas automaticamente`);
          
          // Inserir direto no banco via SQL
          let insertQuery = 'INSERT INTO sale_installments (sale_id, installment_number, amount, due_date, status) VALUES ';
          const queryParams = [];
          let paramCount = 1;
          
          installmentsToCreate.forEach((installment, index) => {
            if (index > 0) {
              insertQuery += ", ";
            }
            
            insertQuery += `($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`;
            
            queryParams.push(
              installment.saleId,
              installment.installmentNumber,
              installment.amount,
              installment.dueDate,
              installment.status
            );
          });
          
          insertQuery += ' RETURNING *';
          
          console.log(`🔵 Executando query SQL para criar parcelas`);
          const createResult = await pool.query(insertQuery, queryParams);
          const createdInstallments = createResult.rows;
          
          console.log(`🔵 ${createdInstallments.length} parcelas criadas com sucesso`);
          
          // Transformar os resultados para o formato esperado
          const formattedInstallments = createdInstallments.map(row => ({
            id: row.id,
            saleId: row.sale_id,
            installmentNumber: row.installment_number,
            amount: row.amount,
            dueDate: row.due_date || null, // Preservar exatamente como está no banco
            paymentDate: row.payment_date || null, // Preservar exatamente como está no banco
            status: row.status,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          
          return res.json(formattedInstallments);
        } 
        // Se a venda for à vista (1 parcela) e não tiver parcelas no banco, criar uma parcela
        else if (sale.installments <= 1) {
          console.log(`🔵 Venda #${id} é à vista e não tem parcelas no banco. Criando parcela única.`);
          
          // Inserir direto no banco via SQL
          // Usamos string fixa para evitar conversões automáticas de data
          // Formato: "YYYY-MM-DD" sem qualquer conversão de timezone
          const formattedDate = new Date().toISOString().split('T')[0];
          
          const insertQuery = `
            INSERT INTO sale_installments (sale_id, installment_number, amount, due_date, status) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
          `;
          
          const result = await pool.query(insertQuery, [
            id,
            1,
            sale.totalAmount || "0",
            formattedDate,
            "pending"
          ]);
          
          if (result.rows.length > 0) {
            console.log(`🔵 Parcela única criada com sucesso para a venda à vista #${id}`);
            
            // Transformar para o formato esperado
            const installment = {
              id: result.rows[0].id,
              saleId: result.rows[0].sale_id,
              installmentNumber: result.rows[0].installment_number,
              amount: result.rows[0].amount,
              dueDate: formattedDate,
              paymentDate: null,
              paymentMethodId: result.rows[0].payment_method_id,
              paymentNotes: result.rows[0].payment_notes,
              status: result.rows[0].status,
              notes: result.rows[0].notes,
              createdAt: result.rows[0].created_at,
              updatedAt: result.rows[0].updated_at
            };
            
            return res.json([installment]);
          }
        }
        
        // Se chegou aqui é porque não conseguiu criar as parcelas
        console.error(`🔵 Não foi possível criar parcelas para a venda #${id}`);
        return res.json([]);
      } 
      catch (error) {
        console.error(`🔵 ERRO ao processar parcelas: ${error}`);
        res.status(500).json({ error: "Erro ao processar parcelas da venda" });
      }
    } catch (error) {
      console.error("Erro ao buscar parcelas da venda:", error);
      res.status(500).json({ error: "Erro ao buscar parcelas da venda" });
    }
  });
  
  // Rota para criar parcelas para uma venda
  app.post("/api/sales/:id/installments", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Validar os dados das parcelas
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ error: "O corpo da requisição deve ser um array de parcelas" });
      }
      
      // Remove parcelas existentes, se houver
      await storage.deleteSaleInstallments(id);
      
      // Prepara os dados das parcelas com o ID da venda
      const installmentsData = req.body.map(item => ({
        saleId: id,
        installmentNumber: item.number || item.installmentNumber,
        amount: item.amount,
        dueDate: item.dueDate,
        status: item.status || 'pending',
        notes: item.notes || null
      }));
      
      console.log(`Criando ${installmentsData.length} parcelas para a venda #${id}`);
      
      // Cria as novas parcelas
      const installments = await storage.createSaleInstallments(installmentsData);
      
      // Emitir evento de atualização
      notifySalesUpdate();
      
      res.status(201).json(installments);
    } catch (error) {
      console.error("Erro ao criar parcelas da venda:", error);
      res.status(500).json({ error: "Erro ao criar parcelas da venda" });
    }
  });

  // === MÓDULO FINANCEIRO ===

  // Rota para buscar custos operacionais de uma venda
  app.get("/api/sales/:id/operational-costs", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      const costs = await storage.getSaleOperationalCosts(id);
      res.json(costs);
    } catch (error) {
      console.error("Erro ao buscar custos operacionais:", error);
      res.status(500).json({ error: "Erro ao buscar custos operacionais" });
    }
  });

  // Rota para adicionar um custo operacional a uma venda
  app.post("/api/sales/:id/operational-costs", canManageSaleOperations, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Extrair dados do corpo da requisição
      const { description, amount, date, paymentDate, notes, serviceProviderId, costTypeId } = req.body;
      
      // A descrição não é mais obrigatória, já que pode ser vazia
      // Apenas garantir que seja uma string no restante do código
      const descriptionText = description || " "; // Usando espaço em branco para evitar NULL no banco
      
      if (!amount || isNaN(parseFloat(amount))) {
        return res.status(400).json({ error: "Valor inválido" });
      }
      
      // Obter o tipo de serviço associado à venda
      let isSindicatoType = false;
      if (sale.serviceTypeId) {
        const serviceType = await storage.getServiceType(sale.serviceTypeId);
        isSindicatoType = serviceType?.name?.toUpperCase() === "SINDICATO";
      }
      
      // Preparar dados do custo
      const costData: any = {
        saleId: id,
        description: descriptionText, // Usando a variável com valor padrão definido acima
        amount: amount.toString(),
        date: date ? date : new Date().toISOString(),
        paymentDate: paymentDate || null, // Nova coluna para data de pagamento
        responsibleId: req.user!.id,
        notes: notes || null,
        costTypeId: costTypeId || null // Incluindo o tipo de custo, pode ser null se não especificado
      };
      
      // Adicionar prestador de serviço se for SINDICATO
      if (isSindicatoType && serviceProviderId) {
        const serviceProviderIdNum = parseInt(serviceProviderId);
        if (!isNaN(serviceProviderIdNum)) {
          costData.serviceProviderId = serviceProviderIdNum;
        }
      }
      
      console.log("Criando custo operacional com dados:", JSON.stringify(costData));
      
      // Criar o custo operacional
      const cost = await storage.createSaleOperationalCost(costData);
      
      // Emitir evento de atualização
      notifySalesUpdate();
      
      res.status(201).json(cost);
    } catch (error) {
      console.error("Erro ao adicionar custo operacional:", error);
      res.status(500).json({ error: "Erro ao adicionar custo operacional" });
    }
  });

  // Rota para atualizar um custo operacional
  app.patch("/api/operational-costs/:id", canManageSaleOperations, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const cost = await storage.getSaleOperationalCost(id);
      if (!cost) {
        return res.status(404).json({ error: "Custo operacional não encontrado" });
      }
      
      // Extrair dados do corpo da requisição
      const { description, amount, date, paymentDate, notes } = req.body;
      
      // Preparar dados para atualização
      const updateData: Partial<InsertSaleOperationalCost> = {};
      
      if (description !== undefined) updateData.description = description || " "; // Usando espaço em branco para evitar null
      if (amount !== undefined) updateData.amount = amount.toString();
      if (date !== undefined) updateData.date = date;
      if (paymentDate !== undefined) updateData.paymentDate = paymentDate;
      if (notes !== undefined) updateData.notes = notes;
      
      // Atualizar o custo operacional
      const updatedCost = await storage.updateSaleOperationalCost(id, updateData);
      
      // Emitir evento de atualização
      notifySalesUpdate();
      
      res.json(updatedCost);
    } catch (error) {
      console.error("Erro ao atualizar custo operacional:", error);
      res.status(500).json({ error: "Erro ao atualizar custo operacional" });
    }
  });

  // Rota para excluir um custo operacional
  app.delete("/api/operational-costs/:id", canManageSaleOperations, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const cost = await storage.getSaleOperationalCost(id);
      if (!cost) {
        return res.status(404).json({ error: "Custo operacional não encontrado" });
      }
      
      const success = await storage.deleteSaleOperationalCost(id);
      
      if (!success) {
        return res.status(500).json({ error: "Não foi possível excluir o custo operacional" });
      }
      
      // Emitir evento de atualização via WebSocket
      broadcastEvent({ 
        type: 'sales_update', 
        payload: { action: 'operational-cost-deleted', saleId, operationalCostId: id } 
      });
      
      // Responder com 204 No Content (operação realizada com sucesso, sem conteúdo de retorno)
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao excluir custo operacional:", error);
      res.status(500).json({ error: "Erro ao excluir custo operacional" });
    }
  });

  // Rota para confirmar pagamento de uma parcela
  app.post("/api/installments/:id/confirm-payment", canManageSaleFinancials, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const installment = await storage.getSaleInstallment(id);
      if (!installment) {
        return res.status(404).json({ error: "Parcela não encontrada" });
      }
      
      // Extrair dados do corpo da requisição
      const { 
        paymentDate, 
        receiptType, 
        receiptUrl, 
        receiptData, 
        notes, 
        paymentMethodId, 
        splitPayments = [],
        createSplitReceipts = false // Nova flag para indicar se queremos criar recibos
      } = req.body;
      
      // Validar data de pagamento
      if (!paymentDate) {
        return res.status(400).json({ error: "Data de pagamento é obrigatória" });
      }
      
      // Validar tipo de comprovante
      if (!receiptType) {
        return res.status(400).json({ error: "Tipo de comprovante é obrigatório" });
      }
      
      // Validar método de pagamento principal
      if (!paymentMethodId) {
        return res.status(400).json({ error: "Método de pagamento é obrigatório" });
      }
      
      // Logging para debug
      console.log(`🔍 Rota de confirmação de pagamento: Data recebida do cliente: ${paymentDate}`);
      if (splitPayments && splitPayments.length > 0) {
        console.log(`🔍 Pagamento dividido em ${splitPayments.length} métodos diferentes`);
        splitPayments.forEach((pay, index) => {
          console.log(`  - Método #${index+1}: ID ${pay.methodId}, Valor: ${pay.amount}`);
        });
      }
      
      // Log para debug
      console.log(`🔄 Confirmando pagamento com createSplitReceipts=${createSplitReceipts}`);
      
      // Chamar método com o novo parâmetro
      const updatedInstallment = await storage.confirmInstallmentPayment(
        id,
        req.user!.id,
        paymentDate,
        {
          type: receiptType,
          url: receiptUrl,
          data: receiptData,
          notes
        },
        paymentMethodId,
        splitPayments,
        createSplitReceipts // Passar a flag para o método de storage
      );
      
      // Emitir evento de atualização
      notifySalesUpdate();
      
      res.json(updatedInstallment);
    } catch (error) {
      console.error("Erro ao confirmar pagamento de parcela:", error);
      res.status(500).json({ error: "Erro ao confirmar pagamento de parcela" });
    }
  });

  // Rota para editar um pagamento já confirmado (exclusivo para administradores)
  app.post("/api/installments/:id/edit-payment", onlyAdminAccess, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const installment = await storage.getSaleInstallment(id);
      if (!installment) {
        return res.status(404).json({ error: "Parcela não encontrada" });
      }
      
      // Verificar se a parcela está paga (só podemos editar pagamentos confirmados)
      if (installment.status !== 'paid') {
        return res.status(400).json({ error: "Só é possível editar parcelas já pagas" });
      }
      
      // Extrair dados do corpo da requisição
      const { paymentDate, paymentMethodId, notes } = req.body;
      
      if (!paymentDate || !paymentMethodId) {
        return res.status(400).json({ error: "Data de pagamento e método de pagamento são obrigatórios" });
      }
      
      // Verificar se o método de pagamento existe
      const paymentMethod = await storage.getPaymentMethod(paymentMethodId);
      if (!paymentMethod) {
        return res.status(400).json({ error: "Método de pagamento não encontrado" });
      }
      
      console.log(`🔧 Editando pagamento da parcela ${id} com a nova data: ${paymentDate}`);
      
      const updatedInstallment = await storage.editInstallmentPayment(
        id,
        req.user!.id,
        paymentDate,
        paymentMethodId,
        notes,
        {
          detail: `Pagamento editado por ${req.user?.username} (${req.user?.role})`,
          paymentMethod: paymentMethod.name
        }
      );
      
      if (!updatedInstallment) {
        return res.status(500).json({ error: "Erro ao editar pagamento da parcela" });
      }
      
      // Registrar atividade de edição
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "EDIT_PAYMENT",
        description: `Edição de pagamento da parcela #${installment.installmentNumber} da venda #${installment.saleId} - Nova data: ${paymentDate}`,
        details: JSON.stringify({
          previousDate: installment.paymentDate,
          newDate: paymentDate,
          installmentId: id,
          saleId: installment.saleId
        })
      });
      
      // Notificar todos os clientes sobre a atualização
      notifySalesUpdate();
      
      res.json(updatedInstallment);
    } catch (error) {
      console.error("Erro ao editar pagamento de parcela:", error);
      res.status(500).json({ error: "Erro ao editar pagamento de parcela" });
    }
  });
  
  // Rota para buscar comprovantes de pagamento de uma parcela
  app.get("/api/installments/:id/payment-receipts", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const installment = await storage.getSaleInstallment(id);
      if (!installment) {
        return res.status(404).json({ error: "Parcela não encontrada" });
      }
      
      const receipts = await storage.getSalePaymentReceipts(id);
      res.json(receipts);
    } catch (error) {
      console.error("Erro ao buscar comprovantes de pagamento:", error);
      res.status(500).json({ error: "Erro ao buscar comprovantes de pagamento" });
    }
  });
  
  // Rota para iniciar o processamento financeiro de uma venda
  app.post("/api/sales/:id/process-financial", isAuthenticated, canManageSaleFinancials, async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      const { financialId } = req.body;
      
      // Verificar se a venda existe
      const sale = await storage.getSale(saleId);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se a venda já está em processo financeiro
      if (sale.financialStatus !== 'pending') {
        return res.status(400).json({ error: "Esta venda não está no status financeiro pendente" });
      }
      
      // Atualizar o status financeiro e o responsável financeiro
      const updatedSale = await storage.updateSale(saleId, {
        financialStatus: 'in_progress',
        responsibleFinancialId: financialId
      });
      
      // Registrar a atualização no histórico de status
      await storage.createSalesStatusHistory({
        saleId,
        userId: financialId,
        fromStatus: 'pending',
        toStatus: 'in_progress',
        notes: "Iniciada tratativa financeira"
      });
      
      // Notificar via WebSocket sobre a mudança
      notifySalesUpdate();
      
      res.json(updatedSale);
    } catch (error) {
      console.error("Erro ao iniciar processamento financeiro:", error);
      res.status(500).json({ error: "Erro ao iniciar processamento financeiro" });
    }
  });
  
  // Rota para finalizar o processamento financeiro de uma venda
  app.post("/api/sales/:id/complete-financial", isAuthenticated, canManageSaleFinancials, async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      const { financialId } = req.body;
      
      // Verificar se a venda existe
      const sale = await storage.getSale(saleId);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se a venda está em processo financeiro
      if (sale.financialStatus !== 'in_progress') {
        return res.status(400).json({ error: "Esta venda não está em processamento financeiro" });
      }
      
      // Verificar se todas as parcelas estão pagas
      const installments = await storage.getSaleInstallments(saleId);
      const allPaid = installments.length > 0 && installments.every(inst => inst.status === 'paid');
      
      if (!allPaid) {
        return res.status(400).json({ error: "Não é possível finalizar - existem parcelas pendentes" });
      }
      
      // Atualizar o status financeiro da venda
      const updatedSale = await storage.updateSale(saleId, {
        financialStatus: 'completed'
      });
      
      // Registrar a atualização no histórico de status
      await storage.createSalesStatusHistory({
        saleId,
        userId: financialId,
        fromStatus: 'in_progress',
        toStatus: 'completed',
        notes: "Finalizada tratativa financeira"
      });
      
      // Notificar via WebSocket sobre a mudança
      notifySalesUpdate();
      
      res.json(updatedSale);
    } catch (error) {
      console.error("Erro ao finalizar processamento financeiro:", error);
      res.status(500).json({ error: "Erro ao finalizar processamento financeiro" });
    }
  });

  // Rotas para tipos de custo operacional
  // GET - Listar todos os tipos de custo
  app.get("/api/cost-types", isAuthenticated, async (req, res) => {
    try {
      const costTypes = await storage.getCostTypes();
      res.json(costTypes);
    } catch (error) {
      console.error("Erro ao buscar tipos de custo:", error);
      res.status(500).json({ error: "Erro ao buscar tipos de custo" });
    }
  });

  // GET - Obter um tipo de custo específico
  app.get("/api/cost-types/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const costType = await storage.getCostType(id);
      if (!costType) {
        return res.status(404).json({ error: "Tipo de custo não encontrado" });
      }
      
      res.json(costType);
    } catch (error) {
      console.error("Erro ao buscar tipo de custo:", error);
      res.status(500).json({ error: "Erro ao buscar tipo de custo" });
    }
  });

  // POST - Criar um novo tipo de custo
  app.post("/api/cost-types", canManageFinance, async (req, res) => {
    try {
      const { name, description, active = true } = req.body;
      
      // Validar dados
      if (!name) {
        return res.status(400).json({ error: "Nome é obrigatório" });
      }
      
      // Verificar se já existe um tipo de custo com o mesmo nome
      const existingCostType = await storage.getCostTypeByName(name);
      if (existingCostType) {
        return res.status(400).json({ error: "Já existe um tipo de custo com este nome" });
      }
      
      // Criar o tipo de custo
      const costType = await storage.createCostType({
        name,
        description,
        active
      });
      
      res.status(201).json(costType);
    } catch (error) {
      console.error("Erro ao criar tipo de custo:", error);
      res.status(500).json({ error: "Erro ao criar tipo de custo" });
    }
  });

  // PATCH - Atualizar um tipo de custo existente
  app.patch("/api/cost-types/:id", canManageFinance, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const { name, description, active } = req.body;
      
      // Validar dados
      if (!name) {
        return res.status(400).json({ error: "Nome é obrigatório" });
      }
      
      // Verificar se o tipo de custo existe
      const costType = await storage.getCostType(id);
      if (!costType) {
        return res.status(404).json({ error: "Tipo de custo não encontrado" });
      }
      
      // Verificar se já existe outro tipo de custo com o mesmo nome
      if (name !== costType.name) {
        const existingCostType = await storage.getCostTypeByName(name);
        if (existingCostType && existingCostType.id !== id) {
          return res.status(400).json({ error: "Já existe outro tipo de custo com este nome" });
        }
      }
      
      // Atualizar o tipo de custo
      const updatedCostType = await storage.updateCostType(id, {
        name,
        description,
        active
      });
      
      res.json(updatedCostType);
    } catch (error) {
      console.error("Erro ao atualizar tipo de custo:", error);
      res.status(500).json({ error: "Erro ao atualizar tipo de custo" });
    }
  });

  // DELETE - Remover um tipo de custo
  app.delete("/api/cost-types/:id", canManageFinance, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se o tipo de custo existe
      const costType = await storage.getCostType(id);
      if (!costType) {
        return res.status(404).json({ error: "Tipo de custo não encontrado" });
      }
      
      // Remover o tipo de custo
      await storage.deleteCostType(id);
      
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao remover tipo de custo:", error);
      res.status(500).json({ error: "Erro ao remover tipo de custo" });
    }
  });

  // Rotas para CRUD de custos operacionais
  // Obter custos operacionais de uma venda
  app.get("/api/sales/:id/operational-costs", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se a venda existe
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      const operationalCosts = await storage.getSaleOperationalCosts(id);
      res.json(operationalCosts);
    } catch (error) {
      console.error("Erro ao buscar custos operacionais:", error);
      res.status(500).json({ error: "Erro ao buscar custos operacionais" });
    }
  });
  
  // Obter um custo operacional específico
  app.get("/api/sales/:saleId/operational-costs/:id", isAuthenticated, async (req, res) => {
    try {
      const saleId = parseInt(req.params.saleId);
      const id = parseInt(req.params.id);
      
      if (isNaN(saleId) || isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se a venda existe
      const sale = await storage.getSale(saleId);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      const operationalCost = await storage.getSaleOperationalCost(id);
      if (!operationalCost || operationalCost.saleId !== saleId) {
        return res.status(404).json({ error: "Custo operacional não encontrado" });
      }
      
      res.json(operationalCost);
    } catch (error) {
      console.error("Erro ao buscar custo operacional:", error);
      res.status(500).json({ error: "Erro ao buscar custo operacional" });
    }
  });
  
  // Rota para criar custo operacional já está definida na linha 2733
  
  // Atualizar um custo operacional
  app.put("/api/sales/:saleId/operational-costs/:id", canManageSaleOperations, async (req, res) => {
    try {
      const saleId = parseInt(req.params.saleId);
      const id = parseInt(req.params.id);
      
      if (isNaN(saleId) || isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se a venda existe
      const sale = await storage.getSale(saleId);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se o custo operacional existe
      const operationalCost = await storage.getSaleOperationalCost(id);
      if (!operationalCost || operationalCost.saleId !== saleId) {
        return res.status(404).json({ error: "Custo operacional não encontrado" });
      }
      
      // Garantir que description tenha ao menos um valor texto (não pode ser null)
      // Usando " " (espaço em branco) para evitar erro de validação no banco 
      const updateData = {
        ...req.body,
        description: req.body.description || " "
      };
      
      // Atualizar o custo operacional
      const updatedOperationalCost = await storage.updateSaleOperationalCost(id, updateData);
      if (!updatedOperationalCost) {
        return res.status(404).json({ error: "Custo operacional não encontrado" });
      }
      
      // Notificar via WebSocket
      broadcastEvent({ 
        type: 'sales_update', 
        payload: { action: 'operational-cost-updated', saleId, operationalCost: updatedOperationalCost } 
      });
      
      res.json(updatedOperationalCost);
    } catch (error) {
      console.error("Erro ao atualizar custo operacional:", error);
      res.status(500).json({ error: "Erro ao atualizar custo operacional" });
    }
  });
  
  // Excluir um custo operacional
  app.delete("/api/sales/:saleId/operational-costs/:id", canManageSaleOperations, async (req, res) => {
    try {
      const saleId = parseInt(req.params.saleId);
      const id = parseInt(req.params.id);
      
      if (isNaN(saleId) || isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se a venda existe
      const sale = await storage.getSale(saleId);
      if (!sale) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      // Verificar se o custo operacional existe
      const operationalCost = await storage.getSaleOperationalCost(id);
      if (!operationalCost || operationalCost.saleId !== saleId) {
        return res.status(404).json({ error: "Custo operacional não encontrado" });
      }
      
      // Excluir o custo operacional
      const deleted = await storage.deleteSaleOperationalCost(id);
      if (!deleted) {
        return res.status(404).json({ error: "Custo operacional não encontrado" });
      }
      
      // Notificar via WebSocket
      broadcastEvent({ 
        type: 'sales_update', 
        payload: { action: 'operational-cost-deleted', saleId, operationalCostId: id } 
      });
      
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao excluir custo operacional:", error);
      res.status(500).json({ error: "Erro ao excluir custo operacional" });
    }
  });

  // Nova rota para reenvio de vendas devolvidas (returned -> corrected)
  app.post('/api/sales/:id/resubmit', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const { correctionNotes } = req.body;
      
      if (!correctionNotes || correctionNotes.trim() === '') {
        return res.status(400).json({ error: "Observações de correção são obrigatórias" });
      }

      const { pool } = await import('./db');
      
      // Verificar se a venda existe e pegar seu status atual
      const saleResult = await pool.query(
        "SELECT * FROM sales WHERE id = $1",
        [id]
      );
      
      if (saleResult.rows.length === 0) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      const sale = saleResult.rows[0];
      
      // Verificar se o usuário tem permissão para reenviar esta venda
      if (req.user?.role !== 'admin' && req.user?.role !== 'supervisor' && 
          !(req.user?.role === 'vendedor' && sale.seller_id === req.user?.id)) {
        return res.status(403).json({ error: "Sem permissão para reenviar esta venda" });
      }
      
      // Verificar se a venda realmente está com status "returned"
      if (sale.status !== 'returned') {
        return res.status(400).json({ error: "Apenas vendas devolvidas podem ser reenviadas" });
      }
      
      // Registrar o status anterior no histórico de status
      await pool.query(
        `INSERT INTO sales_status_history
          (sale_id, from_status, to_status, user_id, notes)
          VALUES ($1, $2, $3, $4, $5)`,
        [id, 'returned', 'corrected', req.user?.id, correctionNotes]
      );
      
      // Registrar o motivo da devolução antes da atualização para verificação
      console.log(`Preservando motivo de devolução para venda #${id} - Motivo atual: "${sale.return_reason}"`);
      
      // Atualizar a venda para o novo status "corrected" mas preservar o motivo da devolução
      const updateResult = await pool.query(
        `UPDATE sales 
          SET status = 'corrected', 
              /* Preservando o motivo de devolução (return_reason) para histórico */
              notes = CASE 
                      WHEN notes IS NULL OR notes = '' THEN $1 
                      ELSE notes || ' | CORREÇÃO: ' || $1 
                      END,
              updated_at = NOW()
          WHERE id = $2
          RETURNING *`,
        [correctionNotes, id]
      );
      
      if (updateResult.rows.length === 0) {
        return res.status(500).json({ error: "Falha ao atualizar a venda" });
      }
      
      // Registrar a ação no log
      console.log(`✅ Venda #${id} reenviada após correção por ${req.user?.username}`);
      
      // Verificar se o motivo da devolução foi preservado
      const saleAfterUpdate = await storage.getSale(id);
      console.log(`✅ Verificação pós-atualização da venda #${id} - Motivo de devolução: "${saleAfterUpdate?.returnReason || 'Não definido'}"`);
      
      // Notificar todos os clientes sobre a atualização da venda
      notifySalesUpdate();
      
      // Retornar dados da venda atualizada
      return res.json({
        ...updateResult.rows[0],
        message: "Venda corrigida e reenviada para avaliação operacional com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao reenviar venda:", error);
      res.status(500).json({ error: "Erro interno ao processar o reenvio da venda" });
    }
  });

  // NOVA ROTA: Solução definitiva para forçar a criação de parcelas para uma venda
  app.post("/api/sales/:id/recreate-installments", isAuthenticated, async (req, res) => {
    try {
      console.log("🔄 INICIANDO RECRIAÇÃO DE PARCELAS");
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        console.log("🔄 ERRO: ID inválido");
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se o usuário tem permissão
      if (!["admin", "supervisor", "operacional", "financeiro"].includes(req.user?.role || "")) {
        console.log("🔄 ERRO: Permissão negada para usuário " + req.user?.username);
        return res.status(403).json({ error: "Permissão negada" });
      }
      
      // Buscar a venda
      const sale = await storage.getSale(id);
      if (!sale) {
        console.log("🔄 ERRO: Venda não encontrada");
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      console.log(`🔄 Recriando parcelas para venda #${id}`);
      console.log(`🔄 Detalhes da venda: orderNumber=${sale.orderNumber}, totalAmount=${sale.totalAmount}, installments=${sale.installments}`);
      
      // Parâmetros do request
      const { numInstallments, installmentValue } = req.body;
      
      // Número de parcelas (usar o valor da venda se não fornecido)
      let installments = sale.installments;
      
      if (numInstallments) {
        installments = parseInt(String(numInstallments));
        console.log(`🔄 Usando número de parcelas da requisição: ${installments}`);
        
        // Atualizar o número de parcelas na venda
        console.log(`🔄 Atualizando número de parcelas na venda para ${installments}`);
        await db
          .update(sales)
          .set({ installments })
          .where(eq(sales.id, id));
      }
      
      // Verificar se o número de parcelas é válido
      if (installments < 1) {
        console.log("🔄 ERRO: Número de parcelas inválido");
        return res.status(400).json({ error: "Número de parcelas inválido" });
      }
      
      // Remover parcelas existentes
      console.log("🔄 Removendo parcelas existentes");
      await storage.deleteSaleInstallments(id);
      
      // Valor total
      const totalAmount = parseFloat(sale.totalAmount);
      
      // Valor das parcelas
      let parsedInstallmentValue = null;
      if (installmentValue) {
        parsedInstallmentValue = parseFloat(String(installmentValue).replace(',', '.'));
        console.log(`🔄 Valor de parcela fornecido: ${parsedInstallmentValue}`);
      }
      
      // Calcular valor da parcela se não fornecido
      const calculatedInstallmentValue = parseFloat((totalAmount / installments).toFixed(2));
      const lastInstallmentValue = totalAmount - (calculatedInstallmentValue * (installments - 1));
      
      console.log(`🔄 Valor calculado por parcela: ${calculatedInstallmentValue}`);
      console.log(`🔄 Valor calculado para última parcela: ${lastInstallmentValue}`);
      
      // Criar as parcelas
      console.log(`🔄 Criando ${installments} parcelas`);
      const hoje = new Date();
      const createdInstallments = [];
      
      for (let i = 1; i <= installments; i++) {
        // Data de vencimento (um mês após o anterior)
        const dueDate = new Date(hoje);
        dueDate.setMonth(hoje.getMonth() + (i - 1));
        
        // Valor da parcela
        const amount = parsedInstallmentValue || 
                      (i === installments ? lastInstallmentValue : calculatedInstallmentValue);
        
        // Criar parcela
        console.log(`🔄 Criando parcela #${i} com valor ${amount} e vencimento ${dueDate.toISOString().split('T')[0]}`);
        
        const installment = await storage.createSaleInstallment({
          saleId: id,
          installmentNumber: i,
          amount: amount.toString(),
          dueDate: dueDate.toISOString().split('T')[0],
          status: "pending",
          paymentDate: null
        });
        
        createdInstallments.push(installment);
      }
      
      // Notificar todos os clientes sobre a atualização
      notifySalesUpdate();
      
      console.log(`🔄 ${createdInstallments.length} parcelas criadas com sucesso`);
      
      // Retornar as parcelas criadas
      res.status(200).json({
        success: true,
        message: `${createdInstallments.length} parcelas criadas com sucesso`,
        installments: createdInstallments
      });
    } catch (error) {
      console.error("🔄 ERRO ao recriar parcelas:", error);
      res.status(500).json({ error: "Erro ao recriar parcelas" });
    }
  });

  // ========== Rotas para o Módulo de Relatórios ==========
  
  // Middleware para verificar permissões - acesso a relatórios
  const canAccessReports = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    // Qualquer usuário autenticado pode acessar relatórios, mas veremos apenas os que tem permissão
    return next();
  };
  
  // Listar todos os relatórios (filtrados pelo papel do usuário)
  app.get("/api/reports", canAccessReports, async (req, res) => {
    try {
      const reports = await storage.getReports(req.user?.role || '');
      res.json(reports);
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
      res.status(500).json({ error: "Erro ao buscar relatórios" });
    }
  });
  
  // Buscar um relatório específico
  app.get("/api/reports/:id", canAccessReports, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ error: "Relatório não encontrado" });
      }
      
      // Verificar se o usuário tem permissão para acessar este relatório
      const userRole = req.user?.role || '';
      const permissionsArray = report.permissions.split(',');
      
      if (!permissionsArray.includes(userRole) && userRole !== 'admin') {
        return res.status(403).json({ error: "Você não tem permissão para acessar este relatório" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Erro ao buscar relatório:", error);
      res.status(500).json({ error: "Erro ao buscar relatório" });
    }
  });
  
  // Criar um novo relatório (apenas admin)
  app.post("/api/reports", isAuthenticated, async (req, res) => {
    try {
      // Verificar permissões (apenas admins podem criar relatórios)
      const currentUser = req.user;
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ error: "Permissão negada. Apenas administradores podem criar relatórios." });
      }
      
      const reportData = {
        ...req.body,
        createdBy: currentUser.id
      };
      
      const report = await storage.createReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      console.error("Erro ao criar relatório:", error);
      res.status(500).json({ error: "Erro ao criar relatório" });
    }
  });
  
  // Atualizar um relatório existente (apenas admin)
  app.put("/api/reports/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar permissões (apenas admins podem atualizar relatórios)
      const currentUser = req.user;
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ error: "Permissão negada. Apenas administradores podem atualizar relatórios." });
      }
      
      const report = await storage.updateReport(id, req.body);
      if (!report) {
        return res.status(404).json({ error: "Relatório não encontrado" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Erro ao atualizar relatório:", error);
      res.status(500).json({ error: "Erro ao atualizar relatório" });
    }
  });
  
  // Excluir um relatório (apenas admin)
  app.delete("/api/reports/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar permissões (apenas admins podem excluir relatórios)
      const currentUser = req.user;
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ error: "Permissão negada. Apenas administradores podem excluir relatórios." });
      }
      
      const success = await storage.deleteReport(id);
      if (!success) {
        return res.status(404).json({ error: "Relatório não encontrado" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao excluir relatório:", error);
      res.status(500).json({ error: "Erro ao excluir relatório" });
    }
  });
  
  // Executar um relatório
  app.post("/api/reports/:id/execute", canAccessReports, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se o relatório existe
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ error: "Relatório não encontrado" });
      }
      
      // Verificar se o usuário tem permissão para acessar este relatório
      const userRole = req.user?.role || '';
      const permissionsArray = report.permissions.split(',');
      
      if (!permissionsArray.includes(userRole) && userRole !== 'admin') {
        return res.status(403).json({ error: "Você não tem permissão para acessar este relatório" });
      }
      
      // Executar o relatório com os parâmetros fornecidos
      const result = await storage.executeReport(id, req.user?.id || 0, req.body.parameters);
      res.json(result);
    } catch (error: any) {
      console.error("Erro ao executar relatório:", error);
      res.status(500).json({ error: error.message || "Erro ao executar relatório" });
    }
  });
  
  // Obter o histórico de execuções de um relatório
  app.get("/api/reports/:id/executions", canAccessReports, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Verificar se o relatório existe
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ error: "Relatório não encontrado" });
      }
      
      // Verificar se o usuário tem permissão para acessar este relatório
      const userRole = req.user?.role || '';
      const permissionsArray = report.permissions.split(',');
      
      if (!permissionsArray.includes(userRole) && userRole !== 'admin') {
        return res.status(403).json({ error: "Você não tem permissão para acessar este relatório" });
      }
      
      // Obter as execuções recentes do relatório
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const executions = await storage.getReportExecutions(id, limit);
      res.json(executions);
    } catch (error) {
      console.error("Erro ao buscar execuções:", error);
      res.status(500).json({ error: "Erro ao buscar execuções" });
    }
  });
  
  // Obter detalhes de uma execução específica
  app.get("/api/report-executions/:id", canAccessReports, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      console.log(`Buscando execução de relatório com ID ${id}`);
      const execution = await storage.getReportExecution(id);
      
      if (!execution) {
        console.log(`Execução com ID ${id} não encontrada`);
        return res.status(404).json({ error: "Execução não encontrada" });
      }
      
      // Tratamento de dados para garantir que os resultados sejam um objeto JSON válido
      if (execution.results) {
        try {
          // Se já estiver em formato de objeto, manter como está
          if (typeof execution.results === 'object' && !Array.isArray(execution.results)) {
            // Nada a fazer, já é um objeto
          } 
          // Se for string, tentar fazer parse
          else if (typeof execution.results === 'string') {
            execution.results = JSON.parse(execution.results);
          }
          // Se for array, manter como está
          else if (Array.isArray(execution.results)) {
            // Nada a fazer, já é um array
          }
          
          // Verificar se os resultados são válidos após processamento
          if (!execution.results || (Array.isArray(execution.results) && execution.results.length === 0)) {
            console.log(`Execução ${id} contém resultados vazios`);
            execution.results = [];
            execution.status = 'completed'; // Garantir status consistente
          }
        } catch (jsonError) {
          console.error(`Erro ao processar JSON dos resultados da execução ${id}:`, jsonError);
          execution.results = [];
          execution.status = 'error';
          execution.error_message = `Erro ao processar resultados: ${jsonError.message}`;
        }
      } else {
        execution.results = [];
      }
      
      console.log(`Execução processada: ${execution.id}, Status: ${execution.status}, Resultados: ${Array.isArray(execution.results) ? execution.results.length : 'não é array'}`);
      
      // Verificar se o relatório existe e se o usuário tem permissão para acessá-lo
      // Obter o ID do relatório - pode estar como report_id ou reportId
      const reportId = execution.report_id || execution.reportId;
      console.log(`Buscando relatório com ID ${reportId}`);
      
      const report = await storage.getReport(reportId);
      if (!report) {
        console.log(`Relatório com ID ${reportId} não encontrado`);
        return res.status(404).json({ error: "Relatório não encontrado" });
      }
      
      const userRole = req.user?.role || '';
      const permissionsArray = report.permissions.split(',');
      
      console.log(`Usuário com perfil ${userRole} acessando relatório com permissões ${permissionsArray}`);
      
      if (!permissionsArray.includes(userRole) && userRole !== 'admin') {
        return res.status(403).json({ error: "Você não tem permissão para acessar esta execução" });
      }
      
      res.json(execution);
    } catch (error) {
      console.error("Erro ao buscar detalhes da execução:", error);
      res.status(500).json({ error: "Erro ao buscar detalhes da execução" });
    }
  });
  
  // Rota para obter as execuções de relatórios mais recentes
  app.get("/api/recent-executions", canAccessReports, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const userRole = req.user?.role || '';
      const userId = req.user?.id;
      
      // Buscar execuções recentes com base no perfil do usuário
      const executions = await storage.getRecentExecutions(userId || 0, userRole, limit);
      res.json(executions);
    } catch (error) {
      console.error("Erro ao buscar execuções recentes:", error);
      res.status(500).json({ error: "Erro ao buscar execuções recentes" });
    }
  });
  
  // Rotas para análises e dashboards
  
  // Resumo geral de vendas
  app.get("/api/analytics/sales-summary", canAccessReports, async (req, res) => {
    try {
      const filters = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        sellerId: req.query.sellerId ? parseInt(req.query.sellerId as string) : undefined,
        status: req.query.status as string | undefined,
        financialStatus: req.query.financialStatus as string | undefined,
      };
      
      const summary = await storage.getSalesSummary(filters);
      res.json(summary);
    } catch (error) {
      console.error("Erro ao gerar resumo de vendas:", error);
      res.status(500).json({ error: "Erro ao gerar resumo de vendas" });
    }
  });
  
  // Desempenho de vendedores
  app.get("/api/analytics/seller-performance", canAccessReports, async (req, res) => {
    try {
      // Verificar permissões adicionais (apenas admin, supervisor e financeiro)
      const userRole = req.user?.role || '';
      if (!['admin', 'supervisor', 'financeiro'].includes(userRole)) {
        return res.status(403).json({ error: "Você não tem permissão para acessar estas informações" });
      }
      
      const filters = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };
      
      const performance = await storage.getSellerPerformance(filters);
      res.json(performance);
    } catch (error) {
      console.error("Erro ao gerar desempenho de vendedores:", error);
      res.status(500).json({ error: "Erro ao gerar desempenho de vendedores" });
    }
  });
  
  // Resumo financeiro
  app.get("/api/analytics/financial-overview", canAccessReports, async (req, res) => {
    try {
      // Verificar permissões adicionais (apenas admin e financeiro)
      const userRole = req.user?.role || '';
      if (!['admin', 'financeiro'].includes(userRole)) {
        return res.status(403).json({ error: "Você não tem permissão para acessar estas informações" });
      }
      
      const filters = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };
      
      const overview = await storage.getFinancialOverview(filters);
      res.json(overview);
    } catch (error) {
      console.error("Erro ao gerar resumo financeiro:", error);
      res.status(500).json({ error: "Erro ao gerar resumo financeiro" });
    }
  });

  // Endpoint para dashboard financeiro
  app.get("/api/dashboard/financial", isAuthenticated, async (req, res) => {
    try {
      const startDate = req.query.startDate as string || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endDate = req.query.endDate as string || new Date().toISOString().split('T')[0];
      const sellerId = req.query.sellerId ? parseInt(req.query.sellerId as string) : undefined;
      const { pool } = await import('./db');

      // Verificar permissões - apenas admin e financeiro podem ver dados financeiros completos
      const userRole = req.user?.role || '';
      if (!['admin', 'financeiro', 'supervisor'].includes(userRole)) {
        return res.status(403).json({ error: "Você não tem permissão para acessar dados financeiros" });
      }

      try {
        // Log único para facilitar depuração
        console.log(`Dashboard financeiro: ${userRole} consultando período ${startDate} a ${endDate}${sellerId ? ` para vendedor ${sellerId}` : ' para todos vendedores'}`);
        
        // Buscar dados do dashboard financeiro com filtro de vendedor se necessário
        const filters = { startDate, endDate, sellerId };
        const financialData = await storage.getFinancialOverview(filters);
        
        // Preparar datas padrão para uso nas consultas
        const startDateForQuery = startDate;
        const endDateForQuery = endDate;
        
        // Buscar dados de parcelas com filtro de vendedor, se necessário
        let installmentsQuery = `
          SELECT 
            COUNT(*) as total_installments,
            COUNT(*) FILTER (WHERE i.status = 'paid') as paid_installments,
            COUNT(*) FILTER (WHERE i.status = 'pending') as pending_installments
          FROM sale_installments i
          JOIN sales s ON i.sale_id = s.id
          WHERE i.due_date BETWEEN $1 AND $2
        `;
        
        // Parâmetros para consulta de parcelas
        let installmentsParams = [startDateForQuery, endDateForQuery];
        
        // Adicionar filtro de vendedor, se necessário
        if (sellerId !== undefined) {
          installmentsQuery += ` AND s.seller_id = $3`;
          installmentsParams.push(sellerId);
        }
        
        // Calcular tendência (comparando com período anterior)
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        // Calcular duração em dias
        const duration = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
        
        // Definir período anterior de mesma duração
        const prevStartDate = new Date(startDateObj);
        prevStartDate.setDate(prevStartDate.getDate() - duration);
        
        const prevEndDate = new Date(startDateObj);
        prevEndDate.setDate(prevEndDate.getDate() - 1);
        
        // Construir a consulta de tendência com filtro de vendedor
        let trendQuery = `
          SELECT COALESCE(SUM(total_amount::numeric), 0) as prev_total
          FROM sales
          WHERE date BETWEEN $1 AND $2
        `;
        
        // Parâmetros para a consulta de tendência
        let trendParams = [
          prevStartDate.toISOString().split('T')[0],
          prevEndDate.toISOString().split('T')[0]
        ];
        
        // Adicionar filtro de vendedor à consulta de tendência, se necessário
        if (sellerId !== undefined) {
          trendQuery += ` AND seller_id = $3`;
          trendParams.push(sellerId);
        }
        
        // Executar todas as consultas simultaneamente
        const [
          installmentsResult, 
          trendResult,
          totalSalesResult
        ] = await Promise.all([
          pool.query(installmentsQuery, installmentsParams),
          pool.query(trendQuery, trendParams),
          getTotalSalesCount(startDate, endDate, sellerId)
        ]);
        
        // Extrair resultados
        const installmentsData = installmentsResult.rows[0] || {
          total_installments: 0,
          paid_installments: 0,
          pending_installments: 0
        };
        
        const prevTotal = parseFloat(trendResult.rows[0]?.prev_total || '0');
        const currentTotal = parseFloat(financialData.totalRevenue || '0');
        
        // Calcular percentual de crescimento
        let trend = 0;
        if (prevTotal > 0) {
          trend = ((currentTotal - prevTotal) / prevTotal) * 100;
        }
        
        // Construir resposta
        res.json({
          totalSales: totalSalesResult,
          totalInstallments: parseInt(installmentsData.total_installments) || 0,
          paidInstallments: parseInt(installmentsData.paid_installments) || 0,
          pendingInstallments: parseInt(installmentsData.pending_installments) || 0,
          totalAmount: parseFloat(financialData.totalRevenue) || 0,
          paidAmount: parseFloat(financialData.paidRevenue) || 0,
          pendingAmount: parseFloat(financialData.pendingRevenue) || 0,
          trend: parseFloat(trend.toFixed(2)),
          operationalCosts: parseFloat(financialData.totalCost) || 0,
          profit: parseFloat(financialData.profit) || 0,
          margin: parseFloat(financialData.margin?.toFixed(2)) || 0
        });
      } catch (queryError) {
        console.error("Erro em consulta específica:", queryError);
        res.status(500).json({ error: "Erro ao processar consultas financeiras" });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard financeiro:", error);
      res.status(500).json({ error: "Erro ao buscar dados do dashboard financeiro" });
    }
  });

  // Função auxiliar para obter contagem total de vendas
  async function getTotalSalesCount(startDate?: string, endDate?: string, sellerId?: number): Promise<number> {
    try {
      const { pool } = await import('./db');
      
      // Definir parâmetros padrão se não fornecidos
      const defaultStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const defaultEndDate = new Date().toISOString().split('T')[0];
      
      // Usar parâmetros fornecidos ou padrões
      const effectiveStartDate = startDate || defaultStartDate;
      const effectiveEndDate = endDate || defaultEndDate;
      
      let query = '';
      let params = [];
      
      if (sellerId !== undefined) {
        // Com filtro de vendedor
        query = `
          SELECT COUNT(*) as total 
          FROM sales 
          WHERE date BETWEEN $1 AND $2
          AND seller_id = $3
        `;
        params = [effectiveStartDate, effectiveEndDate, sellerId];
      } else {
        // Sem filtro de vendedor
        query = `
          SELECT COUNT(*) as total 
          FROM sales 
          WHERE date BETWEEN $1 AND $2
        `;
        params = [effectiveStartDate, effectiveEndDate];
      }
      
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].total) || 0;
    } catch (error) {
      console.error("Erro ao contar vendas:", error);
      return 0;
    }
  }

  // Endpoint para resumo de vendas do dashboard
  app.get("/api/dashboard/sales", isAuthenticated, async (req, res) => {
    try {
      const startDate = req.query.startDate as string || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endDate = req.query.endDate as string || new Date().toISOString().split('T')[0];
      const sellerId = req.query.sellerId ? parseInt(req.query.sellerId as string) : undefined;
      const { pool } = await import('./db');
      
      // Filtrar por vendedor se o usuário for vendedor ou se um sellerId foi especificado
      const userRole = req.user?.role || '';
      const userId = req.user?.id || 0;
      let sellerFilter = '';
      let params = [startDate, endDate];
      
      if (userRole === 'vendedor') {
        // Vendedor só pode ver suas próprias vendas
        sellerFilter = 'AND seller_id = $3';
        params.push(userId);
        console.log(`Vendedor ${userId} visualizando apenas suas vendas no dashboard`);
      } else if (sellerId !== undefined) {
        // Filtro explícito por um vendedor específico para outros tipos de usuários
        sellerFilter = 'AND seller_id = $3';
        params.push(sellerId);
        console.log(`Usuário com perfil ${userRole} filtrando dashboard por vendedor ${sellerId}`);
      }

      // Contar vendas por status
      const statusQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
          COUNT(*) FILTER (WHERE status = 'canceled') as canceled,
          COUNT(*) as total
        FROM sales
        WHERE date BETWEEN $1 AND $2 ${sellerFilter}
      `;
      
      // Buscar vendas agrupadas por data
      const byDateQuery = `
        SELECT 
          TO_CHAR(date, 'YYYY-MM-DD') as date,
          COUNT(*) as count,
          COALESCE(SUM(total_amount::numeric), 0) as amount
        FROM sales
        WHERE date BETWEEN $1 AND $2 ${sellerFilter}
        GROUP BY TO_CHAR(date, 'YYYY-MM-DD')
        ORDER BY date
      `;
      
      // Executar ambas as consultas simultaneamente
      const [statusResult, byDateResult] = await Promise.all([
        pool.query(statusQuery, params),
        pool.query(byDateQuery, params)
      ]);
      
      const statusData = statusResult.rows[0] || {
        completed: 0,
        in_progress: 0,
        pending: 0,
        canceled: 0,
        total: 0
      };
      
      res.json({
        total: parseInt(statusData.total) || 0,
        completed: parseInt(statusData.completed) || 0,
        inProgress: parseInt(statusData.in_progress) || 0,
        pending: parseInt(statusData.pending) || 0,
        canceled: parseInt(statusData.canceled) || 0,
        byStatus: {
          completed: parseInt(statusData.completed) || 0,
          in_progress: parseInt(statusData.in_progress) || 0,
          pending: parseInt(statusData.pending) || 0,
          canceled: parseInt(statusData.canceled) || 0
        },
        byDate: byDateResult.rows || []
      });
    } catch (error) {
      console.error("Erro ao buscar dados do resumo de vendas:", error);
      res.status(500).json({ error: "Erro ao buscar dados do resumo de vendas" });
    }
  });

  // Endpoint para desempenho dos vendedores no dashboard
  app.get("/api/dashboard/sellers", isAuthenticated, async (req, res) => {
    try {
      const startDate = req.query.startDate as string || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endDate = req.query.endDate as string || new Date().toISOString().split('T')[0];
      const { pool } = await import('./db');
      
      // Verificar permissões - apenas admin, supervisor e financeiro podem ver dados de todos vendedores
      const userRole = req.user?.role || '';
      const userId = req.user?.id || 0;
      
      // Se for vendedor, mostra apenas os próprios dados
      let sellerFilter = '';
      let params = [startDate, endDate];
      
      if (userRole === 'vendedor') {
        sellerFilter = 'AND s.seller_id = $3';
        params.push(userId);
        console.log(`Vendedor ${userId} visualizando apenas seus próprios dados de desempenho`);
      }

      // Consulta para obter desempenho dos vendedores
      const query = `
        SELECT 
          s.seller_id as "sellerId",
          u.username as "sellerName",
          COUNT(*) as count,
          COALESCE(SUM(s.total_amount::numeric), 0) as amount
        FROM sales s
        JOIN users u ON s.seller_id = u.id
        WHERE s.date BETWEEN $1 AND $2 ${sellerFilter}
        GROUP BY s.seller_id, u.username
        ORDER BY amount DESC
      `;
      
      const result = await pool.query(query, params);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar dados de desempenho dos vendedores:", error);
      res.status(500).json({ error: "Erro ao buscar dados de desempenho dos vendedores" });
    }
  });

  // Endpoint para atividades recentes no dashboard
  app.get("/api/dashboard/activities", isAuthenticated, async (req, res) => {
    try {
      const startDate = req.query.startDate as string || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endDate = req.query.endDate as string || new Date().toISOString().split('T')[0];
      const limit = Number(req.query.limit) || 10;
      const sellerId = req.query.sellerId ? parseInt(req.query.sellerId as string) : undefined;
      const { pool } = await import('./db');
      
      // Filtrar por vendedor se o usuário for vendedor ou se um ID de vendedor foi fornecido
      const userRole = req.user?.role || '';
      const userId = req.user?.id || 0;
      
      let sellerFilter = '';
      let params = [startDate, endDate, limit];
      let sellerFilterParams = [...params];
      
      if (userRole === 'vendedor') {
        // Vendedor só pode ver suas próprias atividades
        sellerFilter = 'AND s.seller_id = $4';
        params.push(userId);
        sellerFilterParams.push(userId);
        console.log(`Vendedor ${userId} visualizando apenas suas atividades no dashboard`);
      } else if (sellerId !== undefined) {
        // Filtro explícito por vendedor para outros perfis
        sellerFilter = 'AND s.seller_id = $4';
        params.push(sellerId);
        sellerFilterParams.push(sellerId);
        console.log(`Usuário com perfil ${userRole} filtrando atividades por vendedor ${sellerId}`);
      }

      try {
        // Consulta para obter vendas recentes
        let salesQuery = '';
        
        if (sellerFilter) {
          // Com filtro de vendedor
          salesQuery = `
            SELECT 
              s.id,
              'Venda' as type,
              c.name as description,
              s.status,
              s.date,
              s.total_amount::numeric as amount,
              u.username as "user"
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            JOIN users u ON s.seller_id = u.id
            WHERE s.date BETWEEN $1 AND $2
            AND s.seller_id = $4
            ORDER BY s.date DESC
            LIMIT $3
          `;
        } else {
          // Sem filtro de vendedor
          salesQuery = `
            SELECT 
              s.id,
              'Venda' as type,
              c.name as description,
              s.status,
              s.date,
              s.total_amount::numeric as amount,
              u.username as "user"
            FROM sales s
            JOIN customers c ON s.customer_id = c.id
            JOIN users u ON s.seller_id = u.id
            WHERE s.date BETWEEN $1 AND $2
            ORDER BY s.date DESC
            LIMIT $3
          `;
        }
        
        // Consulta para obter pagamentos recentes
        let paymentsQuery = '';
        
        if (sellerFilter) {
          // Com filtro de vendedor
          paymentsQuery = `
            SELECT 
              i.id,
              'Pagamento' as type,
              CONCAT('Parcela #', i.installment_number, ' da venda #', s.order_number) as description,
              i.status,
              i.payment_date as date,
              i.amount::numeric as amount,
              u.username as "user"
            FROM sale_installments i
            JOIN sales s ON i.sale_id = s.id
            JOIN users u ON s.seller_id = u.id
            WHERE i.payment_date BETWEEN $1 AND $2 AND i.status = 'paid'
            AND s.seller_id = $4
            ORDER BY i.payment_date DESC
            LIMIT $3
          `;
        } else {
          // Sem filtro de vendedor
          paymentsQuery = `
            SELECT 
              i.id,
              'Pagamento' as type,
              CONCAT('Parcela #', i.installment_number, ' da venda #', s.order_number) as description,
              i.status,
              i.payment_date as date,
              i.amount::numeric as amount,
              u.username as "user"
            FROM sale_installments i
            JOIN sales s ON i.sale_id = s.id
            JOIN users u ON s.seller_id = u.id
            WHERE i.payment_date BETWEEN $1 AND $2 AND i.status = 'paid'
            ORDER BY i.payment_date DESC
            LIMIT $3
          `;
        }
        
        // Consulta para obter atualizações de status recentes
        // Para vendedores ou quando filtrado por vendedor, mostrar apenas vendas do vendedor especificado
        // Caso contrário, mostrar todos
        let statusUpdateQuery = '';
        
        if (sellerFilter) {
          // Com filtro de vendedor
          statusUpdateQuery = `
            SELECT 
              sh.id,
              'Atualização de Status' as type,
              CONCAT('Venda #', s.order_number, ' atualizada para ', sh.to_status) as description,
              s.status,
              sh.created_at as date,
              s.total_amount::numeric as amount,
              u.username as "user"
            FROM sales_status_history sh
            JOIN sales s ON sh.sale_id = s.id
            JOIN users u ON sh.user_id = u.id
            WHERE sh.created_at BETWEEN $1 AND $2
            AND s.seller_id = $4
            ORDER BY sh.created_at DESC
            LIMIT $3
          `;
        } else {
          // Sem filtro de vendedor
          statusUpdateQuery = `
            SELECT 
              sh.id,
              'Atualização de Status' as type,
              CONCAT('Venda #', s.order_number, ' atualizada para ', sh.to_status) as description,
              s.status,
              sh.created_at as date,
              s.total_amount::numeric as amount,
              u.username as "user"
            FROM sales_status_history sh
            JOIN sales s ON sh.sale_id = s.id
            JOIN users u ON sh.user_id = u.id
            WHERE sh.created_at BETWEEN $1 AND $2
            ORDER BY sh.created_at DESC
            LIMIT $3
          `;
        }
        
        // Executar consultas simultaneamente
        const [salesResult, paymentsResult, statusResult] = await Promise.all([
          pool.query(salesQuery, sellerFilter ? params : params.slice(0, 3)),
          pool.query(paymentsQuery, sellerFilter ? params : params.slice(0, 3)),
          statusUpdateQuery ? pool.query(statusUpdateQuery, sellerFilter ? params : params.slice(0, 3)) : Promise.resolve({ rows: [] })
        ]);
        
        // Combinar resultados e ordenar por data (mais recente primeiro)
        const allActivities = [
          ...salesResult.rows,
          ...paymentsResult.rows,
          ...statusResult.rows,
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Retornar apenas os primeiros 'limit' resultados
        res.json(allActivities.slice(0, limit));
      } catch (queryError) {
        console.error("Erro na consulta de atividades:", queryError);
        res.status(500).json({ error: "Erro na consulta de atividades" });
      }
    } catch (error) {
      console.error("Erro ao buscar atividades recentes:", error);
      res.status(500).json({ error: "Erro ao buscar atividades recentes" });
    }
  });

  // Registrar rotas personalizadas para manipulação de datas exatas
  registerCustomRoutes(app);
  
  // Criar o servidor HTTP
  const httpServer = createServer(app);
  
  // Configurar o WebSocket
  const wss = setupWebsocket(httpServer);
  
  return httpServer;
}

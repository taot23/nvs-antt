// Implementação das novas rotas para lidar com datas exatas nas parcelas
import { Express, Request, Response } from "express";
import { db } from "./db";
import { pool } from "./db";

// Função para gerar um token de anti-bypass para o problema de validação Zod
function generateBypassToken() {
  return `bypass-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function registerCustomRoutes(app: Express) {
  // Rota para adicionar pagamentos divididos a uma parcela existente
  app.post("/api/installments/:id/add-split-payments", async (req, res) => {
    try {
      // Verificar autenticação
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Não autorizado" });
      }
      
      const installmentId = parseInt(req.params.id);
      if (isNaN(installmentId)) {
        return res.status(400).json({ error: "ID de parcela inválido" });
      }
      
      // Obter a parcela para verificação
      const installmentResult = await pool.query(
        "SELECT * FROM sale_installments WHERE id = $1",
        [installmentId]
      );
      
      if (installmentResult.rows.length === 0) {
        return res.status(404).json({ error: "Parcela não encontrada" });
      }
      
      const installment = installmentResult.rows[0];
      
      // Verificar se a parcela está paga
      if (installment.status !== 'paid') {
        return res.status(400).json({ error: "Só é possível adicionar pagamentos divididos a parcelas já pagas" });
      }
      
      // Extrair dados do corpo da requisição
      const { 
        splitPayments = [] 
      } = req.body;
      
      if (!Array.isArray(splitPayments) || splitPayments.length === 0) {
        return res.status(400).json({ error: "Lista de pagamentos divididos é obrigatória" });
      }
      
      // Log de diagnóstico
      console.log(`🔄 Adicionando ${splitPayments.length} pagamentos divididos para a parcela #${installmentId}`);
      
      // Para cada método de pagamento, criar um recibo de pagamento
      const receiptResults = [];
      
      for (const splitPayment of splitPayments) {
        // Verificar se o método de pagamento existe
        const methodResult = await pool.query(
          "SELECT * FROM payment_methods WHERE id = $1",
          [splitPayment.methodId]
        );
        
        if (methodResult.rows.length === 0) {
          return res.status(400).json({ error: `Método de pagamento ${splitPayment.methodId} não encontrado` });
        }
        
        const method = methodResult.rows[0];
        const methodName = method.name;
        
        // Formatação do valor em moeda brasileira
        const amountFormatted = new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(splitPayment.amount);
        
        // Criar o recibo de pagamento
        const receiptResult = await pool.query(`
          INSERT INTO sale_payment_receipts (
            installment_id, receipt_type, receipt_url, receipt_data, 
            confirmed_by, confirmation_date, notes, created_at
          ) 
          VALUES (
            $1, $2, $3, $4, $5, NOW(), $6, NOW()
          )
          RETURNING *
        `, [
          installmentId,
          "split_payment",
          null,
          JSON.stringify({
            methodId: splitPayment.methodId,
            methodName: methodName,
            amount: splitPayment.amount,
            isPartial: true,
            autoCreated: true
          }),
          req.user!.id,
          `Pagamento parcial - ${methodName}: ${amountFormatted}`
        ]);
        
        receiptResults.push(receiptResult.rows[0]);
        console.log(`✅ Recibo de pagamento dividido criado: Método ${methodName}, Valor ${amountFormatted}`);
      }
      
      // Notificar usuários via WebSocket se disponível
      try {
        // @ts-ignore
        if (global.broadcastEvent) {
          // @ts-ignore
          global.broadcastEvent({ 
            type: 'sales_update', 
            payload: { 
              action: 'payment-receipts-updated', 
              installmentId
            } 
          });
        }
      } catch (wsError) {
        console.error("Erro ao notificar via WebSocket:", wsError);
      }
      
      res.status(201).json({ 
        success: true, 
        message: `${receiptResults.length} recibos de pagamento dividido criados com sucesso`,
        receipts: receiptResults
      });
      
    } catch (error) {
      console.error("Erro ao adicionar pagamentos divididos:", error);
      res.status(500).json({ error: "Erro ao adicionar pagamentos divididos" });
    }
  });
  // Rota para recuperar os recibos de pagamento para uma venda
  app.get("/api/sales/:id/payment-receipts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Não autorizado" });
      }
      
      const saleId = parseInt(req.params.id);
      if (isNaN(saleId)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      // Primeiro, buscar todas as parcelas da venda
      const installmentsResult = await pool.query(
        "SELECT id FROM sale_installments WHERE sale_id = $1",
        [saleId]
      );
      
      const installmentIds = installmentsResult.rows.map(row => row.id);
      
      if (installmentIds.length === 0) {
        return res.json([]);
      }
      
      // Buscar todos os recibos para essas parcelas
      const receiptsResult = await pool.query(
        `SELECT 
          id, installment_id as "installmentId", receipt_type as "receiptType", 
          receipt_url as "receiptUrl", receipt_data as "receiptData", 
          confirmed_by as "confirmedBy", confirmation_date as "confirmationDate", 
          notes, created_at as "createdAt"
        FROM sale_payment_receipts 
        WHERE installment_id = ANY($1)
        ORDER BY created_at`,
        [installmentIds]
      );
      
      // Log de diagnóstico
      console.log(`Recuperados ${receiptsResult.rows.length} recibos de pagamento para a venda #${saleId}`);
      
      return res.json(receiptsResult.rows);
    } catch (error) {
      console.error("Erro ao buscar recibos de pagamento:", error);
      return res.status(500).json({ error: "Erro ao buscar recibos de pagamento" });
    }
  });
  // ULTRA BYPASS ENDPOINT (27/04/2025)
  // Este endpoint ignora completamente qualquer validação Zod/Drizzle e executa SQL direto
  app.post('/api/ultra-bypass/sales', async (req: Request, res: Response) => {
    console.log("⚡⚡⚡ ULTRA BYPASS ENDPOINT ACIONADO ⚡⚡⚡");
    
    try {
      // Verificar autenticação
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Não autenticado" });
      }
      
      // Obter dados do body
      const userData = req.body;
      console.log("⚡⚡⚡ ULTRA BYPASS: Dados recebidos:", JSON.stringify(userData, null, 2));
      
      // Validação manual mínima
      if (!userData.customerId || !userData.serviceTypeId) {
        return res.status(400).json({ 
          error: "Dados incompletos", 
          message: "Cliente e tipo de serviço são obrigatórios" 
        });
      }
      
      // Determinar vendedor
      const effectiveSellerId = (["admin", "supervisor", "operacional", "financeiro"].includes(req.user?.role || "") && userData.sellerId) 
        ? userData.sellerId 
        : req.user!.id;
      
      // 1. INSERIR VENDA - sem nenhuma validação ou transformação
      const orderNumber = userData.orderNumber || `OS-${Date.now()}`;
      const totalAmount = userData.totalAmount ? String(userData.totalAmount).replace(',', '.') : "0";
      const numInstallments = Number(userData.installments || 1);
      const notes = userData.notes || "";
      
      // Inserção direta SQL da venda
      console.log("⚡⚡⚡ ULTRA BYPASS: Inserindo venda no banco...");
      
      const result = await pool.query(`
        INSERT INTO sales (
          order_number, date, customer_id, payment_method_id, service_type_id, 
          seller_id, installments, total_amount, status, financial_status, notes, 
          created_at, updated_at
        ) 
        VALUES (
          $1, NOW(), $2, $3, $4, $5, $6, $7, 'pending', 'pending', $8, NOW(), NOW()
        )
        RETURNING *
      `, [
        orderNumber,
        userData.customerId,
        userData.paymentMethodId || 1,
        userData.serviceTypeId,
        effectiveSellerId,
        numInstallments,
        totalAmount,
        notes
      ]);
      
      if (result.rows.length === 0) {
        throw new Error("Falha ao inserir venda no banco de dados");
      }
      
      const createdSale = result.rows[0];
      console.log("⚡⚡⚡ ULTRA BYPASS: Venda criada com ID:", createdSale.id);
      
      // 2. INSERIR PARCELAS (se houver)
      if (numInstallments > 1) {
        console.log("⚡⚡⚡ ULTRA BYPASS: Criando parcelas...");
        
        // Calcular valor de cada parcela
        const totalValue = parseFloat(totalAmount);
        const installmentValue = (totalValue / numInstallments).toFixed(2);
        
        // Array de datas de vencimento
        const installmentDates = userData.installmentDates && 
          Array.isArray(userData.installmentDates) && 
          userData.installmentDates.length === numInstallments 
            ? userData.installmentDates 
            : Array.from({ length: numInstallments }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() + i);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              });
        
        console.log("⚡⚡⚡ ULTRA BYPASS: Datas das parcelas:", installmentDates);
        
        // Inserir cada parcela no banco
        for (let i = 0; i < numInstallments; i++) {
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
        
        console.log(`⚡⚡⚡ ULTRA BYPASS: ${numInstallments} parcelas criadas`);
      }
      
      // 3. INSERIR ITENS (se houver)
      if (userData.items && Array.isArray(userData.items)) {
        console.log("⚡⚡⚡ ULTRA BYPASS: Inserindo itens...");
        
        for (const item of userData.items) {
          if (item.serviceId) {
            await pool.query(`
              INSERT INTO sale_items (
                sale_id, service_id, service_type_id, quantity, price, 
                notes, created_at, updated_at
              ) 
              VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            `, [
              createdSale.id,
              item.serviceId,
              item.serviceTypeId || userData.serviceTypeId,
              item.quantity || 1,
              item.price || "0",
              item.notes || null
            ]);
          }
        }
      }
      
      // 4. REGISTRAR HISTÓRICO
      await pool.query(`
        INSERT INTO sales_status_history (
          sale_id, from_status, to_status, user_id, notes, created_at
        )
        VALUES ($1, '', 'pending', $2, $3, NOW())
      `, [
        createdSale.id,
        req.user!.id,
        'Venda criada via bypass'
      ]);
      
      // 5. NOTIFICAR WEBSOCKET (se possível)
      try {
        // @ts-ignore
        if (global.notifySalesUpdate) {
          // @ts-ignore
          global.notifySalesUpdate();
        }
      } catch (wsError) {
        console.error("⚡⚡⚡ ULTRA BYPASS: Erro ao notificar WebSocket:", wsError);
      }
      
      // Retornar sucesso
      console.log("⚡⚡⚡ ULTRA BYPASS: Operação concluída com sucesso ⚡⚡⚡");
      res.status(201).json({
        ...createdSale,
        _bypassToken: generateBypassToken()
      });
      
    } catch (error) {
      console.error("⚡⚡⚡ ULTRA BYPASS ERRO:", error);
      res.status(500).json({ 
        error: "Erro ao criar venda via bypass", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  // Rota de diagnóstico para verificar como as datas estão sendo armazenadas no banco
  app.get("/api/debug/installments-dates", async (req, res) => {
    try {
      // Verificar a estrutura da tabela
      const tableSchema = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'sale_installments'
        ORDER BY ordinal_position
      `);
      
      // Buscar alguns exemplos de parcelas para verificar o formato das datas
      const installmentsResult = await pool.query(`
        SELECT id, saleId, installmentNumber, 
               dueDate, 
               TO_CHAR(dueDate::date, 'YYYY-MM-DD') as dueDate_formatted,
               amount, status, notes, createdAt
        FROM sale_installments
        LIMIT 10
      `);
      
      res.json({ 
        tableSchema: tableSchema.rows,
        installments: installmentsResult.rows
      });
    } catch (error) {
      console.error("Erro ao buscar informações de debug:", error);
      res.status(500).json({ error: "Erro ao buscar informações de debug" });
    }
  });
  
  // Rota para definir datas exatas nas parcelas
  app.post("/api/sales/:id/set-installments-exact", async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      const { dates, values } = req.body;
      
      if (!Array.isArray(dates) || !Array.isArray(values)) {
        return res.status(400).json({ error: "As datas e valores devem ser arrays" });
      }
      
      if (dates.length !== values.length) {
        return res.status(400).json({ error: "Os arrays de datas e valores devem ter o mesmo tamanho" });
      }
      
      // Primeiro, excluir parcelas existentes
      await pool.query(`
        DELETE FROM sale_installments 
        WHERE sale_id = $1
      `, [saleId]);
      
      console.log(`[DEBUG] Excluídas parcelas existentes da venda ${saleId}`);
      
      // Inserir novas parcelas com as datas exatas
      const installments = [];
      
      for (let i = 0; i < dates.length; i++) {
        const installmentNumber = i + 1;
        const dueDate = dates[i]; // Usar a data exatamente como recebida
        const amount = values[i];
        
        console.log(`[DEBUG] Inserindo parcela ${installmentNumber}: Data=${dueDate}, Valor=${amount}`);
        
        // Inserir usando SQL nativo para evitar qualquer conversão automática de data
        const result = await pool.query(`
          INSERT INTO sale_installments (
            sale_id, installment_number, due_date, amount, status, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, 'pendente', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          ) RETURNING id, sale_id as "saleId", installment_number as "installmentNumber", 
            due_date as "dueDate",
            amount, status
        `, [saleId, installmentNumber, dueDate, amount]);
        
        const installment = result.rows[0];
        console.log(`[DEBUG] Parcela inserida: ${JSON.stringify(installment)}`);
        
        installments.push(installment);
      }
      
      res.status(200).json({ 
        success: true, 
        message: `${installments.length} parcelas definidas com sucesso`, 
        installments 
      });
    } catch (error) {
      console.error("Erro ao definir parcelas com datas exatas:", error);
      res.status(500).json({ error: "Erro ao definir parcelas com datas exatas" });
    }
  });

  // Substituir a rota existente de GET /api/sales/:id/installments
  app.get("/api/sales/:id/installments", async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      
      if (isNaN(saleId)) {
        return res.status(400).json({ error: "ID de venda inválido" });
      }
      
      // Usar SQL nativo para buscar as parcelas com controle preciso do formato da data
      const result = await pool.query(`
        SELECT 
          id, 
          sale_id as "saleId", 
          installment_number as "installmentNumber", 
          due_date as "dueDate", 
          payment_date as "paymentDate",
          amount, 
          status, 
          notes
        FROM sale_installments
        WHERE sale_id = $1
        ORDER BY installment_number
      `, [saleId]);
      
      const installments = result.rows;
      
      // Log para diagnóstico
      console.log(`[DEBUG] Buscando parcelas da venda ${saleId}:`);
      installments.forEach(p => {
        console.log(`[DEBUG] Parcela ${p.installmentNumber}: dueDate=${p.dueDate}, paymentDate=${p.paymentDate || 'null'}`);
      });
      
      res.json(installments);
    } catch (error) {
      console.error("Erro ao buscar parcelas da venda:", error);
      res.status(500).json({ error: "Erro ao buscar parcelas da venda" });
    }
  });
}
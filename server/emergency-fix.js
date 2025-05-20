// SOLUÇÃO DE EMERGÊNCIA PARA O PROBLEMA DE VENDAS (27/04/2025)
// Este arquivo contém uma implementação extremamente simplificada
// para resolver o problema de cadastro de vendas com parcelas.

const express = require('express');
const { Pool } = require('pg');

// Conexão com o banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Função para gerar número sequencial para OS
function generateOrderNumber() {
  return `OS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Configurar o roteador de emergência
function setupEmergencyRouter(app) {
  console.log('🚨 INICIANDO SOLUÇÃO DE EMERGÊNCIA PARA VENDAS 🚨');
  
  // Rota especial de emergência para criar vendas
  app.post('/api/emergency/sales', async (req, res) => {
    // Verificar autenticação
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    
    console.log('🚨 EMERGÊNCIA: Tentativa de criar venda');
    
    const client = await pool.connect();
    
    try {
      // Iniciar transação
      await client.query('BEGIN');
      
      const data = req.body;
      console.log('Dados recebidos:', JSON.stringify(data, null, 2));
      
      // Validação mínima
      if (!data.customerId) {
        throw new Error('Cliente é obrigatório');
      }
      
      // Preparar dados básicos da venda
      const orderNumber = data.orderNumber || generateOrderNumber();
      const customerId = data.customerId;
      const sellerId = data.sellerId || req.user.id;
      const serviceTypeId = data.serviceTypeId || null;
      const paymentMethodId = data.paymentMethodId || 1;
      const totalAmount = data.totalAmount || '0';
      const installments = parseInt(data.installments || '1', 10);
      const notes = data.notes || '';
      
      // Inserir venda
      const saleResult = await client.query(`
        INSERT INTO sales (
          order_number, 
          date, 
          customer_id, 
          payment_method_id, 
          service_type_id,
          seller_id, 
          installments, 
          total_amount, 
          status, 
          financial_status, 
          notes,
          created_at, 
          updated_at
        ) VALUES (
          $1, NOW(), $2, $3, $4, $5, $6, $7, 'pending', 'pending', $8, NOW(), NOW()
        ) RETURNING *
      `, [
        orderNumber,
        customerId,
        paymentMethodId,
        serviceTypeId,
        sellerId,
        installments,
        totalAmount,
        notes
      ]);
      
      const sale = saleResult.rows[0];
      console.log('Venda criada:', sale);
      
      // Processar itens, se houver
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        for (const item of data.items) {
          if (!item.serviceId) continue;
          
          await client.query(`
            INSERT INTO sale_items (
              sale_id,
              service_id,
              service_type_id,
              quantity,
              price,
              total_price,
              status,
              notes,
              created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, 'pending', $7, NOW()
            )
          `, [
            sale.id,
            item.serviceId,
            item.serviceTypeId || serviceTypeId,
            item.quantity || 1,
            item.price || '0',
            item.totalPrice || item.price || '0',
            item.notes || null
          ]);
        }
        console.log(`${data.items.length} itens processados`);
      }
      
      // Processar parcelas
      if (installments > 1) {
        // Obter datas das parcelas
        let dates = [];
        
        if (data.installmentDates && Array.isArray(data.installmentDates) && 
            data.installmentDates.length === installments) {
          dates = data.installmentDates;
        } else {
          // Gerar datas mensais automaticamente
          const baseDate = new Date();
          for (let i = 0; i < installments; i++) {
            const dueDate = new Date(baseDate);
            dueDate.setMonth(baseDate.getMonth() + i);
            const dateStr = dueDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            dates.push(dateStr);
          }
        }
        
        // Calcular valor das parcelas
        const totalValue = parseFloat(totalAmount);
        const installmentValue = (totalValue / installments).toFixed(2);
        
        // Inserir cada parcela
        for (let i = 0; i < installments; i++) {
          await client.query(`
            INSERT INTO sale_installments (
              sale_id,
              installment_number,
              due_date,
              amount,
              status,
              created_at,
              updated_at
            ) VALUES (
              $1, $2, $3, $4, 'pending', NOW(), NOW()
            )
          `, [
            sale.id,
            i + 1,
            dates[i],
            installmentValue
          ]);
        }
        console.log(`${installments} parcelas criadas com sucesso`);
      }
      
      // Registrar histórico
      await client.query(`
        INSERT INTO sales_status_history (
          sale_id,
          from_status,
          to_status,
          user_id,
          notes,
          created_at
        ) VALUES (
          $1, '', 'pending', $2, 'Venda criada (emergência)', NOW()
        )
      `, [sale.id, req.user.id]);
      
      // Commit da transação
      await client.query('COMMIT');
      
      console.log('🎉 Venda criada com sucesso via solução de emergência!');
      res.status(201).json({
        success: true,
        sale: sale,
        message: 'Venda criada com sucesso!'
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('🚨 ERRO na criação de emergência:', error);
      res.status(500).json({
        error: 'Erro ao criar venda',
        details: error.message
      });
    } finally {
      client.release();
    }
  });
  
  // Rota de emergência para confirmar pagamento de parcela
  app.post('/api/emergency/installments/:id/confirm', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    
    const installmentId = parseInt(req.params.id, 10);
    if (isNaN(installmentId)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    
    const { paymentDate, notes } = req.body;
    
    try {
      // Atualizar o status da parcela
      const result = await pool.query(`
        UPDATE sale_installments
        SET 
          status = 'paid',
          payment_date = $1,
          notes = $2,
          updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [paymentDate, notes, installmentId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Parcela não encontrada" });
      }
      
      res.json({
        success: true,
        installment: result.rows[0],
        message: 'Pagamento confirmado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      res.status(500).json({
        error: 'Erro ao confirmar pagamento',
        details: error.message
      });
    }
  });
  
  // Rota de emergência para listar todas as vendas
  app.get('/api/emergency/sales', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    
    try {
      const result = await pool.query(`
        SELECT s.*, c.name as customer_name, u.username as seller_name
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.seller_id = u.id
        ORDER BY s.created_at DESC
        LIMIT 100
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar vendas:', error);
      res.status(500).json({
        error: 'Erro ao listar vendas',
        details: error.message
      });
    }
  });
  
  // Rota de emergência para obter detalhes de uma venda
  app.get('/api/emergency/sales/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    
    const saleId = parseInt(req.params.id, 10);
    if (isNaN(saleId)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    
    try {
      // Obter a venda
      const saleResult = await pool.query(`
        SELECT s.*, c.name as customer_name, u.username as seller_name
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.seller_id = u.id
        WHERE s.id = $1
      `, [saleId]);
      
      if (saleResult.rows.length === 0) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }
      
      const sale = saleResult.rows[0];
      
      // Obter parcelas
      const installmentsResult = await pool.query(`
        SELECT * FROM sale_installments
        WHERE sale_id = $1
        ORDER BY installment_number
      `, [saleId]);
      
      // Obter itens
      const itemsResult = await pool.query(`
        SELECT si.*, s.name as service_name
        FROM sale_items si
        LEFT JOIN services s ON si.service_id = s.id
        WHERE si.sale_id = $1
      `, [saleId]);
      
      res.json({
        sale,
        installments: installmentsResult.rows,
        items: itemsResult.rows
      });
      
    } catch (error) {
      console.error('Erro ao obter detalhes da venda:', error);
      res.status(500).json({
        error: 'Erro ao obter detalhes da venda',
        details: error.message
      });
    }
  });
  
  // Rota de emergência para listar parcelas de uma venda
  app.get('/api/emergency/sales/:id/installments', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    
    const saleId = parseInt(req.params.id, 10);
    if (isNaN(saleId)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    
    try {
      const result = await pool.query(`
        SELECT * FROM sale_installments
        WHERE sale_id = $1
        ORDER BY installment_number
      `, [saleId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar parcelas:', error);
      res.status(500).json({
        error: 'Erro ao listar parcelas',
        details: error.message
      });
    }
  });
  
  console.log('🚨 ROTAS DE EMERGÊNCIA CONFIGURADAS COM SUCESSO 🚨');
}

module.exports = { setupEmergencyRouter };
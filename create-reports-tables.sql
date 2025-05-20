-- Criar tabela de relatórios
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  query TEXT NOT NULL,
  parameters JSONB,
  permissions VARCHAR(255) NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Criar tabela de execuções de relatórios
CREATE TABLE IF NOT EXISTS report_executions (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  parameters JSONB,
  execution_time FLOAT,
  status VARCHAR(50) NOT NULL,
  results JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Criar relatórios pré-definidos para diferentes perfis de usuário

-- Relatório para Admin - Visão Geral de Vendas por Status
INSERT INTO reports (name, description, type, query, parameters, permissions, created_by)
VALUES (
  'Visão Geral de Vendas',
  'Resumo consolidado de todas as vendas, agrupadas por status',
  'table',
  'SELECT status, COUNT(*) as quantidade, SUM(total_amount::numeric) as valor_total, AVG(total_amount::numeric) as valor_medio FROM sales GROUP BY status ORDER BY COUNT(*) DESC',
  '{}',
  'admin,supervisor,financeiro',
  1
);

-- Relatório para Vendedores - Suas Vendas
INSERT INTO reports (name, description, type, query, parameters, permissions, created_by)
VALUES (
  'Minhas Vendas do Período',
  'Lista de vendas por período para o vendedor atual',
  'table',
  'SELECT s.id, s.order_number, s.date, c.name as cliente, st.name as tipo_servico, s.total_amount, s.status, s.financial_status FROM sales s LEFT JOIN customers c ON s.customer_id = c.id LEFT JOIN service_types st ON s.service_type_id = st.id WHERE s.seller_id = :sellerId AND s.date BETWEEN :dataInicial AND :dataFinal ORDER BY s.date DESC',
  '{"dataInicial": {"type": "date", "required": true}, "dataFinal": {"type": "date", "required": true}}',
  'admin,supervisor,vendedor',
  1
);

-- Relatório para Financeiro - Análise de Pagamentos
INSERT INTO reports (name, description, type, query, parameters, permissions, created_by)
VALUES (
  'Análise de Pagamentos',
  'Situação financeira das vendas com detalhes de pagamentos e parcelas',
  'table',
  'SELECT s.id, s.order_number, s.date, c.name as cliente, u.username as vendedor, s.total_amount, COUNT(i.id) as total_parcelas, SUM(CASE WHEN i.status = ''paid'' THEN i.amount::numeric ELSE 0 END) as valor_pago, SUM(CASE WHEN i.status = ''pending'' THEN i.amount::numeric ELSE 0 END) as valor_pendente FROM sales s LEFT JOIN customers c ON s.customer_id = c.id LEFT JOIN users u ON s.seller_id = u.id LEFT JOIN sale_installments i ON s.id = i.sale_id WHERE s.date BETWEEN :dataInicial AND :dataFinal GROUP BY s.id, s.order_number, s.date, c.name, u.username, s.total_amount ORDER BY s.date DESC',
  '{"dataInicial": {"type": "date", "required": true}, "dataFinal": {"type": "date", "required": true}}',
  'admin,financeiro',
  1
);

-- Relatório para Operacional - Serviços Entregues
INSERT INTO reports (name, description, type, query, parameters, permissions, created_by)
VALUES (
  'Serviços Entregues',
  'Lista de serviços entregues no período',
  'table',
  'SELECT s.id, s.order_number, s.date, c.name as cliente, sp.name as prestador, st.name as tipo_servico, COUNT(si.id) as qtd_itens FROM sales s LEFT JOIN customers c ON s.customer_id = c.id LEFT JOIN service_providers sp ON s.service_provider_id = sp.id LEFT JOIN service_types st ON s.service_type_id = st.id LEFT JOIN sale_items si ON s.id = si.sale_id WHERE s.status = ''completed'' AND s.date BETWEEN :dataInicial AND :dataFinal GROUP BY s.id, s.order_number, s.date, c.name, sp.name, st.name ORDER BY s.date DESC',
  '{"dataInicial": {"type": "date", "required": true}, "dataFinal": {"type": "date", "required": true}}',
  'admin,operacional',
  1
);

-- Relatório para Todos - Histórico de Status
INSERT INTO reports (name, description, type, query, parameters, permissions, created_by)
VALUES (
  'Histórico de Status',
  'Acompanhamento das mudanças de status de uma venda específica',
  'table',
  'SELECT h.created_at, h.from_status, h.to_status, u.username as usuario, h.notes FROM sales_status_history h LEFT JOIN users u ON h.user_id = u.id WHERE h.sale_id = :vendaId ORDER BY h.created_at',
  '{"vendaId": {"type": "number", "required": true}}',
  'admin,supervisor,vendedor,financeiro,operacional',
  1
);

-- Relatório para Admin e Supervisor - Desempenho de Vendedores
INSERT INTO reports (name, description, type, query, parameters, permissions, created_by)
VALUES (
  'Desempenho de Vendedores',
  'Análise comparativa do desempenho dos vendedores',
  'table',
  'SELECT u.username as vendedor, COUNT(s.id) as total_vendas, SUM(s.total_amount::numeric) as valor_total, AVG(s.total_amount::numeric) as ticket_medio, COUNT(CASE WHEN s.status = ''completed'' THEN 1 END) as vendas_concluidas, COUNT(CASE WHEN s.status = ''returned'' THEN 1 END) as vendas_devolvidas FROM users u LEFT JOIN sales s ON u.id = s.seller_id WHERE u.role = ''vendedor'' AND (s.date IS NULL OR s.date BETWEEN :dataInicial AND :dataFinal) GROUP BY u.username ORDER BY SUM(s.total_amount::numeric) DESC NULLS LAST',
  '{"dataInicial": {"type": "date", "required": true}, "dataFinal": {"type": "date", "required": true}}',
  'admin,supervisor',
  1
);
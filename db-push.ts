import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, customers, services, serviceTypes, serviceProviders, sales, saleItems, salesStatusHistory, costTypes, saleOperationalCosts, saleInstallments, salePaymentReceipts } from './shared/schema';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { users, customers, services, serviceTypes, serviceProviders, sales, saleItems, salesStatusHistory, costTypes, saleOperationalCosts, saleInstallments, salePaymentReceipts } });

  console.log('Creating users table...');
  
  // Criar tabela users com SQL direto para evitar problemas com drizzle-kit push
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user'
    );
  `);
  
  console.log('Users table created successfully!');
  
  console.log('Creating customers table...');
  
  // Criar tabela customers com SQL direto para evitar problemas com drizzle-kit push
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      document TEXT NOT NULL,
      document_type TEXT NOT NULL DEFAULT 'cpf',
      contact_name TEXT,
      phone TEXT NOT NULL,
      phone2 TEXT,
      email TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id)
    );
  `);
  
  console.log('Customers table created successfully!');
  
  console.log('Creating services table...');
  
  // Criar tabela services com SQL direto para evitar problemas com drizzle-kit push
  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at INTEGER NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))
    );
  `);

  console.log('Services table created successfully!');
  
  console.log('Creating service_types table...');
  
  // Criar tabela service_types com SQL direto para evitar problemas com drizzle-kit push
  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_types (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at INTEGER NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))
    );
  `);

  console.log('Service Types table created successfully!');
  
  console.log('Creating service_providers table...');
  
  // Criar tabela service_providers com SQL direto para evitar problemas com drizzle-kit push
  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_providers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      document TEXT NOT NULL,
      document_type TEXT NOT NULL DEFAULT 'cpf',
      contact_name TEXT,
      phone TEXT NOT NULL,
      phone2 TEXT,
      email TEXT NOT NULL,
      address TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  console.log('Service Providers table created successfully!');
  
  console.log('Creating sales table...');
  
  // Criar tabela sales
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      order_number TEXT NOT NULL,
      date DATE NOT NULL,
      customer_id INTEGER NOT NULL,
      payment_method_id INTEGER NOT NULL,
      seller_id INTEGER NOT NULL,
      service_type_id INTEGER REFERENCES service_types(id),
      service_provider_id INTEGER REFERENCES service_providers(id),
      total_amount TEXT NOT NULL DEFAULT '0',
      installments INTEGER NOT NULL DEFAULT 1,
      installment_value TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      execution_status TEXT NOT NULL DEFAULT 'pending',
      financial_status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      return_reason TEXT,
      responsible_operational_id INTEGER,
      responsible_financial_id INTEGER,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  console.log('Sales table created successfully!');
  
  console.log('Creating sale_items table...');
  
  // Criar tabela sale_items
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      service_type_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  console.log('Sale Items table created successfully!');
  
  console.log('Creating sales_status_history table...');
  
  // Criar tabela sales_status_history
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales_status_history (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL,
      from_status TEXT NOT NULL,
      to_status TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  console.log('Sales Status History table created successfully!');
  
  console.log('Creating cost_types table...');
  
  // Criar tabela cost_types
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cost_types (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  console.log('Cost Types table created successfully!');
  
  console.log('Creating sale_operational_costs table...');
  
  // Criar tabela sale_operational_costs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sale_operational_costs (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      cost_type_id INTEGER REFERENCES cost_types(id),
      amount NUMERIC NOT NULL,
      date DATE NOT NULL,
      responsible_id INTEGER NOT NULL,
      service_provider_id INTEGER,
      notes TEXT,
      payment_receipt_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  console.log('Sale Operational Costs table created successfully!');
  
  console.log('Creating payment_methods table...');
  
  // Criar tabela payment_methods
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at INTEGER NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()))
    );
  `);
  
  console.log('Payment Methods table created successfully!');
  
  console.log('Creating sale_installments table...');
  
  // Criar tabela sale_installments
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sale_installments (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL REFERENCES sales(id),
      installment_number INTEGER NOT NULL,
      amount NUMERIC NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_date TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
  
  console.log('Sale Installments table created successfully!');
  
  console.log('Creating sale_payment_receipts table...');
  
  // Criar tabela sale_payment_receipts
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sale_payment_receipts (
      id SERIAL PRIMARY KEY,
      installment_id INTEGER NOT NULL REFERENCES sale_installments(id),
      receipt_type TEXT NOT NULL,
      receipt_url TEXT,
      receipt_data JSONB,
      confirmed_by INTEGER NOT NULL REFERENCES users(id),
      confirmation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
  
  console.log('Sale Payment Receipts table created successfully!');
  
  await pool.end();
}

main().catch(e => {
  console.error('Error running migration:', e);
  process.exit(1);
});
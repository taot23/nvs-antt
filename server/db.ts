import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Função para registrar logs de depuração detalhados
export async function logDebug(module: string, message: string, data: any = {}) {
  try {
    await pool.query(
      `INSERT INTO debug_logs (module, message, data) VALUES ($1, $2, $3)`,
      [module, message, JSON.stringify(data)]
    );
    console.log(`[${module}] ${message}`);
  } catch (error) {
    console.error(`Erro ao registrar log de depuração:`, error);
  }
}

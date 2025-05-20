import { db } from "./server/db";
import { users } from "./shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  const hashedPassword = await hashPassword("admin123");
  
  try {
    // Verificar se o usuário já existe
    const existingUsers = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (existingUsers.length > 0) {
      console.log("Usuário administrador já existe:", existingUsers[0]);
      return;
    }
    
    // Criar novo usuário admin
    const [user] = await db
      .insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
        role: "admin"
      })
      .returning();
    
    console.log("Usuário administrador criado com sucesso:", user);
    
    // Criar usuário vendedor para testes
    const sellerPassword = await hashPassword("vendedor123");
    
    const [seller] = await db
      .insert(users)
      .values({
        username: "vendedor",
        password: sellerPassword,
        role: "vendedor"
      })
      .returning();
      
    console.log("Usuário vendedor criado com sucesso:", seller);
    
  } catch (error) {
    console.error("Erro ao criar usuários:", error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
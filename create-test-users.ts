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

async function createTestUsers() {
  try {
    // Lista de perfis de usuários para criar
    const userProfiles = [
      { username: "financeiro", password: "financeiro123", role: "financeiro" },
      { username: "operacional", password: "operacional123", role: "operacional" },
      { username: "supervisor", password: "supervisor123", role: "supervisor" }
    ];
    
    for (const profile of userProfiles) {
      // Verificar se o usuário já existe
      const existingUsers = await db.select().from(users).where(eq(users.username, profile.username));
      
      if (existingUsers.length > 0) {
        console.log(`Usuário ${profile.username} já existe:`, existingUsers[0]);
        continue;
      }
      
      // Criar usuário
      const hashedPassword = await hashPassword(profile.password);
      
      const [user] = await db
        .insert(users)
        .values({
          username: profile.username,
          password: hashedPassword,
          role: profile.role
        })
        .returning();
        
      console.log(`Usuário ${profile.username} criado com sucesso:`, user);
    }
    
    // Listar todos os usuários para confirmar
    const allUsers = await db.select().from(users);
    console.log("\nTodos os usuários no sistema:");
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role})`);
    });
    
  } catch (error) {
    console.error("Erro ao criar usuários:", error);
  } finally {
    process.exit(0);
  }
}

createTestUsers();
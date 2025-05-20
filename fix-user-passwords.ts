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

async function updateUserPassword(username: string) {
  try {
    // Encontrar o usuário pelo nome
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    
    if (!user) {
      console.log(`Usuário ${username} não encontrado`);
      return;
    }
    
    // Hashear a senha
    const hashedPassword = await hashPassword("123456");
    
    // Atualizar o usuário
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));
    
    console.log(`Senha do usuário ${username} (${user.role}) corrigida com sucesso`);
  } catch (error) {
    console.error(`Erro ao atualizar senha do usuário ${username}:`, error);
  }
}

async function fixUserPasswords() {
  try {
    // Atualizar cada usuário individualmente
    await updateUserPassword("teste");
    await updateUserPassword("operacional");
    await updateUserPassword("supervisor");
    await updateUserPassword("vendedor");
    await updateUserPassword("financeiro");
    await updateUserPassword("usuario");
    await updateUserPassword("admin");
    
    console.log("Processo concluído!");
  } catch (error) {
    console.error("Erro geral ao corrigir senhas:", error);
  } finally {
    process.exit(0);
  }
}

// Executar a função
fixUserPasswords();
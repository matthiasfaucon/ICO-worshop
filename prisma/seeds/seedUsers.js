import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid"; // Génération d'UUID

const prisma = new PrismaClient();
function generateRandomEmail() {
  const randomString = Math.random().toString(36).substring(2, 12);
  return `${randomString}@example.com`;
}

function generateRandomUsername() {
  return `User_${Math.random().toString(36).substring(2, 10)}`;
}

export async function seedUsers() {
  console.log("Peuplement des utilisateurs...");
  const hashedPassword = await bcrypt.hash("test", 10);
 
  const users = Array.from({ length: 3 }, () => ({
    id: uuidv4(),
    username: generateRandomUsername(),
    email: generateRandomEmail(),
    password: hashedPassword,
    role: "USER",
    session_uuid: uuidv4(),
    is_logged: Math.random() < 0.5, // Aléatoire entre true et false
    created_at: new Date(),
    updated_at: new Date(),
  }));

  for (const user of users) {
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          username: user.username || null, 
          email: user.email || null, 
          password: user.password || null, 
          role: user.role,
          session_uuid: user.session_uuid,
          is_logged: user.is_logged,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      console.error(`Erreur lors de la création de l'utilisateur ${user.id}:`, error);
    }
  }

  console.log("Peuplement des utilisateurs terminé !");
}

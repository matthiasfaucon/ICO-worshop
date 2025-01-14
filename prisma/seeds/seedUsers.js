import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log("Peuplement des utilisateurs...");

  const users = [
    {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      username: "Admin",
      email: "admin@example.com",
      password: "adminpassword",
      role: "ADMIN",
      session_uuid: "00000000-0000-0000-0000-000000000001", 
      is_logged: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        username: "User1",
        email: "user1@example.com",
        password: "user1password",
        role: "USER",
        is_logged: true,
        session_uuid: "00000000-0000-0000-0000-000000000002", 
      },
    {
      id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      username: null, 
      email: null, 
      password: null,
      role: "USER",
      session_uuid: "00000000-0000-0000-0000-000000000003",
      is_logged: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

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

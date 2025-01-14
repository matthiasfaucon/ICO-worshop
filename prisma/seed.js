import { seedUsers } from "./seeds/seedUsers.js";
import { seedCards } from "./seeds/seedCard.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("Démarrage du peuplement des données...");
  await seedUsers(); 
  await seedCards(); 
  console.log("Peuplement terminé !");
}

seed()
  .catch((e) => {
    console.error("Erreur lors du peuplement :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

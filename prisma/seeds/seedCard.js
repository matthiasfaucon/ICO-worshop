import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedCards() {
  console.log("Peuplement des cartes...");

  const cards = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      type: "ROLE",
      name: "Marin",
      description: "Un membre loyal de l'équipage travaillant à transporter le trésor en sécurité.",
      effect: "Ne peut jouer que des cartes 'Île'.",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      type: "ROLE",
      name: "Pirate",
      description: "Un membre trompeur essayant d'empoisonner l'équipage et de voler le trésor.",
      effect: "Peut jouer des cartes 'Poison' ou 'Île'.",
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      type: "ROLE",
      name: "Sirène",
      description: "Une entité mystérieuse qui gagne si les Pirates se trompent en essayant de l'identifier.",
      effect: "Joue des cartes 'Île' et révèle son identité si les Pirates votent incorrectement.",
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      type: "ACTION",
      name: "Poison",
      description: "Empoisonne l'équipage, donnant un point aux Pirates.",
      effect: "Utilisée par les Pirates pour perturber l'équipage.",
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      type: "ACTION",
      name: "Île",
      description: "Assure un voyage sûr pour l'équipage.",
      effect: "Trois cartes 'Île' donnent un point aux Marins et à la Sirène.",
    },
  ];

  for (const card of cards) {
    await prisma.card.upsert({
      where: { id: card.id },
      update: {},
      create: card,
    });
  }

  console.log("Cartes peuplées avec succès !");
}

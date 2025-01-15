import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedGameRules() {
  console.log("Peuplement des règles...");

  const gameRules = [
    {
        "id": "0fa41ea0-d523-409e-9177-821033924a8a",
        "key": "game-goals",
        "value": "Le jeu repose sur une mécanique de points. Les marins et la sirène marquent des points en jouant des cartes « ÎLE » et en progressant vers leur destination. Les pirates, de leur côté, marquent en empoisonnant l’équipage. La partie se termine lorsqu’une équipe remporte dix manches. Si les marins gagnent, la sirène triomphe également. Si les pirates l’emportent, ils doivent identifier la sirène lors d’un vote final. Si la majorité se trompe, la sirène gagne seule.",
        "description": "",
        "updated_by": "07a6a8b2-15bb-4894-b27d-4498ceeabfc2",
        "updated_at": "2025-01-14T19:00:00.000Z",
        "name": "But du jeu",
        "type": "GLOBAL",
        "order": 2
    },
    {
        "id": "320f8b03-31b2-4f6e-b56b-4a62455ad4b3",
        "key": "min-round-to-win",
        "value": "5",
        "description": "C'est le nombre minimum de manche pour gagner",
        "updated_by": "07a6a8b2-15bb-4894-b27d-4498ceeabfc2",
        "updated_at": "2025-01-14T19:17:09.636Z",
        "name": "Nombre de manches minimum pour gagner",
        "type": "SPECIFIC",
        "order": 2
    },
    {
        "id": "484505a1-e82b-47c7-9343-35710462c0ba",
        "key": "intro",
        "value": "Le jeu commence par une mise en situation. Un groupe de marins transporte un trésor à travers des eaux dangereuses. Cependant, parmi eux se cachent des pirates déterminés à s’emparer du butin. Les joueurs incarnent différents rôles, chacun ayant un objectif spécifique. Les marins et la sirène doivent collaborer pour déjouer les plans des pirates et protéger le trésor. En revanche, les pirates doivent infiltrer l’équipage, gagner leur confiance et utiliser des cartes « POISON » pour saboter leurs efforts.",
        "description": "",
        "updated_by": "07a6a8b2-15bb-4894-b27d-4498ceeabfc2",
        "updated_at": "2025-01-14T19:21:20.673Z",
        "name": "Introduction",
        "type": "GLOBAL",
        "order": 1
    },
    {
        "id": "6d894558-35fa-4101-9013-3256dfe842b8",
        "key": "min-player",
        "value": "7",
        "description": "Le minimum de joueur",
        "updated_by": "07a6a8b2-15bb-4894-b27d-4498ceeabfc2",
        "updated_at": "2025-01-14T19:15:04.149Z",
        "name": "Mininum de joueur",
        "type": "SPECIFIC",
        "order": 4
    },
    {
        "id": "8371f4dc-20d7-431d-957f-f2f006235f2a",
        "key": "action-card-impact",
        "value": "Les cartes d’action jouent un rôle central dans le jeu. Les cartes « ÎLE » sont essentielles pour les marins, tandis que les cartes « POISON » sont l’arme principale des pirates. D’autres cartes, comme « MAL DE MER » ou « ANTIDOTE », modifient les conditions d’une manche en influençant les équipages ou en annulant des effets adverses.",
        "description": "",
        "updated_by": "07a6a8b2-15bb-4894-b27d-4498ceeabfc2",
        "updated_at": "2025-01-14T19:30:32.496Z",
        "name": "Cartes d’action et leur impact",
        "type": "GLOBAL",
        "order": 4
    },
    {
        "id": "8eab4ff9-2aec-4688-bed5-02922d8624aa",
        "key": "materials-and-cards",
        "value": "Le jeu utilise plusieurs types de cartes pour structurer les parties. Les cartes de rôle déterminent si un joueur est marin, pirate ou la sirène. D’autres cartes, comme les cartes d’action (« ÎLE », « POISON », etc.) ou les cartes bonus (« OBSERVATEUR », « CHARLATAN », etc.), ajoutent des possibilités stratégiques. Les cartes sont distribuées au début selon le nombre de joueurs et déterminent les actions disponibles.",
        "description": "",
        "updated_by": "07a6a8b2-15bb-4894-b27d-4498ceeabfc2",
        "updated_at": "2025-01-14T19:23:27.793Z",
        "name": "Matériel et cartes",
        "type": "GLOBAL",
        "order": 3
    },
    {
        "id": "a346313c-beba-472f-9947-40b87921fbc1",
        "key": "advice-for-players",
        "value": "Chaque rôle bénéficie de conseils spécifiques. Les marins doivent observer attentivement les comportements pour démasquer les pirates et reconnaître leurs alliés. Les pirates doivent semer le doute et parfois jouer des cartes favorables aux marins pour gagner leur confiance. La sirène, quant à elle, doit maintenir un équilibre délicat en soutenant les marins tout en semant la confusion chez les pirates, augmentant ainsi ses chances de victoire individuelle.",
        "description": "",
        "updated_by": "07a6a8b2-15bb-4894-b27d-4498ceeabfc2",
        "updated_at": "2025-01-14T19:33:07.412Z",
        "name": "Conseils pour les joueurs",
        "type": "GLOBAL",
        "order": 7
    },
    {
        "id": "a5abae51-b8ce-4564-baa8-644b0e0537dd",
        "key": "bonus-and-strategy",
        "value": "Les cartes bonus offrent une dimension supplémentaire de stratégie. Elles peuvent être utilisées à des moments précis pour bouleverser le déroulement de la partie. Par exemple, la carte « OBSERVATEUR » permet de vérifier secrètement une carte d’un autre joueur, tandis que « TRIBORD » change le sens du jeu. Ces cartes permettent des retournements imprévus et favorisent les stratégies individuelles.",
        "description": "",
        "updated_by": "07a6a8b2-15bb-4894-b27d-4498ceeabfc2",
        "updated_at": "2025-01-14T19:32:20.854Z",
        "name": "Cartes bonus et stratégies avancées",
        "type": "GLOBAL",
        "order": 6
    },
    {
        "id": "c7841f78-5805-42b3-bee1-cc13f494b7eb",
        "key": "max-round-to-win",
        "value": "10",
        "description": "",
        "updated_by": "07a6a8b2-15bb-4894-b27d-4498ceeabfc2",
        "updated_at": "2025-01-15T10:45:07.083Z",
        "name": "Nombre de manches maximum pour gagner",
        "type": "SPECIFIC",
        "order": 3
    },
    {
        "id": "ce9105f9-61e2-4291-b240-2a2a7a5ab9d4",
        "key": "max-player",
        "value": "20",
        "description": "Le maximum de joueur",
        "updated_by": "07a6a8b2-15bb-4894-b27d-4498ceeabfc2",
        "updated_at": "2025-01-14T19:15:54.664Z",
        "name": "Maximum de joueur",
        "type": "SPECIFIC",
        "order": 1
    },
    {
        "id": "d2e3272d-670d-46cf-854f-d7c2025c5982",
        "key": "game-steps",
        "value": "La partie débute par une phase de mise en place. Le capitaine est désigné pour distribuer les rôles et superviser le début du jeu. Les pirates et la sirène se reconnaissent en ouvrant les yeux, tandis que les marins restent dans l’ignorance. Pendant chaque manche, un équipage de trois personnes est choisi. Chaque membre joue secrètement une carte parmi celles disponibles : « ÎLE » ou « POISON ». Les résultats des manches sont déterminés par les cartes jouées. Si toutes les cartes sont des « ÎLE », les marins marquent un point. Sinon, les pirates remportent la manche avec une carte « POISON ». Les manches se succèdent avec des votes et des choix tactiques jusqu’à la fin de la partie.",
        "description": "",
        "updated_by": "07a6a8b2-15bb-4894-b27d-4498ceeabfc2",
        "updated_at": "2025-01-14T19:24:17.366Z",
        "name": "Déroulement de la partie",
        "type": "GLOBAL",
        "order": 5
    }
]

  for (const oneGameRule of gameRules) {
    await prisma.gameRule.upsert({
      where: { id: oneGameRule.id },
      update: {},
      create: oneGameRule,
    });
  }

  console.log("Peuplement des règles terminé !");
}

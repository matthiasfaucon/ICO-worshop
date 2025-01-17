import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const gameCode = params.code;

  try {
    console.log("Requête reçue pour lancer la partie avec le code :", gameCode);

    const body = await req.json().catch(() => null); // Attrape les erreurs JSON
    if (!body || !body.sessionUuid) {
      return NextResponse.json(
        { message: "Le corps de la requête est invalide ou manquant." },
        { status: 400 }
      );
    }

    const { sessionUuid } = body;

    // Récupérer la partie et ses joueurs
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: { players: true },
    });

    if (!game) {
      console.error("Partie introuvable pour le code :", gameCode);
      return NextResponse.json(
        { message: "Partie introuvable." },
        { status: 404 }
      );
    }

    console.log("Partie trouvée :", game);

    const hostPlayer = game.players.find((player) => player.is_host);
    if (!hostPlayer || hostPlayer.session_uuid !== sessionUuid) {
      console.error("Hôte non autorisé ou session UUID incorrecte.");
      return NextResponse.json(
        { message: "Seul l'hôte peut lancer la partie." },
        { status: 403 }
      );
    }

    console.log("Hôte identifié :", hostPlayer);

    const totalPlayers = game.players.length;

    const rolesDistribution = {
      marins: Math.max(
        0,
        totalPlayers - Math.floor((totalPlayers - 1) / 3) - 1
      ),
      pirates: Math.floor((totalPlayers - 1) / 3),
      sirene: 1,
    };

    console.log("Distribution des rôles :", rolesDistribution);

    // Mélanger les joueurs pour garantir une distribution aléatoire
    const shuffledPlayers = [...game.players].sort(() => Math.random() - 0.5);

    const assignedPlayers = shuffledPlayers.map((player, index) => {
      let role: string;

      // Assigner les rôles en fonction des quantités restantes dans rolesDistribution
      if (rolesDistribution.pirates > 0) {
        role = "pirate";
        rolesDistribution.pirates--;
      } else if (rolesDistribution.marins > 0) {
        role = "marin";
        rolesDistribution.marins--;
      } else if (rolesDistribution.sirene > 0) {
        role = "sirene";
        rolesDistribution.sirene--;
      } else {
        throw new Error("Distribution des rôles incorrecte.");
      }

      console.log(`Assignation : ${player.username} reçoit le rôle ${role}`);

      return {
        ...player,
        role,
        is_captain: index === 0, // Premier joueur devient capitaine
      };
    });

    console.log("Joueurs assignés :", assignedPlayers);

    const currentCaptain = assignedPlayers.find((player) => player.is_captain);

    if (!currentCaptain) {
      console.error("Erreur : Aucun capitaine n'a été assigné.");
      return NextResponse.json(
        { message: "Erreur lors de l'assignation du capitaine." },
        { status: 500 }
      );
    }

    // Initialiser le score
    const initialScore = { marins: 0, pirates: 0 };

    // Mettre à jour les joueurs, le champ current_captain_id et le score dans la base de données
    await prisma.$transaction([
      ...assignedPlayers.map((player) =>
        prisma.player.update({
          where: { id: player.id },
          data: {
            role: player.role,
            is_captain: player.is_captain,
          },
        })
      ),
      prisma.game.update({
        where: { id: game.id },
        data: {
          current_captain_id: currentCaptain.id,
          score: initialScore,
        },
      }),
    ]);

    console.log(
      "Rôles, capitaine et score mis à jour dans la base de données."
    );

    // Notification via Pusher
    await pusher.trigger(`game-${gameCode}`, "game-started", {
      message: "La partie a commencé !",
      players: assignedPlayers.map(({ id, username, role, is_captain }) => ({
        id,
        username,
        role,
        is_captain,
      })),
      currentCaptain: currentCaptain.username,
      score: initialScore,
    });

    console.log("Événement envoyé via Pusher.");

    return NextResponse.json({ message: "La partie a commencé !" });
  } catch (error) {
    console.error("Erreur lors du lancement de la partie :", error);
    return NextResponse.json(
      { message: "Erreur serveur. Impossible de lancer la partie." },
      { status: 500 }
    );
  }
}

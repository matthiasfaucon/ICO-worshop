import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const gameCode = await params.code;

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

    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: { players: true },
    });

    if (!game) {
      console.error("Partie introuvable pour le code :", gameCode);
      return NextResponse.json({ message: "Partie introuvable." }, { status: 404 });
    }

    console.log("Partie trouvée :", game);

    const hostPlayer = game.players.find((player) => player.is_host);
    if (!hostPlayer) {
      console.error("Aucun hôte trouvé pour la partie :", gameCode);
      return NextResponse.json(
        { message: "Seul l'hôte peut lancer la partie." },
        { status: 403 }
      );
    }

    console.log("Hôte identifié :", hostPlayer);

    const totalPlayers = game.players.length;
    console.log("Nombre total de joueurs :", totalPlayers);

    if (totalPlayers < 7 || totalPlayers > 20) {
      console.error(
        "Nombre de joueurs invalide :", totalPlayers,
        "Code de la partie :", gameCode
      );
      return NextResponse.json(
        { message: "Le nombre de joueurs doit être entre 7 et 20." },
        { status: 400 }
      );
    }

    // Rôles et distribution
    const rolesDistribution = {
      marin: Math.max(0, totalPlayers - 3),
      pirate: Math.min(9, Math.floor(totalPlayers / 3)),
      sirène: 1,
    };
    console.log("Distribution des rôles :", rolesDistribution);

    const shuffledPlayers = [...game.players].sort(() => Math.random() - 0.5);
    let assignedPlayers = shuffledPlayers.map((player) => {
      const role = Object.keys(rolesDistribution).find((role) => rolesDistribution[role] > 0)!;
      rolesDistribution[role]--;
      console.log(`Assignation : ${player.nickname} reçoit le rôle ${role}`);

      return { ...player, role };
    });

    // Assigner l'hôte comme capitaine
    assignedPlayers = assignedPlayers.map((player) => ({
      ...player,
      is_captain: player.id === hostPlayer.id, // Définir le capitaine comme étant l'hôte
    }));

    console.log("Joueurs assignés :", assignedPlayers);

    await Promise.all(
      assignedPlayers.map((player) =>
        prisma.player.update({
          where: { id: player.id },
          data: { role: player.role, is_captain: player.is_captain },
        })
      )
    );

    console.log("Rôles et capitaine mis à jour dans la base de données.");

    await pusher.trigger(`game-${gameCode}`, "game-started", {
      message: "La partie a commencé !",
      players: assignedPlayers.map(({ id, nickname, role, is_captain }) => ({
        id,
        nickname,
        role,
        is_captain,
      })),
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

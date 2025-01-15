import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const gameCode =await params.code;

  try {
    const body = await req.json();
    const { sessionUuid } = body;

    // Vérifier si la partie existe
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json({ message: "Partie introuvable." }, { status: 404 });
    }

    // Vérifier si l'utilisateur est l'hôte
    const hostPlayer = game.players.find((player) => player.is_host);
   
    if (!hostPlayer) {
      return NextResponse.json(
        { message: "Seul l'hôte peut lancer la partie." },
        { status: 403 }
      );
    }

    // Vérifier le nombre de joueurs
    const totalPlayers = game.players.length;
    if (totalPlayers < 7 || totalPlayers > 20) {
      return NextResponse.json(
        { message: "Le nombre de joueurs doit être entre 7 et 20." },
        { status: 400 }
      );
    }

    // Définir les rôles selon les règles du jeu
    const rolesDistribution: { [role: string]: number } = {
      marin: Math.max(0, totalPlayers - 3), // Nombre restant de joueurs après pirates et sirène
      pirate: Math.min(9, Math.floor(totalPlayers / 3)), // Environ 1/3 des joueurs
      sirène: 1, // Toujours une seule sirène
    };

    // Mélanger les joueurs aléatoirement
    const shuffledPlayers = [...game.players].sort(() => Math.random() - 0.5);
    let assignedPlayers = shuffledPlayers.map((player) => {
      const role = Object.keys(rolesDistribution).find((role) => rolesDistribution[role] > 0)!;
      rolesDistribution[role]--;
      return { ...player, role };
    });

    // Sélectionner un capitaine au hasard parmi les joueurs
    const captain = assignedPlayers[Math.floor(Math.random() * assignedPlayers.length)];
    assignedPlayers = assignedPlayers.map((player) => ({
      ...player,
      is_captain: player.id === captain.id,
    }));

    // Mettre à jour les rôles et le capitaine dans la base de données
    await Promise.all(
      assignedPlayers.map((player) =>
        prisma.player.update({
          where: { id: player.id },
          data: { role: player.role, is_captain: player.is_captain },
        })
      )
    );

    // Notifier tous les joueurs via Pusher
    await pusher.trigger(`game-${gameCode}`, "game-started", {
      message: "La partie a commencé !",
      players: assignedPlayers.map(({ id, nickname, role, is_captain }) => ({
        id,
        nickname,
        role,
        is_captain,
      })),
    });

    return NextResponse.json({ message: "La partie a commencé !" });
  } catch (error) {
    console.error("Erreur lors du lancement de la partie :", error);
    return NextResponse.json(
      { message: "Erreur serveur. Impossible de lancer la partie." },
      { status: 500 }
    );
  }
}

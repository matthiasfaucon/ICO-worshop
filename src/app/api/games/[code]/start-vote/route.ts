import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const gameCode = params.code;

  try {
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json({ message: "Partie introuvable." }, { status: 404 });
    }

    // Vérifiez si l'équipage a bien été sélectionné
    const crewSelected = await prisma.player.findMany({
      where: { game_id: game.id, is_in_crew: true },
    });

    if (crewSelected.length === 0) {
      return NextResponse.json(
        { message: "Aucun équipage sélectionné. Impossible de lancer le vote." },
        { status: 400 }
      );
    }

    // Envoyer un événement Pusher pour passer tout le monde à l'écran de vote
    await pusher.trigger(`game-${gameCode}`, "start-vote", {
      message: "Votez pour l'équipage proposé.",
      crew: crewSelected.map((player) => ({ id: player.id, username: player.username })),
    });

    return NextResponse.json({ message: "Vote lancé avec succès." });
  } catch (error) {
    console.error("Erreur lors du lancement du vote :", error);
    return NextResponse.json(
      { message: "Erreur interne lors du lancement du vote." },
      { status: 500 }
    );
  }
}

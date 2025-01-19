import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const gameCode = params.code;

    // Récupérer la partie
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: { players: true, turns: true },
    });

    if (!game) {
      return NextResponse.json(
        { message: "Partie introuvable." },
        { status: 404 }
      );
    }

    const currentTurn = game.turns.find(
      (turn) => turn.turn_number === game.current_turn
    );

    if (!currentTurn) {
      return NextResponse.json(
        { message: "Tour actuel introuvable." },
        { status: 400 }
      );
    }

    // Récupérer les votes
    const votes = await prisma.vote.findMany({
      where: { turn_id: currentTurn.id },
    });

    const yesVotes = votes.filter((v) => v.is_approved).length;
    const noVotes = votes.length - yesVotes;

    // Vérifier la majorité des votes
    if (yesVotes <= noVotes) {
      return NextResponse.json(
        { message: "Les votes ne sont pas majoritairement favorables." },
        { status: 400 }
      );
    }

    
    // Notifier les joueurs via Pusher
    await pusher.trigger(`game-${gameCode}`, "vote-success", {
      message: "L'équipage a été validé. Passage au tour suivant.",
    });

    return NextResponse.json({
      message: "L'équipage a été validé avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors du traitement des votes favorables :", error);
    return NextResponse.json(
      { message: "Erreur interne lors du traitement des votes." },
      { status: 500 }
    );
  }
}

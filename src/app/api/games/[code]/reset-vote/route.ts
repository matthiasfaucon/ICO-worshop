import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const gameCode = await params.code;

    // Récupérer la partie
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json(
        { message: "Partie introuvable pour le code fourni." },
        { status: 404 }
      );
    }

    const { players, current_turn } = game;

    if (!current_turn) {
      return NextResponse.json(
        { message: "Tour actuel introuvable pour la partie." },
        { status: 400 }
      );
    }

    // Récupérer le tour actuel
    const currentTurn = await prisma.turn.findFirst({
      where: {
        game_id: game.id,
        turn_number: current_turn,
      },
    });

    if (!currentTurn) {
      return NextResponse.json(
        { message: "UUID introuvable pour le tour actuel." },
        { status: 400 }
      );
    }

    // Vérifier les votes
    const totalVotes = await prisma.vote.count({
      where: { turn_id: currentTurn.id },
    });
    const totalPlayers = players.length;

    if (totalVotes !== totalPlayers) {
      return NextResponse.json(
        { message: "Tous les joueurs n'ont pas encore voté." },
        { status: 400 }
      );
    }

    // Calcul des votes "oui"
    const yesVotes = await prisma.vote.count({
      where: { turn_id: currentTurn.id, is_approved: true },
    });
    const majority = Math.ceil(totalPlayers / 2);

    if (yesVotes >= majority) {
      // L'équipage est validé
      await prisma.game.update({
        where: { id: game.id },
        data: { status: "TRAVEL" },
      });

      await pusher.trigger(`game-${gameCode}`, "crew-approved", {
        message: "L'équipage a été validé et peut voyager.",
      });

      return NextResponse.json({
        message: "L'équipage a été validé et peut voyager.",
      });
    } else {
      // L'équipage est rejeté, déclencher la réinitialisation via Pusher
      const currentCaptain = await prisma.player.findFirst({
        where: { game_id: game.id, is_captain: true },
      });

      if (!currentCaptain) {
        return NextResponse.json(
          { message: "Capitaine actuel introuvable." },
          { status: 400 }
        );
      }

      await pusher.trigger(`game-${gameCode}`, "crew-rejected", {
        message:
          "L'équipage a été rejeté. Le capitaine doit proposer un nouvel équipage avec au moins un membre différent.",
        captainSessionUuid: currentCaptain.session_uuid,
      });

      return NextResponse.json({
        message:
          "L'équipage a été rejeté. Le capitaine doit proposer un nouvel équipage avec au moins un membre différent.",
        captainSessionUuid: currentCaptain.session_uuid,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la finalisation du tour :", error);
    return NextResponse.json(
      { message: "Erreur serveur. Impossible de finaliser le tour." },
      { status: 500 }
    );
  }
}

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

    const { players, current_turn: currentTurnNumber } = game;

    if (!currentTurnNumber) {
      return NextResponse.json(
        { message: "Tour actuel introuvable." },
        { status: 400 }
      );
    }

    // Récupérer le tour actuel
    const currentTurn = await prisma.turn.findFirst({
      where: {
        game_id: game.id,
        turn_number: currentTurnNumber,
      },
    });

    if (!currentTurn) {
      return NextResponse.json(
        { message: "Tour introuvable." },
        { status: 400 }
      );
    }

    // Récupérer les votes
    const votes = await prisma.vote.findMany({
      where: { turn_id: currentTurn.id },
    });

    const totalVotes = votes.length;
    const yesVotes = votes.filter((vote) => vote.is_approved).length;
    const noVotes = totalVotes - yesVotes;

    if (yesVotes >= noVotes) {
      return NextResponse.json(
        { message: "Les votes ne sont pas majoritairement défavorables." },
        { status: 400 }
      );
    }
    await prisma.vote.deleteMany({
        where: { turn_id: currentTurn.id },
      });
    // Vérifier si c'est le premier rejet
    const existingRejections = currentTurn.status === "REJECTED" ? 1 : 0;

    if (existingRejections === 0) {
      // Premier rejet : permettre de proposer un nouvel équipage
      await prisma.turn.update({
        where: { id: currentTurn.id },
        data: { status: "REJECTED" },
      });

      // Réinitialiser l'équipage pour permettre une nouvelle sélection
      await prisma.player.updateMany({
        where: { game_id: game.id },
        data: { is_in_crew: false },
      });

      // Notifier les joueurs via Pusher
      await pusher.trigger(`game-${gameCode}`, "vote-rejected", {
        message: "L'équipage a été rejeté. Le capitaine doit proposer un nouvel équipage.",
      });

      return NextResponse.json({
        message: "Premier rejet enregistré. Le capitaine peut proposer un nouvel équipage.",
      });
    } else {
      // Deuxième rejet : passer au joueur suivant
      const currentCaptainIndex = game.players.findIndex(
        (p) => p.is_captain
      );
      const nextCaptainIndex =
        (currentCaptainIndex + 1) % game.players.length;

      const nextCaptain = game.players[nextCaptainIndex];

      await prisma.$transaction([
        
        prisma.player.updateMany({
            where: { game_id: game.id },
            data: { is_captain: false },
          }),
        prisma.player.updateMany({
            where: { game_id: game.id },
            data: { is_in_crew: false },
          }),
        prisma.player.update({
          where: { id: nextCaptain.id },
          data: { is_captain: true },
        }),
        prisma.game.update({
            where: { id: game.id },
            data: { current_captain_id: nextCaptain.id },
          }),
      ]);

      // Notifier les joueurs via Pusher
      await pusher.trigger(`game-${gameCode}`, "vote-failed", {
        message: "Deuxième rejet enregistré. Passage au prochain capitaine.",
        captainSessionUuid: nextCaptain.session_uuid,
        nextCaptainUsername: nextCaptain.username,
      });

      return NextResponse.json({
        message:
          "Deuxième rejet enregistré. Le tour passe au prochain capitaine.",
        nextCaptain: nextCaptain.username,
      });
    }
  } catch (error) {
    console.error("Erreur lors du traitement des votes défavorables :", error);
    return NextResponse.json(
      { message: "Erreur interne lors du traitement des votes." },
      { status: 500 }
    );
  }
}

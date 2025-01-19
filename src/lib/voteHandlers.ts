import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";
import { NextResponse } from "next/server"; // Import correct

export async function handleVoteYes(gameCode: string, game: any, turn: any) {
  try {
    await prisma.$transaction([
      prisma.turn.update({
        where: { id: turn.id },
        data: { status: "COMPLETED" },
      }),
      prisma.player.updateMany({
        where: {
          game_id: game.id,
          is_in_crew: true,
        },
        data: { is_in_crew: false }, // Réinitialiser l'équipage
      }),
    ]);

    // Notifier les joueurs via Pusher
    await pusher.trigger(`game-${gameCode}`, "vote-success", {
      message: "L'équipage a été validé. Passage au tour suivant.",
    });

    return NextResponse.json({
      message: "L'équipage a été validé avec succès.",
      nextTurnNumber: game.current_turn + 1,
    });
  } catch (error) {
    console.error("Erreur dans handleVoteYes :", error);
    return NextResponse.json(
      { message: "Erreur interne lors de la validation de l'équipage." },
      { status: 500 }
    );
  }
}

export async function handleVoteNo(gameCode: string, game: any, turn: any) {
  try {
    const existingRejections = turn.status === "REJECTED" ? 1 : 0;

    if (existingRejections === 0) {
      // Premier rejet
      await prisma.turn.update({
        where: { id: turn.id },
        data: { status: "REJECTED" },
      });

      await prisma.player.updateMany({
        where: { game_id: game.id },
        data: { is_in_crew: false },
      });

      await pusher.trigger(`game-${gameCode}`, "vote-rejected", {
        message: "L'équipage a été rejeté. Le capitaine doit proposer un nouvel équipage.",
      });

      return NextResponse.json({
        message: "Premier rejet enregistré. Le capitaine peut proposer un nouvel équipage.",
      });
    } else {
      // Deuxième rejet : Passage au prochain capitaine
      const currentCaptainIndex = game.players.findIndex((p: { is_captain: any; }) => p.is_captain);
      const nextCaptainIndex =
        (currentCaptainIndex + 1) % game.players.length;

      const nextCaptain = game.players[nextCaptainIndex];

      await prisma.$transaction([
        prisma.turn.update({
          where: { id: turn.id },
          data: { status: "COMPLETED" },
        }),
        prisma.player.updateMany({
          where: { game_id: game.id },
          data: { is_in_crew: false },
        }),
        prisma.player.updateMany({
          where: { game_id: game.id },
          data: { is_captain: false },
        }),
        prisma.player.update({
          where: { id: nextCaptain.id },
          data: { is_captain: true },
        }),
        prisma.game.update({
          where: { id: game.id },
          data: { current_turn: game.current_turn + 1 },
        }),
      ]);

      await pusher.trigger(`game-${gameCode}`, "vote-failed", {
        message: "Deuxième rejet enregistré. Passage au prochain capitaine.",
        nextCaptain: nextCaptain.username,
      });

      return NextResponse.json({
        message: "Deuxième rejet enregistré. Le tour passe au prochain capitaine.",
        nextCaptain: nextCaptain.username,
      });
    }
  } catch (error) {
    console.error("Erreur dans handleVoteNo :", error);
    return NextResponse.json(
      { message: "Erreur interne lors du rejet de l'équipage." },
      { status: 500 }
    );
  }
}

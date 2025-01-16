import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const gameCode = params.code;

  try {
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: {
        players: true,
        votes: {
          where: { turn_id: game.current_turn }, // Votes du tour actuel
        },
      },
    });

    if (!game) {
      return NextResponse.json({ message: "Partie introuvable." }, { status: 404 });
    }

    const votes = game.votes;
    const totalVotes = votes.length;
    const yesVotes = votes.filter((vote) => vote.is_approved).length;
    const noVotes = totalVotes - yesVotes;

    console.log(`Votes pour l'équipage : Oui (${yesVotes}), Non (${noVotes})`);

    const totalPlayers = game.players.length;
    const majority = Math.ceil(totalPlayers / 2);

    if (yesVotes >= majority) {
      // L'équipage est validé
      await prisma.game.update({
        where: { id: game.id },
        data: { status: "IN_PROGRESS" },
      });

      // Lancer un nouveau tour
      await prisma.turn.create({
        data: {
          game_id: game.id,
          turn_number: game.current_turn,
          status: "IN_PROGRESS",
        },
      });

      await prisma.game.update({
        where: { id: game.id },
        data: { current_turn: game.current_turn + 1 },
      });

      await pusher.trigger(`game-${gameCode}`, "crew-approved", {
        message: "L'équipage a été validé. Le tour commence.",
      });

      return NextResponse.json({ message: "L'équipage a été validé et le tour a commencé." });
    } else if (totalVotes === totalPlayers) {
      // Tous les joueurs ont voté et l'équipage est rejeté
      await prisma.player.updateMany({
        where: { game_id: game.id },
        data: { is_in_crew: false },
      });

      await pusher.trigger(`game-${gameCode}`, "crew-rejected", {
        message: "L'équipage a été rejeté. Le capitaine doit refaire un choix.",
      });

      return NextResponse.json({ message: "L'équipage a été rejeté. Recommencez." });
    }

    return NextResponse.json({ message: "Votes en cours.", yesVotes, noVotes });
  } catch (error) {
    console.error("Erreur lors de la vérification des votes :", error);
    return NextResponse.json(
      { message: "Erreur interne lors de la vérification des votes." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const gameCode = params.code;

  try {
    const body = await req.json();

    if (!body || !body.sessionUuid || !Array.isArray(body.selectedPlayers)) {
      return NextResponse.json(
        { message: "Requête invalide. 'sessionUuid' et 'selectedPlayers' sont requis." },
        { status: 400 }
      );
    }

    const { sessionUuid, selectedPlayers } = body;

    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: { players: true, turns: true },
    });

    if (!game) {
      return NextResponse.json({ message: "Partie introuvable." }, { status: 404 });
    }

    const captain = game.players.find(
      (player) => player.is_captain && player.session_uuid === sessionUuid
    );

    if (!captain) {
      return NextResponse.json(
        { message: "Seul le capitaine peut effectuer cette action." },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (prisma) => {
      // Réinitialiser les joueurs de l'équipage précédent
      await prisma.player.updateMany({
        where: { game_id: game.id },
        data: { is_in_crew: false },
      });

      // Ajouter les joueurs sélectionnés dans le nouvel équipage
      await prisma.player.updateMany({
        where: {
          id: { in: selectedPlayers },
          game_id: game.id,
        },
        data: { is_in_crew: true },
      });

      // Créer un nouveau tour s'il n'existe pas pour `current_turn`
      const existingTurn = game.turns.find(
        (turn) => turn.turn_number === game.current_turn
      );

      if (!existingTurn) {
        await prisma.turn.create({
          data: {
            game_id: game.id,
            turn_number: game.current_turn,
            status: "IN_PROGRESS",
          },
        });
      }
    });

    // Envoyer un événement via Pusher pour rediriger les joueurs
    await pusher.trigger(`game-${gameCode}`, "redirect-to-vote", {
      message: "Le capitaine a validé l'équipage. Passons au vote.",
      crew: selectedPlayers,
    });

    return NextResponse.json({
      message: "Équipage validé. Redirection vers le vote.",
      crew: selectedPlayers,
    });
  } catch (error) {
    console.error("Erreur lors de la validation de l'équipage :", error);
    return NextResponse.json({ message: "Erreur interne du serveur." }, { status: 500 });
  }
}

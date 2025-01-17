import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const gameCode = await params.code;

  try {
    const body = await req.json();

    // Vérification de la requête
    if (!body || !body.sessionUuid || !Array.isArray(body.selectedPlayers)) {
      return NextResponse.json(
        {
          message:
            "Requête invalide. 'sessionUuid' et 'selectedPlayers' sont requis.",
        },
        { status: 400 }
      );
    }

    const { sessionUuid, selectedPlayers } = body;

    // Récupérer la partie et les joueurs
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

    // Vérification du capitaine
    const captain = game.players.find(
      (player) => player.is_captain && player.session_uuid === sessionUuid
    );
    console.log(captain);

    if (!captain) {
      return NextResponse.json(
        { message: "Seul le capitaine peut effectuer cette action." },
        { status: 403 }
      );
    }

    // Vérifier si c'est le premier tour
    const isFirstTurn = game.current_turn === 1;
    // Transaction pour mettre à jour l'équipage et les tours
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

    // Rediriger les joueurs non sélectionnés vers la page d'attente
    const nonSelectedPlayers = game.players.filter(
      (player) => !selectedPlayers.includes(player.id)
    );
    console.log(nonSelectedPlayers);
    console.log("chioisie voyahe" + selectedPlayers);
    await Promise.all(
      nonSelectedPlayers.map((player) =>
        pusher.trigger(`player-${player.session_uuid}`, "redirect-to-waiting", {
          message:
            "Vous êtes dans la salle d'attente en attendant la fin du voyage.",
        })
      )
    );

    // Redirection selon le tour
    if (isFirstTurn) {
      await pusher.trigger(`game-${gameCode}`, "redirect-to-trip", {
        message: "Premier tour : l'équipage commence directement le voyage.",
        crew: selectedPlayers,
      });

      return NextResponse.json({
        message: "Premier tour : redirection vers le voyage.",
        isFirstTurn: true,
        crew: selectedPlayers,
      });
    } else {
      await pusher.trigger(`game-${gameCode}`, "redirect-to-vote", {
        message: "Le capitaine a validé l'équipage. Passons au vote.",
        crew: selectedPlayers,
      });

      return NextResponse.json({
        message: "Équipage validé. Redirection vers le vote.",
        crew: selectedPlayers,
        isFirstTurn: false,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la validation de l'équipage :", error);
    return NextResponse.json(
      {
        message: "Erreur interne du serveur.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

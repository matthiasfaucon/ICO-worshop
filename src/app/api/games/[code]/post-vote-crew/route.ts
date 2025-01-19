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
    if (!body || !Array.isArray(body.selectedPlayers)) {
      return NextResponse.json(
        { message: "'selectedPlayers' est requis." },
        { status: 400 }
      );
    }

    const { selectedPlayers } = body;

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

    // Vérifier si le vote a validé l'équipage
    const currentTurn = game.turns.find(
      (turn) => turn.turn_number === game.current_turn
    );

   

    // Transaction pour gérer la mise à jour de l'équipage
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


    });

    // Notifier les joueurs via Pusher
    const nonSelectedPlayers = game.players.filter(
      (player) => !selectedPlayers.includes(player.id)
    );

    await Promise.all([
      // Notifier les joueurs non sélectionnés
      ...nonSelectedPlayers.map((player) =>
        pusher.trigger(`player-${player.session_uuid}`, "redirect-to-waiting", {
          message: "Vous êtes dans la salle d'attente en attendant la fin du voyage.",
        })
      ),

      // Notifier l'équipage sélectionné pour le voyage
      pusher.trigger(`game-${gameCode}`, "redirect-to-trip", {
        message: "L'équipage va commencer son voyage.",
        crew: selectedPlayers,
      }),
    ]);

    return NextResponse.json({
      message: "Mise à jour de l'équipage effectuée avec succès.",
      crew: selectedPlayers,
    });
  } catch (error) {
    console.error("Erreur lors de la gestion post-vote de l'équipage :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur.", error: error.message },
      { status: 500 }
    );
  }
}

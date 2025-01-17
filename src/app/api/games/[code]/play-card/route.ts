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

    if (!body || !body.sessionUuid || !body.card) {
      return NextResponse.json(
        { message: "Requête invalide. 'sessionUuid' et 'card' sont requis." },
        { status: 400 }
      );
    }

    const { sessionUuid, card } = body;

    // Vérifier que la carte est valide
    if (!["island", "poison"].includes(card)) {
      return NextResponse.json({ message: "Carte invalide." }, { status: 400 });
    }

    // Récupérer la partie et le joueur
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

    const player = game.players.find((p) => p.session_uuid === sessionUuid);

    if (!player || !player.is_in_crew) {
      return NextResponse.json(
        { message: "Joueur introuvable ou non dans l'équipage." },
        { status: 403 }
      );
    }

    // Vérifier que le joueur n'a pas déjà joué une carte pour ce tour
    const currentTurn = game.turns.find(
      (t) => t.turn_number === game.current_turn
    );
    if (!currentTurn) {
      return NextResponse.json(
        { message: "Tour actuel introuvable." },
        { status: 400 }
      );
    }

    const existingAction = await prisma.cardAction.findFirst({
      where: { player_id: player.id, turn_id: currentTurn.id },
    });

    if (existingAction) {
      return NextResponse.json(
        { message: "Vous avez déjà joué une carte." },
        { status: 403 }
      );
    }

    // Enregistrer l'action du joueur
    await prisma.cardAction.create({
      data: {
        player_id: player.id,
        game_id: game.id,
        turn_id: currentTurn.id,
        card_id:
          card === "island"
            ? "55555555-5555-5555-5555-555555555555"
            : "44444444-4444-4444-4444-444444444444", // Remplacez par vos IDs de cartes
        type: card,
      },
    });

    // Publier l'action via Pusher
    await pusher.trigger(`game-${gameCode}`, "card-played", {
      playerId: player.id,
      card,
    });

    // Vérifier si tous les joueurs ont joué leur carte
    const crewPlayers = game.players.filter((p) => p.is_in_crew);
    const playedActions = await prisma.cardAction.count({
      where: { turn_id: currentTurn.id },
    });

    if (playedActions === crewPlayers.length) {
      // Toutes les cartes ont été jouées, calculer le résultat
      const allActions = await prisma.cardAction.findMany({
        where: { turn_id: currentTurn.id },
      });

      const poisonCount = allActions.filter(
        (action) => action.type === "poison"
      ).length;
      const islandCount = allActions.filter(
        (action) => action.type === "island"
      ).length;

      const result = poisonCount > 0 ? "pirates" : "marins";

      // Publier le résultat via Pusher
      await pusher.trigger(`game-${gameCode}`, "mission-reveal", {
        result,
      });

      // Mettre à jourst le statut du tour
      await prisma.turn.update({
        where: { id: currentTurn.id },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({ message: "Carte jouée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la sélection de la carte :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

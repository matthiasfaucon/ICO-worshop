import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const gameCode = await params.code;
  console.log("test");
  try {
    const body = await req.json();

    if (!body || !body.sessionUuid) {
      return NextResponse.json(
        { message: "Requête invalide. 'sessionUuid' est requis." },
        { status: 400 }
      );
    }

    const { sessionUuid } = body;

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

    const player = game.players.find((p) => p.session_uuid === sessionUuid);

    if (!player) {
      return NextResponse.json(
        { message: "Joueur introuvable." },
        { status: 403 }
      );
    }

    console.log("ici ceest la");

    // Vérifier le tour actuel
    const currentTurn = game.turns.find(
      (t) => t.turn_number === game.current_turn
    );
    if (!currentTurn) {
      return NextResponse.json(
        { message: "Tour actuel introuvable." },
        { status: 400 }
      );
    }

    console.log("current turn :" + currentTurn);
    console.log("aadfez afdezfazefgeazf la");

    // Récupérer toutes les actions de cartes pour ce tour
    const allActions = await prisma.cardAction.findMany({
      where: { turn_id: currentTurn.id },
    });

    console.log("allactions  " +allActions);

    if (allActions.length === 0) {
      return NextResponse.json(
        { message: "Aucune carte n'a été jouée pour ce tour." },
        { status: 400 }
      );
    }

    
    // Mélanger les cartes pour garantir l'anonymat
    const shuffledActions = allActions.sort(() => Math.random() - 0.5);

    console.log("faeeseses");
    // Calculer le résultat de la mission
    const poisonCount = shuffledActions.filter(
      (action) => action.type === "poison"
    ).length;
    const islandCount = shuffledActions.filter(
      (action) => action.type === "island"
    ).length;

    const result = poisonCount > 0 ? "pirates" : "marins";

    // Mettre à jour le score dans le jeu
    const updatedScore = {
      ...game.score,
      [result]: (game.score[result] || 0) + 1,
    };

    console.log("isotherme");

    // Trouver le prochain capitaine
    const currentCaptainIndex = game.players.findIndex(
      (p) => p.session_uuid === game.current_captain?.session_uuid
    );
    const nextCaptainIndex = (currentCaptainIndex + 1) % game.players.length;
    const nextCaptain = game.players[nextCaptainIndex];

    if (!nextCaptain) {
      return NextResponse.json(
        { message: "Erreur lors de la sélection du prochain capitaine." },
        { status: 500 }
      );
    }

    console.log("Nouveau capitaine session UUID:", nextCaptain.session_uuid);

    // Réinitialiser et mettre à jour les joueurs et le capitaine
    await prisma.$transaction([
      prisma.player.updateMany({
        where: { game_id: game.id },
        data: { is_captain: false, is_in_crew: false },
      }),
      prisma.player.update({
        where: { id: nextCaptain.id },
        data: { is_captain: true },
      }),
      prisma.vote.deleteMany({ where: { game_id: game.id } }),
      prisma.game.update({
        where: { id: game.id },
        data: {
          current_turn: game.current_turn + 1,
          current_captain_id: nextCaptain.id,
          score: updatedScore,
        },
      }),
      prisma.turn.update({
        where: { id: currentTurn.id },
        data: { status: "COMPLETED" },
      }),
    ]);

    console.log("Équipage réinitialisé et tour incrémenté avec succès.");

    // Rediriger les joueurs avec `session_uuid`
    const playerPromises = game.players.map((player) => {
      const event =
        player.session_uuid === nextCaptain.session_uuid
          ? "redirect-to-select-crew"
          : "redirect-to-player-wait";

      return pusher.trigger(`player-${player.session_uuid}`, event, {
        message:
          player.session_uuid === nextCaptain.session_uuid
            ? "Vous êtes le nouveau capitaine. Sélectionnez votre équipage."
            : "Veuillez patienter pendant que le capitaine sélectionne l'équipage.",
      });
    });

    await Promise.all(playerPromises);

    // Publier l'événement via Pusher avec le `session_uuid` du capitaine
    await pusher.trigger(`game-${gameCode}`, "mission-reveal", {
      result,
      shuffledCards: shuffledActions.map((action) => action.type),
      score: updatedScore,
      nextCaptainSessionUuid: nextCaptain.session_uuid,
    });

    console.log("Événement Pusher 'mission-reveal' envoyé avec succès.");

    return NextResponse.json({
      message: "Mission terminée. Prochain tour en cours.",
      result,
      poisonCount,
      islandCount,
      updatedScore,
      nextTurnNumber: game.current_turn + 1,
      nextCaptain: nextCaptain.session_uuid,
    });
  } catch (error) {
    console.error("Erreur lors de la révélation de la mission:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const gameCode = params.code;

    // Récupérer l'UUID de session à partir du cookie
    const sessionUuid = req.cookies.get("session_uuid")?.value;
    if (!sessionUuid) {
      return NextResponse.json(
        { message: "Session UUID manquant." },
        { status: 400 }
      );
    }

    // Récupérer la partie
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: { players: true },
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
        { message: `Tour numéro ${currentTurnNumber} introuvable.` },
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

    // Récupérer le vote de l'utilisateur actuel
    const player = await prisma.player.findFirst({
      where: { session_uuid: sessionUuid, game_id: game.id },
    });

    const playerVote = votes.find((vote) => vote.player_id === player?.id)
      ?.is_approved
      ? "yes"
      : null;

    // Récupérer les joueurs n'ayant pas encore voté
    const votedPlayerIds = votes.map((vote) => vote.player_id);
    const playersYetToVote = players.filter(
      (player) => !votedPlayerIds.includes(player.id)
    );

    // Récupérer l'équipage sélectionné pour ce tour
    const crew = await prisma.player.findMany({
      where: {
        is_in_crew: true,
        game_id: game.id,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return NextResponse.json({
      message: "Données récupérées avec succès.",
      yesVotes,
      noVotes,
      totalVotes,
      totalPlayers: players.length,
      playerVote,
      playersYetToVote: playersYetToVote.map((player) => ({
        id: player.id,
        username: player.username,
      })),
      crew,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des votes :", error);
    return NextResponse.json(
      { message: "Erreur interne lors de la récupération des votes." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  console.log("dfdsfdsf");

  try {
    const gameCode = await params.code;
    const body = await req.json().catch(() => null);

    if (!body || !body.sessionUuid || !body.vote) {
      return NextResponse.json(
        { message: "Requête invalide : Session UUID ou vote manquant." },
        { status: 400 }
      );
    }

    const { sessionUuid, vote } = body;

    // Vérification du joueur et de la partie
    const player = await prisma.player.findFirst({
      where: { session_uuid: sessionUuid, game: { code: gameCode } },
      include: { game: { include: { players: true, turns: true } } },
    });

    if (!player) {
      return NextResponse.json(
        { message: "Joueur introuvable ou non associé à la partie." },
        { status: 404 }
      );
    }

    const currentTurn = player.game?.turns.find(
      (turn) => turn.turn_number === player.game?.current_turn
    );

    if (!currentTurn || !currentTurn.id) {
      return NextResponse.json(
        { message: "Tour actuel introuvable pour la partie." },
        { status: 400 }
      );
    }

    // Recherche ou création du vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        player_id: player.id,
        turn_id: currentTurn.id,
      },
    });

    if (existingVote) {
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { is_approved: vote === "yes" },
      });
    } else {
      await prisma.vote.create({
        data: {
          player_id: player.id,
          game_id: player.game_id,
          turn_id: currentTurn.id,
          is_approved: vote === "yes",
        },
      });
    }

    // Récupérer les votes mis à jour
    const votes = await prisma.vote.findMany({
      where: { turn_id: currentTurn.id },
    });

    const totalVotes = votes.length;
    const yesVotes = votes.filter((v) => v.is_approved).length;
    const noVotes = totalVotes - yesVotes;

    const players = player.game.players;

    const votedPlayerIds = votes.map((v) => v.player_id);
    const playersYetToVote = players.filter(
      (p) => !votedPlayerIds.includes(p.id)
    );

    console.log(players);

    // Publier les mises à jour des votes via Pusher
    await pusher.trigger(`game-${gameCode}`, "vote-updated", {
      yesVotes,
      noVotes,
      totalVotes,
      totalPlayers: players.length,
      playersYetToVote: playersYetToVote.map((p) => ({
        id: p.id,
        username: p.username,
      })),
    });

    return NextResponse.json({
      message: "Vote enregistré et mis à jour avec succès.",
      yesVotes,
      noVotes,
      totalVotes,
      totalPlayers: players.length,
      playersYetToVote: playersYetToVote.map((p) => ({
        id: p.id,
        username: p.username,
      })),
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement ou de la mise à jour des votes :",
      error
    );
    return NextResponse.json(
      { message: "Erreur serveur. Impossible de traiter le vote." },
      { status: 500 }
    );
  }
}

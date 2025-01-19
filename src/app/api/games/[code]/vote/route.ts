import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const gameCode = await params.code;

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

    const currentTurn = await prisma.turn.findFirst({
      where: {
        game_id: game.id,
        turn_number: game.current_turn,
      },
    });

    if (!currentTurn) {
      return NextResponse.json(
        { message: "Tour actuel introuvable." },
        { status: 400 }
      );
    }

    const votes = await prisma.vote.findMany({
      where: { turn_id: currentTurn.id },
    });

    const totalVotes = votes.length;
    const yesVotes = votes.filter((v) => v.is_approved).length;
    const noVotes = totalVotes - yesVotes;

    const playersYetToVote = game.players.filter(
      (p) => !votes.map((v) => v.player_id).includes(p.id)
    );

    return NextResponse.json({
      message: "Votes récupérés avec succès.",
      yesVotes,
      noVotes,
      totalVotes,
      totalPlayers: game.players.length,
      playersYetToVote: playersYetToVote.map((p) => ({
        id: p.id,
        username: p.username,
      })),
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
  try {

    console.log("route vote");
    const gameCode = await params.code;
    const body = await req.json();

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

    const game = player.game;
    const currentTurn = game.turns.find(
      (turn) => turn.turn_number === game.current_turn
    );

    if (!currentTurn) {
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

    const playersYetToVote = game.players.filter(
      (p) => !votes.map((v) => v.player_id).includes(p.id)
    );

    // Mise à jour en temps réel via Pusher
    await pusher.trigger(`game-${gameCode}`, "vote-updated", {
      yesVotes,
      noVotes,
      totalVotes,
      totalPlayers: game.players.length,
      playersYetToVote: playersYetToVote.map((p) => ({
        id: p.id,
        username: p.username,
      })),
    });

    console.log("nombre totale de votes :  " + totalVotes);
    console.log("nombres joeuurs " + game.players.length);


    // Vérifiez si tous les joueurs ont voté
    if (totalVotes === game.players.length) {
      if (yesVotes > noVotes) {
        const endpoint = `/api/games/${gameCode}/vote-yes`;
    
        const response = await fetch(new URL(endpoint, req.url), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionUuid }), // Inclure sessionUuid si nécessaire
        });
    
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            message: "Votes terminés, logique 'Oui' déclenchée.",
            ...data,
          });
        } else {
          const errorData = await response.json();
          console.error("Erreur dans vote-yes :", errorData);
          return NextResponse.json(
            { message: "Erreur dans vote-yes.", ...errorData },
            { status: response.status }
          );
        }
      } else {
        const endpoint = `/api/games/${gameCode}/vote-no`;
    
        const response = await fetch(new URL(endpoint, req.url), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionUuid }),
        });
    
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            message: "Votes terminés, logique 'Non' déclenchée.",
            ...data,
          });
        } else {
          const errorData = await response.json();
          console.error("Erreur dans vote-no :", errorData);
          return NextResponse.json(
            { message: "Erreur dans vote-no.", ...errorData },
            { status: response.status }
          );
        }
      }
    }
    
    return NextResponse.json({
      message: "Vote enregistré et mis à jour avec succès.",
      yesVotes,
      noVotes,
      totalVotes,
      totalPlayers: game.players.length,
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

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const gameCode = params.code;

  try {
    const body = await req.json();

    if (!body || !body.sessionUuid) {
      return NextResponse.json(
        { message: "Requête invalide. 'sessionUuid' est requis." },
        { status: 400 }
      );
    }

    const { sessionUuid } = body;

    // Récupérer la partie et ses joueurs
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

    // Identifier le joueur actuel à partir de `sessionUuid`
    const player = game.players.find((p) => p.session_uuid === sessionUuid);

    if (!player) {
      return NextResponse.json(
        { message: "Joueur introuvable." },
        { status: 403 }
      );
    }

    // Trouver l'index du capitaine actuel
    const currentCaptainIndex = game.players.findIndex(
      (p) => p.id === game.current_captain_id
    );

    if (currentCaptainIndex === -1) {
      return NextResponse.json(
        { message: "Capitaine actuel introuvable." },
        { status: 400 }
      );
    }

    // Calculer l'index du prochain capitaine (cyclique)
    const nextCaptainIndex = (currentCaptainIndex + 1) % game.players.length;
    const nextCaptain = game.players[nextCaptainIndex];

    if (!nextCaptain) {
      return NextResponse.json(
        { message: "Prochain capitaine introuvable." },
        { status: 500 }
      );
    }

    // Mettre à jour le capitaine et réinitialiser les joueurs
    await prisma.$transaction([
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
        data: {
          current_captain_id: nextCaptain.id,
          current_turn: game.current_turn + 1,
        },
      }),
    ]);

    // Notifier les joueurs via Pusher
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

    // Notifier les observateurs du jeu
    await pusher.trigger(`game-${gameCode}`, "update-captain", {
      nextCaptainSessionUuid: nextCaptain.session_uuid,
    });

    return NextResponse.json({
      message: "Capitaine mis à jour avec succès.",
      nextCaptain: {
        id: nextCaptain.id,
        session_uuid: nextCaptain.session_uuid,
        username: nextCaptain.username,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du capitaine:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

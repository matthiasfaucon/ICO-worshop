import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  console.log("etsfdse");

  try {
    const { gameCode } = await req.json();

    // Validation des données
    if (
      !gameCode ||
      typeof gameCode !== "string" ||
      gameCode.trim().length === 0
    ) {
      return NextResponse.json(
        { message: "Code de partie invalide." },
        { status: 400 }
      );
    }

    console.log("etsfdse");

    // Vérifiez si la partie existe
    const game = await prisma.game.findUnique({
      where: { code: gameCode.trim() },
    });

    if (!game) {
      return NextResponse.json(
        { message: "Aucune partie trouvée avec ce code." },
        { status: 404 }
      );
    }

    console.log("reger");

    // Récupération du sessionUUID et du pseudo
    const playerSessionUUID = req.headers.get("session-uuid");
    const playerNickname =
      req.headers.get("nickname") ||
      `Visiteur-${Math.random().toString(36).substring(2, 8)}`;

    if (!playerSessionUUID) {
      return NextResponse.json(
        { message: "Session UUID manquant." },
        { status: 400 }
      );
    }

    // Vérifiez si le joueur existe déjà ou ajoutez-le
    const player = await prisma.player.upsert({
      where: { session_uuid: playerSessionUUID },
      update: { game_id: game.id },
      create: {
        session_uuid: playerSessionUUID,
        game_id: game.id,
        username: playerNickname,
      },
    });

    // Émettre un événement via Pusher pour informer les autres joueurs
    await pusher.trigger(`game-${gameCode}`, "player-joined", {
      player: {
        id: player.id,
        nickname: player.username,
        sessionUUID: player.session_uuid,
      },
    });

    return NextResponse.json(
      { message: "Rejoint avec succès.", player },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la tentative de rejoindre une partie :",
      error
    );
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

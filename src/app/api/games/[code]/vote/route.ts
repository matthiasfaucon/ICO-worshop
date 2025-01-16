import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const gameCode = await params.code;

  try {
    const body = await req.json();
    const { sessionUuid, vote } = body;

    if (!sessionUuid || !vote) {
      return NextResponse.json(
        { message: "Session UUID ou vote manquant." },
        { status: 400 }
      );
    }

    // Vérifiez que le joueur est dans la partie
    const player = await prisma.player.findFirst({
      where: { session_uuid: sessionUuid, game: { code: gameCode } },
      include: { game: true },
    });

    if (!player) {
      console.error("Joueur introuvable ou non dans la partie.");
      return NextResponse.json(
        { message: "Joueur introuvable ou non dans la partie." },
        { status: 404 }
      );
    }
    console.log(player);

    if (!player.game || player.game.current_turn == null) {
      console.error("Tour actuel introuvable pour la partie.");
      return NextResponse.json(
        { message: "Tour actuel introuvable pour la partie." },
        { status: 400 }
      );
    }


    console.log("rtesdfsg");
    // Enregistrez ou mettez à jour le vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        player_id: player.id,
        turn_id: player.game.current_turn,
      },
    });

    console.log("ratatata");

    
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
          turn_id: player.game.current_turn,
          is_approved: vote === "yes",
        },
      });
    }

    return NextResponse.json({ message: "Vote enregistré avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du vote :", error);
    return NextResponse.json(
      { message: "Erreur interne lors de l'enregistrement du vote." },
      { status: 500 }
    );
  }
}

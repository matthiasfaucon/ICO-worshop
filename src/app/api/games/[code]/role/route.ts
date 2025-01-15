import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const gameCode = params.code;

  try {
    // Récupérer le sessionUuid depuis les cookies
    const sessionUuid = req.cookies.get("session_uuid")?.value;

    console.log("Session UUID récupéré :", sessionUuid);

    // Vérifier si le session UUID est valide
    if (!sessionUuid) {
      return NextResponse.json(
        { message: "Session UUID manquant ou invalide." },
        { status: 400 }
      );
    }

    // Vérifier si la partie existe
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: {
        players: true,
      },
    });

    if (!game) {
      return NextResponse.json(
        { message: "Partie introuvable." },
        { status: 404 }
      );
    }

    console.log("Partie trouvée :", game);

    // Trouver le joueur correspondant à la session UUID
    const player = await prisma.player.findFirst({
      where: {
        game_id: game.id,
        session_uuid: sessionUuid, // Comparer avec le session_uuid dans Player
      },
    });

    if (!player) {
      return NextResponse.json(
        { message: "Joueur introuvable dans cette partie." },
        { status: 404 }
      );
    }

    console.log("Joueur trouvé :", player);

    // Retourner le rôle et le statut de capitaine
    return NextResponse.json({
      role: player.role,
      is_captain: player.is_captain,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

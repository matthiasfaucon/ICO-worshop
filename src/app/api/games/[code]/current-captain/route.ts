import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const gameCode = params.code;

  try {
    // Récupérer la partie et le capitaine actuel
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: {
        current_captain: {
          select: {
            session_uuid: true,
            username: true,
            id: true,
          },
        },
      },
    });

    // Vérifier si la partie existe
    if (!game) {
      return NextResponse.json(
        { message: "Partie introuvable." },
        { status: 404 }
      );
    }

    // Vérifier si un capitaine est défini pour la partie
    if (!game.current_captain) {
      return NextResponse.json(
        { message: "Aucun capitaine pour le tour actuel." },
        { status: 404 }
      );
    }

    // Retourner les informations du capitaine actuel
    return NextResponse.json({
      currentCaptain: {
        sessionUuid: game.current_captain.session_uuid,
        username: game.current_captain.username,
        id: game.current_captain.id,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du capitaine actuel :",
      error
    );
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

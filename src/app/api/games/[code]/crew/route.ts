import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const gameCode = await params.code;

  try {
    // Récupérer la partie par son code
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: {
        players: {
          where: {
            is_in_crew: true, // Filtrer les joueurs sélectionnés pour l'équipage
          },
          select: {
            id: true,
            username: true,
            session_uuid: true, // Inclure le sessionUuid
            role: true, // Inclure le rôle
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

    // Retourner les joueurs de l'équipage avec leurs rôles
    return NextResponse.json({
      crew: game.players,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'équipage :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

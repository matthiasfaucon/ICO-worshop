import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const gameCode = params.code;

  try {
    // Vérifier si la partie existe
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: {
        players: {
          select: {
            id: true,
            username: true,
            session_uuid: true,
            role: true,
            is_captain: true,
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { message: "Partie introuvable." },
        { status: 404 }
      );
    }

    // Récupérer les pirates et la sirène
    const piratesAndSiren = game.players.filter(
      (player) => player.role === "pirate" || player.role === "sirene"
    );

    // Retourner la liste des joueurs avec les informations nécessaires
    return NextResponse.json({
      pirates: piratesAndSiren.map((p) => ({
        id: p.id,
        username: p.username || "Anonyme",
        session_uuid: p.session_uuid, // Inclure le session_uuid
        is_captain: p.is_captain, // Inclure le statut de capitaine
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des pirates :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

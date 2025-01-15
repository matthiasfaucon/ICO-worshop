import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const gameCode = params.code;

  try {
    // Vérifier si la partie existe
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

    // Récupérer les pirates et la sirène
    const piratesAndSiren = game.players.filter(
      (player) => player.role === "pirate" || player.role === "sirène"
    );

    console.log(game);

    // Retourner la liste des joueurs
    return NextResponse.json({
      pirates: piratesAndSiren.map((p) => ({
        id: p.id,
        nickname: p.username || "Anonyme",
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

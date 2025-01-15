import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    console.log("====================================");
    console.log(body); // Assurez-vous que le corps de la requête est bien passé
    const { who_won } = body;


    if (!who_won) {
      return NextResponse.json(
        { error: "Type de gagnant manquant" },
        { status: 400 }
      );
    }

    console.log(params.id);

    // Vérifier si le jeu existe
    const existingGame = await prisma.gameMonoDevice.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingGame) {
      return NextResponse.json(
        { error: "Jeu non trouvé" },
        { status: 404 }
      );
    }

    // Calculer la durée en secondes
    const gameDuration = (new Date().getTime() - existingGame.created_at.getTime()) / 1000;

    console.log(params.id);

    // Mettre à jour le jeu
    const game = await prisma.gameMonoDevice.update({
      where: {
        id: params.id,
      },
      data: {
        who_won,
        game_duration: gameDuration,
        terminated_at: new Date(),
      },
    });

    return NextResponse.json(game, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du jeu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du jeu" },
      { status: 500 }
    );
  }
}

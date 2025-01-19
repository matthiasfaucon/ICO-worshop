import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const gameCode = params.code;

    // Vérifier si le code du jeu est fourni
    if (!gameCode) {
      return NextResponse.json(
        { message: "Code de jeu non fourni." },
        { status: 400 }
      );
    }

    // Récupérer la partie et les scores
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      select: {
        score: true,
        status: true,
      },
    });

    // Vérifier si la partie existe
    if (!game) {
      return NextResponse.json(
        { message: "Partie introuvable." },
        { status: 404 }
      );
    }

    const { score, status } = game;

    // Si le jeu est déjà terminé, retourner une réponse appropriée
    if (status === "end") {
      return NextResponse.json(
        { message: "La partie est déjà terminée." },
        { status: 400 }
      );
    }

    const scorePirates = score?.pirates || 0;
    const scoreMarins = score?.marins || 0;

    // Vérifier si une équipe a atteint le seuil de victoire
    if (scoreMarins >= 5) {
      // Mettre à jour le statut du jeu à "end"
      await prisma.game.update({
        where: { code: gameCode },
        data: { status: "end" },
      });

      // Notifier la victoire des Marins
      await pusher.trigger(`game-${gameCode}`, "game-winner", {
        winner: "marins",
        message: `🌊 Les Marins ont triomphé !`,
        score: { pirates: scorePirates, marins: scoreMarins },
      });

      return NextResponse.json({
        winner: "marins",
        message: `🌊 Les Marins ont triomphé !`,
        score: { pirates: scorePirates, marins: scoreMarins },
      });
    }

    if (scorePirates >= 5) {
      // Mettre à jour le statut du jeu à "end"
      await prisma.game.update({
        where: { code: gameCode },
        data: { status: "end" },
      });

      // Notifier la victoire des Pirates
      await pusher.trigger(`game-${gameCode}`, "game-winner", {
        winner: "pirates",
        message: `🏴‍☠️ Les Pirates ont triomphé !`,
        score: { pirates: scorePirates, marins: scoreMarins },
      });

      return NextResponse.json({
        winner: "pirates",
        message: `🏴‍☠️ Les Pirates ont triomphé !`,
        score: { pirates: scorePirates, marins: scoreMarins },
      });
    }

    // Émission d'un événement pour continuer la partie
    await pusher.trigger(`game-${gameCode}`, "game-progress", {
      winner: null,
      message: "La partie continue. Aucune équipe n'a encore atteint 10 manches.",
      score: { pirates: scorePirates, marins: scoreMarins },
    });

    return NextResponse.json({
      winner: null,
      message: "La partie continue. Aucune équipe n'a encore atteint 10 manches.",
      score: { pirates: scorePirates, marins: scoreMarins },
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du gagnant :", error);
    return NextResponse.json(
      { message: "Erreur interne lors de la vérification du gagnant." },
      { status: 500 }
    );
  }
}

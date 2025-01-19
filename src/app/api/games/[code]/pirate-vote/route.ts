import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  context: { params: { code: string } }
) {
  try {
    const { code: gameCode } = context.params; // Extraire correctement le paramètre `code`
    const { voterId, targetId } = await req.json();

    // Vérifier les paramètres nécessaires
    if (!voterId || !targetId) {
      return NextResponse.json(
        { message: "Les paramètres voterId et targetId sont requis." },
        { status: 400 }
      );
    }

    // Récupérer la partie et le joueur votant
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

    const voter = game.players.find((player) => player.id === voterId);

    if (!voter || voter.role.toLowerCase() !== "pirate") {
      return NextResponse.json(
        { message: "Seuls les pirates peuvent voter." },
        { status: 403 }
      );
    }

    // Vérifier si le joueur a déjà voté
    const existingVote = await prisma.vote.findFirst({
      where: {
        player_id: voterId,
        game_id: game.id,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { message: "Vous avez déjà voté." },
        { status: 400 }
      );
    }

    // Enregistrer le vote
    await prisma.vote.create({
      data: {
        player_id: voterId,
        game_id: game.id,
        target_id: targetId,
        is_approved: true,
      },
    });

    // Vérifier si tous les pirates ont voté
    const totalPirates = game.players.filter(
      (player) => player.role.toLowerCase() === "pirate"
    ).length;

    const votesCount = await prisma.vote.count({
      where: { game_id: game.id },
    });

    if (votesCount === totalPirates) {
      // Regrouper les votes par cible
      const voteResults = await prisma.vote.groupBy({
        by: ["target_id"],
        _count: {
          target_id: true,
        },
      });

      const formattedResults = voteResults.map((result) => ({
        targetId: result.target_id,
        votes: result._count.target_id,
      }));

      // Événement Pusher pour envoyer les résultats des votes
      await pusher.trigger(`game-${gameCode}`, "vote-results", {
        message: "Tous les votes ont été enregistrés.",
        results: formattedResults,
      });

      // Déterminer si la Sirène a été identifiée
      const sirenVotes = formattedResults.find((result) => {
        const targetPlayer = game.players.find(
          (player) => player.id === result.targetId
        );
        return targetPlayer?.role.toLowerCase() === "sirene";
      });

      if (sirenVotes && sirenVotes.votes > totalPirates / 2) {
        // Sirène identifiée : victoire des pirates
        await pusher.trigger(`game-${gameCode}`, "game-over", {
          winner: "pirates",
          message: "🏴‍☠️ Les Pirates ont gagné en identifiant la Sirène !",
        });

        return NextResponse.json({
          message: "🏴‍☠️ Les Pirates ont gagné en identifiant la Sirène !",
        });
      } else {
        // Sirène non identifiée : victoire de la Sirène
        await pusher.trigger(`game-${gameCode}`, "game-over", {
          winner: "sirene",
          message: "🌊 La Sirène a gagné en trompant les Pirates !",
        });

        return NextResponse.json({
          message: "🌊 La Sirène a gagné en trompant les Pirates !",
        });
      }
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

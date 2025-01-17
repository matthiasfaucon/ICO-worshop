import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const gameCode = params.code;

  try {
    // Récupérer la partie et ses joueurs
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: {
        players: true, // Inclure les joueurs pour déterminer le prochain capitaine
      },
    });

    if (!game) {
      return NextResponse.json(
        { message: "Partie introuvable." },
        { status: 404 }
      );
    }

    const { players, current_captain_id } = game;

    if (!players || players.length === 0) {
      return NextResponse.json(
        { message: "Aucun joueur trouvé dans cette partie." },
        { status: 400 }
      );
    }

    // Trier les joueurs par ordre d'arrivée (par `joined_at`)
    const sortedPlayers = players.sort(
      (a, b) =>
        new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
    );

    // Trouver l'index du capitaine actuel
    const currentCaptainIndex = sortedPlayers.findIndex(
      (player) => player.id === current_captain_id
    );

    // Déterminer le prochain capitaine de manière cyclique
    const nextCaptainIndex = (currentCaptainIndex + 1) % sortedPlayers.length;
    const nextCaptain = sortedPlayers[nextCaptainIndex];

    if (!nextCaptain) {
      return NextResponse.json(
        { message: "Erreur lors de la détermination du prochain capitaine." },
        { status: 500 }
      );
    }

    // Mettre à jour le capitaine actuel dans la partie et désigner le prochain capitaine dans la liste des joueurs
    await prisma.$transaction([
      prisma.game.update({
        where: { id: game.id },
        data: {
          current_captain_id: nextCaptain.id,
          updated_at: new Date(),
        },
      }),
      prisma.player.updateMany({
        where: { game_id: game.id },
        data: { is_captain: false },
      }),
      prisma.player.update({
        where: { id: nextCaptain.id },
        data: { is_captain: true },
      }),
    ]);

    // Réponse avec le nouveau capitaine
    return NextResponse.json({
      message: "Capitaine mis à jour avec succès.",
      nextCaptain: {
        id: nextCaptain.id,
        session_uuid: nextCaptain.session_uuid,
        username: nextCaptain.username,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du capitaine :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

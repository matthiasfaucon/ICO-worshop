import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const gameCode = params.code; // Pas besoin d'utiliser await ici, params.code est synchrone

  try {
    console.log(`Requête reçue pour récupérer les joueurs de la partie avec le code : ${gameCode}`);

    // Vérifier si la partie existe
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: {
        players: {
          select: {
            id: true,
            username: true,
            session_uuid: true, // Inclure le session_uuid
            is_captain: true,   // Inclure is_captain
            role: true,         // Inclure le rôle du joueur
          },
        },
      },
    });

    // Log explicite pour vérifier la structure des données récupérées
    console.log("Résultat de la requête Prisma pour la partie :", game);

    if (!game) {
      console.warn(`Aucune partie trouvée pour le code : ${gameCode}`);
      return NextResponse.json(
        { message: "Partie introuvable." },
        { status: 404 }
      );
    }

    console.log(`Joueurs associés à la partie ${gameCode} :`, game.players);

    // Retourner tous les joueurs avec les informations nécessaires
    return NextResponse.json({
      players: game.players.map((player) => ({
        id: player.id,
        username: player.username || "Anonyme",
        session_uuid: player.session_uuid,
        is_captain: player.is_captain,
        role: player.role,
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des joueurs :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

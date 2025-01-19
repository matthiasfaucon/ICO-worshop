import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Token manquant.", code: "TOKEN_MISSING" },
        { status: 401 }
      );
    }

    const decoded: any = validateToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Token invalide ou expiré.", code: "TOKEN_INVALID" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { withSiren, withBonus, pointsToWin, playersCount } = body;

    // Vérifiez les paramètres requis
    if (!pointsToWin || !playersCount) {
      return NextResponse.json(
        { message: "Paramètres de partie invalides." },
        { status: 400 }
      );
    }

    if (playersCount < 3 || playersCount > 20) {
      return NextResponse.json(
        { message: "Le nombre de joueurs doit être entre 7 et 20." },
        { status: 400 }
      );
    }

    // Récupérer le session UUID depuis les cookies
    const sessionUuid = req.cookies.get("session_uuid")?.value;

    if (!sessionUuid) {
      return NextResponse.json(
        { message: "Session UUID introuvable." },
        { status: 400 }
      );
    }

    // Récupérer le username depuis localStorage
    const usernameHeader = req.headers.get("x-username");
    const nicknameHeader = req.headers.get("x-nickname");

    const username =
      usernameHeader ||
      nicknameHeader ||
      `User-${Math.random().toString(36).substring(2, 8)}`;

    // Créez un code unique pour la partie
    const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    console.log("Création de la partie avec le code :", gameCode);

    // Définir un rôle au hasard pour le créateur
    const roles = ["marin", "pirate", "sirene"];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];

    console.log(`Rôle attribué au créateur de la partie : ${randomRole}`);

    // Enregistrez la partie dans la base de données
    const newGame = await prisma.game.create({
      data: {
        code: gameCode,
        status: "PENDING", // La partie est en attente de joueurs
        max_players: playersCount,
        win_threshold: pointsToWin,
        socket_room: `room_${gameCode}`,
        players: {
          create: {
            user_id: decoded.id, // Utilisateur qui crée la partie
            session_uuid: sessionUuid, // Enregistrer le session UUID de l'hôte
            is_host: true, // Marquer comme hôte
            role: randomRole, // Rôle aléatoire attribué
            username: username, // Attribuer le username récupéré
          },
        },
      },
      include: {
        players: true, // Inclure les joueurs pour vérifier l'hôte
      },
    });

    // Retourner les informations de la partie créée
    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la partie :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

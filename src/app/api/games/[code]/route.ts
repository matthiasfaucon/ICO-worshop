import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const gameCode = await params.code;

  try {
    // Récupérer les données de la partie avec les joueurs
    const game = await prisma.game.findUnique({
      where: { code: gameCode },
      include: {
        players: {
          include: {
            user: true, 
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

    // Récupérer le session_uuid depuis les cookies
    const sessionUuid = req.cookies.get("session_uuid")?.value || null;

    let nicknameFromLocalStorage = "Visiteur"; // Valeur par défaut si aucun pseudo n'est trouvé

    if (sessionUuid) {
      // Vérifier si l'utilisateur existe dans la base de données
      const user = await prisma.user.findUnique({
        where: { session_uuid: sessionUuid },
      });

      if (!user) {
        // Si l'utilisateur n'est pas trouvé, tenter de récupérer son pseudo depuis le localStorage
        nicknameFromLocalStorage = req.headers.get("x-nickname") || "Visiteur";
      }
    }

    // Formater les joueurs (connectés et anonymes) et inclure l'hôte
    const players = game.players.map((player) => {
      const isAnonymous = !player.user?.username; // Détecter si l'utilisateur est anonyme

      // Déterminer le pseudo et l'avatar
      const nickname = isAnonymous
        ? nicknameFromLocalStorage // Utiliser le pseudo du localStorage pour les anonymes
        : player.user?.username || "Inconnu";

      const avatarLetters = nickname.slice(0, 2).toUpperCase();

      return {
        id: player.id,
        nickname,
        avatar: avatarLetters, // Les lettres pour l'icône
        sessionUUID: isAnonymous
          ? sessionUuid
          : player.user?.session_uuid || null,
        isHost: player.is_host, // Inclure le statut d'hôte
      };
    });

    // Émettre un événement via Pusher pour notifier un nouvel état
    await pusher.trigger(`game-${gameCode}`, "update-players", {
      players,
    });
    console.log(players);
    return NextResponse.json({
      players,
      session_uuid: sessionUuid, // Inclure le session_uuid pour l'utilisateur actuel
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la partie :", error);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const gameCode = await params.code;

  if (!gameCode) {
    return NextResponse.json(
      { message: "Code de partie manquant." },
      { status: 400 }
    );
  }

  try {
    // Récupérer ou générer un `session_uuid` depuis les cookies
    let sessionUuid = req.cookies.get("session_uuid")?.value;

    if (!sessionUuid) {
      sessionUuid = uuidv4();
      console.log("Nouveau session_uuid généré :", sessionUuid);
    }

    // Récupérer les pseudos depuis les headers ou générer un pseudo aléatoire
    const usernameFromHeader = req.headers.get("x-username");
    const nicknameFromHeader =
      req.headers.get("x-nickname") ||
      `Visiteur-${Math.random().toString(36).substring(2, 8)}`;
    const username = usernameFromHeader || nicknameFromHeader;

    // Vérifier ou créer l'utilisateur
    let user = await prisma.user.findUnique({
      where: { session_uuid: sessionUuid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          session_uuid: sessionUuid,
          username: username,
        },
      });
      console.log("Nouvel utilisateur créé :", user);
    }

    console.log("Utilisateur trouvé ou créé :", user);

    // Vérifier l'existence de la partie
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

    // Vérifier si le joueur existe déjà dans la partie
    const existingPlayer = await prisma.player.findFirst({
      where: { user_id: user.id, game_id: game.id },
    });

    if (!existingPlayer) {
      console.log("Ajouter un nouveau joueur");

      // Fournir une valeur par défaut si `user.username` est null
      const playerUsername =
        user.username ||
        `Visiteur-${Math.random().toString(36).substring(2, 8)}`;

      // Ajouter un joueur à la partie
      const newPlayer = await prisma.player.create({
        data: {
          user_id: user.id,
          game_id: game.id,
          session_uuid: sessionUuid,
          username: playerUsername, // Associer un username valide
          role: "PLAYER",
          is_host: false,
        },
        include: { user: { select: { username: true } } },
      });

      console.log("Nouveau joueur ajouté :", newPlayer);

      // Émettre un événement via Pusher
      await pusher.trigger(`game-${gameCode}`, "player-joined", {
        player: {
          id: newPlayer.id,
          nickname: newPlayer.username,
          isHost: newPlayer.is_host,
        },
      });
    }

    // Mettre à jour les cookies pour inclure le `session_uuid`
    const response = NextResponse.json({
      message: "Joueur ajouté avec succès.",
    });
    response.cookies.set("session_uuid", sessionUuid, {
      maxAge: 365 * 24 * 60 * 60, // 1 an
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un joueur :", error);
    return NextResponse.json(
      {
        message:
          "Erreur serveur. Assurez-vous que la requête est correctement formée.",
      },
      { status: 500 }
    );
  }
}

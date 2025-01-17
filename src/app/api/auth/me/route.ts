import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Récupération du token depuis les cookies ou l'en-tête Authorization
  const authHeader = req.headers.get("Authorization");
  let token = req.cookies.get("authToken")?.value;

  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    console.error("Aucun token fourni.");
    return NextResponse.json(
      { message: "Non autorisé, token manquant" },
      { status: 401 }
    );
  }

  try {
    const decoded: any = validateToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true, // Champ correct
        updated_at: true, // Champ correct
        session_uuid: true, // Si nécessaire
        is_logged: true, // Si nécessaire
      },
    });

    if (!user) {
      console.error("Utilisateur introuvable :", decoded.id);
      return NextResponse.json(
        { message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Retourne toutes les informations de l'utilisateur
    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur d'authentification :", error.message);
    return NextResponse.json(
      { message: "Token invalide ou expiré" },
      { status: 401 }
    );
  }
}

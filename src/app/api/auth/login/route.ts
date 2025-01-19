import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Vérification des champs requis
    if (!email || !password) {
      return NextResponse.json(
        { message: email ? "Mot de passe manquant" : "Email manquant" },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        session_uuid: true,
        is_logged: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 400 }
      );
    }

    // Gestion du `session_uuid`
    let sessionUuid = req.cookies.get("session_uuid")?.value || user.session_uuid;

    if (!sessionUuid) {
      sessionUuid = uuidv4();
    }

    // Vérifiez si un autre utilisateur utilise déjà ce `session_uuid`
    const conflictingUser = await prisma.user.findUnique({
      where: { session_uuid: sessionUuid },
    });

    if (conflictingUser && conflictingUser.id !== user.id) {
      // Si le `session_uuid` est déjà pris, générez-en un nouveau
      sessionUuid = uuidv4();
    }

    // Mise à jour du `session_uuid` et du statut de connexion
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        session_uuid: sessionUuid,
        is_logged: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        session_uuid: true,
        is_logged: true,
      },
    });

    // Générer un token JWT
    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Réponse avec les cookies mis à jour
    const response = NextResponse.json(
      {
        message: "Connexion réussie",
        token,
        user: updatedUser,
      },
      { status: 200 }
    );

    response.cookies.set("authToken", token, {
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      // httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    response.cookies.set("session_uuid", sessionUuid, {
      maxAge: 365 * 24 * 60 * 60, // 1 an
      // httpOnly: false,
      // secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Erreur interne du serveur" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Erreur inconnue lors de la connexion." },
      { status: 500 }
    );
  }
}

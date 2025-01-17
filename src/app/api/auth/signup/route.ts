import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt"; // Assurez-vous de définir cela dans vos variables d'environnement

export async function POST(req: NextRequest) {
  try {
    const { email, password, username } = await req.json();

    // Validation des champs requis
    if (!email || !password) {
      return NextResponse.json(
        { message: "Tous les champs sont requis." },
        { status: 400 }
      );
    }

    // Vérifiez si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, role: true, session_uuid: true, is_logged: true, created_at: true, updated_at: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vérifier s'il existe un session_uuid dans les cookies
    let sessionId = req.cookies.get("session_uuid")?.value;
    if (!sessionId) {
      // Générer un nouveau `session_uuid` s'il n'existe pas
      sessionId = uuidv4();
    }

    // Vérifiez si un autre utilisateur utilise déjà ce `session_uuid`
    const conflictingUser = await prisma.user.findUnique({
      where: { session_uuid: sessionId },
    });

    if (conflictingUser) {
      // Si le `session_uuid` est déjà pris, générez-en un nouveau
      sessionId = uuidv4();
    }


    // Création de l'utilisateur avec le session_uuid
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: "USER",
        is_logged: true,
        session_uuid: sessionId, // Associer le session_uuid
      },
    });

    // Préparer la réponse JSON
    const responsePayload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      is_logged: newUser.is_logged,
      session_uuid: newUser.session_uuid,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    };

    // Retourne une réponse avec un cookie pour le session_uuid
    const response = NextResponse.json(
      { message: "Utilisateur créé avec succès.", user: responsePayload },
      { status: 201 }
    );

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }

    );

    response.cookies.set("authToken", token, {
      maxAge: 60 * 60 * 24, // 1 heure
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    response.cookies.set("session_uuid", sessionId, {
      maxAge: 365 * 24 * 60 * 60, // 1 an
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);

    // Assurez-vous de toujours retourner un objet JSON, même en cas d'erreur
    return NextResponse.json(
      { message: "Erreur interne du serveur.", error: String(error) },
      { status: 500 }
    );
  }
}

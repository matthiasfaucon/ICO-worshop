import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { email, password, username } = await req.json();

    // Validation des champs requis
    if (!email || !password || !username) {
      return NextResponse.json(
        { message: "Tous les champs sont requis." },
        { status: 400 }
      );
    }

    // Vérifiez si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
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
console.log("iciiiii");
console.log(sessionId)
    if (!sessionId) {
      // Générer un nouveau `session_uuid` s'il n'existe pas
      sessionId = uuidv4();
    }


    console.log("testttinnnntt");


    console.log(email);
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

    console.log(newUser);

    console.log("testtttt");
    // Préparer la réponse JSON
    const responsePayload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      is_logged: newUser.is_logged,
      session_uuid: newUser.session_uuid,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };

    console.log(responsePayload);

    // Retourne une réponse avec un cookie pour le session_uuid
    const response = NextResponse.json(
      { message: "Utilisateur créé avec succès.", user: responsePayload },
      { status: 201 }
    );

    response.cookies.set("session_uuid", sessionId, {
      maxAge: 365 * 24 * 60 * 60, // 1 an
      httpOnly: true,
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

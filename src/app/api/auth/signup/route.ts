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
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: "USER",
        is_logged: false,
        session_uuid: uuidv4(), // Génère une valeur UUID par défaut
      },
    });

    // Générer le token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role }, // Données à inclure dans le token
      JWT_SECRET, // Secret pour signer le token
      { expiresIn: "1h" } // Durée de validité du token
    );

    return NextResponse.json(
      { message: "Utilisateur créé avec succès.", token },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

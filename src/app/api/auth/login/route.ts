import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt"; // Assurez-vous de définir cela dans vos variables d'environnement

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email manquant" }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ message: "Mot de passe manquant" }, { status: 400 });
  }

  try {
    // Recherchez l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: "Email ou mot de passe incorrect" }, { status: 400 });
    }

    // Vérifiez le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Email ou mot de passe incorrect" }, { status: 400 });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // Données à inclure dans le token
      JWT_SECRET, // Secret pour signer le token
      { expiresIn: "1h" } // Durée de validité du token
    );

    return NextResponse.json(
      { message: "Connexion réussie", token },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

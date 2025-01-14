import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

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

    return NextResponse.json({ message: "Connexion réussie", user }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
  }
}

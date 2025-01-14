import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Assurez-vous que prisma est bien configuré

export async function POST(req: NextRequest) {
  const { uuid } = await req.json();

  if (!uuid) {
    return NextResponse.json({ message: "UUID manquant" }, { status: 400 });
  }

  try {
    // Vérifiez si l'utilisateur avec cet UUID existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { session_uuid: uuid },
    });

    if (existingUser) {
      return NextResponse.json({ message: "UUID déjà enregistré" }, { status: 200 });
    }

    // Si l'utilisateur n'existe pas, créez-le
    await prisma.user.create({
      data: {
        session_uuid: uuid,
        role: "USER",
      },
    });

    return NextResponse.json({ message: "UUID enregistré avec succès" }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'UUID :", error);
    return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
  }
}

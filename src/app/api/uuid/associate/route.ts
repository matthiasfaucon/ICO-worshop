import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    const { uuid, email, password } = await req.json();

    // Vérifications des données reçues
    if (!uuid) {
        return NextResponse.json({ message: "UUID manquant" }, { status: 400 });
    }

    if (!email) {
        return NextResponse.json({ message: "Email manquant" }, { status: 400 });
    }

    if (!password) {
        return NextResponse.json({ message: "Mot de passe manquant" }, { status: 400 });
    }

    try {
        // Vérifiez si un utilisateur existe avec cet UUID
        let user = await prisma.user.findUnique({
            where: { session_uuid: uuid },
        });

        if (!user) {
            // Si l'utilisateur n'existe pas, créez-le avec l'UUID
            user = await prisma.user.create({
                data: {
                    session_uuid: uuid,
                    role: "USER", // Rôle par défaut
                },
            });
        }

        // Vérifiez si l'email est déjà utilisé par un autre utilisateur
        const emailExists = await prisma.user.findUnique({
            where: { email },
        });

        if (emailExists) {
            return NextResponse.json({ message: "Email déjà utilisé" }, { status: 400 });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Mettez à jour l'utilisateur avec l'email et le mot de passe
        await prisma.user.update({
            where: { session_uuid: uuid },
            data: {
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: "Compte associé avec succès" }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de l'association de l'UUID :", error);
        return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
    }
}

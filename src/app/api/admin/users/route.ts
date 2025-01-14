import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                created_at: true,
                is_logged: true
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération des utilisateurs" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { username, email, password, role, session_uuid } = await request.json();

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Un utilisateur avec ce nom ou cet email existe déjà" },
                { status: 400 }
            );
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
                session_uuid,
                is_logged: false
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                created_at: true,
                is_logged: true
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Erreur:', error);
        return NextResponse.json(
            { error: "Erreur lors de la création de l'utilisateur" },
            { status: 500 }
        );
    }
} 
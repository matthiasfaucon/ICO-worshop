import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const token = request.headers.get("Authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json(
                { message: "Token manquant." },
                { status: 401 }
            );
        }

        const decoded: any = validateToken(token);
        if (!decoded) {
            return NextResponse.json(
                { message: "Token invalide ou expiré." },
                { status: 401 }
            );
        }

        const { type, description } = await request.json();

        // Créer le feedback
        const feedback = await prisma.bugSuggestion.create({
            data: {
                type,
                description,
                status: 'PENDING',
                user: {
                    connect: {
                        id: decoded.id
                    }
                }
            }
        });

        return NextResponse.json(feedback);
    } catch (error) {
        console.error('Erreur:', error);
        return NextResponse.json(
            { error: "Erreur lors de la création du feedback" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const bugs = await prisma.bugSuggestion.findMany({
            include: {
                user: {
                    select: {
                        username: true,
                        id: true
                    }
                },
                history: true
            }
        });
        return NextResponse.json(bugs);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération des feedbacks" }, { status: 500 });
    }
} 
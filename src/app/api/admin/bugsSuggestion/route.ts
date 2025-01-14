import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { type, description } = await request.json();

        // Créer le feedback
        const feedback = await prisma.bugSuggestion.create({
            data: {
                type,
                description,
                status: 'PENDING',
                user: {
                    connect: {
                        id: 'user_id' // À remplacer par l'ID de l'utilisateur connecté
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
                        username: true
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
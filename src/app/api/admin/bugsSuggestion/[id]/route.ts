import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { status, changed_by } = await request.json();
        
        const bugSuggestion = await prisma.bugSuggestion.findUnique({
            where: { id: params.id }
        });

        if (!bugSuggestion) {
            return NextResponse.json({ error: "Bug/suggestion non trouvé" }, { status: 404 });
        }

        const [updatedBug] = await prisma.$transaction([
            prisma.bugSuggestion.update({
                where: { id: params.id },
                data: { 
                    status,
                    updated_at: new Date()
                }
            }),
            prisma.bugSuggestionHistory.create({
                data: {
                    bug_suggestion_id: params.id,
                    old_status: bugSuggestion.status,
                    new_status: status,
                    changed_by
                }
            })
        ]);

        return NextResponse.json(updatedBug);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la mise à jour du bug/suggestion" }, { status: 500 });
    }
} 
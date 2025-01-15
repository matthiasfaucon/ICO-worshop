import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const rule = await prisma.gameRule.findUnique({
            where: { id: params.id }
        });
        return NextResponse.json(rule);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération de la règle" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { name, value, description, updated_by, order, type } = await request.json();
        const rule = await prisma.gameRule.update({
            where: { id: params.id },
            data: { name, value, description, updated_by, order, type }
        });
        return NextResponse.json(rule);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la mise à jour de la règle" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.gameRule.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ message: "Règle supprimée avec succès" });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la suppression de la règle" }, { status: 500 });
    }
} 
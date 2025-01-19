import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateToken } from '@/lib/auth';

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
        const { name, value, description, order, type, key } = await request.json();
        const rule = await prisma.gameRule.update({
            where: { id: params.id },
            data: { name, value, description, updated_by: decoded.id, order, type, key }
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
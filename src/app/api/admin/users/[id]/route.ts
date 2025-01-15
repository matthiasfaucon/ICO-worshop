import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const user = await prisma.user.findUnique({ where: { id: params.id } });
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération de l'utilisateur" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { role } = await request.json();
        const user = await prisma.user.update({
            where: { id: params.id },
            data: { role }
        });
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la mise à jour de l'utilisateur" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.user.delete({ where: { id: params.id } });
        return NextResponse.json({ message: "Utilisateur supprimé" });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la suppression de l'utilisateur" }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GameRuleType } from '@prisma/client';
import { validateToken } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as GameRuleType | null;;

        const rules = await prisma.gameRule.findMany({
            where: type ? { type: { equals: type } } : {},
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(rules);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération des règles" }, { status: 500 });
    }
}

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

        const { key, type, name, value, description } = await request.json();
        const rule = await prisma.gameRule.create({
            data: {
                key,
                type,
                name,
                value,
                description,
                updated_by: decoded.id
            }
        });
        return NextResponse.json(rule);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la création de la règle" }, { status: 500 });
    }
}
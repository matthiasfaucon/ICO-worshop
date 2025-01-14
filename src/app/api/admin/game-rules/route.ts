import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const rules = await prisma.gameRule.findMany({
            orderBy: { updated_at: 'desc' }
        });
        return NextResponse.json(rules);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération des règles" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { key, type, name, value, description } = await request.json();
        const rule = await prisma.gameRule.create({
            data: { 
                key, 
                type, 
                name, 
                value, 
                description,
                updated_by: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
            }
        });
        return NextResponse.json(rule);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la création de la règle" }, { status: 500 });
    }
}
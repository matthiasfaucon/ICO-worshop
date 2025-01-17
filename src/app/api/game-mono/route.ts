import { NextResponse } from 'next/server'
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
    const { playersCount } = await request.json()

    const gameMonoDevice = await prisma.gameMonoDevice.create({
      data: {
        created_by: decoded.id,
        players_count: playersCount,
        created_at: new Date(),
      }
    })

    return NextResponse.json(gameMonoDevice, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du jeu:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du jeu' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
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
    const games = await prisma.gameMonoDevice.findMany({
      where: decoded.id ? { created_by: decoded.id } : {},
      include: {
        User: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(games, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de la récupération des jeux:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des jeux' },
      { status: 500 }
    );
  }
}
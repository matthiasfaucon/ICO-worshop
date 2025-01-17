import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {

    const { user_id, playersCount } = await request.json()
    console.log(user_id)
    if (!user_id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const gameMonoDevice = await prisma.gameMonoDevice.create({
      data: {
        created_by: user_id,
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    console.log(userId)
    const games = await prisma.gameMonoDevice.findMany({
      where: userId ? { created_by: userId } : {},
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
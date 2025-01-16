import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {

    const { user_id } = await request.json()
    if (!user_id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const gameMonoDevice = await prisma.gameMonoDevice.create({
      data: {
        created_by: user_id,
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

export async function GET() {
  try {
    const games = await prisma.gameMonoDevice.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(games, { status: 200 })

  } catch (error) {
    console.error('Erreur lors de la récupération des jeux:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des jeux' },
      { status: 500 }
    )
  }
} 
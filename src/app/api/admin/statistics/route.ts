import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const [
            totalGames,
            abandonedGames,
            averageDuration,
            medianDuration,
            totalUsers,
            activeUsers
        ] = await Promise.all([
            prisma.game.count(),
            prisma.gameStatistics.count({ where: { abandoned: true } }),
            prisma.gameStatistics.aggregate({
                _avg: { duration: true }
            }),
            prisma.gameStatistics.findMany({ select: { duration: true } }),
            prisma.user.count(),
            prisma.user.count({ where: { is_logged: true } })
        ]);

        return NextResponse.json({
            totalGames,
            abandonedGames,
            averageDuration: averageDuration._avg.duration,
            medianDuration: calculateMedian(medianDuration.map(g => g.duration).filter(Boolean) as number[]),
            totalUsers,
            activeUsers
        });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 });
    }
}

function calculateMedian(numbers: number[]): number {
    const sorted = numbers.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];
} 

"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/admin/components/Sidebar";

export default function Page() {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch("/api/game-mono");
                if (!response.ok) throw new Error("Failed to fetch stats");
                const data = await response.json();
                console.log(data);
                setGames(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const totalGames = games?.length

    const gameFinished = games?.filter(game => game?.terminated_at !== null).length

    const averageDuration = games?.reduce((acc, game) => acc + game?.duration, 0) / totalGames || 0

    const totalPlayers = games?.reduce((acc, game) => acc + game?.playersCount?.length, 0) || 0

    const victoryByRole = {
        "pirates": {
            count: 0
        },
        "marins": {
            count: 0
        },
        "sirene": {
            count: 0
        }
    }

    games?.forEach((game: any) => {
        switch (game?.who_won) {
            case 'PIRATES':
                victoryByRole["pirates"].count += 1;
                break
            case 'MARINS':
                victoryByRole["marins"].count += 1;
                break
            case 'SIRENE':
                victoryByRole["sirene"].count += 1;
                break
            default:
                break
        }
    })

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Statistiques</h1>

                {loading ? (
                    <p>Chargement...</p>
                ) : games ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                            <dt className="truncate text-sm font-medium text-gray-500">Parties totales</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{totalGames}</dd>
                        </div>
                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                            <dt className="truncate text-sm font-medium text-gray-500">Parties terminées</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{gameFinished}</dd>
                        </div>
                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                            <dt className="truncate text-sm font-medium text-gray-500">Durée moyenne</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{averageDuration} min</dd>
                        </div>
                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                            <dt className="truncate text-sm font-medium text-gray-500">Joueurs totaux</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{totalPlayers}</dd>
                        </div>
                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                            <dt className="truncate text-sm font-medium text-gray-500">Victoire des pirates</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{victoryByRole["pirates"].count}</dd>
                        </div>
                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                            <dt className="truncate text-sm font-medium text-gray-500">Victoire des marins</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{victoryByRole["marins"].count}</dd>
                        </div>
                        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                            <dt className="truncate text-sm font-medium text-gray-500">Victoire des sirènes</dt>
                            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{victoryByRole["sirene"].count}</dd>
                        </div>

                    </div>
                ) : (
                    <p>Erreur lors du chargement des statistiques.</p>
                )}
            </main>
        </div>
    );
}
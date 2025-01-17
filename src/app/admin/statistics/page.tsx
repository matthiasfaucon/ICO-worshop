"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/admin/components/Sidebar";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { ChartBarIcon, ClockIcon, UsersIcon, TrophyIcon } from "@heroicons/react/24/solid";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

function StatCard({ title, value, icon: Icon, color }: { title: string; value: any; icon: any; color: string }) {
    return (
        <div className={`overflow-hidden rounded-lg bg-white px-4 py-5 shadow hover:shadow-lg transition-shadow`}>
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div className="ml-4">
                    <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</dd>
                </div>
            </div>
        </div>
    );
}

function RoleWinCard({ role, count, color }: { role: string; count: number; color: string }) {
    return (
        <div className={`flex flex-col items-center justify-center rounded-lg bg-${color}-500 p-4 w-full`}>
            <h4 className={`text-xl font-bold text-white`}>{role}</h4>
            <p className={`mt-2 text-2xl font-semibold text-white`}>{count}</p>
        </div>
    );
}

export default function Page() {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dailyGameData, setDailyGameData] = useState<any>({ labels: [], data: [] });

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch("/api/game-mono");
                if (!response.ok) throw new Error("Failed to fetch stats");
                const data = await response.json();

                setGames(data);

                // Process data to calculate games per day
                const gamesByDay: { [date: string]: number } = {};
                data.forEach((game: any) => {
                    const date = new Date(game.created_at).toLocaleDateString("fr-FR");
                    gamesByDay[date] = (gamesByDay[date] || 0) + 1;
                });

                const labels = Object.keys(gamesByDay).sort();
                const chartData = labels.map((label) => gamesByDay[label]);

                setDailyGameData({ labels, data: chartData });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const totalGames = games?.length;
    const gameFinished = games?.filter((game) => game?.terminated_at !== null).length;
    const averageDuration = totalGames > 0
        ? (games?.reduce((acc, game) => acc + game?.game_duration, 0) / totalGames / 60).toFixed(2)
        : 0;
    const totalPlayers = games?.reduce((acc, game) => acc + game?.players_count, 0) || 0;

    const victoryByRole = {
        pirates: { count: 0 },
        marins: { count: 0 },
        sirene: { count: 0 },
    };

    games?.forEach((game: any) => {
        switch (game?.who_won) {
            case "PIRATES":
                victoryByRole.pirates.count += 1;
                break;
            case "MARINS":
                victoryByRole.marins.count += 1;
                break;
            case "SIRENE":
                victoryByRole.sirene.count += 1;
                break;
            default:
                break;
        }
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Statistiques</h1>

                {loading ? (
                    <p>Chargement...</p>
                ) : games ? (
                    <>
                        {/* Section principale des statistiques */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            <StatCard
                                title="Parties totales"
                                value={totalGames}
                                icon={ChartBarIcon}
                                color="text-blue-500"
                            />
                            <StatCard
                                title="Parties terminées"
                                value={gameFinished}
                                icon={TrophyIcon}
                                color="text-green-500"
                            />
                            <StatCard
                                title="Durée moyenne"
                                value={`${averageDuration} min`}
                                icon={ClockIcon}
                                color="text-purple-500"
                            />
                            <StatCard
                                title="Joueurs totaux"
                                value={totalPlayers}
                                icon={UsersIcon}
                                color="text-indigo-500"
                            />
                        </div>

                        {/* Section des victoires par rôle */}
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Victoire par rôle</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-8">
                            <RoleWinCard role="Pirates" count={victoryByRole.pirates.count} color="red" />
                            <RoleWinCard role="Marins" count={victoryByRole.marins.count} color="blue" />
                            <RoleWinCard role="Sirènes" count={victoryByRole.sirene.count} color="purple" />
                        </div>

                        {/* Section graphique */}
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Nombre de parties par jour</h2>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <Line
                                data={{
                                    labels: dailyGameData.labels,
                                    datasets: [
                                        {
                                            label: "Parties",
                                            data: dailyGameData.data,
                                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                                            borderColor: "rgba(54, 162, 235, 1)",
                                            borderWidth: 2,
                                            fill: true,
                                            tension: 0.3, // Ajoute de la douceur à la courbe
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: "Date",
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: "Nombre de parties",
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <p>Erreur lors du chargement des statistiques.</p>
                )}
            </main>
        </div>
    );
}

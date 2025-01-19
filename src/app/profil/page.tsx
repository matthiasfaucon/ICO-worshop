"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import HeaderHome from "@/components/HeaderHome"; // Ajoutez ici votre composant Header

export default function ProfilPage() {
    const [userGames, setUserGames] = useState([]);
    const router = useRouter();
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const token = Cookies.get("authToken");
            if (!token) {
                router.push("/signin");
                return;
            }

            try {
                const response = await fetch(`/api/game-mono`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                let data = await response.json();

                if (data.length === 0) {
                    setError(true);
                } else {
                    // prendre les 5 derniers jeux
                    data = data?.slice(0, 5);
                }
                setUserGames(data);
            } catch (error) {
                console.error('Fetch error:', error);
                setError(true);
            }
        }
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        Cookies.remove('authToken');
        Cookies.remove('session_uuid');
        router.push('/auth-options');
    };

    return (
        <div 
            className="bg-brown-texture min-h-screen bg-cover bg-center flex flex-col" 
            style={{
                backgroundImage: "url('/cards/background-app-brown.svg')",
            }}
        >
            <HeaderHome />

            <div className="mx-auto mb-4 mt-6 bg-white/15 backdrop-blur-md rounded-lg shadow-lg border-2 border-white/40 p-6 w-11/12 max-w-4xl flex-grow">
                <h1 className="text-4xl sm:text-4xl font-magellan text-white mb-6 text-center">
                    Mon Profil
                </h1>
                <h2 className="text-xl sm:text-xl font-filson text-white mb-4 text-center">
                    Mes parties récentes
                </h2>

                {error ? (
                    <div className="bg-red-500/90 text-white p-4 rounded-lg shadow-md text-center">
                        Une erreur s'est produite lors du chargement des données. Veuillez réessayer plus tard.
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {userGames.map((game) => (
                            <li 
                                key={game.id} 
                                className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4 shadow-md text-white"
                            >
                                <p className="text-lg font-bold">
                                    Date de création : {new Date(game.created_at).toLocaleDateString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-lg font-bold bg-white text-slate-700 hover:bg-red-600 transition text-sm sm:text-base"
                    >
                        Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    );
}

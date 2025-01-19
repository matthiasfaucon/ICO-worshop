"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import HeaderHome from "@/components/HeaderHome"; // Ajoutez ici votre composant Header

export default function ProfilPage() {
    const [userGames, setUserGames] = useState([]);
    const router = useRouter();
    const [error, setError] = useState(false);

    // Fetch user data when component mounts
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
                    if (response.status === 401) {
                        router.push('/auth-options');
                        return;
                    }
                    throw new Error('Network response was not ok');
                }

                let data = await response.json();

                if (data.length === 0) {
                    setError(true);
                } else {
                    // Récupérer les 5 derniers jeux
                    data = data.slice(0, 5);
                    setUserGames(data);
                }
            } catch (error) {
                console.error("Erreur lors du fetch :", error);
                setError(true);
            }
        }

        fetchData();
    }, [router]);

    // Logout logic
    const handleLogout = () => {
        try {
            // Supprimer les données utilisateur
            localStorage.removeItem("userInfo");
            Cookies.remove("authToken");
            Cookies.remove("session_uuid");

            // Redirection vers la page d'authentification
            router.push("/auth-options");
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">

            {/* Bouton de retour */}
            <button onClick={() => router.back()} className="text-gray-600 text-sm mb-4">
                Retour
            </button>

            <h1 className="text-3xl font-bold mb-6 text-gray-800">Profil</h1>

            <h2 className="text-xl font-semibold mb-4">Mes parties en mono-device</h2>
            {error ? (
                <p className="text-red-500">Une erreur s'est produite lors du chargement des données.</p>
            ) : (
                <ul className="w-full max-w-md bg-white rounded-lg shadow-md p-4 space-y-2">
                    {userGames.map((game) => (
                        <li
                            key={game.id}
                            className="text-gray-700 text-sm border-b last:border-b-0 pb-2"
                        >
                            Partie créée le : {new Date(game.created_at).toLocaleString()}
                        </li>
                    ))}
                </ul>
            )}

            <button
                onClick={handleLogout}
                className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition"
            >
                Se déconnecter
            </button>
        </div>
    );
}

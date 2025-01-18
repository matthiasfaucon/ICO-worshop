"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

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
        <div>
            <h1>Profil</h1>
            <h2>Mes parties en mono-device</h2>
            {error ? (
                <p>Une erreur s'est produite lors du chargement des données.</p>
            ) : (
                <ul>
                    {userGames.map((game) => (
                        <li key={game.id}>{game.created_at}</li>
                    ))}
                </ul>
            )}
            <button onClick={handleLogout}>Se déconnecter</button>
        </div>
    );
}
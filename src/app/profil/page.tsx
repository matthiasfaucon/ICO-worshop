"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function ProfilPage() {
    const [userGames, setUserGames] = useState([]);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const token = Cookies.get("authToken");
            if (!token) {
                alert("Vous devez être connecté pour créer une partie.");
                router.push("/signin");
                return;
            }

            const response = await fetch(`/api/game-mono`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            let data = await response.json();

            if (data.length === 0) {
                alert("Vous n'avez pas encore de partie enregistrée.");
            }
            // prendre les 5 derniers jeux
            data = data?.slice(0, 5);
            setUserGames(data);
        }
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        Cookies.remove('authToken');
        Cookies.remove('session_uuid');
        router.push('/');
    };

    return (
        <div>
            <h1>Profil</h1>
            <h2>Mes parties en mono-device</h2>
            <ul>
                {userGames.map((game) => (
                    <li key={game.id}>{game.created_at}</li>
                ))}
            </ul>
            <button onClick={handleLogout}>Se déconnecter</button>
        </div>
    );
}
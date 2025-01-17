"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilPage() {
    const [userGames, setUserGames] = useState([]);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const user = localStorage.getItem('userInfo');
            const user_id = user ? JSON.parse(user).id : null;
            if (!user_id) {
                console.log('Non autorisé');
                router.push('/');
                return;
            }

            const response = await fetch(`/api/game-mono?user_id=${user_id}`);
            let data = await response.json();
            // prendre les 5 derniers jeux
            data = data.slice(0, 5);
            setUserGames(data);
        }
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
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
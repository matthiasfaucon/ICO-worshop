"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Player {
  id: string;
  username: string; // Aligné avec le backend
  is_captain: boolean; // Aligné avec le backend
  session_uuid: string; // Aligné avec le backend
}

export default function MarinsDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;
  const [players, setPlayers] = useState<Player[]>([]);
  const [isCaptain, setIsCaptain] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}/players`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Données des joueurs :", data.players);
          setPlayers(data.players);

          // Récupérer le sessionUuid depuis les cookies
          const sessionUuid = document.cookie
            .split("; ")
            .find((row) => row.startsWith("session_uuid="))
            ?.split("=")[1];

          if (!sessionUuid) {
            console.error("Session UUID manquant.");
            return;
          }

          // Vérifier si le joueur actuel est le capitaine
          const currentPlayer = data.players.find(
            (player: Player) => player.session_uuid === sessionUuid
          );

          if (!currentPlayer) {
            console.warn("Aucun joueur correspondant trouvé avec le session_uuid :", sessionUuid);
          } else {
            console.log("Joueur actuel trouvé :", currentPlayer);
            setIsCaptain(currentPlayer.is_captain || false);
          }
        } else {
          console.error("Erreur lors de la récupération des joueurs.");
        }
      } catch (err) {
        console.error("Erreur lors de la requête :", err);
      }
    };

    fetchPlayers();

    // Redirection après 20 secondes
    const timer = setTimeout(() => {
      if (isCaptain) {
        router.push(`/multidevice/game/${gameCode}/captain-selection`);
      } else {
        router.push(`/multidevice/game/${gameCode}/player-wait-captain`);
      }
    }, 10000); // 20 secondes

    return () => clearTimeout(timer);
  }, [gameCode, isCaptain, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-6">
      {/* Titre principal */}
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Hmm... Il ne faut faire confiance à personne !
      </h1>
      <p className="text-sm text-gray-500 mb-6">Restez vigilants...</p>

      {/* Timer placeholder */}
      <div className="w-48 h-48 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center mb-6">
        <p className="text-gray-500 font-semibold">Timer</p>
      </div>

      {/* Grille des joueurs */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex flex-row gap-5 items-center bg-gray-100 p-4 rounded-lg shadow"
          >
            {/* Placeholder avec initiales */}
            <div className="w-12 h-12 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center mb-2 font-semibold">
              {player.username && player.username.trim()
                ? player.username
                    .trim()
                    .split(/\s+/)
                    .flatMap((word) => word.slice(0, 2)) // Récupération jusqu'à 2 lettres par mot
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "??"}
            </div>

            {/* Pseudo */}
            <p className="text-sm font-medium text-slate-900">{player.username || "Visiteur"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

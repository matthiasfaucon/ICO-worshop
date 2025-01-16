"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Pusher from "pusher-js";

interface Player {
  id: string;
  username: string;
  is_captain: boolean;
}

export default function CaptainSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const maxSelection = 3;

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}/players`, { method: "GET" });
        if (response.ok) {
          const data = await response.json();

          // Trier les joueurs pour que le capitaine soit en premier
          const sortedPlayers = data.players.sort((a: Player, b: Player) =>
            Number(b.is_captain) - Number(a.is_captain)
          );
          setPlayers(sortedPlayers);
        } else {
          console.error("Erreur lors de la récupération des joueurs.");
        }
      } catch (error) {
        console.error("Erreur lors de la requête :", error);
      }
    };

    fetchPlayers();

    // Configurer Pusher pour écouter les événements
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    });
    const channel = pusher.subscribe(`game-${gameCode}`);

    channel.bind("redirect-to-vote", () => {
      router.push(`/multidevice/game/${gameCode}/vote`);
    });

    return () => {
      pusher.unsubscribe(`game-${gameCode}`);
    };
  }, [gameCode, router]);

  const toggleSelection = (id: string) => {
    setSelectedPlayers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((playerId) => playerId !== id); // Désélectionner
      } else if (prev.length < maxSelection) {
        return [...prev, id]; // Sélectionner
      }
      return prev; // Si le max est atteint, ne rien faire
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const sessionUuid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session_uuid="))
        ?.split("=")[1];

      if (!sessionUuid) {
        console.error("Session UUID manquant.");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/games/${gameCode}/select-crew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionUuid, selectedPlayers }),
      });

      if (response.ok) {
        console.log("Équipage validé !");
      } else {
        console.error("Erreur lors de la validation de l'équipage.");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la sélection :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-slate-900">Qui part en voyage ?</h1>
      <p className="text-gray-500 my-2">{`${selectedPlayers.length}/${maxSelection}`}</p>

      {/* Liste des joueurs */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex justify-between items-center p-4 rounded-lg border ${
              selectedPlayers.includes(player.id)
                ? "bg-blue-100 border-blue-500"
                : "bg-gray-100 border-gray-300"
            }`}
            onClick={() => toggleSelection(player.id)}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center font-bold">
                {player.username
                  .split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <span className="text-sm text-slate-900 font-medium">{player.username}</span>
            </div>
            {selectedPlayers.includes(player.id) && (
              <span className="text-blue-500 font-bold">&#10003;</span>
            )}
          </div>
        ))}
      </div>

      {/* Bouton de validation */}
      <button
        onClick={handleSubmit}
        disabled={selectedPlayers.length !== maxSelection || loading}
        className={`mt-6 py-3 px-6 rounded-lg  font-semibold text-slate-900 ${
          selectedPlayers.length === maxSelection && !loading
            ? "bg-blue-600 hover:bg-blue-700 text-slate-900"
            : "bg-gray-300 cursor-not-allowed text-slate-900"
        }`}
      >
        {loading ? "Validation..." : "Valider l'équipage"}
      </button>
    </div>
  );
}

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
        const response = await fetch(`/api/games/${gameCode}/players`, {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();

          // Trier les joueurs pour que le capitaine soit en premier
          const sortedPlayers = data.players.sort(
            (a: Player, b: Player) =>
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

    channel.bind("redirect-to-trip", () => {
      router.push(`/multidevice/game/${gameCode}/trip`);
    });

    channel.bind("redirect-to-vote", () => {
      router.push(`/multidevice/game/${gameCode}/vote`);
    });

    channel.bind("redirect-to-waiting", () => {
      router.push(`/multidevice/game/${gameCode}/player-wait`);
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
        const data = await response.json();

        // Redirections prises en charge via événements Pusher
        console.log("Équipage validé :", data);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 px-6 py-6">
      {/* Header */}
      <h1 className="text-2xl font-extrabold text-orange-900 mb-2 animate-pulse">
        🏝️ Qui part en voyage ?
      </h1>
      <p className="text-orange-700 text-lg italic mb-6">{`${selectedPlayers.length}/${maxSelection}`}</p>

      {/* Liste des joueurs */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-md transform transition-transform ${
              selectedPlayers.includes(player.id)
                ? "bg-orange-200 border-orange-500 scale-105"
                : "bg-white border-gray-300"
            } border cursor-pointer hover:scale-105`}
            onClick={() => toggleSelection(player.id)}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow ${
                  selectedPlayers.includes(player.id)
                    ? "bg-orange-400 text-white"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {player.username
                  .split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              {/* Nom du joueur */}
              <span className="text-md text-orange-900 font-semibold">
                {player.username}
              </span>
            </div>
            {/* Validation Icon */}
            {selectedPlayers.includes(player.id) && (
              <span className="text-orange-700 font-bold text-xl">
                &#10003;
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Bouton de validation */}
      <button
        onClick={handleSubmit}
        disabled={selectedPlayers.length !== maxSelection || loading}
        className={`mt-8 py-3 px-8 rounded-lg font-semibold text-lg transform transition-all ${
          selectedPlayers.length === maxSelection && !loading
            ? "bg-orange-600 text-white hover:bg-orange-700 hover:scale-105"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {loading ? "Validation en cours..." : "Valider l'équipage"}
      </button>
    </div>
  );
}

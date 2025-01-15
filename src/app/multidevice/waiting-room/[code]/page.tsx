"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { FaChevronLeft, FaGamepad } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import Pusher from "pusher-js";

export default function WaitingRoomPage() {
  const router = useRouter();
  const params = useParams();
  const gameCode = params.code; // Code de la partie
  const [players, setPlayers] = useState([]); // Liste des joueurs
  const [isHost, setIsHost] = useState(false); // Indique si l'utilisateur est l'hôte

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}`);
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.players);

          // Vérifier si l'utilisateur actuel est l'hôte
          const sessionUuid = document.cookie
            .split("; ")
            .find((row) => row.startsWith("session_uuid="))
            ?.split("=")[1];
          const currentPlayer = data.players.find(
            (player) => player.sessionUUID === sessionUuid
          );
          setIsHost(currentPlayer?.isHost || false);
        } else {
          console.error("Erreur lors de la récupération des joueurs existants.");
        }
      } catch (err) {
        console.error("Erreur lors de la requête pour récupérer les joueurs :", err);
      }
    };

    fetchPlayers();

    // Configurer Pusher pour écouter les événements en temps réel
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    });

    const channel = pusher.subscribe(`game-${gameCode}`);

    // Écouter l'événement "player-joined" pour mettre à jour la liste des joueurs
    channel.bind("player-joined", (data) => {
      setPlayers((prevPlayers) => [...prevPlayers, data.player]);
    });

    // Écouter l'événement "game-started" pour rediriger vers role-display
    channel.bind("game-started", () => {
      router.push(`multidevice/game/${gameCode}/role-display`);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [gameCode, router]);

  const handleStartGame = async () => {
    try {
      const sessionUuid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session_uuid="))
        ?.split("=")[1] || "";

      const response = await fetch(`/api/games/${gameCode}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionUuid }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        console.error("Erreur lors du lancement de la partie :", message);
      }
    } catch (err) {
      console.error("Erreur lors de la tentative de lancement de la partie :", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-50 px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-md bg-gray-200 px-4 py-2 rounded-lg mb-6">
        <button onClick={() => router.back()} className="text-gray-700 hover:text-gray-900">
          <FaChevronLeft size={20} />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-300 flex items-center justify-center rounded-md">
            <FaGamepad className="text-gray-600" />
          </div>
          <span className="text-gray-800 font-semibold">ICO</span>
        </div>
        <div className="w-6"></div> {/* Espace vide pour alignement */}
      </div>

      {/* Main Content */}
      <h1 className="text-lg font-bold text-slate-900 text-center mb-6">
        {players.length} personnes ont rejoint la partie
      </h1>

      {/* Bloc avec le code et QR Code */}
      <div className="bg-gray-100 rounded-lg shadow-lg px-4 py-6 w-full max-w-md mb-6">
        <div className="text-center mb-4">
          <p className="text-sm font-semibold text-slate-700">Code de la partie</p>
          <h2 className="text-xl font-bold text-slate-900">{gameCode}</h2>
        </div>
        <div className="flex justify-center">
          <QRCode value={gameCode} size={120} />
        </div>
      </div>

      {/* Liste des joueurs */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg shadow-sm"
          >
            <div className="w-8 h-8 bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center font-semibold">
              {player.avatar || "??"}
            </div>
            <span className="text-slate-900 font-semibold">{player.nickname}</span>
          </div>
        ))}
      </div>

      {/* Bouton pour lancer la partie (visible uniquement si l'utilisateur est hôte) */}
      {isHost && (
        <div className="w-full max-w-md">
          <button
            onClick={handleStartGame}
            className="w-full py-3 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition duration-300"
          >
            Lancer la partie
          </button>
        </div>
      )}
    </div>
  );
}

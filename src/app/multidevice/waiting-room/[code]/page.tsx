"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { FaChevronLeft, FaGamepad } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import Pusher from "pusher-js";

// Définir le type Player
interface Player {
  id: string;
  nickname: string;
  avatar?: string;
  sessionUUID: string;
  isHost: boolean;
}

export default function WaitingRoomPage() {
  const router = useRouter();
  const params = useParams();
  const gameCode: string = Array.isArray(params.code) ? params.code[0] : params.code || "";
  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
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

          // Vérifier si l'utilisateur est l'hôte
          const currentPlayer = data.players.find(
            (player: Player) => player.sessionUUID === sessionUuid
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

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
    });

    const channel = pusher.subscribe(`game-${gameCode}`);

    channel.bind("player-joined", (data: { player: Player }) => {
      setPlayers((prevPlayers) => [...prevPlayers, data.player]);
    });

    // Redirection automatique après "game-started"
    channel.bind("game-started", () => {
      router.push(`../game/${gameCode}/role-display`);
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
        ?.split("=")[1];

      if (!sessionUuid) {
        console.error("Session UUID manquant.");
        return;
      }

      const response = await fetch(`/api/games/${gameCode}/start`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionUuid }), // Inclure sessionUuid dans la requête
      });

      if (!response.ok) {
        const { message } = await response.json();
        console.error("Erreur lors du lancement de la partie :", message);
      } else {
        console.log("Partie lancée avec succès !");
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
        <div className="w-6"></div>
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
          <QRCode value={gameCode || "Code indisponible"} size={120} />
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

      {/* Bouton pour lancer la partie */}
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

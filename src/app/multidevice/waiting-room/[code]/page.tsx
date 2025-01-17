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
  const gameCode: string = Array.isArray(params.code)
    ? params.code[0]
    : params.code || "";
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
          console.error(
            "Erreur lors de la récupération des joueurs existants."
          );
        }
      } catch (err) {
        console.error(
          "Erreur lors de la requête pour récupérer les joueurs :",
          err
        );
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
      console.error(
        "Erreur lors de la tentative de lancement de la partie :",
        err
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-md bg-white shadow-md px-4 py-3 rounded-lg mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-800 transition duration-200"
        >
          <FaChevronLeft size={20} />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-200 flex items-center justify-center rounded-md shadow-md">
            <FaGamepad className="text-indigo-600" size={18} />
          </div>
          <span className="text-indigo-800 font-bold text-lg">ICO</span>
        </div>
        <div className="w-6"></div>
      </div>

      {/* Main Content */}
      <h1 className="text-xl font-extrabold text-slate-900 text-center mb-8 tracking-wide">
        {players.length} joueur{players.length > 1 ? "s" : ""} ont rejoint la
        partie
      </h1>

      {/* Bloc avec le code et QR Code */}
      <div className="bg-white rounded-lg shadow-xl px-6 py-8 w-full max-w-md mb-8">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-gray-500 uppercase">
            Code de la partie
          </p>
          <h2 className="text-2xl font-extrabold text-indigo-800 tracking-wider">
            {gameCode}
          </h2>
        </div>
        <div className="flex justify-center">
          <QRCode
            value={gameCode || "Code indisponible"}
            size={120}
            className="shadow-lg rounded-lg"
          />
        </div>
      </div>

      {/* Liste des joueurs */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center space-x-3 bg-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300"
          >
            <div className="w-10 h-10 bg-indigo-100 border border-indigo-300 rounded-full flex items-center justify-center font-semibold text-indigo-700">
              {player.avatar || "??"}
            </div>
            <span className="text-slate-800 font-semibold truncate">
              {player.nickname}
            </span>
          </div>
        ))}
      </div>

      {/* Bouton pour lancer la partie */}
      {isHost && (
        <div className="w-full max-w-md">
          <button
            onClick={handleStartGame}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition duration-300 font-bold text-lg"
          >
            Lancer la partie
          </button>
        </div>
      )}
    </div>
  );
}

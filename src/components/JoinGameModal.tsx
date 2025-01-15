"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Pusher from "pusher-js";

interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinGameModal({ isOpen, onClose }: JoinGameModalProps) {
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState("");
  const [pusher, setPusher] = useState<Pusher | null>(null);

  // Configuration de Pusher
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY!;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!;

    const newPusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    setPusher(newPusher);

    return () => {
      newPusher.disconnect();
    };
  }, []);

  if (!isOpen) return null;

  const handleJoin = async () => {
    if (!gameCode.trim()) {
      setError("Veuillez saisir un code de partie valide.");
      return;
    }
  
    // Récupérer le session UUID depuis les cookies
    const sessionUuid = document.cookie
      .split("; ")
      .find((row) => row.startsWith("session_uuid="))
      ?.split("=")[1] || "";
  
    // Récupérer le username depuis le localStorage pour les utilisateurs connectés
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const username = userInfo.username || localStorage.getItem("nickname") || `Visiteur-${Math.random().toString(36).substring(2, 8)}`;
  
    try {
      const response = await fetch(`/api/games/${gameCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-uuid": sessionUuid,
          "x-username": userInfo.username || "",
          "x-nickname": username,
        },
        body: JSON.stringify({}),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Rejoint la partie :", data);
  
        // Récupérer les données initiales de la partie pour afficher les joueurs
        const playersResponse = await fetch(`/api/games/${gameCode}`);
        if (playersResponse.ok) {
          const playersData = await playersResponse.json();
          console.log("Données initiales des joueurs :", playersData);
  
          // Rediriger vers la salle d'attente
          window.location.href = `multidevice/waiting-room/${gameCode}`;
        }
      } else {
        const { message } = await response.json();
        setError(message || "Erreur lors de la tentative de rejoindre la partie.");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion à la partie :", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-10">
      <div className="relative bg-white rounded-lg shadow-lg w-96 p-6">
        {/* Bouton pour fermer la modale */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-200"
        >
          <FaTimes className="text-lg" />
        </button>

        {/* Header */}
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Rejoindre une partie</h2>

        {/* Input pour le code de la partie */}
        <div className="mb-4">
          <label htmlFor="gameCode" className="block text-sm font-semibold text-gray-700 mb-2">
            Code de la partie
          </label>
          <input
            id="gameCode"
            type="text"
            placeholder="2R9BHB"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Séparateur avec "Ou" */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">Ou</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Option pour scanner le QR code */}
        <div className="text-center mb-6">
          <button
            onClick={() => console.log("Scanner le QR code")}
            className="text-blue-600 underline text-sm"
          >
            Scannez le QR code
          </button>
        </div>

        {/* Boutons */}
        <div className="mt-4">
          <button
            onClick={handleJoin}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Commencer l’aventure
          </button>
        </div>
      </div>
    </div>
  );
}

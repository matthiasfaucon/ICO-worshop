"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { FaChevronLeft, FaGamepad } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface WaitingRoomProps {
  gameCode: string;
  players: { id: number; nickname: string }[];
}

export default function WaitingRoom({ gameCode, players }: WaitingRoomProps) {
  const router = useRouter();

  const handleStartGame = () => {
    console.log("Lancer la partie");
    // Ajouter la logique pour démarrer la partie
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-50 px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-md bg-gray-200 px-4 py-2 rounded-lg mb-6">
        <a href="/">
        <button
          onClick={() => router.back()}
          className="text-gray-700 hover:text-gray-900"
        >
          <FaChevronLeft size={20} />
        </button>
        </a>
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
            <div className="w-8 h-8 bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center">
              {/* Placeholder for player icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a8 8 0 110 16 8 8 0 010-16zm0 14a6 6 0 100-12 6 6 0 000 12zm-2-7a2 2 0 104 0 2 2 0 00-4 0zM4.293 14.707A8.001 8.001 0 0110 18a8.001 8.001 0 015.707-3.293A5.978 5.978 0 0110 14a5.978 5.978 0 01-5.707 3.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-slate-900 font-semibold">{player.nickname}</span>
          </div>
        ))}
      </div>

      {/* Bouton pour lancer la partie */}
      <div className="w-full max-w-md">
        <button
          onClick={handleStartGame}
          className="w-full py-3 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition duration-300"
        >
          Lancer la partie
        </button>
      </div>
    </div>
  );
}

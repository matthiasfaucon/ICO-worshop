"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinGameModal({ isOpen, onClose }: JoinGameModalProps) {
  const [gameCode, setGameCode] = useState("");

  if (!isOpen) return null;

  const handleJoin = () => {
    console.log("Rejoindre la partie avec le code :", gameCode);
    // Ajouter la logique pour rejoindre une partie
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
            placeholder="34 24 01"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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

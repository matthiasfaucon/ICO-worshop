"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { FaChevronLeft, FaGamepad } from "react-icons/fa";

// Définir les types des propriétés attendues
interface CreateGameProps {
  withSiren: boolean;
  withBonus: boolean;
  pointsToWin: number;
  playersCount: number;
}

export default function CreateGameMulti({
  withSiren: initialWithSiren,
  withBonus: initialWithBonus,
  pointsToWin: initialPointsToWin,
  playersCount: initialPlayersCount,
}: CreateGameProps) {
  const [withSiren, setWithSiren] = useState(initialWithSiren);
  const [withBonus, setWithBonus] = useState(initialWithBonus);
  const [pointsToWin, setPointsToWin] = useState(initialPointsToWin);
  const [playersCount, setPlayersCount] = useState(initialPlayersCount);
  const router = useRouter();

  const handleCreateGame = async () => {

    try {
      const token = Cookies.get("authToken");
      if (!token) {
        alert("Vous devez être connecté pour créer une partie.");
        router.push("/auth-options/signIn");
        return;
      }

      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const username =
        userInfo.username || localStorage.getItem("nickname") || `User-${Math.random().toString(36).substring(2, 8)}`;

      const response = await fetch("/api/games/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-username": userInfo.username || "",
          "x-nickname": localStorage.getItem("nickname") || "",
        },
        body: JSON.stringify({
          withSiren,
          withBonus,
          pointsToWin,
          playersCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`./waiting-room/${data.code}`);
      } else {
        const error = await response.json();
        console.error("Erreur :", error.message);
        switch (error.code) {
          case "TOKEN_MISSING":
            alert("Erreur : Vous devez être connecté pour effectuer cette action.");
            router.push("/auth-options/signin");
            break;
          case "TOKEN_INVALID":
            alert("Erreur : Votre session a expiré. Veuillez vous reconnecter.");
            router.push("/auth-options/signin");
            break;
          default:
            alert("Erreur inconnue. Veuillez réessayer.");
        }
      }
    } catch (err) {
      console.error("Erreur lors de la création de la partie :", err);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const handlePlayersCountChange = (value: number) => {
    setPlayersCount(Math.max(3, Math.min(value, 20)));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-gray-50 px-6 py-8">
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={() => router.back()}
        className="p-3 text-blue-700 hover:text-blue-900 rounded-full bg-white shadow-md transition-transform transform hover:scale-110"
      >
        <FaChevronLeft size={24} />
      </button>
      <div className="flex items-center space-x-3">
        <FaGamepad size={28} className="text-blue-700" />
        <span className="text-xl font-bold text-blue-800">ICO</span>
      </div>
      <div className="w-6"></div>
    </div>
  
    {/* Title */}
    <h1 className="text-2xl font-extrabold text-center text-blue-800 mb-8">
      🌟 Créez votre partie 🌟
    </h1>
  
    {/* Modes */}
    <div className="mb-8">
      <div className="bg-blue-200 text-blue-900 font-bold text-sm rounded-lg px-4 py-2">
        Modes
      </div>
      <div className="flex space-x-6 mt-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={withSiren}
            onChange={() => setWithSiren(!withSiren)}
            className="form-checkbox text-blue-600 focus:ring-2 focus:ring-blue-500 rounded"
          />
          <span className="text-blue-800 font-medium">Avec la Sirène</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={withBonus}
            onChange={() => setWithBonus(!withBonus)}
            className="form-checkbox text-blue-600 focus:ring-2 focus:ring-blue-500 rounded"
          />
          <span className="text-blue-800 font-medium">Avec les Bonus</span>
        </label>
      </div>
    </div>
  
    {/* Parameters */}
    <div className="mb-8">
      <div className="bg-blue-200 text-blue-900 font-bold text-sm rounded-lg px-4 py-2">
        Paramètres
      </div>
      <div className="mt-6 space-y-6">
        {/* Points to Win */}
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">
            Nombre de points pour gagner
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={pointsToWin}
              onChange={(e) => setPointsToWin(Number(e.target.value))}
              className="w-24 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">Temps estimé : 30 min</span>
          </div>
        </div>
  
 
      </div>
    </div>
  
    {/* Create Game Button */}
    <div className="mt-auto">
      <button
        onClick={handleCreateGame}
        className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300"
      >
        🎮 Créer la Partie 🎮
      </button>
    </div>
  </div>
  
  );
}

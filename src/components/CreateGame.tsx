"use client";

import { useState } from "react";
import { FaChevronLeft, FaGamepad } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function CreateGame() {
  const [withSiren, setWithSiren] = useState(true);
  const [withBonus, setWithBonus] = useState(false);
  const [pointsToWin, setPointsToWin] = useState(10);
  const [playersCount, setPlayersCount] = useState(10);
  const router = useRouter();

  const handleCreateGame = () => {
    console.log("Création de la partie avec les paramètres :", {
      modes: {
        withSiren,
        withBonus,
      },
      pointsToWin,
      playersCount,
    });
    router.push("/waiting-room");

    // Logique de création de partie
  };

  const handlePlayersCountChange = (value: number) => {
    if (value < 5) setPlayersCount(5);
    else if (value > 20) setPlayersCount(20);
    else setPlayersCount(value);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <a href="/">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-700 hover:text-slate-900"
        >
          <FaChevronLeft size={24} />
        </button></a>

        <div className="flex items-center space-x-2">
          <FaGamepad size={24} className="text-slate-700" />
          <span className="text-lg font-semibold text-slate-900">ICO</span>
        </div>
        <div className="w-6"></div> {/* Espace pour alignement */}
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-center text-slate-900 mb-6">
        Votre partie
      </h1>

      {/* Modes */}
      <div className="mb-6">
        <div className="bg-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-900">
          Mode
        </div>
        <div className="flex space-x-4 mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={withSiren}
              onChange={() => setWithSiren(!withSiren)}
              className="form-checkbox text-blue-600"
            />
            <span className="text-slate-900">Avec la Sirène</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={withBonus}
              onChange={() => setWithBonus(!withBonus)}
              className="form-checkbox text-blue-600"
            />
            <span className="text-slate-900">Avec les Bonus</span>
          </label>
        </div>
      </div>

      {/* Parameters */}
      <div className="mb-6">
        <div className="bg-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-900">
          Paramètres
        </div>
        <div className="mt-4 space-y-4">
          {/* Points to win */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Nombre de points pour gagner
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={pointsToWin}
                onChange={(e) => setPointsToWin(Number(e.target.value))}
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-500">Temps estimé : 30 min</span>
            </div>
          </div>

          {/* Players count */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Nombre de joueurs
            </label>
            <input
              type="number"
              value={playersCount}
              onChange={(e) =>
                handlePlayersCountChange(Number(e.target.value))
              }
              className="w-20 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-500 mt-2 block">
              Min : 5, Max : 20
            </span>
          </div>
        </div>
      </div>

      {/* Create game button */}
      <div className="mt-auto">
        <button
          onClick={handleCreateGame}
          className="w-full py-3 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition duration-300"
        >
          Créer la partie
        </button>
      </div>
    </div>
  );
}

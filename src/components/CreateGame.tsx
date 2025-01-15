"use client";

import { useEffect, useState } from "react";
import { FaChevronLeft, FaGamepad } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { configureGame } from '@/lib/reducers/game';

export default function CreateGame() {
  const [withBonus, setWithBonus] = useState(false);
  const [pointsToWin, setPointsToWin] = useState(10);
  const [playersCount, setPlayersCount] = useState(10);

  const router = useRouter();
  const [gameRules, setGameRules] = useState({});
  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state) => state.game);

  const handleCreateGame = async () => {
    let generalRules = await fetch("/api/admin/game-rules?type=SPECIFIC", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      }
    })
    generalRules = await generalRules.json()

    generalRules = generalRules.reduce((acc, rule) => {
      acc[rule.key] = rule.value
      return acc
    }, {})

    dispatch(configureGame({ withBonus, pointsToWin, playersCount, min_players: generalRules["min-player"], max_players: generalRules["max-player"], min_points: generalRules["min-round-to-win"], max_points: generalRules["max-round-to-win"] }));
    console.log(gameState);
    router.push("/games");

  };

  const handlePlayersCountChange = (value: number) => {
    if (value < gameRules["min-player"]) {
      setPlayersCount(gameRules["min-player"]);
    } else if (value > gameRules["max-player"]) {
      setPlayersCount(gameRules["max-player"]);
    } else {
      setPlayersCount(value);
    }
  };

  useEffect(() => {
    async function fetchGameRules() {
      const filter = {
        type: "SPECIFIC"
      }
      const response = await fetch(`/api/admin/game-rules?type=${filter.type}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
      })

      const data = await response.json()
      const rules = data.reduce((acc, rule) => {
        acc[rule.key] = rule.value
        return acc
      }, {})
      setGameRules(rules)

    }
    fetchGameRules()
  }, [])

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
                min={gameRules["min-round-to-win"]}
                max={gameRules["max-round-to-win"]}
                onChange={(e) => setPointsToWin(Number(e.target.value))}
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-500">Temps estimé : 30 min</span>
            </div>
            <span className="text-sm text-slate-500 mt-2 block">
              Min : {gameRules["min-round-to-win"]}, Max : {gameRules["max-round-to-win"]}
            </span>
          </div>

          {/* Players count */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Nombre de joueurs
            </label>
            <input
              type="number"
              value={playersCount}
              min={gameRules["min-player"]}
              max={gameRules["max-player"]}
              onChange={(e) =>
                handlePlayersCountChange(Number(e.target.value))
              }
              className="w-20 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-500 mt-2 block">
              Min : {gameRules["min-player"]}, Max : {gameRules["max-player"]}
            </span>
          </div>
        </div>
      </div>

      {/* Create game button */}
      <div className="mt-auto">
        <button
          onClick={handleCreateGame}
          className="w-full py-3 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition duration-300">
          Créer la partie
        </button>
      </div>
    </div>
  );
}

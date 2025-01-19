"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { configureGame } from '@/lib/reducers/game';
import Header from "./header";
import Cookies from "js-cookie";

export default function CreateGame() {
  const [withBonus, setWithBonus] = useState(false);
  const [pointsToWin, setPointsToWin] = useState(10);
  const [playersCount, setPlayersCount] = useState(10);
  const [timerDuration, setTimerDuration] = useState(10);

  const router = useRouter();
  const [gameRules, setGameRules] = useState({});
  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state) => state.game);

  const handleCreateGame = async () => {
    const token = Cookies.get("authToken");
    let generalRules = await fetch("/api/admin/game-rules?type=SPECIFIC", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
    generalRules = await generalRules.json()

    generalRules = generalRules.reduce((acc, rule) => {
      acc[rule.key] = rule.value
      return acc
    }, {})

    dispatch(configureGame({ withBonus, pointsToWin, playersCount, timerDuration, min_players: generalRules["min-player"], max_players: generalRules["max-player"], min_points: generalRules["min-round-to-win"], max_points: generalRules["max-round-to-win"] }));
    router.push("/onedevice/games");
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

  const handleTimerDurationChange = (value: number) => {
    if (value < gameRules["min-timer-duration"]) {
      setTimerDuration(gameRules["min-timer-duration"]);
    } else if (value > gameRules["max-timer-duration"]) {
      setTimerDuration(gameRules["max-timer-duration"]);
    } else {
      setTimerDuration(value);
    }
  }

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
    <div className="bg-brown-texture h-screen bg-cover bg-center">
      <Header />
      <div className="mt-8 pt-6 relative bg-white/10 backdrop-blur-lg border-slate-50 border-2 border-white/20 rounded-lg shadow-lg w-11/12 h-5/6 mx-auto">
        {/* Title */}
        <h1 className="text-center text-white mb-6 font-magellan  text-4xl">
          Votre partie
        </h1>

        <div className="p-4 border-white/20 border-y-2">
          <p className="text-white font-filson ">Si tu débutes, on te conseille de commencer sans les bonus !</p>
        </div>

        {/* Modes */}
        <div className="flex items-center justify-center pt-10 pb-6">
          <div className="flex gap-10">
            <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={withBonus}
              onChange={() => setWithBonus(!withBonus)}
              className="appearance-none w-7 h-7 border-2 border-white rounded-md checked:bg-white checked:border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 relative"
            />
            <span className="font-filson text-xl">Avec les Bonus</span>
            <style jsx>{`
              input:checked::after {
                content: '✔';
                color: black;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 1rem;
                font-weight: bold;
              }
            `}</style>
            </label>
          </div>
        </div>

            {/* Parameters */}
            <div className="mb-6 px-4">
              <div className="mt-4 space-y-6">
                {/* Points to win */}
                <div className="flex justify-between items-start">
                  <div className="px-1">
                    <label className="block text-lg font-medium text-white">
                      Nombre de points pour gagner
                    </label>
                    <span className="text-sm text-white/80">
                      Min : {gameRules["min-round-to-win"]}, Max : {gameRules["max-round-to-win"]} (Temps estimé : 30 min)
                    </span>
                  </div>
                  <input
                    type="number"
                    value={pointsToWin}
                    min={gameRules["min-round-to-win"]}
                    max={gameRules["max-round-to-win"]}
                    onChange={(e) => setPointsToWin(Number(e.target.value))}
                    className="w-16 h-12 text-center text-lg font-medium text-white bg-transparent border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>

                {/* Players count */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-lg font-medium text-white">
                      Nombre de joueurs
                    </label>
                    <span className="text-sm text-white/80">
                      Min : {gameRules["min-player"]}, Max : {gameRules["max-player"]}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={playersCount}
                    min={gameRules["min-player"]}
                    max={gameRules["max-player"]}
                    onChange={(e) => handlePlayersCountChange(Number(e.target.value))}
                    className="w-16 h-12 text-center text-lg font-medium text-white bg-transparent border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>

                 {/* Timer Count */}
                 <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-lg font-medium text-white">
                      Durée du timer des pirates
                    </label>
                    <span className="text-sm text-white/80">
                      Min : {gameRules["min-timer-duration"]} s, Max : {gameRules["max-timer-duration"]} s
                    </span>
                  </div>
                  <input
                    type="number"
                    value={timerDuration}
                    min={gameRules["min-timer-duration"]}
                    max={gameRules["max-timer-duration"]}
                    onChange={(e) => handleTimerDurationChange(Number(e.target.value))}
                    className="w-16 h-12 text-center text-lg font-medium text-white bg-transparent border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>
            </div>

          {/* Create game button */}
          <div className="mt-auto px-4">
            <button
              onClick={handleCreateGame}
              className="w-full py-3 bg-white text-slate-800 font-bold rounded-lg">
              Créer la partie
            </button>
          </div>
      </div>
    </div>
  );
}
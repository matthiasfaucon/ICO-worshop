"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EndGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;

  const [winner, setWinner] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [score, setScore] = useState<{ pirates: number; marins: number } | null>(null);

  useEffect(() => {
    const fetchEndGameDetails = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}/check-game-winner`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setWinner(data.winner);
          setMessage(data.message);
          setScore(data.score);
        } else {
          console.error("Erreur lors de la récupération des résultats de fin de partie.");
        }
      } catch (error) {
        console.error("Erreur lors de l'appel à l'API end-game :", error);
      }
    };

    fetchEndGameDetails();
  }, [gameCode]);

  const handleRestart = () => {
    router.push(`/multidevice`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 text-gray-900 px-6 py-6">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 animate-fade-in">
        🎉 Fin de la Partie 🎉
      </h1>

      {message && (
        <p className="text-xl font-semibold text-gray-700 mb-4 text-center">
          {message}
        </p>
      )}

      {score && (
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 border-t-4 border-gray-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Score Final :</h2>
          <p className="text-md text-gray-700 mb-2">
            🏴‍☠️ Pirates : <span className="font-bold text-red-600">{score.pirates}</span>
          </p>
          <p className="text-md text-gray-700">
            🌊 Marins : <span className="font-bold text-green-600">{score.marins}</span>
          </p>
        </div>
      )}

      {winner && (
        <div className="mt-8 text-center">
          <p className="text-2xl font-bold text-gray-800">
            {winner === "marins"
              ? "🌊 Les Marins ont gagné avec la Sirène !"
              : "🏴‍☠️ Les Pirates ont triomphé !"}
          </p>
        </div>
      )}

      <button
        onClick={handleRestart}
        className="mt-8 py-3 px-8 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transform hover:scale-105 transition"
      >
        Rejouer une Partie
      </button>
    </div>
  );
}

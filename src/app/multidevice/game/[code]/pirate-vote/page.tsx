"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Pusher from "pusher-js";

export default function PirateVotePage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;

  const [players, setPlayers] = useState([]);
  const [isPirate, setIsPirate] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteResults, setVoteResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const sessionUuid =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("session_uuid="))
          ?.split("=")[1]
      : null;


  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}/players`, {
          method: "GET",
        });
        const data = await response.json();

        setPlayers(data.players);

        const currentPlayer = data.players.find(
          (player) => player.session_uuid === sessionUuid
        );

        if (!currentPlayer) {
          setErrorMessage("Erreur : Impossible de déterminer votre rôle.");
          return;
        }

        setIsPirate(currentPlayer.role.toLowerCase() === "pirate");
      } catch (error) {
        console.error("Erreur lors de la récupération des joueurs :", error);
        setErrorMessage("Erreur lors de la récupération des joueurs.");
      }
    };

    fetchPlayers();
  }, [gameCode, sessionUuid]);

  const handleVote = async (targetId) => {
    try {
      const response = await fetch(`/api/games/${gameCode}/pirate-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: sessionUuid, targetId }),
      });

      if (response.ok) {
        setHasVoted(true);
      } else {
        const error = await response.json();
        console.error("Erreur lors du vote :", error.message);
        setErrorMessage("Erreur lors du vote. Réessayez.");
      }
    } catch (error) {
      console.error("Erreur lors du vote :", error);
      setErrorMessage("Erreur lors du vote. Réessayez.");
    }
  };

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
    });

    const channel = pusher.subscribe(`game-${gameCode}`);

    channel.bind("vote-results", (data) => {
      setVoteResults(data.results);

      if (data.winner === "pirates") {
        alert("🎉 Les Pirates ont gagné !");
      } else if (data.winner === "sirene") {
        alert("🌊 La Sirène a gagné !");
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [gameCode]);

  if (errorMessage) {
    return <p className="text-red-500 font-bold">{errorMessage}</p>;
  }

  if (!isPirate) {
    return (
      <p className="text-center text-red-500 font-bold">
        Seuls les pirates peuvent voter.
      </p>
    );
  }

  if (hasVoted) {
    return (
      <p className="text-center text-green-500 font-bold">
        Merci, votre vote a été enregistré.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-4">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">
        Vote des Pirates 🏴‍☠️
      </h1>
      <ul className="w-full max-w-lg space-y-4">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between bg-white shadow-lg rounded-lg p-4 border border-gray-200"
          >
            <span className="font-medium text-gray-800">{player.username}</span>
            <button
              onClick={() => handleVote(player.id)}
              className="py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
            >
              Voter
            </button>
          </li>
        ))}
      </ul>

      {voteResults && (
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6 w-full max-w-lg border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Résultats des votes :
          </h2>
          <ul className="space-y-3">
            {voteResults.map((result) => (
              <li
                key={result.targetId}
                className="flex justify-between items-center"
              >
                <span className="font-medium text-gray-600">
                  {players.find((p) => p.id === result.targetId)?.username ||
                    "Joueur inconnu"}
                </span>
                <span className="font-bold text-blue-600">
                  {result.votes} votes
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

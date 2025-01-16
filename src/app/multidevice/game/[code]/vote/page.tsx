"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Player {
  id: string;
  username: string;
  vote?: "yes" | "no"; // Ajout pour suivre les votes
}

export default function VotePage() {
  const params = useParams();
  const gameCode = params.code;
  const [crew, setCrew] = useState<Player[]>([]);
  const [votes, setVotes] = useState<{ yes: Player[]; no: Player[] }>({ yes: [], no: [] });
  const [vote, setVote] = useState<"yes" | "no" | null>(null);

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}/crew`, { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          setCrew(data.crew);
        } else {
          console.error("Erreur lors de la récupération de l'équipage.");
        }
      } catch (error) {
        console.error("Erreur lors de la requête :", error);
      }
    };

    fetchCrew();
  }, [gameCode]);

  const handleVote = async (selectedVote: "yes" | "no") => {
    setVote(selectedVote);
    try {
      const sessionUuid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session_uuid="))
        ?.split("=")[1];

      if (!sessionUuid) {
        console.error("Session UUID manquant.");
        return;
      }

      await fetch(`/api/games/${gameCode}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionUuid, vote: selectedVote }),
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du vote :", error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      fetch(`/api/games/${gameCode}/check-vote`, { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
          setVotes({
            yes: data.yes || [],
            no: data.no || [],
          });
        });
    }, 200000);

    return () => clearInterval(timer);
  }, [gameCode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <div className="flex gap-2 items-center">
          <img src="/path/to/image-icon.svg" alt="icon" className="w-8 h-8" />
          <span className="text-xl font-bold">0</span>
          <img src="/path/to/image-icon.svg" alt="icon" className="w-8 h-8" />
        </div>
        <img src="/path/to/info-icon.svg" alt="info" className="w-8 h-8" />
      </div>

      {/* Main Question */}
      <h1 className="text-xl font-bold text-slate-900 mb-6">Est-ce que cet équipage part en voyage ?</h1>

      {/* Crew Display */}
      <div className="grid grid-cols-1 gap-4 mb-6 w-full max-w-md">
        {crew.map((player) => (
          <div key={player.id} className="p-4 bg-gray-100 rounded-lg flex items-center gap-2">
            {/* <img src="/path/to/player-icon.svg" alt="avatar" className="w-8 h-8" /> */}
            <span className="text-sm font-medium text-slate-900">{player.username}</span>
          </div>
        ))}
      </div>

      {/* Votes In Progress */}
      <div className="w-full max-w-md bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Votes en cours</h2>
          <div className="flex items-center gap-2">
            <img src="/path/to/clock-icon.svg" alt="timer" className="w-6 h-6" />
            <span className="text-lg font-medium">5</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Oui Column */}
          <div>
            <h3 className="text-sm font-bold bg-gray-200 p-2  text-slate-900 rounded">Oui</h3>
            <ul>
              {votes.yes.map((player) => (
                <li key={player.id} className="flex items-center gap-2 p-2">
                  <img src="/path/to/player-icon.svg" alt="avatar" className="w-6 h-6" />
                  <span className="text-sm text-slate-900">{player.username}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Non Column */}
          <div>
            <h3 className="text-sm font-bold bg-gray-200 p-2 rounded">Non</h3>
            <ul>
              {votes.no.map((player) => (
                <li key={player.id} className="flex items-center gap-2 p-2">
                  <img src="/path/to/player-icon.svg" alt="avatar" className="w-6 h-6" />
                  <span className="text-sm text-slate-900">{player.username}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Voting Buttons */}
      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={() => handleVote("yes")}
          disabled={!!vote}
          className={`flex-1 py-3 rounded-lg font-semibold ${
            vote === "yes" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          Oui
        </button>
        <button
          onClick={() => handleVote("no")}
          disabled={!!vote}
          className={`flex-1 py-3 rounded-lg font-semibold ${
            vote === "no" ? "bg-red-500 text-white " : "bg-gray-200"
          }`}
        >
          Non
        </button>
      </div>
    </div>
  );
}

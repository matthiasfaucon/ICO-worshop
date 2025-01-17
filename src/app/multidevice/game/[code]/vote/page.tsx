"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Pusher from "pusher-js";

export default function VotePage() {
  const params = useParams();
  const gameCode = params.code;

  const [votes, setVotes] = useState({
    yes: 0,
    no: 0,
    totalVotes: 0,
    totalPlayers: 0,
    playerVote: null,
  });

  const [vote, setVote] = useState(null);
  const [crew, setCrew] = useState([]);
  const [playersYetToVote, setPlayersYetToVote] = useState([]);
  const [sessionUuid, setSessionUuid] = useState(null);

  // Obtenir le sessionUuid uniquement côté client
  useEffect(() => {
    if (typeof document !== "undefined") {
      const uuid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session_uuid="))
        ?.split("=")[1];
      setSessionUuid(uuid);
    }
  }, []);

  // Récupération initiale des données
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [votesResponse, crewResponse] = await Promise.all([
          fetch(`/api/games/${gameCode}/vote`, { method: "GET" }),
          fetch(`/api/games/${gameCode}/crew`, { method: "GET" }),
        ]);

        if (votesResponse.ok) {
          const votesData = await votesResponse.json();
          setVotes({
            yes: votesData.yesVotes,
            no: votesData.noVotes,
            totalVotes: votesData.totalVotes,
            totalPlayers: votesData.totalPlayers,
            playerVote: votesData.playerVote || null,
          });
          setPlayersYetToVote(votesData.playersYetToVote || []);
        }

        if (crewResponse.ok) {
          const crewData = await crewResponse.json();
          setCrew(crewData.crew || []);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération initiale des données :",
          error
        );
      }
    };

    fetchInitialData();
  }, [gameCode]);

  // Gestion des votes
  const handleVote = async (selectedVote) => {
    setVote(selectedVote);

    try {
      if (!sessionUuid) {
        console.error("Session UUID manquant.");
        return;
      }

      const response = await fetch(`/api/games/${gameCode}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionUuid, vote: selectedVote }),
      });

      if (response.ok) {
        const data = await response.json();
        setVotes((prevVotes) => ({
          ...prevVotes,
          ...data,
          playerVote: selectedVote,
        }));
        setPlayersYetToVote(data.playersYetToVote || []);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du vote :", error);
    }
  };

  // Mise à jour en temps réel avec Pusher
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    });

    const channel = pusher.subscribe(`game-${gameCode}`);

    channel.bind("vote-updated", (data) => {
      setVotes({
        yes: data.yesVotes,
        no: data.noVotes,
        totalVotes: data.totalVotes,
        totalPlayers: data.totalPlayers,
        playerVote: data.playerVote || null,
      });
      setPlayersYetToVote(data.playersYetToVote || []);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [gameCode]);

  const voteProgress = votes.totalPlayers
    ? Math.round((votes.totalVotes / votes.totalPlayers) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-6">
      {/* Header */}
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
          Vote pour l'équipage
        </h1>
        <p className="text-gray-700 mb-6">
          Votez pour valider ou refuser l'équipage sélectionné.
        </p>
      </div>

      {/* Équipage sélectionné */}
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Équipage sélectionné :
        </h2>
        <ul className="space-y-2">
          {crew.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-md"
            >
              <span className="text-gray-700">{member.username}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Progrès des votes */}
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Progrès du vote :
          </h2>
          <span className="text-sm text-gray-600">
            {votes.totalVotes}/{votes.totalPlayers} votes ({voteProgress}%)
          </span>
        </div>
        <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
            style={{ width: `${voteProgress}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-bold text-green-600 mb-2">
              Oui ({votes.yes})
            </h3>
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-600 mb-2">
              Non ({votes.no})
            </h3>
          </div>
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-lg">
        <button
          onClick={() => handleVote("yes")}
          disabled={vote !== null}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
            vote === "yes"
              ? "bg-green-500 text-white"
              : vote === null
              ? "bg-gray-200 hover:bg-green-500 hover:text-white"
              : "bg-gray-200"
          }`}
        >
          Oui
        </button>
        <button
          onClick={() => handleVote("no")}
          disabled={vote !== null}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
            vote === "no"
              ? "bg-red-500 text-white"
              : vote === null
              ? "bg-gray-200 hover:bg-red-500 hover:text-white"
              : "bg-gray-200"
          }`}
        >
          Non
        </button>
      </div>

      {/* Message de statut */}
      <div className="mt-6 text-gray-600 text-center">
        {vote
          ? `Vous avez voté : ${vote === "yes" ? "Oui" : "Non"}`
          : "Vous n'avez pas encore voté."}
      </div>

      {/* Joueurs non votants */}
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-6 mb-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Joueurs n'ayant pas encore voté :
        </h2>
        <ul className="space-y-2">
          {playersYetToVote.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-md"
            >
              <span className="text-gray-700">{player.username}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

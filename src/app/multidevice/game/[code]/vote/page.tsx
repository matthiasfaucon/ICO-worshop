"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Pusher from "pusher-js";

interface Votes {
  yes: number;
  no: number;
  totalVotes: number;
  totalPlayers: number;
  playerVote: "yes" | "no" | null;
}

interface CrewMember {
  id: string;
  username: string;
}

interface PlayerYetToVote {
  id: string;
  username: string;
}

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;

  const [votes, setVotes] = useState<Votes>({
    yes: 0,
    no: 0,
    totalVotes: 0,
    totalPlayers: 0,
    playerVote: null,
  });
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [playersYetToVote, setPlayersYetToVote] = useState<PlayerYetToVote[]>(
    []
  );
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [timer, setTimer] = useState<number | null>(5);
  const [rejectedTimer, setRejectedTimer] = useState<number | null>(null);
  const [failedTimer, setFailedTimer] = useState<number | null>(null);

  // Obtenir le sessionUuid uniquement côté client
  useEffect(() => {
    if (typeof document !== "undefined") {
      const uuid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session_uuid="))
        ?.split("=")[1];
      setSessionUuid(uuid || null);
    }
  }, []);

  // Récupération initiale des données (votes et équipage)
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
          setVote(votesData.playerVote || null);
          setPlayersYetToVote(votesData.playersYetToVote || []);
        }

        if (crewResponse.ok) {
          const crewData = await crewResponse.json();
          setCrew(crewData.crew || []);
        }

        // Une fois les données récupérées, arrêter le chargement
        setIsLoading(false);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération initiale des données :",
          error
        );
        setIsLoading(false); // Arrêter le chargement même en cas d'erreur
      }
    };

    fetchInitialData();
  }, [gameCode]);

  // Gestion des votes
  const handleVote = async (selectedVote: "yes" | "no") => {
    try {
      if (!sessionUuid) {
        throw new Error("Session UUID manquant.");
      }

      const response = await fetch(`/api/games/${gameCode}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionUuid, vote: selectedVote }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur lors de l'envoi du vote :", errorData);
        throw new Error(errorData.message || "Erreur lors de l'envoi du vote.");
      }

      const data = await response.json();
      setVote(selectedVote); // Enregistrer le vote localement
    } catch (error) {
      console.error("Erreur dans handleVote :", error);
    }
  };

  // Mise à jour en temps réel avec Pusher
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
    });

    const channel = pusher.subscribe(`game-${gameCode}`);

    channel.bind("vote-updated", (data: any) => {
      setVotes({
        yes: data.yesVotes,
        no: data.noVotes,
        totalVotes: data.totalVotes,
        totalPlayers: data.totalPlayers,
        playerVote: data.playerVote || null,
      });
      setPlayersYetToVote(data.playersYetToVote || []);
    });

    channel.bind("vote-success", async () => {
    
      try {
        // Forcer la récupération de l'équipage avant d'envoyer
        const crewResponse = await fetch(`/api/games/${gameCode}/crew`, { method: "GET" });
        if (!crewResponse.ok) {
          console.error("Erreur lors de la récupération de l'équipage :", await crewResponse.json());
          return;
        }
    
        const crewData = await crewResponse.json();
    
        const selectedPlayers = crewData.crew.map((member: CrewMember) => member.id); // Utiliser la donnée récupérée
    
        const response = await fetch(`/api/games/${gameCode}/post-vote-crew`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedPlayers }),
        });
    
        if (response.ok) {
    
          // Initialisez le compte à rebours
          setTimer(5);
          const countdown = setInterval(() => {
            setTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
          }, 1000);
    
          setTimeout(() => {
            clearInterval(countdown);
            router.push(`/multidevice/game/${gameCode}/trip`);
          }, 5000);
        } else {
          console.error("Erreur lors de la configuration de l'équipage :", await response.json());
        }
      } catch (error) {
        console.error("Erreur lors de l'appel à post-vote-crew :", error);
      }
    });
    

    channel.bind("vote-rejected", async (data: any) => {
  
      // Initialisez un compte à rebours de 5 secondes
      setRejectedTimer(5);
  
      const countdown = setInterval(() => {
        setRejectedTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
  
      // Obtenez l'utilisateur actuel
      const sessionUuid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session_uuid="))
        ?.split("=")[1];
  
      // Récupérez le capitaine actuel via l'API
      const response = await fetch(`/api/games/${gameCode}/current-captain`, {
        method: "GET",
      });
      if (!response.ok) {
        console.error("Erreur lors de la récupération du capitaine actuel.");
        return;
      }
  
      const currentCaptainData = await response.json();
      const currentCaptainUuid = currentCaptainData.currentCaptain.sessionUuid;
  
      setTimeout(() => {
        clearInterval(countdown);
  
        if (sessionUuid === currentCaptainUuid) {
          // Capitaine redirigé vers la sélection de l'équipage
          router.push(`/multidevice/game/${gameCode}/captain-selection`);
        } else {
          // Autres joueurs redirigés vers la salle d'attente
          router.push(`/multidevice/game/${gameCode}/player-wait`);
        }
      }, 5000);
    });
  
    // Événement pour passer au capitaine suivant
    channel.bind("vote-failed", (data: any) => {
    
      // Initialisez un compte à rebours de 5 secondes
      setFailedTimer(5);
    
      const countdown = setInterval(() => {
        setFailedTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    
      const sessionUuid = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session_uuid="))
        ?.split("=")[1];
    
      setTimeout(() => {
        clearInterval(countdown);
    
        if (sessionUuid === data.captainSessionUuid) {
          // Redirection du nouveau capitaine
          router.push(`/multidevice/game/${gameCode}/captain-selection`);
        } else {
          // Redirection des autres joueurs
          router.push(`/multidevice/game/${gameCode}/player-wait`);
        }
      }, 5000);
    });
    
    


    
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [gameCode,router]);

  

  const voteProgress = votes.totalPlayers
    ? Math.round((votes.totalVotes / votes.totalPlayers) * 100)
    : 0;

  if (isLoading) {
    // Afficher un spinner ou un message de chargement
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <h1 className="text-xl font-semibold text-gray-700 animate-pulse">
          Chargement...
        </h1>
      </div>
    );
  }

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

      {rejectedTimer !== null && (
  <div className="text-center text-red-600 font-semibold mt-4">
    Équipage démantelé, nouvelle sélection dans {rejectedTimer}...
  </div>
)}

 {/* Message de redirection */}
 {timer < 5 && timer > 0 && (
        <div className="text-lg font-semibold text-gray-700 mb-6">
          L'équipage va maintenant procéder à son voyage dans {timer}...
        </div>
      )}

{failedTimer !== null && (
  <div className="text-center text-red-600 font-semibold mt-4">
    Deuxième rejet, passage au capitaine suivant dans {failedTimer}...
  </div>
)}

      {/* Boutons de vote */}
      <div className="flex gap-4 w-full max-w-lg">
        {vote !== "no" && (
          <button
            onClick={() => handleVote("yes")}
            disabled={vote !== null}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
              vote === "yes"
                ? "bg-green-500 text-white"
                : "bg-gray-200 hover:bg-green-500 hover:text-white"
            }`}
          >
            Oui
          </button>
        )}
        {vote !== "yes" && (
          <button
            onClick={() => handleVote("no")}
            disabled={vote !== null}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
              vote === "no"
                ? "bg-red-500 text-white"
                : "bg-gray-200 hover:bg-red-500 hover:text-white"
            }`}
          >
            Non
          </button>
        )}
      </div>

      {/* Message de statut */}
      {vote === null ? (
        <div className="mt-6 text-gray-600 text-center">
          Vous n'avez pas encore voté.
        </div>
      ) : (
        <div className="mt-6 text-gray-600 text-center">
          Vous avez voté : {vote === "yes" ? "Oui" : "Non"}.
        </div>
      )}

      {/* Joueurs n'ayant pas encore voté */}
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

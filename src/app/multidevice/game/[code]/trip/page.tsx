"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Pusher from "pusher-js";


interface CrewMember {
  id: string;
  username: string;
  session_uuid: string;
}

interface DeckSlot {
  playerId: string;
  username: string;
  card: "island" | "poison" | null;
}

interface Score {
  pirates: number;
  marins: number;
}

export default function MissionPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;

  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [deck, setDeck] = useState<DeckSlot[]>([]);
  const [selectedCard, setSelectedCard] = useState<"island" | "poison" | null>(
    null
  );
  const [isMissionOver, setIsMissionOver] = useState(false);
  const [missionResult, setMissionResult] = useState<"pirates" | "marins" | null>(
    null
  );
  const [score, setScore] = useState<Score>({ pirates: 0, marins: 0 });
  const [nextCaptain, setNextCaptain] = useState<string | null>(null);
  const [currentCaptainSessionUuid, setCurrentCaptainSessionUuid] = useState<
    string | null
  >(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);

  const [areCardsRevealed, setAreCardsRevealed] = useState(false); 

  
  const sessionUuid =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("session_uuid="))
          ?.split("=")[1]
      : null;

  const isInCrew = crew.some((member) => member.session_uuid === sessionUuid);
  const isCaptain = currentCaptainSessionUuid === sessionUuid;
  const [countdown, setCountdown] = useState<number | null>(null); // État pour le timer
  const areAllCardsPlayed = deck.every((slot) => slot.card !== null);

  useEffect(() => {
    const fetchCurrentCaptain = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}/current-captain`, {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentCaptainSessionUuid(data.currentCaptain.sessionUuid);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du capitaine actuel :",
          error
        );
      }
    };

    fetchCurrentCaptain();
  }, [gameCode]);


  const startCountdown = (duration: number) => {
    setCountdown(duration); // Initialiser le compte à rebours
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null; // Arrêter le timer
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}/crew`, {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setCrew(data.crew);

          const initialDeck = data.crew.map((member: CrewMember) => ({
            playerId: member.id,
            username: member.username,
            card: null,
          }));
          setDeck(initialDeck);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'équipage :", error);
      }
    };

    fetchCrew();
  }, [gameCode]);

  const updateNextCaptain = async () => {
    try {
      const response = await fetch(`/api/games/${gameCode}/maj-capitaine-end-turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionUuid }),
      });

      if (response.ok) {
        const data = await response.json();
        setNextCaptain(data.nextCaptain.session_uuid);
      } else {
        console.error(
          "Erreur lors de la mise à jour du capitaine :",
          await response.json()
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'appel à la route maj-capitaine-end-turn :",
        error
      );
    }
  };


  const handleCheckGameWinner = async () => {
    try {
      const response = await fetch(`/api/games/${gameCode}/check-game-winner`, {
        method: "GET",
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur lors de la vérification du gagnant :", errorData);
        return;
      }
  
      const data = await response.json();
  
      if (data.winner) {
        // Mettre à jour l'état pour indiquer la fin de la partie
        setIsGameOver(true);
        setFinalMessage(data.message);
  
        // Déterminer la page de redirection en fonction du gagnant
        const redirectPath =
          data.winner === "marins"
            ? `/multidevice/game/${gameCode}/end-game`
            : `/multidevice/game/${gameCode}/end-game`; // Uniformisation pour pirates et marins
    
        // Redirection après un délai
        setTimeout(() => {
          router.push(redirectPath);
        }, 500); // Délai de 0.5 seconde
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à la route check-game-winner :", error);
    }
  };
  
  const handleReveal = async () => {
    try {
      const response = await fetch(`/api/games/${gameCode}/mission-reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionUuid }),
      });

      if (response.ok) {
        setAreCardsRevealed(true);
        await updateNextCaptain();
        setIsMissionOver(true);
        await handleCheckGameWinner(); 
        setIsMissionOver(true);
      } else {
        console.error(
          "Erreur lors de la révélation des cartes :",
          await response.json()
        );
      }
    } catch (error) {
      console.error("Erreur lors de la révélation des cartes :", error);
    }
  };

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
    });

    const channel = pusher.subscribe(`game-${gameCode}`);

    channel.bind(
      "card-played",
      (data: { playerId: string; card: "island" | "poison" }) => {
        setDeck((prevDeck) =>
          prevDeck.map((slot) =>
            slot.playerId === data.playerId
              ? { ...slot, card: data.card }
              : slot
          )
        );
      }
    );

    channel.bind("mission-reveal", (data: any) => {
      setMissionResult(data.result);

      setScore((prevScore) => ({
        pirates: data.score?.pirates ?? prevScore.pirates,
        marins: data.score?.marins ?? prevScore.marins,
      }));

      setNextCaptain(data.nextCaptainSessionUuid);

      if (!isGameOver) {
        startCountdown(80); // Début du timer de 80 secondes
        setTimeout(() => {
          if (sessionUuid === data.nextCaptainSessionUuid) {
            router.push(`/multidevice/game/${gameCode}/captain-selection`);
          } else {
            router.push(`/multidevice/game/${gameCode}/player-wait`);
          }
        }, 8000);
      }
    });

    channel.bind("game-winner", (data: any) => {
    
      // Mettre à jour le message final et marquer la partie comme terminée
      setFinalMessage(data.message);
      setIsGameOver(true);
    
      // Délai avant redirection vers la page appropriée
      const redirectDelay = 500; // Délai de 0.5 seconde
    
      setTimeout(() => {
        if (data.winner === "marins") {
          router.push(`/multidevice/game/${gameCode}/end-game`);
        } else if (data.winner === "pirates") {
          router.push(`/multidevice/game/${gameCode}/end-game`);
        }
      }, redirectDelay);
    });
    

    

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [gameCode, sessionUuid, router]);

  const handleCardSelection = async (cardType: "island" | "poison") => {
    try {
      if (!sessionUuid) {
        console.error("Session UUID manquant.");
        return;
      }

      await fetch(`/api/games/${gameCode}/play-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionUuid, card: cardType }),
      });

      setSelectedCard(cardType);
    } catch (error) {
      console.error("Erreur lors de la sélection de la carte :", error);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 via-orange-100 to-red-50 px-4 py-6 text-gray-900">
  {/* Titre principal */}
  <h1 className="text-4xl font-extrabold text-orange-700 mb-6 animate-bounce">
    🌊 Le voyage est en cours... 🌊
  </h1>

  {countdown !== null && (
        <p className="text-lg font-semibold text-gray-800">
          La prochaine manche débute dans <span className="font-bold text-blue-500">{countdown}s</span>
        </p>
      )}

  {/* Plateau de mission */}
  <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-6 mb-6 border-t-4 border-orange-500">
    <h2 className="text-xl font-bold text-gray-800 mb-4">Plateau de la mission :</h2>
    <ul className="space-y-3">
      {deck.map((slot) => (
     <li
     key={slot.playerId}
     className={`flex items-center justify-between px-4 py-3 rounded-lg ${
       areCardsRevealed
         ? slot.card === "island"
           ? "bg-green-100 border-l-4 border-green-500 text-green-700"
           : slot.card === "poison"
           ? "bg-red-100 border-l-4 border-red-500 text-red-700"
           : "bg-gray-100 border-l-4 border-gray-300 text-gray-700"
         : "bg-gray-200 border-l-4 border-gray-400 text-gray-800"
     }`}
   >
         <span className="font-medium">
                {areCardsRevealed
                  ? slot.card
                    ? slot.card === "island"
                      ? "🌴 Île"
                      : "☠️ Poison"
                    : "En attente..."
                  : slot.card
                  ? "Joué"
                  : "En attente..."}
              </span>
        </li>
      ))}
    </ul>
  </div>

  {/* Actions disponibles */}
  {!isMissionOver && !selectedCard && isInCrew && (
    <div className="flex gap-6">
      <button
        onClick={() => handleCardSelection("island")}
        className="py-3 px-6 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transform hover:scale-105 transition"
      >
        Jouer 🌴 Île
      </button>
      {crew.find((member) => member.session_uuid === sessionUuid)?.role === "pirate" && (
        <button
          onClick={() => handleCardSelection("poison")}
          className="py-3 px-6 bg-red-500 text-white font-semibold rounded-lg shadow-lg hover:bg-red-600 transform hover:scale-105 transition"
        >
          Jouer ☠️ Poison
        </button>
      )}
    </div>
  )}

{!isMissionOver && isCaptain && areAllCardsPlayed && (
    <button
      onClick={handleReveal}
      className="py-3 px-8 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transform hover:scale-105 transition mt-6"
    >
      Révéler les cartes jouées
    </button>
  )}

  {/* Résultat de la mission */}
  {isMissionOver && (
    <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-6 mt-6 border-t-4 border-orange-500">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Résultat de la mission :</h2>
      <p
        className={`text-2xl font-extrabold ${
          missionResult === "pirates" ? "text-red-600" : "text-green-600"
        }`}
      >
        {missionResult === "pirates"
          ? "🏴‍☠️ Les Pirates ont gagné ce tour !"
          : "🌊 Les Marins et la Sirène ont triomphé !"}
      </p>
      <h3 className="text-lg font-semibold text-gray-800 mt-6">Score actuel :</h3>
      <p className="text-md text-gray-700">
        Pirates : <span className="font-bold text-red-600">{score.pirates}</span> | Marins :{" "}
        <span className="font-bold text-green-600">{score.marins}</span>
      </p>
      {nextCaptain && (
        <p className="text-md text-gray-700 mt-4">
          Le nouveau capitaine est :{" "}
          <strong className="text-orange-700">{nextCaptain}</strong>
        </p>
      )}
    </div>
  )}

  {/* Animation arrière-plan */}
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-orange-400 to-transparent rounded-full blur-2xl opacity-30 animate-blob"></div>
    <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-r from-yellow-300 to-transparent rounded-full blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
    <div className="absolute bottom-10 left-20 w-80 h-80 bg-gradient-to-r from-red-500 to-transparent rounded-full blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
  </div>
</div>

  );
}

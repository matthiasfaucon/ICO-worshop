"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Player {
  id: string;
  username: string;
  is_captain: boolean; // Correction pour refléter le champ JSON renvoyé
  session_uuid: string; // Ajout pour inclure le champ session_uuid
}

export default function PiratesDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;
  const [team, setTeam] = useState<Player[]>([]);
  const [isCaptain, setIsCaptain] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}/pirates`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Données reçues pour les pirates :", data.pirates);
          setTeam(data.pirates);
          console.log(team);
          // Récupérer le sessionUuid depuis les cookies
          const sessionUuid = document.cookie
            .split("; ")
            .find((row) => row.startsWith("session_uuid="))
            ?.split("=")[1];

          if (!sessionUuid) {
            console.error("Session UUID manquant.");
            return;
          }

          // Vérifier si le joueur actuel est le capitaine
          const currentPlayer = data.pirates.find(
            (player: Player) => player.session_uuid === sessionUuid // Vérification correcte avec session_uuid
          );

          console.log("Joueur actuel trouvé :", currentPlayer);
          setIsCaptain(currentPlayer?.is_captain || false); // Utilisation correcte de is_captain
        } else {
          console.error("Erreur lors de la récupération des pirates.");
        }
      } catch (err) {
        console.error("Erreur lors de la requête :", err);
      }
    };

    fetchTeam();

    // Redirection après 20 secondes
    const timer = setTimeout(() => {
      if (isCaptain) {
        router.push(`/multidevice/game/${gameCode}/captain-selection`);
      } else {
        router.push(`/multidevice/game/${gameCode}/player-wait-captain`);
      }
    }, 20000); // 20 secondes

    return () => clearTimeout(timer); // Nettoyage du timer à la fin
  }, [gameCode, isCaptain, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-6">
      {/* Titre principal */}
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Votre bande de pirates</h1>
      <p className="text-sm text-gray-500 mb-6">N'oubliez personne !</p>

      {/* Timer placeholder */}
      <div className="w-48 h-48 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center mb-6">
        <p className="text-gray-500 font-semibold">Timer</p>
      </div>

      {/* Grille des pirates */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {team.map((member) => (
          <div
            key={member.id}
            className="flex flex-row gap-5 items-center bg-gray-100 p-4 rounded-lg shadow"
          >
            {/* Placeholder avec initiales */}
            <div className="w-12 h-12 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center mb-2 font-semibold">
              {member.username && member.username.trim()
                ? member.username
                    .trim()
                    .split(/\s+/)
                    .flatMap((word: string) => word.slice(0, 3)) // Récupération jusqu'à 3 lettres par mot
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "??"}
            </div>
            {/* Pseudo */}
            <p className="text-sm font-medium text-slate-900">{member.username || "Visiteur"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

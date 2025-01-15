"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PiratesDisplayPage() {
  const params = useParams();
  const gameCode = params.code;
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}/pirates`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setTeam(data.pirates);
        } else {
          console.error("Erreur lors de la récupération des pirates.");
        }
      } catch (err) {
        console.error("Erreur lors de la requête :", err);
      }
    };

    fetchTeam();
  }, [gameCode]);

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
              {member.nickname
                ? member.nickname
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "??"}
            </div>
            {/* Pseudo */}
            <p className="text-sm font-medium text-slate-900">{member.nickname || "Visiteur"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

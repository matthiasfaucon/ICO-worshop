"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Pusher from "pusher-js";

export default function RoleDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = Array.isArray(params.code) ? params.code[0] : params.code; // Vérification de type
  const [currentRole, setCurrentRole] = useState<string>("");
  const [isCaptain, setIsCaptain] = useState<boolean>(false);

  useEffect(() => {
    if (!gameCode) {
      console.error("Le code de la partie est manquant.");
      return;
    }

    const fetchRole = async () => {
      try {
        const sessionUuid =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("session_uuid="))
            ?.split("=")[1] || "";

        if (!sessionUuid) {
          console.error("Session UUID manquant.");
          return;
        }

        const response = await fetch(`/api/games/${gameCode}/role`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionUuid }),
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentRole(data.role);
          setIsCaptain(data.is_captain);
        } else {
          console.error("Erreur lors de la récupération du rôle.");
        }
      } catch (err) {
        console.error("Erreur lors de la requête :", err);
      }
    };

    fetchRole();

    // Configurer Pusher pour synchroniser les redirections
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
    });

    const channel = pusher.subscribe(`game-${gameCode}`);
    channel.bind("redirect", (data: { role: string }) => {
      console.log("Redirection synchronisée reçue :", data);
    });

    // Redirection automatique après 10 secondes
    const timer = setTimeout(() => {
      if (currentRole === "pirate" || currentRole === "sirene") {
        router.push(`../${gameCode}/pirates-display`);
      } else if (currentRole === "marin") {
        router.push(`../${gameCode}/marins-display`);
      }
    }, 10000); // 10 secondes

    return () => {
      clearTimeout(timer); // Nettoyer le timeout
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [gameCode, router, currentRole]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 px-6 py-8">
      {/* Titre principal */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-4 animate-fade-in">
        Vous êtes <span className="text-blue-600">{currentRole}</span> !
      </h1>

      {/* Indication de rôle de capitaine */}
      {isCaptain && (
        <h2 className="text-xl font-semibold text-indigo-600 bg-indigo-100 px-4 py-2 rounded-lg shadow-md mb-6">
          Vous êtes aussi le Capitaine !
        </h2>
      )}

      {/* Icône ou avatar */}
      <div className="w-40 h-40 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 2a8 8 0 110 16 8 8 0 010-16zm0 14a6 6 0 100-12 6 6 0 000 12zm-2-7a2 2 0 104 0 2 2 0 00-4 0zM4.293 14.707A8.001 8.001 0 0110 18a8.001 8.001 0 015.707-3.293A5.978 5.978 0 0110 14a5.978 5.978 0 01-5.707 3.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Texte d'information */}
      <p className="text-center text-sm text-gray-700 leading-relaxed">
        Préparez-vous pour le début de la partie !<br />
        Le capitaine choisira bientôt son équipage.
      </p>
    </div>
  );
}

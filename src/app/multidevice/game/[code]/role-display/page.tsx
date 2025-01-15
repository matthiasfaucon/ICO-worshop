"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Pusher from "pusher-js";

export default function RoleDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;
  const [currentRole, setCurrentRole] = useState("");
  const [isCaptain, setIsCaptain] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const sessionUuid = document.cookie
          .split("; ")
          .find((row) => row.startsWith("session_uuid="))
          ?.split("=")[1] || "";

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

          console.log("Rôle récupéré :", data.role);
        } else {
          console.error("Erreur lors de la récupération du rôle.");
        }
      } catch (err) {
        console.error("Erreur lors de la requête :", err);
      }
    };

    fetchRole();

    // Configurer Pusher pour synchroniser les redirections
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    });

    const channel = pusher.subscribe(`game-${gameCode}`);
    channel.bind("redirect", (data) => {
      console.log("Redirection synchronisée reçue :", data);

      // Rediriger en fonction du rôle reçu dans l'événement
      if (data.role === "pirate" || data.role === "sirène") {
        router.push(`multidevice/game/${gameCode}/pirates-display`);
      } else if (data.role === "marin") {
        router.push(`multidevice/game/${gameCode}/main`);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [gameCode, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {isCaptain ? "Vous êtes le Capitaine !" : `Vous êtes ${currentRole} !`}
      </h1>
      <div className="w-32 h-32 bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-gray-500"
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
      <p className="text-center text-sm text-gray-600 mt-4">
        Préparez-vous pour le début de la partie !
      </p>
    </div>
  );
}

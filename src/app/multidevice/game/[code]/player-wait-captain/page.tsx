"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Pusher from "pusher-js";

export default function PlayerWaitCaptainPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;

  useEffect(() => {
    // Configuration de Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    });

    // S'abonner au canal du jeu
    const channel = pusher.subscribe(`game-${gameCode}`);

    // Écouter l'événement pour rediriger les joueurs
    channel.bind("redirect-to-vote", () => {
      router.push(`/multidevice/game/${gameCode}/vote`);
    });

    // Nettoyage à la fin de l'effet
    return () => {
      pusher.unsubscribe(`game-${gameCode}`);
    };
  }, [gameCode, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-md mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
            <img src="/path/to/image-icon.svg" alt="icon" className="h-6 w-6" />
          </div>
          <div className="text-lg font-medium">3</div>
          <div className="text-gray-500">/</div>
          <div className="text-lg font-medium">5</div>
        </div>
        <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full">
          <img src="/path/to/info-icon.svg" alt="info" className="h-6 w-6" />
        </div>
      </div>

      {/* Main content */}
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Le capitaine travaille</h1>

      {/* Loader */}
      <div className="flex flex-col items-center justify-center w-64 h-64 bg-gray-100 border border-gray-300 rounded-lg">
        <img src="/path/to/loader-icon.svg" alt="loader" className="h-12 w-12 mb-4" />
        <p className="text-lg font-semibold text-gray-700">En attente...</p>
      </div>
    </div>
  );
}

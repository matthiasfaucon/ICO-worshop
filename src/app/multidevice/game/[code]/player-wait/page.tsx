"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Pusher, { Channel } from "pusher-js";

export default function PlayerWait() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;

  useEffect(() => {
    // Vérification des variables d'environnement
    const pusherAppKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;

    if (!pusherAppKey || !pusherCluster) {
      console.error("Pusher environment variables are missing.");
      return;
    }

    // Configuration de Pusher
    const pusher = new Pusher(pusherAppKey, {
      cluster: pusherCluster,
    });

    // S'abonner au canal du jeu
    const channel: Channel = pusher.subscribe(`game-${gameCode}`);

    // Rediriger les membres de l'équipage vers `/trip` si c'est le premier tour
    channel.bind("redirect-to-trip", () => {
      router.push(`/multidevice/game/${gameCode}/trip`);
    });

    // Rediriger les autres joueurs vers `/vote` si ce n'est pas le premier tour
    channel.bind("redirect-to-vote", () => {
      router.push(`/multidevice/game/${gameCode}/vote`);
    });

    // Rediriger les joueurs non choisis vers la salle d'attente
    channel.bind("redirect-to-waiting", () => {
      router.push(`/multidevice/game/${gameCode}/waiting`);
    });

    // Rediriger tous les joueurs sur le plateau lors du reveal
    channel.bind("mission-reveal", () => {
      router.push(`/multidevice/game/${gameCode}/trip`);
    });

    // Nettoyage à la fin de l'effet
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [gameCode, router]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 via-orange-100 to-red-50 text-gray-900 px-6 py-6 overflow-hidden">
      {/* Titre principal */}
      <h1 className="text-4xl font-extrabold text-center text-orange-700 mb-10 animate-bounce">
        🏝️ Le capitaine compose son équipage 🏝️
      </h1>

      {/* Loader stylisé */}
      <div className="relative flex flex-col items-center justify-center w-64 h-64 bg-gradient-to-br from-orange-200 to-yellow-100 rounded-full shadow-xl border-4 border-orange-400">
        {/* Animation centrale */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 bg-gradient-to-r from-yellow-400 via-red-400 to-orange-400 rounded-full animate-pulse opacity-20"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 rounded-full animate-spin-slow"></div>
        </div>
        {/* Icône centrale */}
        <svg
          fill="#FF6F00"
          width="80px"
          height="80px"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          className="z-10"
        >
          <path d="M441.215 227.396l-40.302 2.302c-3.815-21.067-12.107-40.584-23.88-57.527l30.386-27.112c5.386-5.386 8.353-12.568 8.353-20.23 0-7.663-2.967-14.85-8.353-20.235-11.16-11.16-29.313-11.15-40.674.217l-26.904 30.167c-16.942-11.771-36.457-20.062-57.521-23.877l2.311-40.608c0-15.775-12.836-28.612-28.614-28.612h-20c-15.777 0-28.613 12.837-28.613 28.912l2.302 40.308c-21.064 3.815-40.58 12.107-57.522 23.879L102.7 92.712c-11.155-11.155-29.307-11.16-40.468 0-5.386 5.386-8.353 12.572-8.353 20.235 0 7.662 2.967 14.844 8.573 20.437l30.167 26.907C89.915 177.134 81.623 196.65 77.808 217.716L37.201 215.405c-15.778 0-28.614 12.836-28.614 28.612 0 15.775 12.826 28.606 28.901 28.606l40.305-2.302c3.815 21.064 12.107 40.579 23.877 57.521l-30.387 27.113c-5.386 5.386-8.353 12.573-8.353 20.235 0 7.663 2.967 14.844 8.353 20.23 5.386 5.386 12.573 8.355 20.235 8.355 7.663 0 14.847-2.969 20.44-8.573l26.907-30.168c16.942 11.771 36.457 20.062 57.521 23.877l-2.311 40.608c0 15.78 12.836 28.617 28.614 28.617h20c15.777 0 28.614-12.837 28.614-28.917l-2.302-40.308c21.063-3.815 40.577-12.106 57.518-23.876l27.113 30.384c5.386 5.386 12.573 8.355 20.235 8.355 7.662 0 14.846-2.969 20.232-8.355 5.386-5.386 8.353-12.567 8.353-20.23 0-7.662-2.967-14.848-8.573-20.442l-30.165-26.905c11.771-16.942 20.063-36.457 23.878-57.522l40.605 2.312c15.778 0 28.614-12.837 28.614-28.617C470.116 240.227 457.29 227.396 441.215 227.396z" />
        </svg>
        <p className="relative z-10 text-lg font-bold mt-4 text-orange-700">
          En attente...
        </p>
      </div>

      {/* Arrière-plan animé */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-60 h-60 bg-gradient-to-r from-orange-500 to-transparent rounded-full blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-400 to-transparent rounded-full blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 w-60 h-60 bg-gradient-to-r from-red-500 to-transparent rounded-full blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}

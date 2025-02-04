"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Player {
  id: string;
  username: string;
  is_captain: boolean;
  session_uuid: string;
}

export default function MarinsDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;

  const [players, setPlayers] = useState<Player[]>([]);
  const [isCaptain, setIsCaptain] = useState(false);
  const [timer, setTimer] = useState(10); // Initialisation à 10 secondes
  const [isLoading, setIsLoading] = useState(true); // État pour indiquer si les données sont en chargement

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}/players`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setPlayers(data.players);

          const sessionUuid = document.cookie
            .split("; ")
            .find((row) => row.startsWith("session_uuid="))
            ?.split("=")[1];

          if (!sessionUuid) {
            console.error("Session UUID manquant.");
            return;
          }

          const currentPlayer = data.players.find(
            (player: Player) => player.session_uuid === sessionUuid
          );

          setIsCaptain(currentPlayer?.is_captain || false);
        } else {
          console.error("Erreur lors de la récupération des joueurs.");
        }
      } catch (err) {
        console.error("Erreur lors de la requête :", err);
      } finally {
        setIsLoading(false); // Les données sont maintenant chargées
      }
    };

    fetchPlayers();
  }, [gameCode]);

  useEffect(() => {
    if (!isLoading) {
      // Timer de 10 secondes avec mise à jour chaque seconde
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      // Redirection après 10 secondes
      const timeout = setTimeout(() => {
        if (isCaptain) {
          router.push(`/multidevice/game/${gameCode}/captain-selection`);
        } else {
          router.push(`/multidevice/game/${gameCode}/player-wait`);
        }
      }, 10000);

      // Nettoyage
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isLoading, isCaptain, gameCode, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 px-6 py-8">
      {isLoading ? (
        <div className="flex flex-col items-center">
          {/* Spinner de chargement */}
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 mt-4">
            Chargement des données...
          </p>
        </div>
      ) : (
        <>
          {/* Titre principal */}
          <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-3 animate-fade-in">
            Hmm... Faites attention, personne n'est digne de confiance !
          </h1>
          <p className="text-md text-gray-600 italic mb-8">
            Restez vigilants...
          </p>

          {/* Timer visuel */}
          <div className="relative w-48 h-48 flex items-center justify-center bg-white rounded-full shadow-lg mb-8">
            <svg
              className="absolute inset-0 w-full h-full text-blue-500"
              viewBox="0 0 36 36"
            >
              <circle
                className="text-gray-300"
                strokeWidth="3"
                stroke="currentColor"
                fill="transparent"
                r="16"
                cx="18"
                cy="18"
              />
              <circle
                className="stroke-current text-blue-500 transition-all"
                strokeWidth="3"
                strokeDasharray="100"
                strokeDashoffset={100 - (timer / 10) * 100}
                strokeLinecap="round"
                fill="transparent"
                r="16"
                cx="18"
                cy="18"
              />
            </svg>
            <p className="text-xl font-bold text-gray-700">{`00:${timer
              .toString()
              .padStart(2, "0")}`}</p>
          </div>

          {/* Grille des joueurs */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md transform transition-transform hover:scale-105"
              >
                {/* SVG Avatar */}
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    version="1.1"
                    id="marina"
                    xmlns="http://www.w3.org/2000/svg"
                    width="15px"
                    height="15px"
                    viewBox="0 0 256 256"
                  >
                    <style type="text/css"></style>
                    <path
                      className="st0"
                      d="M126.291,254.167c-0.951,0-1.912-0.136-2.856-0.418c-1.56-0.465-2.94-1.287-4.061-2.361
	c-0.501-0.479-0.958-1.017-1.359-1.608c-14.267-21.032-27.544-26.579-45.921-34.258c-5.552-2.319-11.293-4.718-17.595-7.744
	c-27.69-13.292-37.742-51.702-37.742-74.276c0-3.901,2.269-7.446,5.812-9.08c1.338-0.618,2.768-0.92,4.187-0.92
	c2.336,0,4.647,0.817,6.493,2.393l23.822,20.326c3.291,2.809,4.403,7.414,2.756,11.414c-0.705,1.712-1.847,3.147-3.261,4.204
	c7.701,6.104,22.606,11.565,45.094,11.819c5.165-18.749,7.701-44.833,6.566-67.888c-4.579-0.925-10.415-1.419-17.052-1.419
	c-2.286,0-4.406,0.058-6.24,0.137c-3.433,4.065-7.751,4.483-9.358,4.483c-8.318,0-13.907-7.827-13.907-19.476
	c0-11.649,5.589-19.476,13.907-19.476c1.648,0,6.123,0.437,9.588,4.76c2.683,0.206,5.958,0.375,9.488,0.375
	c2.713,0,5.268-0.103,7.63-0.303c-10.593-7.684-16.824-19.799-16.824-33.017C85.457,19.318,103.775,1,126.291,1
	c22.516,0,40.833,18.318,40.833,40.833c0,13.088-6.264,25.25-16.651,32.892c1.782,0.11,3.654,0.166,5.604,0.166
	c3.041,0,5.921-0.133,8.422-0.313c3.445-4.138,7.806-4.558,9.416-4.558c8.319,0,13.908,7.827,13.908,19.476
	c0,11.649-5.589,19.476-13.908,19.476c-1.551,0-5.694-0.392-9.087-4.183c-1.79-0.073-3.78-0.124-5.875-0.124
	c-7.723,0-13.048,0.656-16.65,1.437c-0.394,21.345,3.072,47.664,8.867,67.445c22.282-0.403,37.083-5.773,44.775-11.763
	c-1.381-1.051-2.496-2.467-3.189-4.15c-1.646-4.001-0.534-8.606,2.756-11.414l23.822-20.326c1.847-1.575,4.157-2.393,6.493-2.393
	c1.419,0,2.848,0.302,4.187,0.92c3.543,1.634,5.812,5.179,5.812,9.08c0,22.574-10.052,60.984-37.743,74.277
	c-6.301,3.025-12.041,5.424-17.593,7.743c-18.377,7.678-31.655,13.226-45.922,34.258
	C132.672,252.573,129.545,254.167,126.291,254.167z M126.291,36c-3.217,0-5.833,2.617-5.833,5.833s2.617,5.833,5.833,5.833
	c3.217,0,5.833-2.617,5.833-5.833S129.508,36,126.291,36z"
                    />
                    <path
                      className="st1"
                      d="M202.002,153.827l10.219-0.764c-1.016,16.866-26.911,31.621-68.363,30.441
	c-8.455-24.206-12.84-59.295-11.274-84.717c10.67-5.058,29.854-4.297,38.191-3.67c0.711,2.333,1.851,3.854,3.14,3.854
	c2.157,0,3.908-4.242,3.908-9.476s-1.751-9.476-3.908-9.476c-1.32,0-2.485,1.593-3.193,4.025c-7.551,0.851-23.98,2.025-35.868-1.961
	c1.421-5.984,3.447-10.576,6.142-13.154c9.601-5.23,16.13-15.415,16.13-27.096c0-17.001-13.832-30.833-30.833-30.833
	S95.457,24.832,95.457,41.833c0,11.126,5.926,20.894,14.786,26.317c2.214,2.883,4.004,7.896,5.345,14.356
	c-12.712,4.125-31.196,2.368-36.771,1.7c-0.702-2.525-1.893-4.187-3.242-4.187c-2.159,0-3.907,4.243-3.907,9.476
	s1.749,9.476,3.907,9.476c1.338,0,2.518-1.633,3.223-4.121c5.924-0.489,26.611-1.736,38.945,3.311
	c2.171,25.886-0.408,61.505-8.68,85.401c-42.018,1.501-67.675-13.46-68.702-30.499l10.218,0.764l-23.821-20.326
	c0,18.802,8.655,54.021,32.07,65.262c27.576,13.24,47.028,15.276,67.464,45.403v-0.03l0,0.03
	c20.436-30.127,39.887-32.163,67.463-45.403c23.416-11.24,32.07-46.46,32.07-65.262L202.002,153.827z M110.457,41.833
	c0-8.73,7.103-15.833,15.833-15.833c8.731,0,15.833,7.103,15.833,15.833s-7.103,15.833-15.833,15.833
	C117.56,57.667,110.457,50.564,110.457,41.833z"
                    />
                  </svg>
                </div>

                {/* Détails du joueur */}
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-gray-900">
                    {player.username || "Visiteur"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

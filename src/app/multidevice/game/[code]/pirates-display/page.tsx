"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Player {
  id: string;
  username: string;
  is_captain: boolean;
  session_uuid: string;
}

export default function PiratesDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code;

  const [team, setTeam] = useState<Player[]>([]);
  const [isCaptain, setIsCaptain] = useState(false);
  const [timer, setTimer] = useState(10); // Initialisation à 10 secondes
  const [isLoading, setIsLoading] = useState(true); // Indicateur de chargement

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`/api/games/${gameCode}/pirates`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setTeam(data.pirates);

          const sessionUuid = document.cookie
            .split("; ")
            .find((row) => row.startsWith("session_uuid="))
            ?.split("=")[1];

          if (!sessionUuid) {
            console.error("Session UUID manquant.");
            return;
          }

          const currentPlayer = data.pirates.find(
            (player: Player) => player.session_uuid === sessionUuid
          );

          setIsCaptain(currentPlayer?.is_captain || false);
        } else {
          console.error("Erreur lors de la récupération des pirates.");
        }
      } catch (err) {
        console.error("Erreur lors de la requête :", err);
      } finally {
        setIsLoading(false); // Les données sont chargées
      }
    };

    fetchTeam();
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 px-6 py-6">
      {isLoading ? (
        <div className="flex flex-col items-center">
          {/* Spinner de chargement */}
          <div className="w-16 h-16 border-4 border-yellow-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-yellow-700 mt-4">
            Chargement des données...
          </p>
        </div>
      ) : (
        <>
          {/* Titre principal */}
          <h1 className="text-3xl font-bold text-yellow-800 mb-2">
            ⚓ Votre Équipage de Pirates ⚓
          </h1>
          <p className="text-base text-yellow-700 italic mb-6">
            Rassemblez vos forces et tenez bon contre l’ennemi !
          </p>

          {/* Timer stylisé */}
          <div className="w-48 h-48 bg-white border-4 border-yellow-800 rounded-full flex flex-col items-center justify-center mb-6 shadow-lg">
            <svg
              fill="#000000"
              height="50px"
              width="50px"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 490 490"
              className="mb-2"
            >
              <path d="M417.418,136.155l41.024-41.24l-43.116-42.896L373.652,93.92c-20.224-14.732-43.051-26.091-67.657-33.238V32.838 ..." />
            </svg>
            <p className="text-yellow-800 font-bold text-lg">{`00:${timer
              .toString()
              .padStart(2, "0")}`}</p>
          </div>

          {/* Grille des pirates */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            {team.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md transform transition-transform hover:scale-105 border border-yellow-700"
              >
                {/* SVG Avatar */}
                <div className="w-12 h-12 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    fill="#000000"
                    height="50px"
                    width="50px"
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 420.357 420.357"
                  >
                    <g>
                      <path
                        d="M182.875,124.079c1.464,1.464,3.384,2.197,5.303,2.197s3.839-0.732,5.303-2.197l16.697-16.697l16.697,16.697
		c1.464,1.465,3.384,2.197,5.303,2.197c1.919,0,3.839-0.732,5.303-2.197c2.929-2.929,2.929-7.678,0-10.606l-16.697-16.697
		l16.697-16.697c2.929-2.929,2.929-7.678,0-10.606c-2.929-2.929-7.678-2.929-10.606,0L210.178,86.17l-16.697-16.697
		c-2.929-2.929-7.678-2.929-10.606,0c-2.929,2.929-2.929,7.677,0,10.606l16.697,16.697l-16.697,16.697
		C179.946,116.402,179.946,121.151,182.875,124.079z"
                      />
                      <path
                        d="M366.112,185.909l39.924-75.854c1.117-2.123,1.152-4.651,0.093-6.803c-1.058-2.152-3.082-3.668-5.445-4.079l-18.089-3.146
		c-28.555-4.966-53.647-20.626-70.654-44.096C288.026,18.928,250.935,0,210.179,0c-0.002,0,0.002,0,0,0
		c-40.754,0-77.849,18.93-101.763,51.931C91.409,75.4,66.317,91.06,37.762,96.026l-18.089,3.146
		c-2.363,0.411-4.387,1.927-5.445,4.079c-1.059,2.152-1.024,4.68,0.093,6.803l39.924,75.854c3.215,6.107,7.556,11.232,12.638,15.239
		c-8.709,19.818-13.135,40.932-13.135,62.785c0,86.252,70.171,156.424,156.424,156.424c86.259,0,156.436-70.171,156.436-156.424
		c0-21.855-4.427-42.972-13.138-62.792C358.553,197.134,362.897,192.016,366.112,185.909z M40.332,110.804
		c32.425-5.639,60.918-23.422,80.23-50.072C141.622,31.669,174.286,15,210.178,15c35.892,0,68.556,16.669,89.617,45.732
		c19.312,26.65,47.804,44.433,80.229,50.072l7.939,1.381l-7.609,14.458l-8.596-1.715c-34.107-6.801-64.026-25.405-84.25-52.389
		l-1.009-1.355c-17.969-24.572-46.459-39.257-76.223-39.282c-29.751,0.025-58.241,14.71-76.156,39.21
		c-0.197,0.263-0.391,0.529-0.585,0.795c-0.155,0.212-0.309,0.424-0.468,0.636c-20.22,26.978-50.143,45.582-84.258,52.385
		l-8.786,1.751l-7.629-14.494L40.332,110.804z M47.308,140.522l4.434-0.884c37.745-7.526,70.889-28.16,93.326-58.096
		c0.199-0.265,0.395-0.534,0.591-0.802c0.153-0.21,0.306-0.421,0.516-0.701c15.158-20.728,39.126-33.116,64.103-33.137
		c24.989,0.021,48.958,12.409,64.169,33.21l1.062,1.427c22.44,29.941,55.581,50.575,93.316,58.099l4.245,0.847l-20.23,38.437
		c-7.828,14.873-25.432,21.218-40.947,14.765c-32.4-13.477-66.621-20.311-101.713-20.311c-35.091,0-69.313,6.833-101.713,20.311
		c-15.517,6.455-33.119,0.107-40.947-14.765L47.308,140.522z M309.255,228.729c0,18.064-4.999,35.507-13.976,50.604l-11.53-27.914
		c11.202-6.896,18.688-19.27,18.688-33.362c0-4.507-0.772-8.835-2.18-12.868c1.964,0.76,3.923,1.537,5.874,2.348
		c0.306,0.127,0.614,0.236,0.921,0.357C308.508,214.712,309.255,221.702,309.255,228.729z M113.312,207.892
		c0.305-0.12,0.611-0.229,0.914-0.355c30.565-12.714,62.848-19.16,95.952-19.16c8.771,0,17.482,0.463,26.121,1.365
		c-7.484,7.135-12.167,17.184-12.167,28.316c0,21.588,17.563,39.152,39.152,39.152c2.182,0,4.32-0.188,6.406-0.533l15.273,36.974
		c-7.062,8.159-15.492,15.22-25.063,20.782c-6.323,3.67-14.079,4.299-20.756,1.681c-8.599-3.359-18.613-5.134-28.959-5.134
		c-10.355,0-20.374,1.78-28.969,5.145c-6.69,2.612-14.452,1.981-20.762-1.688c-30.439-17.694-49.349-50.535-49.349-85.707
		C111.105,221.688,111.853,214.698,113.312,207.892z M263.284,242.209c-13.317,0-24.152-10.834-24.152-24.152
		c0-13.318,10.834-24.152,24.152-24.152c13.318,0,24.152,10.834,24.152,24.152C287.437,231.375,276.602,242.209,263.284,242.209z
		 M351.608,263.933c0,77.981-63.448,141.424-141.436,141.424c-77.981,0-141.424-63.442-141.424-141.424
		c0-19.293,3.813-37.942,11.316-55.477c5.523,1.984,11.419,2.924,17.39,2.729c-0.894,5.781-1.35,11.648-1.35,17.544
		c0,40.495,21.769,78.305,56.81,98.674c6.037,3.511,12.907,5.3,19.769,5.3c4.763,0,9.523-0.862,13.996-2.609
		c6.875-2.691,15.004-4.114,23.506-4.114c8.498,0,16.624,1.42,23.492,4.103c10.892,4.271,23.508,3.271,33.756-2.678
		c35.049-20.367,56.822-58.177,56.822-98.675c0-5.89-0.456-11.758-1.349-17.547c0.509,0.016,1.018,0.037,1.526,0.037
		c5.447,0,10.805-0.958,15.857-2.773C347.794,225.984,351.608,244.636,351.608,263.933z"
                      />
                      <path
                        d="M164.12,273.483c-2.722,5.351-3.016,11.621-0.812,17.186l0.107,0.271c3.884,9.809,14.532,15.213,24.77,12.568
		c14.39-3.716,29.601-3.716,43.99,0c1.75,0.452,3.512,0.669,5.25,0.669c8.43,0,16.299-5.102,19.513-13.22l0.107-0.271
		c2.21-5.582,1.917-11.852-0.806-17.203c-2.737-5.381-7.668-9.335-13.528-10.848c-21.281-5.492-43.779-5.492-65.063,0
		C171.788,264.148,166.858,268.101,164.12,273.483z M181.397,277.159c9.417-2.43,19.098-3.645,28.783-3.645
		c9.683,0,19.369,1.215,28.782,3.645c1.721,0.444,3.109,1.554,3.908,3.125c0.454,0.892,1.086,2.712,0.235,4.862l-0.108,0.271
		c-1.104,2.79-4.144,4.324-7.072,3.566c-16.843-4.349-34.648-4.35-51.493,0c-2.926,0.756-5.967-0.777-7.065-3.549l-0.107-0.27
		c-0.858-2.168-0.225-3.988,0.229-4.88C178.289,278.713,179.677,277.603,181.397,277.159z"
                      />
                      <path
                        d="M158.51,214.667l4.967,2.838c-0.5,0.307-0.982,0.649-1.436,1.035c-3.756,3.188-5.203,8.479-3.579,13.131
		c1.661,4.755,6.281,8.036,11.32,8.036c5.655,0,10.654-4.111,11.77-9.65c0.171-0.85,0.238-1.707,0.219-2.559
		c0.483,0.096,0.969,0.159,1.454,0.159c2.604,0,5.134-1.358,6.519-3.78c2.055-3.597,0.806-8.178-2.791-10.233l-21-12
		c-3.596-2.055-8.177-0.806-10.233,2.791C153.664,208.031,154.913,212.612,158.51,214.667z"
                      />
                    </g>
                  </svg>
                </div>

                {/* Détails du joueur */}
                <div className="flex flex-col">
                  <p className="text-lg font-medium text-yellow-900">
                    {member.username || "Visiteur"}
                  </p>
                  <p className="text-sm text-yellow-700">Prêt à l’aventure !</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

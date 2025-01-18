"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import HeaderHome from "./HeaderHome";
import { useAppDispatch } from '@/lib/hooks';
import { loadFromLocalStorage } from '@/lib/reducers/game';

export default function HomepageChooseMode() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handlePlayClick = () => {
    setIsModalOpen(true);
  };

  const handleModeSelect = (mode: string) => {
    setIsModalOpen(false);
    if (mode === "multidevice") {
      router.push("/multidevice");
    } else if (mode === "onedevice") {
      router.push("/onedevice");
    }
  };

  const handleResumeGame = () => {
    const savedGameState = localStorage.getItem('gameState');
    if (savedGameState) {
      dispatch(loadFromLocalStorage());
      router.push('/onedevice/games');
    }
  };

  return (
    <div className="bg-brown-texture h-dvh bg-cover bg-center">
      <HeaderHome />
      {/* Header */}

      <div className="mx-auto mt-8 bg-white/15 backdrop-blur-sm rounded-lg shadow-lg border-2 border-white/40 h-5/6 w-11/12 z-10">

        {/* Main Content */}
        <div className="flex flex-col items-center mt-8 w-full">
          <h1 className="text-4xl text-center font-magellan  text-white mb-4 px-6">Prépare-toi pour l’aventure !</h1>

          <div className="w-full">

            {/* <div className=" bg-white/10 border-white/20 backdrop-blur-lg  border-y-2 p-4 w-full flex items-center justify-around">

        <div className="bg-red-400 w-36 h-32 bg-pirate bg-cover bg-center">
        </div>

          <p className="text-white font-magellan text-center ">VS</p>

          <div className="bg-blue-400 w-36 h-32 bg-marin bg-cover bg-center">
          </div>

        </div> */}

            <div className="w-full h-[450px] bg-home bg-contain bg-center bg-no-repeat">

            </div>

            <div className="px-6 flex flex-col gap-2 mb-6">
              {localStorage.getItem("gameState") ? (
                <button
                  onClick={handleResumeGame}
                  className="w-full py-3 rounded-lg font-bold border-white border-2 text-white">
                  Reprendre la partie en cours
                </button>
              ) : null}
              <button
                onClick={() => handleModeSelect("onedevice")}
                className="w-full py-3 rounded-lg font-bold border-white border-2 text-white">
                Jouer sur un écran
              </button>
              <button
                onClick={() => handleModeSelect("multidevice")}
                className="w-full py-3 rounded-lg font-bold bg-white text-slate-800 mb-6">
                Jouer sur plusieurs écrans
              </button>
            </div>

          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
                Choisissez un mode de jeu
              </h2>
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => handleModeSelect("multidevice")}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Multi Device
                </button>
                <button
                  onClick={() => handleModeSelect("onedevice")}
                  className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition"
                >
                  One Device
                </button>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm text-center"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

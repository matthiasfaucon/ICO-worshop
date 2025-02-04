"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import HeaderHome from "./HeaderHome";
import { useAppDispatch } from '@/lib/hooks';
import { loadFromLocalStorage } from '@/lib/reducers/game';

export default function HomepageChooseMode() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isGameSaved, setIsGameSaved] = useState(false);

  useEffect(() => {
    const savedGameState = localStorage.getItem("gameState");
    if (savedGameState) {
      setIsGameSaved(true);
    }
  }, []);

  const handleModeSelect = (mode: string) => {
    if (isGameSaved) {
      localStorage.removeItem("gameState");
    }
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
    <div 
      className="bg-brown-texture min-h-screen bg-cover bg-center flex flex-col" 
      style={{
        backgroundImage: "url('/cards/background-app-brown.svg')",
      }}
    >
      <HeaderHome />
      {/* Main Content */}
      <div className="mx-auto mt-4 mb-4 lg:mt-8 bg-white/15 backdrop-blur-sm rounded-lg shadow-lg border-2 border-white/40 w-11/12 max-w-4xl flex-grow">
        <div className="flex flex-col items-center mt-8 pb-4 lg:px-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl text-center font-magellan text-white mb-6">
            Prépare-toi pour l’aventure !
          </h1>

          <div className="w-full">
            <div className="w-full h-96 sm:h-64 lg:h-96 bg-home bg-cover bg-center bg-no-repeat"></div>

            <div className="px-4 sm:px-6 lg:px-8 flex flex-col gap-3 mt-6">
              {isGameSaved && (
                <button
                  onClick={handleResumeGame}
                  className="w-full py-3 rounded-lg font-bold border-white border-2 text-white text-sm sm:text-base lg:text-lg"
                >
                  Reprendre la partie en cours
                </button>
              )}
              <button
                onClick={() => handleModeSelect("onedevice")}
                className="w-full py-3 rounded-lg font-bold border-white border-2 text-white text-sm sm:text-base lg:text-lg"
              >
                Jouer sur un écran
              </button>
              <button
                onClick={() => handleModeSelect("multidevice")}
                className="w-full py-3 rounded-lg font-bold bg-white text-slate-800 text-sm sm:text-base lg:text-lg"
              >
                Jouer sur plusieurs écrans
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

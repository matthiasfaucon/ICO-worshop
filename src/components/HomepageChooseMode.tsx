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
              {isGameSaved ? (
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
      </div>
    </div>
  );
}

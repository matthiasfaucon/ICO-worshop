"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";

export default function HomepageChooseMode() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

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

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black text-white px-6 py-6">
      {/* Header */}
      <div className="absolute top-6 right-6">
        <Link href="/profil" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <FaUserCircle className="text-gray-800" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center mt-20">
        <h1 className="text-4xl font-bold mb-8">Bienvenue sur ICO !</h1>
        <h2 className="text-2xl font-semibold w-3/4 text-center mb-8">Sélectionnez votre mode de jeu :</h2>
       <div>
        <button
          onClick={() => handleModeSelect("onedevice")}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
          Jouer sur un écran
        </button>
        <button
          onClick={() => handleModeSelect("multidevice")}
          className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition mt-4">
          Jouer sur plusieurs écrans
        </button>
       </div>
      </div>

      {/* Footer Icons */}
      <div className="absolute bottom-6 w-full flex justify-around">
        <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18" />
          </svg>
        </div>
        <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20v-8m0-4V4m4 4H8" />
          </svg>
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
  );
}

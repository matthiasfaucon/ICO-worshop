"use client";

import { useRouter } from "next/navigation";
import HeaderHome from "./HeaderHome";

export default function AuthOptions() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/signin");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div
      className="bg-brown-texture h-dvh bg-cover bg-center"
      style={{ backgroundImage: "url('/cards/background-app-brown.svg')" }}
    >
      {/* Header */}
      {/* <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => router.push("/multidevice")}
          className="p-3 rounded-full bg-white shadow-md hover:bg-gray-200 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-gray-800"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div> */}
      <HeaderHome />
      {/* Contenu principal */}
      <div className="mx-auto mt-8 mb-4 bg-white/15 backdrop-blur-sm rounded-lg shadow-lg border-2 border-white/40 h-5/6 w-11/12 z-10 flex flex-col items-center justify-center px-6 py-8">
        {/* Titre et sous-titre */}
        <h1 className="text-4xl font-magellan text-white mb-2 text-center">
          Bienvenue sur ICO !
        </h1>
        <p className="text-white text-center font-filson mb-6">
          Identifier, Convaincre, Observer
        </p>

        {/* Section VS */}
        <div className="flex items-center justify-center mb-8 gap-4">
          <div className="w-20 h-20 bg-red-400 rounded-lg flex items-center justify-center shadow-md">
            <img src="/cards/pirate.png" alt="Pirate" className="w-12 h-12" />
          </div>
          <p className="text-white font-magellan text-lg font-bold">VS</p>
          <div className="w-20 h-20 bg-blue-400 rounded-lg flex items-center justify-center shadow-md">
            <img src="/cards/marin.png" alt="Marin" className="w-12 h-12" />
          </div>
        </div>

        {/* Boutons */}
        <div className="w-full max-w-lg">
          <button
            onClick={handleSignIn}
            className="w-full py-3 bg-white text-gray-800 text-lg font-bold rounded-lg shadow-md hover:bg-gray-100 transition"
          >
            Se connecter
          </button>

          {/* Séparateur */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white/50"></div>
            <span className="text-white px-4">Ou</span>
            <div className="flex-grow border-t border-white/50"></div>
          </div>

          <button
            onClick={handleSignUp}
            className="w-full py-3 text-white text-lg font-bold border border-white rounded-lg shadow-md hover:bg-white hover:text-gray-800 transition"
          >
            S'inscrire
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <p className="text-white text-sm text-center">
            Tu n’as pas de compte ?{" "}
            <span
              onClick={handleSignUp}
              className="font-bold underline cursor-pointer"
            >
              Inscris-toi
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

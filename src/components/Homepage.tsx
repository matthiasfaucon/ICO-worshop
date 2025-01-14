"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();

  const [inputCode, setInputCode] = useState("");

  const handleConnect = () => {
    console.log("Se connecter");
  };

  const handleSignup = () => {
    console.log("Redirection vers la page d'inscription");
    router.push("/signup");
  };

  const handleJoinGame = () => {
    console.log("Code de la partie :", inputCode);
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900 px-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Bienvenue sur ICO</h1>
        <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet consectetur.</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={handleConnect}
          className="w-full bg-gray-800 text-white font-medium py-3 rounded-md hover:bg-gray-900 transition">
          Se connecter
        </button>
        <div className="text-center text-sm text-gray-500">
          Pas de compte ?{" "}
          <button onClick={handleSignup} className="text-blue-600 hover:underline">
            Inscrivez-vous
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative px-4 bg-white text-gray-500 text-sm">Ou</div>
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Code de la partie
          </label>
          <input
            type="text"
            id="code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="34 24 01"
          />
        </div>

        <button
          onClick={handleJoinGame}
          className="w-full bg-blue-500 text-white font-medium py-3 rounded-md hover:bg-blue-600 transition">
          Rejoindre une partie
        </button>
      </div>
    </section>
  );
}

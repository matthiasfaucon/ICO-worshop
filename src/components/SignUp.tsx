"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gameKey, setGameKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSignup = async () => {
    if (!email) {
      setError("Veuillez entrer votre email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    if (!password) {
      setError("Veuillez entrer votre mot de passe.");
      return;
    }

    if (!username) {
      setError("Veuillez entrer votre nom d'utilisateur.");
      return;
    }

    setError(""); // Réinitialiser les erreurs
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token; // Le JWT retourné par l'API

        // Stocker le token dans un cookie sécurisé
        Cookies.set("authToken", token, { secure: true, sameSite: "strict" });

        router.push("/"); // Redirection après connexion réussie
      } else {
        const data = await response.json();
        setError(data.message || "Une erreur est survenue.");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      setError("Une erreur inconnue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
      <h1 className="text-3xl font-bold mb-8 text-black">Inscription</h1>
      <form className="w-full max-w-sm space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-black text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Nom@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3  text-slate-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2 text-black">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            placeholder="**********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-slate-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Nom d'utilisateur */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2 text-black">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="username"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 text-slate-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        {/* Clé du jeu */}
        <div>
          <label htmlFor="gameKey" className="block text-sm font-medium mb-2 text-black">
            Clé du jeu - <span className="text-gray-600">optionnel</span>
          </label>
          <input
            type="text"
            id="gameKey"
            placeholder="482 FHQ 20D 20M SJH"
            value={gameKey}
            onChange={(e) => setGameKey(e.target.value)}
            className="w-full text-slate-900 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Texte descriptif */}
        <div className="flex items-center border border-gray-300 rounded-lg p-4 space-x-4">
          <div className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l6.16-3.422A12.083 12.083 0 018.84 3.422L12 14zm0 0l-9 5 9 5 9-5-9-5zm0 0l-6.16 3.422A12.083 12.083 0 0015.16 20.578L12 14z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet
            consectetur.
          </p>
        </div>

        {/* Bouton */}
        <button
          type="button"
          onClick={handleSignup}
          className="w-full py-3 text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-900 transition duration-300"
        >
          Commencer l’aventure
        </button>
      </form>
    </div>
  );
}

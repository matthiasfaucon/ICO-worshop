"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    if (!username) {
      setError("Veuillez entrer un nom d'utilisateur.");
      return;
    }

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
      setError("Veuillez entrer un mot de passe.");
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
        const token = data.token; 
        const userInfo = data.user; 

        // Stocker le token dans un cookie sécurisé
        Cookies.set("authToken", token, { 
          secure: true, 
          sameSite: "strict", 
          expires: 7 // Durée en jours
        });

        // Stocker les informations utilisateur dans localStorage
        localStorage.setItem("userInfo", JSON.stringify(userInfo));

        // Rediriger l'utilisateur après une inscription réussie
        router.push("/");
      } else {
        const data = await response.json();
        setError(data.message || "Une erreur est survenue lors de l'inscription.");
      }
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      setError("Une erreur inconnue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
      <h1 className="text-3xl font-bold mb-8 text-black">Inscription</h1>
      <form className="w-full max-w-sm space-y-6">
        {/* Nom d'utilisateur */}
        <div>
          <label htmlFor="username" className="block text-black text-sm font-medium mb-2">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="username"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 text-slate-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

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
            className="w-full px-4 py-3 text-slate-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

        {/* Afficher les erreurs */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {/* Bouton d'inscription */}
        <button
          type="button"
          onClick={handleSignup}
          className={`w-full py-3 text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-900 transition duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Chargement..." : "S'inscrire"}
        </button>
      </form>
    </div>
  );
}

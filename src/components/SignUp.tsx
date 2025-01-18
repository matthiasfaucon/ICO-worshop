"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter(); // Pour la redirection

  const handleSignup = async () => {
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
        console.log("Inscription réussie :", data);
        
        // Stocker les informations de l'utilisateur dans le localStorage
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        
        // Rediriger vers la page d'accueil
        router.push("/");
      } else {
        const { message } = await response.json();
      }
    } catch (error) {
      console.error("Erreur lors de la requête d'inscription :", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
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

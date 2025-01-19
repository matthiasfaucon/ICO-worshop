"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaInfoCircle, FaTrophy, FaTimesCircle, FaUser } from "react-icons/fa";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";

export default function ConnectedHome() {
  const [victories, setVictories] = useState(4);
  const [defeats, setDefeats] = useState(4);
  const [nickname, setNickname] = useState("");
  const [isNicknameValid, setIsNicknameValid] = useState(false); // Validation du pseudo
  const [isConnected, setIsConnected] = useState(false); // Indique si l'utilisateur est connecté
  const [error, setError] = useState("");
  const router = useRouter();

  // Chargement des données utilisateur
  useEffect(() => {
    const authToken = Cookies.get("authToken");
    const storedUserInfo = localStorage.getItem("userInfo");
    const storedNickname = localStorage.getItem("nickname");

    if (authToken && storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      setNickname(userInfo.username || "");
      setIsNicknameValid(!!userInfo.username);
      setIsConnected(true);
    } else {
      if (storedNickname) {
        setNickname(storedNickname);
        setIsNicknameValid(true);
      }
      setIsConnected(false);
    }
  }, []);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value.trim());
  };

  const handleNicknameSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (nickname.length >= 4) {
        setIsNicknameValid(true);
        setError("");
        localStorage.setItem("nickname", nickname);
      } else {
        setError("Le pseudo doit contenir au moins 4 caractères.");
      }
    }
  };

  const handleCreateGame = () => {
    if (isNicknameValid && isConnected) {
      router.push("/onedevice/create-game");
    }
  };

  const handleInfo = () => {
    router.push("/info");
  };

  return (
    <div 
      className="bg-brown-texture h-dvh bg-cover bg-center" 
      style={{
        backgroundImage: "url('/cards/background-app-brown.svg')",
      }}
    >
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm w-full py-4 px-6 flex items-center justify-between">
        <button onClick={handleInfo} className="p-2 text-white">
          <FaInfoCircle className="text-xl" />
        </button>
        <div className="text-white text-center">
          <FaTrophy className="text-2xl" />
        </div>
        <a href="/multidevice/auth-options">
          <button className="p-2 text-white">
            <FaUser className="text-xl" />
          </button>
        </a>
      </div>

      {/* Main Container */}
      <div className="mx-auto mt-8 bg-white/15 backdrop-blur-md rounded-lg shadow-lg border-2 border-white/40 w-11/12 md:w-8/12 lg:w-6/12">
        {/* Profil et pseudo */}
        <div className="flex flex-col items-center mt-8">
          <div
            className={`transition-transform duration-500 ${
              isNicknameValid ? "scale-100 opacity-100" : "scale-90 opacity-50"
            }`}
          >
            <div className="w-40 h-40 bg-white/20 border border-white rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-white">
                {nickname ? nickname.slice(0, 2).toUpperCase() : "?"}
              </span>
            </div>
          </div>
          {!isNicknameValid && (
            <div className="flex flex-col items-center mt-4">
              <input
                type="text"
                placeholder="Votre pseudo (min. 4 caractères)"
                value={nickname}
                onChange={handleNicknameChange}
                onKeyDown={handleNicknameSubmit}
                className="p-2 w-64 border border-white rounded-lg bg-transparent text-white placeholder-white text-center"
                required
              />
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="flex justify-center items-center mt-8 space-x-8">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-white/20 border border-white rounded-lg flex items-center justify-center">
              <FaTrophy className="text-white text-xl" />
            </div>
            <p className="mt-2 text-sm font-semibold text-white">Victoires</p>
            <span className="mt-1 text-lg font-bold text-white">{victories}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-white/20 border border-white rounded-lg flex items-center justify-center">
              <FaTimesCircle className="text-white text-xl" />
            </div>
            <p className="mt-2 text-sm font-semibold text-white">Défaites</p>
            <span className="mt-1 text-lg font-bold text-white">{defeats}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 flex flex-col gap-2 mb-8 mt-6">
          {!isNicknameValid && (
            <p className="text-red-500 mb-2 text-center">
              Renseigner un pseudo pour accéder aux actions
            </p>
          )}
          <button
            onClick={handleCreateGame}
            disabled={!isNicknameValid || !isConnected}
            className={`w-full py-3 rounded-lg font-bold transition duration-300 ${
              isNicknameValid && isConnected
                ? "bg-white text-slate-800 hover:bg-gray-100"
                : "bg-gray-600 text-white cursor-not-allowed"
            }`}
          >
            Créer une partie
          </button>
          {!isConnected && (
            <p className="text-red-500 mt-2 text-center">
              Vous devez être connecté pour créer une partie.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

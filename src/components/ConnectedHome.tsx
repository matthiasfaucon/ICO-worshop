"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaInfoCircle, FaTrophy, FaTimesCircle, FaUser } from "react-icons/fa";
import JoinGameModal from "./JoinGameModal"; // Votre composant pour rejoindre une partie
import { v4 as uuidv4 } from "uuid";

export default function ConnectedHome() {
  const [victories, setVictories] = useState(4);
  const [defeats, setDefeats] = useState(4);
  const [nickname, setNickname] = useState("");
  const [isNicknameValid, setIsNicknameValid] = useState(false); // État pour valider le pseudo
  const [sessionUUID, setSessionUUID] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Indique si l'utilisateur est connecté
  const [error, setError] = useState("");
  const router = useRouter();

  // Fonction pour charger les données utilisateur
  useEffect(() => {
    // Récupérer le `session_uuid` et `authToken` depuis les cookies
    const authToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="))
      ?.split("=")[1];

    const sessionUuidFromCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("session_uuid="))
      ?.split("=")[1];

    const storedUserInfo = localStorage.getItem("userInfo");
    const storedNickname = localStorage.getItem("nickname");

    if (authToken && storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      setNickname(userInfo.username || "");
      setSessionUUID(sessionUuidFromCookie || uuidv4());
      setIsNicknameValid(!!userInfo.username);
      setIsConnected(true);

      // Si le session_uuid n'existe pas dans les cookies, on le génère et l'ajoute
      if (!sessionUuidFromCookie) {
        document.cookie = `session_uuid=${uuidv4()}; path=/;`;
      }
    } else {
      // Si l'utilisateur est anonyme
      if (storedNickname) {
        setNickname(storedNickname);
        setIsNicknameValid(true);
      }
      if (sessionUuidFromCookie) {
        setSessionUUID(sessionUuidFromCookie);
      } else {
        const newSessionUUID = uuidv4();
        setSessionUUID(newSessionUUID);
        document.cookie = `session_uuid=${newSessionUUID}; path=/;`;
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

  const handleOpenModal = () => {
    if (isNicknameValid) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateGame = () => {
    if (isNicknameValid && isConnected) {
      router.push("/multidevice/create-game");
    }
  };

  const handleViewAchievements = () => {
    router.push("/achievements");
  };

  const handleInfo = () => {
    router.push("/info");
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-50 px-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-md">
        <button onClick={handleInfo} className="p-2">
          <FaInfoCircle className="text-gray-700 text-2xl" />
        </button>
        <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
          <FaTrophy className="text-gray-400 text-3xl" />
        </div>
        <a href="/multidevice/auth-options">
          <button className="p-2">
            <FaUser className="text-gray-700 text-2xl" />
          </button>
        </a>
      </div>

      {/* Profile and Nickname */}
      <div className="flex flex-col items-center mt-6">
        <div
          className={`transition-transform duration-500 ${
            isNicknameValid ? "scale-100 opacity-100" : "scale-90 opacity-50"
          }`}
        >
          <div className="w-40 h-40 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center">
            <span className="text-5xl font-bold text-gray-700">
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
              className="p-2 border border-gray-300 rounded-lg mb-4 w-64 text-slate-900"
              required
            />
            {error && <p className="text-red-500">{error}</p>}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="flex justify-center items-center w-full max-w-md mt-6 space-x-8">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
            <FaTrophy className="text-gray-600 text-xl" />
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-700">Victoires</p>
          <span className="mt-1 text-lg font-bold text-gray-900">{victories}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
            <FaTimesCircle className="text-gray-600 text-xl" />
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-700">Défaites</p>
          <span className="mt-1 text-lg font-bold text-gray-900">{defeats}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-md mt-6">
        {!isNicknameValid && (
          <p className="text-red-500 mb-2 text-center">Renseigner un pseudo pour accéder aux actions</p>
        )}
        <button
          onClick={handleOpenModal}
          disabled={!isNicknameValid}
          className={`w-full py-3 mb-4 text-white rounded-lg shadow-md transition duration-300 ${
            isNicknameValid ? "bg-gray-400 hover:bg-gray-500" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Rejoindre une partie
        </button>
        <button
          onClick={handleCreateGame}
          disabled={!isNicknameValid || !isConnected}
          className={`w-full py-3 text-white rounded-lg shadow-md transition duration-300 ${
            isNicknameValid && isConnected
              ? "bg-gray-800 hover:bg-gray-900"
              : "bg-gray-600 cursor-not-allowed"
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

      {/* Join Game Modal */}
      <JoinGameModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

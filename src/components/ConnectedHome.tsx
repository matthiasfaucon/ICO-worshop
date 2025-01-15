"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaInfoCircle, FaTrophy, FaTimesCircle, FaCog } from "react-icons/fa";
import JoinGameModal from "./JoinGameModal"; // Import your modal component

export default function ConnectedHome() {
  const [victories, setVictories] = useState(4);
  const [defeats, setDefeats] = useState(4);
  const [nickname, setNickname] = useState("Pseudo");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Fonction pour récupérer le profil utilisateur
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Assurez-vous que le token est stocké dans localStorage lors de la connexion
          },
        });

        
        if (response.ok) {
          const user = await response.json();
          console.log("user:", user);
          setNickname(user.username || "Utilisateur"); // Met à jour le nickname
        } else {
          console.error("Échec de la récupération du profil utilisateur :", response.statusText);
          setError("Impossible de récupérer le profil utilisateur.");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du profil utilisateur :", err);
        setError("Une erreur est survenue.");
      }
    };

    fetchUserProfile();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateGame = () => {
    router.push("/create-game");
  };

  const handleViewAchievements = () => {
    router.push("/achievements");
  };

  const handleUser = () => {
    router.push("/auth-options");
  };

  const handleInfo = () => {
    router.push("/info");
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-50 px-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-md">
        <button onClick={handleUser} className="p-2">
          <FaUser className="text-gray-700 text-2xl" />
        </button>
        <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
          <FaTrophy className="text-gray-400 text-3xl" />
        </div>
        <button onClick={handleInfo} className="p-2">
          <FaInfoCircle className="text-gray-700 text-2xl" />
        </button>
      </div>

      {/* Profile Picture and Nickname */}
      <div className="flex flex-col items-center mt-6">
        <div className="flex items-center space-x-2 mb-2">
          <h2 className="text-xl font-bold text-gray-800">{nickname}</h2>
          <button onClick={handleEditProfile} className="p-1">
            <FaCog className="text-gray-600 text-lg" />
          </button>
        </div>
        <div className="w-40 h-40 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
          <FaUser className="text-gray-400 text-6xl" />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Statistics */}
      <div className="flex justify-center items-center w-full max-w-md mt-6 space-x-8">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
            <FaTrophy className="text-gray-600 text-xl" />
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-700">Victoire</p>
          <span className="mt-1 text-lg font-bold text-gray-900">{victories}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
            <FaTimesCircle className="text-gray-600 text-xl" />
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-700">Défaite</p>
          <span className="mt-1 text-lg font-bold text-gray-900">{defeats}</span>
        </div>
      </div>

      {/* Achievements Link */}
      <div className="mt-6">
        <button
          onClick={handleViewAchievements}
          className="text-sm text-blue-600 underline"
        >
          Tous tes succès
        </button>
      </div>

      {/* Actions */}
      <div className="w-full max-w-md mt-6">
        <button
          onClick={handleOpenModal}
          className="w-full py-3 mb-4 text-white bg-gray-400 rounded-lg shadow-md hover:bg-gray-500 transition duration-300"
        >
          Rejoindre une partie
        </button>
        <button
          onClick={handleCreateGame}
          className="w-full py-3 text-white bg-gray-800 rounded-lg shadow-md hover:bg-gray-900 transition duration-300"
        >
          Créer une partie
        </button>
      </div>

      {/* Join Game Modal */}
      <JoinGameModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

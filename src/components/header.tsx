'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { FaBookDead } from "react-icons/fa";
import Link from 'next/link';
import RulesSlider from './RulesSlider';
import { MdOutlineFeedback } from "react-icons/md";

export default function Header() {
  const [showRules, setShowRules] = useState(false);
  const gamePhase = useAppSelector((state) => state.game.gamePhase);

  return (
    <>
      <header className="bg-white px-7 py-4 shadow h-20 flex justify-between items-center w-full">
        {/* Back button */}
        <div className="flex items-center">
          {(gamePhase === 'SETUP' || gamePhase === 'CREATE_PLAYERS') && (
            <Link
              href={gamePhase === 'SETUP' ? '/' : '/onedevice'}
              className="p-2 rounded-full"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.292893 7.29289C-0.0976315 7.68342 -0.0976315 8.31658 0.292893 8.70711L7.29289 15.7071C7.68342 16.0976 8.31658 16.0976 8.70711 15.7071C9.09763 15.3166 9.09763 14.6834 8.70711 14.2929L3.41421 9H15C15.5523 9 16 8.55229 16 8C16 7.44772 15.5523 7 15 7H3.41421L8.70711 1.70711C9.09763 1.31658 9.09763 0.683417 8.70711 0.292893Z"
                  fill="#3B4450"
                />
              </svg>
            </Link>
          )}
        </div>

        {/* Role display */}
        <div className="flex items-center justify-end">
          {gamePhase === 'REVEAL_ROLES' && (
            <span className="text-sm font-bold text-gray-800 bg-gray-200 px-3 py-1 rounded-lg shadow">
              Rôle en révélation
            </span>
          )}
        </div>

        <div className="flex items-center gap-9">
          {/* Bouton pour afficher RulesSlider */}
          <button
            className="rounded-full"
            onClick={() => setShowRules(true)}
          >
            <FaBookDead className="text-xl" />
          </button>

          {/* Bouton Feedback conditionnel */}
          {(gamePhase === 'SETUP' || gamePhase === 'GAME_OVER') && (
            <Link href="/feedback">
              <MdOutlineFeedback className="text-xl" />
            </Link>
          )}
        </div>
      </header>

      {/* Affichage conditionnel de RulesSlider */}
      {showRules && <RulesSlider onClose={() => setShowRules(false)} />}
    </>
  );
}

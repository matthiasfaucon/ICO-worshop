'use client';

import { useAppSelector } from '@/lib/hooks';

export default function Header() {
  const gamePhase = useAppSelector((state) => state.game.gamePhase);

  return (
    <header className="bg-white px-7 py-4 shadow h-20 flex justify-between items-center w-full">
      {/* Back button */}
      <div className="flex items-center">
        <button className="p-2 rounded-full">
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
        </button>
      </div>

      {/* Logo */}
      <div className="flex items-center justify-center">
        <svg
          width="42"
          height="20"
          viewBox="0 0 42 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.424022 11.4557L7.35481 19.0324C8.00234 19.7403 8.96895 20.0645 9.91237 19.8903L16.0824 18.7509C19.0932 18.195 22.1792 18.1808 25.195 18.7092L32.0383 19.9082C32.9709 20.0716 33.9226 19.7494 34.5641 19.053L41.5619 11.4576C42.1695 10.7981 41.6379 9.73744 40.7459 9.8295L35.5822 10.3624C34.352 10.4894 33.173 9.83604 32.6285 8.7256L31.9601 7.36238C30.1681 3.70793 26.7843 1.08978 22.797 0.272709C21.378 -0.0180717 19.9089 0.049093 18.5223 0.468141L18.394 0.506925C14.8223 1.58637 11.8323 4.05236 10.0928 7.35331L9.39908 8.66978C8.79301 9.81988 7.54823 10.4856 6.25517 10.3512L1.24303 9.83024C0.352457 9.73767 -0.180315 10.7951 0.424022 11.4557Z"
            fill="#3B4450"
          />
        </svg>
      </div>

      {/* Role display */}
      <div className="flex items-center justify-end">
        {gamePhase === 'REVEAL_ROLES' && (
          <span className="text-sm font-bold text-gray-800 bg-gray-200 px-3 py-1 rounded-lg shadow">
            Rôle en révélation
          </span>
        )}

        {/* Rules button */}
        <button className="p-2 rounded-full ml-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 10L10 14.5M10 6.66455V6.625M1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10Z"
              stroke="#3B4450"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { FaBookDead } from "react-icons/fa";
import Link from "next/link";
import RulesSlider from "./RulesSlider";
import { GoPerson } from "react-icons/go";
import { FaUserShield } from "react-icons/fa";

export default function HeaderHome() {
  const [showRules, setShowRules] = useState(false);
  const [isLogged, setIsLogged] = useState(null); // `null` pour différencier le chargement
  const gamePhase = useAppSelector((state) => state.game.gamePhase);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    async function checkLogin() {
      try {
        const response = await fetch("/api/auth/isLogged", {
          method: "GET",
          credentials: "include", // Inclut les cookies dans la requête
        });

        if (response.ok) {
          const data = await response.json();
          console.log("data", data);
          if (data.isLogged) {
            setIsLogged(true);
            if (data?.user?.role?.toLowerCase() === "admin") {
              setIsAdmin(true);
            }
          } else {
            setIsAdmin(false);
            setIsLogged(false);
          }
        } else {
          setIsAdmin(false);
          setIsLogged(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la connexion :", error);
        setIsLogged(false);
      }
    }

    checkLogin();
  }, [router]);

  if (isLogged === null) {
    return null;
  }

  return (
    <>
      <header className="bg-white px-7 py-4 shadow h-20 flex justify-between items-center w-full">
        <div>
          {/* Si connecté, lien vers le profil */}
          {isLogged ? (
            <div className="flex items-center gap-5">
              <Link href="/profil">
                <GoPerson className="text-xl text-slate-700" />
              </Link>
              {isAdmin ? (
                <Link href="/admin">
                  <FaUserShield className="text-xl text-red-500" />
                </Link>
              ) : null}
            </div>
          ) : (
            <Link href="/auth-options">
              <GoPerson className="text-xl text-slate-700" />
            </Link>
          )}
        </div>

        <div className="flex items-center justify-end">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="46"
            height="22"
            viewBox="0 0 46 22"
            fill="#fff"
          >
            <path
              d="M2.42402 12.4556L9.35481 20.0323C10.0023 20.7402 10.9689 21.0644 11.9124 20.8902L18.0824 19.7509C21.0932 19.1949 24.1792 19.1807 27.195 19.7091L34.0383 20.9081C34.9709 21.0715 35.9226 20.7493 36.5641 20.053L43.5619 12.4575C44.1695 11.798 43.6379 10.7374 42.7459 10.8294L37.5822 11.3623C36.352 11.4893 35.173 10.836 34.6285 9.72553L33.9601 8.36231C32.1681 4.70785 28.7843 2.0897 24.797 1.27263C23.378 0.981852 21.9089 1.04902 20.5223 1.46806L20.394 1.50685C16.8223 2.58629 13.8323 5.05229 12.0928 8.35323L11.3991 9.6697C10.793 10.8198 9.54823 11.4855 8.25517 11.3511L3.24303 10.8302C2.35246 10.7376 1.81969 11.795 2.42402 12.4556Z"
              fill="#3B4450"
            />
          </svg>
        </div>

        <div className="flex items-center gap-9">
          <button className="rounded-full" onClick={() => setShowRules(true)}>
            <FaBookDead className="text-xl text-slate-700" />
          </button>
        </div>
      </header>

      {/* Slider pour les règles */}
      {showRules && <RulesSlider onClose={() => setShowRules(false)} />}
    </>
  );
}

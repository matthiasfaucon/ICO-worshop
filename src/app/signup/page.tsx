"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { setUUID as setUUIDAction } from "@/lib/reducers/users";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const dispatch = useDispatch();
    const uuid = useSelector((state: RootState) => state.user.uuid);

    // Générer ou récupérer l'UUID
    useEffect(() => {
        const getOrCreateUUID = () => {
            const storedUUID = localStorage.getItem("user_uuid");
            if (storedUUID) {
                return storedUUID;
            }

            // Génération d'un nouvel UUID
            const newUUID = crypto.randomUUID();
            localStorage.setItem("user_uuid", newUUID);
            return newUUID;
        };

        const generatedUUID = getOrCreateUUID();
        dispatch(setUUIDAction(generatedUUID)); // Enregistrez dans Redux
    }, [dispatch]);

    const handleSignIn = async () => {
        if (!email) {
            setError("Veuillez entrer votre email.");
            return;
        }

        // Vérifiez si l'email est valide
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Veuillez entrer une adresse email valide.");
            return;
        }

        if (!password) {
            setError("Veuillez entrer votre mot de passe.");
            return;
        }

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/uuid/associate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uuid, email, password }),
            });

            if (response.ok) {
                // Redirection vers la page login après inscription réussie
                router.push("/login");
            } else {
                const data = await response.json();
                setError(data.message);
            }
        } catch {
            setError("Une erreur inconnue est survenue.");
        }
        setLoading(false);
    };

    const createAccountWithGoogle = async () => {
        setGoogleLoading(true);
        try {
            await signIn("google", { callbackUrl: "/games" });
        } catch {
            setError("Une erreur est survenue avec Google Sign-In.");
        }
        setGoogleLoading(false);
    };

    return (
        <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600 text-white px-6 py-8">
            <div className="text-center mb-10">
                <h1 className="text-5xl font-bold mb-4">
                    Rejoignez <span className="text-yellow-400">ICO</span> !
                </h1>
                <p className="text-lg max-w-xl mx-auto">
                    Préparez-vous à conquérir les océans avec votre équipage. Inscrivez-vous et démarrez votre aventure dès aujourd'hui !
                </p>
            </div>

            <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl p-8 text-gray-800">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                    Créez votre compte
                </h2>
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Adresse email"
                        className="w-full bg-gray-100 p-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        className="w-full bg-gray-100 p-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md mt-6 transition duration-300 ease-in-out ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleSignIn}
                    disabled={loading}
                >
                    {loading ? "Chargement..." : "Créer votre compte"}
                </button>
                {error && (
                    <p className="text-red-500 text-center mt-4 font-medium">{error}</p>
                )}
            </div>

            <div className="flex flex-col items-center mt-8">
                <p className="text-sm mb-4">Ou connectez-vous avec</p>
                <button
                    className={`w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-transform transform hover:scale-105 ${
                        googleLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={createAccountWithGoogle}
                    disabled={googleLoading}
                >
                    <Image src="/logo-google.webp" alt="Google" width={24} height={24} />
                </button>
            </div>

            <div className="w-full flex flex-col items-center max-w-md rounded-lg text-gray-800">
                <p className="text-sm mt-10 mb-4 text-white ">ID client</p>
                <span className="font-mono bg-white text-indigo-600 px-2 py-1 rounded">
                    {uuid || "Génération en cours..."}
                </span>
            </div>
        </section>
    );
}

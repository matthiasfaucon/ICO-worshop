"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

export default function AuthOptions() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Erreur lors de la connexion avec Google :", error);
    }
  };

  const handleSignIn = () => {
    console.log("Se connecter");
    router.push("/signin");
  };

  const handleSignUp = () => {
    console.log("S'inscrire");
    router.push("/signup");
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 px-6 py-6 text-white">
      {/* Header */}
      <div className="flex justify-start w-full">
        <button
          onClick={() => router.back()}
          className="p-3 text-white bg-blue-500 rounded-full hover:bg-blue-400 transition duration-300"
        >
          &#8592;
        </button>
      </div>

      {/* Logo et message */}
      <div className="flex flex-col items-center text-center mt-10">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
          <img
            src="/logo.png" // Remplacez par l'URL de votre logo
            alt="Logo"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <p className="mt-6 text-lg font-semibold text-center">
          Connecte-toi ou crée un compte pour jouer en ligne et accéder à ta progression sur tous tes appareils.
        </p>
      </div>

      {/* Boutons */}
      <div className="flex flex-col items-center w-full max-w-md space-y-4 mt-10">
        {/* Bouton Google */}
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full py-3 bg-white text-gray-800 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition duration-300"
        >
          <FaGoogle className="text-xl mr-3" />
          Se connecter avec Google
        </button>

        {/* Séparateur */}
        <div className="flex items-center w-full my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-gray-200 text-sm">ou</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Bouton Se connecter */}
        <button
          onClick={handleSignIn}
          className="w-full py-3 bg-blue-700 rounded-full font-semibold hover:bg-blue-800 transition duration-300"
        >
          Se connecter
        </button>

        {/* Bouton S'inscrire */}
        <button
          onClick={handleSignUp}
          className="w-full py-3 bg-transparent border border-white rounded-full font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
        >
          S'inscrire
        </button>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center text-sm">
        <p>
          En t'inscrivant ou en te connectant, tu acceptes nos{" "}
          <a href="/terms" className="underline font-semibold">
            Conditions d'utilisation
          </a>{" "}
          et notre{" "}
          <a href="/privacy" className="underline font-semibold">
            Politique de confidentialité
          </a>.
        </p>
      </div>
    </div>
  );
}

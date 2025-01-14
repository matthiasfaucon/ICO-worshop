"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUUID as setUUIDAction } from "@/lib/reducers/users";
import { RootState } from "@/lib/store";

export default function Home() {
	const [inputCode, setInputCode] = useState("");
	const router = useRouter();
	const dispatch = useDispatch();
	const uuid = useSelector((state: RootState) => state.user.uuid);

	function getOrCreateUUID() {
		const storedUUID = localStorage.getItem("user_uuid");
		if (storedUUID) {
			return storedUUID;
		}

		const newUUID = uuidv4();
		localStorage.setItem("user_uuid", newUUID);
		return newUUID;
	}

	function createAccount() {
		// Redirect to /signup
		router.push("/signup");
	}

	function joinGame(code: string) {
		console.log("Joining game with code", code);
		router.push("/games/" + code);
	}

	function connect() {
		router.push("/login");
	}

	useEffect(() => {
		const generatedUUID = getOrCreateUUID();
		dispatch(setUUIDAction(generatedUUID));
	}, [dispatch]);

	return (
		<section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-indigo-600 to-purple-700 text-white px-12">
			<div className="text-center">
				<h1 className="text-4xl font-extrabold mb-4 animate-fade-in">
					Bienvenue sur <span className="text-yellow-400">ICO</span> !
				</h1>
				<p className="text-lg mb-6 max-w-lg mx-auto">
					Venez conquérir les océans avec votre équipage ! Pour commencer, créez un compte ou rejoignez vos amis.
				</p>
			</div>

			<div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-gray-800">
				<button
					className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md mb-4 transition duration-300 ease-in-out"
					onClick={createAccount}>
					Créer un compte
				</button>
				<button
					className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md mb-6 transition duration-300 ease-in-out"
					onClick={connect}>
					Se connecter
				</button>
				<div className="relative mb-6">
					<hr className="border-gray-300" />
					<span className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 bg-white px-4 text-gray-500">
						OU
					</span>
				</div>
				<input
					type="text"
					placeholder="Entrez le code de la partie"
					value={inputCode}
					onChange={(e) => setInputCode(e.target.value)}
					className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
				/>
				<button
					className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out"
					onClick={() => joinGame(inputCode)}>
					Rejoindre une partie
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

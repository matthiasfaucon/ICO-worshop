"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/admin/components/Sidebar";
import { v4 as uuidv4 } from "uuid";

type CreateUserData = {
  username: string;
  email: string;
  password: string;
  role: string;
};

export default function CreateUser() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          session_uuid: uuidv4(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la création de l'utilisateur");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Créer un nouvel utilisateur</h1>
        </div>

        <div className="max-w-3xl mx-auto  p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block mb-2 font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={3}
                maxLength={50}
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={6}
              />
              <p className="text-sm text-gray-500 mt-1">
                Le mot de passe doit contenir au moins 6 caractères.
              </p>
            </div>

            <div>
              <label htmlFor="role" className="block mb-2 font-medium text-gray-700">
                Rôle
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="USER">Utilisateur</option>
                <option value="MODERATOR">Modérateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                Créer l'utilisateur
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/admin/components/Sidebar";

type RuleFormData = {
  key: string;
  name: string;
  type: string;
  order: number;
  value: string;
  description: string;
};

export default function CreateRulePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RuleFormData>({
    key: "",
    name: "",
    type: "GLOBAL",
    order: 1,
    value: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/admin/game-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la création de la règle");
      }

      router.push("/admin/rules");
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
          <h1 className="text-2xl font-bold text-gray-900">Créer une nouvelle règle</h1>
        </div>

        <div className="max-w-3xl mx-auto  p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="key" className="block mb-2 font-medium text-gray-700">
                Clé de la règle
              </label>
              <input
                id="key"
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                Nom de la règle
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block mb-2 font-medium text-gray-700">
                Type de règle
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="GLOBAL">Global</option>
                <option value="LOCAL">Local</option>
              </select>
            </div>

            <div>
              <label htmlFor="order" className="block mb-2 font-medium text-gray-700">
                Ordre
              </label>
              <input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                min={1}
              />
            </div>

            <div>
              <label htmlFor="value" className="block mb-2 font-medium text-gray-700">
                Valeur
              </label>
              <textarea
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-2 font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                Créer la règle
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

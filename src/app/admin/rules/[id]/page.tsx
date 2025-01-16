"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/app/admin/components/Sidebar";

type GameRule = {
  id: string;
  key: string;
  type: string;
  order: number;
  name: string;
  value: string;
  description: string;
  updated_at: string;
};

export default function AdminOneRulePage() {
  const router = useRouter();
  const params = useParams();
  const [rule, setRule] = useState<GameRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [form, setForm] = useState<GameRule>({
    id: "",
    key: "",
    type: "GLOBAL",
    order: 1,
    name: "",
    value: "",
    description: "",
    updated_at: "",
  });

  useEffect(() => {
    fetchRule();
  }, []);

  const fetchRule = async () => {
    try {
      const response = await fetch(`/api/admin/game-rules/${params.id}`);
      if (!response.ok) throw new Error("Erreur lors de la récupération de la règle");
      const data = await response.json();
      setRule(data);
      setForm(data);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/game-rules/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          updated_by: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", // Replace with actual admin ID
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour de la règle");

      router.push("/admin/rules");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour de la règle");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Chargement...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Erreur: {error.message}
      </div>
    );
  if (!rule) return <div>Règle non trouvée</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Modifier la règle</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="block w-full rounded-lg border-gray-300 shadow-sm p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clé</label>
              <input
                type="text"
                value={form.key}
                onChange={(e) =>
                  setForm({ ...form, key: e.target.value })
                }
                className="block w-full rounded-lg border-gray-300 shadow-sm p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
                className="block w-full rounded-lg border-gray-300 shadow-sm p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="GLOBAL">Global</option>
                <option value="SPECIFIC">Specific</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordre</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: Number(e.target.value) })
                }
                className="block w-full rounded-lg border-gray-300 shadow-sm p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valeur</label>
              <textarea
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: e.target.value })
                }
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/rules")}
                className="px-4 py-2 border rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                Mettre à jour
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

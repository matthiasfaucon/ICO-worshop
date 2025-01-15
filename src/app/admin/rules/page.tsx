"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";

type GameRule = {
  id: string;
  key: string;
  type: string;
  name: string;
  order: number;
  value: string;
  description: string;
  updated_at: string;
};

export default function AdminRulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState<GameRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchRules() {
      try {
        const response = await fetch("/api/admin/game-rules");
        if (!response.ok) throw new Error("Erreur lors de la récupération des règles.");
        const data = await response.json();
        setRules(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchRules();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-gray-700">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg font-semibold">
          Erreur : {error.message}
        </p>
      </div>
    );
  }

  const getTypeBadge = (type: string) => {
    return type === "GLOBAL" ? (
      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
        GLOBAL
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">
        LOCAL
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block fixed inset-y-0 md:static z-10 w-64 bg-white shadow-md md:translate-x-0 transform transition-transform duration-300`}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Back Office</h2>
          <nav className="mt-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push("/admin/cards")}
                  className="w-full text-left px-4 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Gestion des cartes
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/users")}
                  className="w-full text-left px-4 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Gestion des utilisateurs
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/statistics")}
                  className="w-full text-left px-4 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Statistiques
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/rules")}
                  className="w-full text-left px-4 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Gestion des règles
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Règles du jeu</h1>
          <button
            onClick={() => router.push("/admin/rules/create")}
            type="button"
            className="rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span className="text-sm font-semibold flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
              Nouvelle règle
            </span>
          </button>
          <button
            className="block md:hidden p-2 rounded-full text-gray-500 hover:bg-gray-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rule.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(rule.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.order}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => router.push(`/admin/rules/edit/${rule.id}`)}
                      type="button"
                      className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 transition duration-200"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

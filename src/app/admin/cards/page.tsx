"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/admin/components/Sidebar";
import { PlusIcon } from "@heroicons/react/20/solid";

type Card = {
  id: string;
  type: string;
  name: string;
  description: string | null;
  effect: string | null;
  image: string | null;
};

export default function AdminCardsPage() {
  const router = useRouter();
  const [data, setData] = useState<Card[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/cards");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données.");
        }
        const cards = await response.json();
        setData(cards);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette carte ?")) return;

    try {
      const response = await fetch(`/api/admin/cards/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setData((currentData) =>
          currentData?.filter((card) => card.id !== id) ?? null
        );
      } else {
        throw new Error("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression de la carte.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Cartes</h1>
          <button
            onClick={() => router.push("/admin/cards/create")}
            type="button"
            className="rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span className="text-sm font-semibold flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Créer une carte
            </span>
          </button>
        </div>

        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.map((card) => (
                <tr key={card.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={card.image ? `/cards/${card.image}` : "/placeholder.jpg"}
                      alt={card.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{card.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                      {card.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => router.push(`/admin/cards/edit/${card.id}`)}
                      type="button"
                      className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 transition duration-200"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      type="button"
                      className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100 transition duration-200"
                    >
                      Supprimer
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

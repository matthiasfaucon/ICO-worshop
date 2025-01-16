"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/admin/components/Sidebar";
import { PlusIcon } from "@heroicons/react/20/solid";

type User = {
  id: string;
  username: string | null;
  email: string | null;
  role: string;
  created_at: string;
  is_logged: boolean;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données.");
        }
        const users = await response.json();
        setData(users);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function deleteUser(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setData((currentData) =>
          currentData?.filter((user) => user.id !== id) ?? null
        );
      } else {
        throw new Error("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression de l'utilisateur.");
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
            ADMIN
          </span>
        );
      case "MODERATOR":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/10">
            MODERATOR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">
            USER
          </span>
        );
    }
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <button
            onClick={() => router.push("/admin/users/create")}
            type="button"
            className="rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span className="text-sm font-semibold flex items-center gap-1">
              <PlusIcon className="h-5 w-5" />
              Créer un utilisateur
            </span>
          </button>
        </div>

        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom d'utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscrit le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.username || "Non défini"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email || "Non défini"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_logged
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.is_logged ? "En ligne" : "Hors ligne"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/users/edit/${user.id}`)}
                      className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 transition duration-200"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100 transition duration-200 ml-2"
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

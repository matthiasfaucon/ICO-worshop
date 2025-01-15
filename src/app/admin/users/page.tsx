"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 flex lg:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <aside className="w-64 bg-white shadow-md h-full">
          <div className="p-6">
            <h2 onClick={() => router.push("/admin")} className="text-lg font-semibold text-gray-900">Back Office</h2>
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
              </ul>
            </nav>
          </div>
        </aside>
        <div
          className="flex-1 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white shadow-md">
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
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          {/* Mobile Hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-500 focus:outline-none"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>
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

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/admin/components/Sidebar";

type User = {
  id: string;
  username: string | null;
  email: string | null;
  role: string;
  is_logged: boolean;
};

export default function EditUser() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${params.id}`);
        if (!response.ok) throw new Error("Utilisateur non trouvé");
        const user = await response.json();
        setFormData(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: formData.role,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification de l'utilisateur");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Chargement...
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Modifier l'utilisateur
          </h1>

          {/* User Info Panel */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom d'utilisateur
                </label>
                <p className="mt-1 text-gray-900">{formData.username || "Non défini"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-gray-900">{formData.email || "Non défini"}</p>
              </div>
            </div>
          </div>

          {/* Role Modification Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-sm rounded-lg p-6 space-y-6"
          >
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Rôle
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="USER">Utilisateur</option>
                <option value="MODERATOR">Modérateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

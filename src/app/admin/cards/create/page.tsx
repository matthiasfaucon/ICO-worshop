"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Sidebar from "@/app/admin/components/Sidebar";

export default function CreateCard() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    description: "",
    effect: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSend = {
        ...formData,
        image: imagePreview?.split(",")[1], // Remove base64 prefix
      };

      const response = await fetch("/api/admin/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la carte");
      }

      router.push("/admin/cards");
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Créer une nouvelle carte</h1>
          <button
            className="block md:hidden p-2 rounded-full text-gray-500 hover:bg-gray-200"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div>
            <label htmlFor="type" className="block mb-2 font-medium text-gray-700">
              Type de carte
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Sélectionner un type</option>
              <option value="ACTION">Action</option>
              <option value="BONUS">Bonus</option>
              <option value="ROLE">Rôle</option>
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
              Nom
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

          <div>
            <label htmlFor="effect" className="block mb-2 font-medium text-gray-700">
              Effet
            </label>
            <textarea
              id="effect"
              value={formData.effect}
              onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
              className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="image" className="block mb-2 font-medium text-gray-700">
              Image de la carte
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Aperçu :</p>
                <img src={imagePreview} alt="Aperçu" className="mt-2 max-w-full h-auto rounded-lg shadow-md" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              Créer la carte
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
      </main>
    </div>
  );
}

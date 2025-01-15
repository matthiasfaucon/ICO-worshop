'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCard() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        type: '',
        name: '',
        description: '',
        effect: '',
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
                image: imagePreview?.split(',')[1] // Enlever le préfixe "data:image/...;base64,"
            };

            const response = await fetch('/api/admin/cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de la carte');
            }

            router.push('/admin/cards');
            router.refresh();
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Créer une nouvelle carte</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2">Type de carte</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="">Sélectionner un type</option>
                        <option value="ACTION">Action</option>
                        <option value="EQUIPMENT">Équipement</option>
                        <option value="ROLE">Rôle</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-2">Nom</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2 border rounded"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block mb-2">Effet</label>
                    <textarea
                        value={formData.effect}
                        onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
                        className="w-full p-2 border rounded"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block mb-2">Image de la carte</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full p-2 border rounded"
                    />
                    {imagePreview && (
                        <div className="mt-2">
                            <p className="mb-2">Aperçu :</p>
                            <img 
                                src={imagePreview} 
                                alt="Aperçu" 
                                className="max-w-xs h-auto"
                            />
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Créer la carte
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}

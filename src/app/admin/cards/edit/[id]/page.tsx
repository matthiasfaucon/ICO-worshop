'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

type Card = {
    id: string;
    type: string;
    name: string;
    description: string | null;
    effect: string | null;
    image: string | null;
};

export default function EditCard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Card | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const params = useParams();

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const response = await fetch(`/api/admin/cards/${params.id}`);
                if (!response.ok) throw new Error('Carte non trouvée');
                const card = await response.json();
                setFormData(card);
                if (card.image) {
                    setImagePreview(`/cards/${card.image}`);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            } finally {
                setLoading(false);
            }
        };
        fetchCard();
    }, [params.id]);

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
        if (!formData) return;

        try {
            const dataToSend = {
                ...formData,
                image: imagePreview?.includes('data:image') 
                    ? imagePreview.split(',')[1] 
                    : undefined // Ne pas envoyer l'image si elle n'a pas été modifiée
            };

            const response = await fetch(`/api/admin/cards/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la modification de la carte');
            }

            router.push('/admin/cards');
            router.refresh();
        } catch (error) {
            console.error('Erreur:', error);
            setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
    }

    if (error || !formData) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Modifier la carte</h1>

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
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2 border rounded"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block mb-2">Effet</label>
                    <textarea
                        value={formData.effect || ''}
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
                            <p className="mb-2">Image actuelle :</p>
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
                        Enregistrer les modifications
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
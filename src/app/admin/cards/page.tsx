"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setData(data);
            } catch (error) {
                setError(error as Error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;

        try {
            const response = await fetch(`/api/admin/cards/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setData(data => data?.filter(card => card.id !== id) ?? null);
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression de la carte');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg font-semibold text-gray-700">Chargement...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 text-lg font-semibold">Erreur : {error.message}</div>
            </div>
        );
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'ACTION':
                return 'bg-blue-100 text-blue-800';
            case 'ROLE':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Gestion des Cartes</h1>
                    <button
                        onClick={() => router.push('/admin/cards/create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Créer une carte
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.map((card) => (
                        <div
                            key={card.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 h-[30rem]"
                            style={{ backgroundImage: card.image ? `url(/cards/${card.image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-semibold text-gray-900">{card.name}</h2>
                                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getTypeColor(card.type)}`}>
                                        {card.type}
                                    </span>
                                </div>

                                {/* {card.description && (
                                    <p className="text-gray-600 mb-2">
                                        <span className="font-medium">Description:</span> {card.description}
                                    </p>
                                )}

                                {card.effect && (
                                    <p className="text-gray-600 mb-4">
                                        <span className="font-medium">Effet:</span> {card.effect}
                                    </p>
                                )} */}

                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        onClick={() => router.push(`/admin/cards/edit/${card.id}`)}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200">
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(card.id)}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200">
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

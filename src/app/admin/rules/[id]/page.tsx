'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
    const [form, setForm] = useState({
        key: '',
        type: '',
        order: '',
        name: '',
        value: '',
        description: ''
    });

    useEffect(() => {
        fetchRule();
    }, []);

    const fetchRule = async () => {
        try {
            const response = await fetch(`/api/admin/game-rules/${params.id}`);
            if (!response.ok) throw new Error('Erreur lors de la récupération de la règle');
            const data = await response.json();
            setRule(data);
            setForm({
                key: data.key,
                type: data.type,
                order: data.order,
                name: data.name,
                value: data.value,
                description: data.description || '',
            });
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
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    updated_by: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' // Replace with actual admin ID
                }),
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour de la règle');
            
            router.push('/admin/rules');
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la mise à jour de la règle');
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>Erreur: {error.message}</div>;
    if (!rule) return <div>Règle non trouvée</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Modifier la règle</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Clé</label>
                            <input
                                type="text"
                                value={form.key}
                                onChange={(e) => setForm({ ...form, key: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="GLOBAL">Global</option>
                                <option value="SPECIFIC">Specific</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ordre</label>
                            <input
                                type="number"
                                value={form.order}
                                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valeur</label>
                            <input
                                type="text"
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.push('/admin/rules')}
                            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Mettre à jour
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
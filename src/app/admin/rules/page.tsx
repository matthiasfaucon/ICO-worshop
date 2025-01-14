'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const response = await fetch('/api/admin/game-rules');
            if (!response.ok) throw new Error('Erreur lors de la récupération des règles');
            const data = await response.json();
            setRules(data);
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div>Erreur: {error.message}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Règles du jeu</h1>
                    <button
                        onClick={() => router.push('/admin/rules/create')}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md">
                        Nouvelle règle
                    </button>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clé</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rules.map((rule) => (
                                <tr key={rule.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.key}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            rule.type === 'GLOBAL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {rule.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.order}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {rule.value.length > 50 ? `${rule.value.substring(0, 50)}...` : rule.value}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => router.push(`/admin/rules/${rule.id}`)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            Modifier
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
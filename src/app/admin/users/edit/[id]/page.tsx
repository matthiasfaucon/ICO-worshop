'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
                if (!response.ok) throw new Error('Utilisateur non trouvé');
                const user = await response.json();
                setFormData(user);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
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
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: formData.role
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la modification de l\'utilisateur');
            }

            router.push('/admin/users');
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
            <h1 className="text-2xl font-bold mb-6">Modifier l'utilisateur</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                        <p className="mt-1 text-gray-900">{formData.username || 'Non défini'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-gray-900">{formData.email || 'Non défini'}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2">Rôle</label>
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="USER">Utilisateur</option>
                        <option value="MODERATOR">Modérateur</option>
                        <option value="ADMIN">Administrateur</option>
                    </select>
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
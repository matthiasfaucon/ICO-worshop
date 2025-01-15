'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

type CreateUserData = {
    username: string;
    email: string;
    password: string;
    role: string;
};

export default function CreateUser() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateUserData>({
        username: '',
        email: '',
        password: '',
        role: 'USER'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    session_uuid: uuidv4()
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la création de l\'utilisateur');
            }

            router.push('/admin/users');
            router.refresh();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Créer un nouvel utilisateur</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2">Nom d'utilisateur</label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                        minLength={3}
                        maxLength={50}
                    />
                </div>

                <div>
                    <label className="block mb-2">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2">Mot de passe</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                        minLength={6}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Le mot de passe doit contenir au moins 6 caractères
                    </p>
                </div>

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
                        Créer l'utilisateur
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
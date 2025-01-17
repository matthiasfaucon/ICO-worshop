'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function CreateBugReport() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        description: '',
        type: 'BUG', // ou 'SUGGESTION'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        const token = Cookies.get("authToken");
        if (!token) {
            alert("Vous devez être connecté pour créer une partie.");
            router.push("/signin");
            return;
        }
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/bugs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData
                }),
            });

            if (response.ok) {
                router.push('/admin/bugs');
                router.refresh();
            } else {
                throw new Error('Erreur lors de la création du rapport');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Créer un nouveau rapport</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2">Type</label>
                    <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="BUG">Bug</option>
                        <option value="SUGGESTION">Suggestion</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-2">Description</label>
                    <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full p-2 border rounded"
                        rows={5}
                        required
                    />
                </div>

                <div className="flex gap-4">
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Soumettre
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
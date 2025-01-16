'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FeedbackData = {
    type: 'BUG' | 'SUGGESTION';
    description: string;
    user_id: string | null;
};

export default function FeedbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState<FeedbackData>({
        type: 'BUG',
        description: '',
        user_id: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        const user = localStorage.getItem('userInfo');
        const user_id = user ? JSON.parse(user).id : null;
        setFormData({ ...formData, user_id: user_id });
        console.log(formData);

        try {
            const response = await fetch('/api/admin/bugsSuggestion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la soumission du feedback');
            }

            setSuccess('Merci pour votre feedback !');

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto p-4">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Soumettre un feedback
                    </h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de feedback
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="BUG"
                                        checked={formData.type === 'BUG'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'BUG' })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2">Bug</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="SUGGESTION"
                                        checked={formData.type === 'SUGGESTION'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'SUGGESTION' })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2">Suggestion</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={formData.type === 'BUG' 
                                    ? 'Décrivez le bug que vous avez rencontré...'
                                    : 'Partagez votre suggestion d\'amélioration...'}
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-4 py-2 text-white rounded-md ${
                                    isSubmitting
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le feedback'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Retour
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

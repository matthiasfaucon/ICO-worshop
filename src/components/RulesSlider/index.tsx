'use client';
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type Rule = {
    id: string;
    name: string;
    value: string;
    order: number;
};

export default function RulesSlider() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const response = await fetch('/api/admin/game-rules');
                if (!response.ok) throw new Error('Erreur lors de la récupération des règles');
                const data = await response.json();
                // Filtrer uniquement les règles globales et les trier par ordre
                const globalRules = data
                    .filter((rule: Rule & { type: string }) => rule.type === 'GLOBAL')
                    .sort((a: Rule, b: Rule) => a.order - b.order);
                setRules(globalRules);
            } catch (err) {
                setError('Impossible de charger les règles');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRules();
    }, []);

    const goToNext = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === rules.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? rules.length - 1 : prevIndex - 1
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                {error}
            </div>
        );
    }

    if (rules.length === 0) {
        return (
            <div className="text-gray-500 text-center p-4">
                Aucune règle à afficher
            </div>
        );
    }

    return (
        <div className="relative max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg p-8 min-h-[300px]">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {rules[currentIndex].name}
                    </h2>
                    <div className="text-gray-600 whitespace-pre-wrap">
                        {rules[currentIndex].value}
                    </div>
                </div>

                <div className="flex justify-center gap-2 mt-6">
                    {rules.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                index === currentIndex 
                                    ? 'bg-blue-600 w-4' 
                                    : 'bg-gray-300'
                            }`}
                            aria-label={`Aller à la règle ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {rules.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                        aria-label="Règle précédente"
                    >
                        <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                        aria-label="Règle suivante"
                    >
                        <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </>
            )}
        </div>
    );
}

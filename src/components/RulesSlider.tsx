'use client';
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';


type Rule = {
    id: string;
    name: string;
    value: string;
    order: number;
};

export default function RulesSlider({ onClose }: { onClose: () => void }) {
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
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    if (rules.length === 0) {
        return (
            <div className="text-gray-500 text-center p-4">
                Aucune règle à afficher
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-20 bg-brown-600 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center bg-white shadow px-6 py-4">
                <h2 className="text-xl font-bold text-gray-800">Règles</h2>
                <button
                    onClick={onClose}
                    className="rounded-full p-2 hover:bg-gray-100 transition"
                    aria-label="Fermer le slider"
                >
                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl h-[80%] overflow-auto">
                    <h3 className="text-2xl font-magellan text-gray-900 mb-4">
                        {rules[currentIndex].name}
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {rules[currentIndex].value}
                    </p>
                </div>

                <div className="flex gap-2">
                    {rules.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'bg-brown-500 w-4'
                                    : 'bg-gray-300'
                            }`}
                            aria-label={`Aller à la règle ${index + 1}`}
                        />
                    ))}
                </div>
            </div>



            {/* Footer */}
            <div className="bg-white shadow flex border-t border-gray-300">
                {/* Bouton Précédent */}
                <button
                    onClick={goToPrevious}
                    className="w-1/2 flex items-center justify-center px-4 py-2 border-r border-gray-300 hover:bg-gray-100 transition"
                    aria-label="Règle précédente"
                >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                </button>

                {/* Bouton Suivant */}
                <button
                    onClick={goToNext}
                    className="w-1/2 flex items-center justify-center px-4 py-2 hover:bg-gray-100 transition"
                    aria-label="Règle suivante"
                >
                    <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                </button>
            </div>

        </div>
    );
}

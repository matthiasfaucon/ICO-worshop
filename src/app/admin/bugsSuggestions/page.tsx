'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Sidebar from '../components/Sidebar';

type BugSuggestion = {
    id: string;
    type: string;
    description: string;
    status: string;
    created_at: string;
    user: {
        username: string;
        id: string;
    };
    history: {
        id: string;
        old_status: string;
        new_status: string;
        change_date: string;
    }[];
};

export default function AdminBugsPage() {
    const router = useRouter();
    const [data, setData] = useState<BugSuggestion[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/admin/bugsSuggestion");
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

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const token = Cookies.get("authToken");
            if (!token) {
                alert("Vous devez être connecté pour créer une partie.");
                router.push("/signin");
                return;
            }
            const response = await fetch(`/api/admin/bugsSuggestion/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: newStatus
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du statut');
            }

            const updatedBug = await response.json();

            // Mettre à jour les données localement
            setData(prevData =>
                prevData?.map(item =>
                    item.id === id
                        ? {
                            ...item,
                            status: newStatus,
                            history: [...item.history, {
                                id: crypto.randomUUID(),
                                old_status: item.status,
                                new_status: newStatus,
                                change_date: new Date().toISOString()
                            }]
                        }
                        : item
                ) ?? null
            );
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800';
            case 'RESOLVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        return type === 'BUG'
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800';
    };

    const filteredData = data?.filter(item => {
        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
        const matchesType = selectedType === 'all' || item.type === selectedType;
        return matchesStatus && matchesType;
    });

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Bugs et Suggestions</h1>
                    <div className="flex gap-4">
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="all">Tous les types</option>
                            <option value="BUG">Bugs</option>
                            <option value="SUGGESTION">Suggestions</option>
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="PENDING">En attente</option>
                            <option value="IN_PROGRESS">En cours</option>
                            <option value="RESOLVED">Résolu</option>
                            <option value="REJECTED">Rejeté</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="grid gap-6 p-6">
                        {filteredData && filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                                                    {item.type}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Soumis par {item.user.username} le {new Date(item.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <select
                                            value={item.status}
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                            className="px-2 py-1 border rounded-md text-sm"
                                        >
                                            <option value="PENDING">En attente</option>
                                            <option value="IN_PROGRESS">En cours</option>
                                            <option value="RESOLVED">Résolu</option>
                                            <option value="REJECTED">Rejeté</option>
                                        </select>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
                                    {item.history.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Historique</h4>
                                            <div className="space-y-2">
                                                {item.history.map((h) => (
                                                    <div key={h.id} className="text-sm text-gray-500 flex justify-between items-center">
                                                        <span>{new Date(h.change_date).toLocaleString()}</span>
                                                        <span>{h.old_status} → {h.new_status}</span>
                                                        <span>par {item.user.username} ({item.user.id})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500">Aucune information trouvée</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
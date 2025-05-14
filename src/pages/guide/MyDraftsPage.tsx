// src/pages/MyDraftsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import guideService from '@/services/guideService.ts';
import '@/css/Guide.css';

interface Draft {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
}

const MyDraftsPage = () => {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        guideService.getDrafts()
            .then(setDrafts)
            .catch(err => console.error('Error fetching drafts:', err))
            .finally(() => setLoading(false));
    }, []);

    const deleteDraft = async (id: number) => {
        if (!confirm('Are you sure you want to delete this draft?')) return;

        try {
            await guideService.deleteGuide(id);
            setDrafts(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error('Error deleting draft:', error);
        }
    };

    if (loading) return <div className="p-6 text-center">Loading drafts...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-[#f47e00] mb-6">My Drafts</h1>
            {drafts.length === 0 ? (
                <p className="text-gray-500">You have no drafts yet.</p>
            ) : (
                <div className="space-y-4">
                    {drafts.map((draft) => (
                        <div
                            key={draft.id}
                            className="p-4 border border-gray-300 rounded-lg flex justify-between items-center hover:shadow-md transition-shadow"
                        >
                            <div>
                                <h2 className="text-lg font-semibold">{draft.title}</h2>
                                <p className="text-sm text-gray-500">
                                    Updated: {new Date(draft.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    className="bg-[#f47e00] hover:bg-[#d56b00] text-white py-2 px-4 rounded"
                                    onClick={() => navigate(`/guides/edit/${draft.id}`)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                                    onClick={() => deleteDraft(draft.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyDraftsPage;

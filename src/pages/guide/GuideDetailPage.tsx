// src/pages/guide/GuideDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import guideService from '../../services/guideService';
import MarkdownViewer from '../../components/MarkdownViewer';
import { useAuth } from '../../context/AuthContext';
import '@/css/Guide.css';

interface Guide {
    id: number;
    title: string;
    content: string;
    coverImageUrl?: string;
    gameId: number;
    gameName?: string;
    authorName?: string;
    createdAt: string;
    updatedAt: string;
    isDraft?: boolean;
    isPublished?: boolean;
}

const GuideDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [guide, setGuide] = useState<Guide | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            loadGuideData();
        }
    }, [id]);

    const loadGuideData = async () => {
        try {
            setLoading(true);
            console.log(`Loading guide ${id}...`);

            const guideData = await guideService.getGuideById(id!);
            console.log('Loaded guide data:', guideData);

            if (!guideData) {
                throw new Error('Guide not found');
            }

            setGuide(guideData);
            setError(null);
        } catch (err) {
            console.error("Error loading guide:", err);
            setError("Failed to load guide details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditGuide = () => {
        navigate(`/guides/edit/${id}`);
    };

    const handleDeleteGuide = async () => {
        if (!window.confirm("Are you sure you want to delete this guide?")) {
            return;
        }

        try {
            await guideService.deleteGuide(parseInt(id!));
            navigate('/guides');
        } catch (err) {
            console.error("Error deleting guide:", err);
            setError("Failed to delete guide. Please try again.");
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f47e00]"></div>
                <div className="mt-2 text-gray-600">Loading guide...</div>
            </div>
        );
    }

    if (error || !guide) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-red-800">
                        {error || "Guide not found"}
                    </div>
                </div>
                <Link
                    to="/guides"
                    className="text-[#f47e00] hover:underline flex items-center gap-2"
                >
                    <span className="text-lg">←</span> Back to Guides
                </Link>
            </div>
        );
    }

    // For now, let's allow any authenticated user to edit guides
    // You can refine this later based on your user system
    const isAuthor = isAuthenticated;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Back Navigation */}
            <Link
                to="/guides"
                className="mb-6 text-[#f47e00] hover:underline flex items-center gap-2 transition-colors"
            >
                <span className="text-lg">←</span> Back to Guides
            </Link>

            {/* Guide Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex gap-6 items-start mb-4">
                    {/* Cover Image */}
                    {guide.coverImageUrl && (
                        <div className="flex-shrink-0">
                            <img
                                src={guide.coverImageUrl}
                                alt={guide.title}
                                className="w-48 h-32 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Guide Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {guide.title}
                        </h1>

                        <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                            {guide.gameName && (
                                <Link
                                    to={`/games/${guide.gameId}`}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                                >
                                    {guide.gameName}
                                </Link>
                            )}
                            {guide.authorName && (
                                <span>by <strong>{guide.authorName}</strong></span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Created: {formatDate(guide.createdAt)}</span>
                            {guide.updatedAt !== guide.createdAt && (
                                <span>Updated: {formatDate(guide.updatedAt)}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {isAuthor && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleEditGuide}
                            className="bg-[#f47e00] hover:bg-[#d56b00] text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            Edit Guide
                        </button>
                        <button
                            onClick={handleDeleteGuide}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            Delete Guide
                        </button>
                    </div>
                )}
            </div>

            {/* Guide Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Guide Content</h2>
                <div className="prose max-w-none">
                    <MarkdownViewer content={guide.content} />
                </div>
            </div>

            {/* Related Guides Section (Optional) */}
            {guide.gameId && (
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        More guides for {guide.gameName}
                    </h3>
                    <Link
                        to={`/games/${guide.gameId}/guides`}
                        className="text-[#f47e00] hover:underline"
                    >
                        View all guides for this game →
                    </Link>
                </div>
            )}
        </div>
    );
};

export default GuideDetailPage;
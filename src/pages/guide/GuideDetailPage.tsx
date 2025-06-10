import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import guideService from "@/services/guideService";
import { Guide } from "@/interfaces/Guide";
import { useAuth } from "@/context/AuthContext";

const GuideDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [guide, setGuide] = useState<Guide | null>(null);
    const [loading, setLoading] = useState(true);
    const { isAdmin, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) guideService.getById(+id).then(setGuide).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-4">Loading…</div>;
    if (!guide)   return <div className="p-4">Guide not found.</div>;

    const canEdit = isAdmin || guide.userId === user?.id;

    return (
        <div className="p-4 max-w-3xl mx-auto">
            {guide.coverImageUrl && (
                <img src={guide.coverImageUrl} className="w-full rounded mb-4" />
            )}

            <h1 className="text-3xl font-bold mb-2">{guide.title}</h1>
            <p className="text-gray-500 mb-4">{new Date(guide.createdAt).toLocaleDateString()}</p>

            <article className="prose prose-slate max-w-none mb-8">
                {guide.content}
            </article>

            {canEdit && (
                <div className="space-x-2">
                    {guide.published ? (
                        <button
                            onClick={() => guideService.unpublish(guide.id).then(setGuide)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded">Unpublish</button>
                    ) : (
                        <button
                            onClick={() => guideService.publish(guide.id).then(setGuide)}
                            className="bg-green-600 text-white px-3 py-1 rounded">Publish</button>
                    )}

                    <button
                        onClick={() => navigate(`/guides/edit/${guide.id}`)}
                        className="bg-gray-500 text-white px-3 py-1 rounded">Edit</button>

                    <button
                        onClick={() => { if (confirm("Delete?")) guideService.delete(guide.id).then(() => navigate("/guides")); }}
                        className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                </div>
            )}

            {isAuthenticated && (
                <button
                    onClick={() => guideService.like(guide.id).then(() => guideService.getById(guide.id).then(setGuide))}
                    className="mt-4 bg-pink-600 text-white px-4 py-2 rounded">
                    ❤️ {guide.likeCount}
                </button>
            )}
        </div>
    );
};

export default GuideDetailPage;

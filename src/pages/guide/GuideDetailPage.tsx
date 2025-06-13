import { useEffect, useState } from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import guideService from "@/services/guideService";
import { Guide } from "@/interfaces/Guide";
import { useAuth } from "@/context/AuthContext";

const GuideDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [guide, setGuide] = useState<Guide | null>(null);
    const [loading, setLoading] = useState(true);
    const { isAdmin, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [authorUsername, setAuthorUsername] = useState<string | null>(null);


    useEffect(() => {
        if (id) guideService.getById(+id).then(setGuide).finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (guide?.authorId) {
            guideService.getAuthor(guide.authorId).then(setAuthorUsername);
        }
    }, [guide?.authorId]);

    if (loading) return <div className="p-4">Loading…</div>;
    if (!guide)   return <div className="p-4">Guide not found.</div>;

    const canEdit = isAdmin || guide.authorId === user?.id;

    return (
        <div className="p-4 max-w-3xl mx-auto">
            {guide.coverImageUrl && (
                <img src={guide.coverImageUrl} className="w-full rounded mb-4"/>
            )}

            <h1 className="text-3xl font-bold mb-2">{guide.title}</h1>
            <p className="text-gray-600 mb-2">
                By{" "}
                {authorUsername
                    ? (
                        <Link
                            to={`/profile/${guide.authorId}`}
                            className="text-blue-600 hover:underline"
                        >
                            {authorUsername}
                        </Link>
                    )
                    : <>Author ID: {guide.authorId}</>
                }{" "}
                · {new Date(guide.createdAt).toLocaleDateString()}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
                {guide.tags.map(tag => (
                    <span key={tag} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {tag}
                    </span>
                ))}
            </div>
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
                        className="bg-gray-500 text-white px-3 py-1 rounded">Edit
                    </button>

                    <button
                        onClick={() => {
                            if (confirm("Delete?")) guideService.delete(guide.id).then(() => navigate("/guides"));
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded">Delete
                    </button>
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

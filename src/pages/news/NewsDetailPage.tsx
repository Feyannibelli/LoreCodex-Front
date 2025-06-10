import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import newsService from "@/services/newsService";
import { News } from "@/interfaces/News";
import { useAuth } from "@/context/AuthContext";

const NewsDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin } = useAuth(); // ajusta si tu contexto expone estos flags

    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);

    /* cargar noticia */
    useEffect(() => {
        if (id) {
            newsService.getById(parseInt(id))
                .then(res => setNews(res.data))
                .finally(() => setLoading(false));
        }
    }, [id]);

    /* like / unlike (solo usuarios logueados) */
    const toggleLike = () => {
        if (!news) return;
        newsService.toggleLike(news.id).then(res => setNews(res.data));
    };

    if (loading) return <div className="p-4">Loading…</div>;
    if (!news)   return <div className="p-4">News not found.</div>;

    return (
        <div className="p-4 max-w-3xl mx-auto">
            {/* portada opcional */}
            {news.coverImage && (
                <img
                    src={news.coverImage}
                    alt={news.title}
                    className="w-full h-auto rounded mb-4"
                />
            )}

            <h1 className="text-3xl font-bold mb-2">{news.title}</h1>

            <div className="text-sm text-gray-500 mb-4 flex gap-4 items-center">
                <span>{new Date(news.createdAt).toLocaleDateString()}</span>
                <span>{news.likes} likes</span>
                {news.tags?.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
            #{t}
          </span>
                ))}
            </div>

            <article className="prose prose-slate max-w-none mb-8">
                {news.content}
            </article>

            {/* Like button (usuario) */}
            {isAuthenticated && (
                <button
                    onClick={toggleLike}
                    className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
                >
                    {news.likes ? "Toggle Like" : "Like"}
                </button>
            )}

            {/* Panel admin */}
            {isAdmin && (
                <div className="mt-6 space-x-2">
                    {news.published ? (
                        <button
                            onClick={() =>
                                newsService.unpublish(news.id).then(res => setNews(res.data))
                            }
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                            Unpublish
                        </button>
                    ) : (
                        <button
                            onClick={() =>
                                newsService.publish(news.id).then(res => setNews(res.data))
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                            Publish
                        </button>
                    )}

                    <button
                        onClick={() => navigate(`/admin/news/edit/${news.id}`)}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                    >
                        Edit
                    </button>

                    <button
                        onClick={() => {
                            if (confirm("Delete this news item?")) {
                                newsService.delete(news.id).then(() => navigate("/news"));
                            }
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default NewsDetailPage;

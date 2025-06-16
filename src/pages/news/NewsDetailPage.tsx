import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { News } from "../../interfaces/News.ts";
import newsService from "../../services/newsService.ts";
import MarkdownRenderer from "../../components/MarkdownRenderer"; // Ajusta la ruta según tu estructura

const NewsDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin } = useAuth();

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
    if (!news) return <div className="p-4">News not found.</div>;

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* portada opcional */}
            {news.coverImage && (
                <img
                    src={news.coverImage}
                    alt={news.title}
                    className="w-full h-auto rounded-lg mb-6 shadow-md"
                />
            )}

            <h1 className="text-4xl font-bold mb-4">{news.title}</h1>

            <div className="text-sm text-gray-500 mb-6 flex gap-4 items-center flex-wrap">
                <span>📅 {new Date(news.createdAt).toLocaleDateString()}</span>
                <span>❤️ {news.likes} likes</span>
                {news.tags?.map(t => (
                    <span key={t} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        #{t}
                    </span>
                ))}
            </div>

            {/* Contenido renderizado con markdown */}
            <article className="mb-8 bg-white">
                <MarkdownRenderer
                    content={news.content}
                    className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-pink-600 prose-code:bg-pink-50 prose-a:text-blue-600 prose-blockquote:text-gray-600 prose-blockquote:border-gray-300"
                />
            </article>

            {/* Like button (usuario) */}
            {isAuthenticated && (
                <div className="mb-6">
                    <button
                        onClick={toggleLike}
                        className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                    >
                        ❤️ {news.likes ? "Toggle Like" : "Like"}
                    </button>
                </div>
            )}

            {/* Panel admin */}
            {isAdmin && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3 text-gray-700">Acciones de administrador</h3>
                    <div className="space-x-2">
                        {news.published ? (
                            <button
                                onClick={() =>
                                    newsService.unpublish(news.id).then(res => setNews(res.data))
                                }
                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                            >
                                📝 Despublicar
                            </button>
                        ) : (
                            <button
                                onClick={() =>
                                    newsService.publish(news.id).then(res => setNews(res.data))
                                }
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                            >
                                ✅ Publicar
                            </button>
                        )}

                        <button
                            onClick={() => navigate(`/admin/news/edit/${news.id}`)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                        >
                            ✏️ Editar
                        </button>

                        <button
                            onClick={() => {
                                if (confirm("¿Estás seguro de que quieres eliminar esta noticia?")) {
                                    newsService.delete(news.id).then(() => navigate("/news"));
                                }
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsDetailPage;
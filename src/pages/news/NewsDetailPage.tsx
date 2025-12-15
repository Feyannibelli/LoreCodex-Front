import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { News } from "../../interfaces/News.ts";
import newsService from "../../services/newsService.ts";
import UnifiedContentRenderer from "../../components/UnifiedContentRenderer";
import CommentSection from "../../components/comments/CommentSection";
import { ArrowLeft, Calendar, Heart, Tag } from "lucide-react";
import Button from "../../components/Button";

const NewsDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin } = useAuth();

    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (id) {
            newsService.getById(parseInt(id))
                .then(res => setNews(res.data))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const toggleLike = () => {
        if (!news) return;
        newsService.toggleLike(news.id).then(res => setNews(res.data));
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Noticia no encontrada
                    </h2>
                    <Button onClick={() => navigate('/news')}>
                        Volver a Noticias
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/news')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                >
                    <ArrowLeft size={20} />
                    Volver a Noticias
                </button>

                {/* Cover Image */}
                {news.coverImage && (
                    <div className="mb-6">
                        <img
                            src={news.coverImage}
                            alt={news.title}
                            className="w-full h-auto rounded-lg shadow-lg max-h-96 object-cover"
                        />
                    </div>
                )}

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {news.title}
                </h1>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(news.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart size={16} />
                        <span>{news.likes} likes</span>
                    </div>
                    {!news.published && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            🔒 Borrador
                        </span>
                    )}
                </div>

                {/* Tags */}
                {news.tags && news.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {news.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full text-sm font-medium"
                            >
                                <Tag size={14} />
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <article className="mb-8">
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <UnifiedContentRenderer content={news.content} />
                </div>
            </article>

            {/* Like Button */}
            {isAuthenticated && (
                <div className="mb-6">
                    <Button
                        onClick={toggleLike}
                        className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700"
                    >
                        <Heart size={20} />
                        {news.likes > 0 ? 'Toggle Like' : 'Like'}
                    </Button>
                </div>
            )}

            {/* Admin Panel */}
            {isAdmin && (
                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mb-8">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                        Acciones de Administrador
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {news.published ? (
                            <Button
                                onClick={() =>
                                    newsService.unpublish(news.id).then(res => setNews(res.data))
                                }
                                className="bg-yellow-500 hover:bg-yellow-600"
                            >
                                🔒 Despublicar
                            </Button>
                        ) : (
                            <Button
                                onClick={() =>
                                    newsService.publish(news.id).then(res => setNews(res.data))
                                }
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                ✅ Publicar
                            </Button>
                        )}

                        <Button
                            onClick={() => navigate(`/admin/news/edit/${news.id}`)}
                            className="bg-gray-500 hover:bg-gray-600"
                        >
                            ✏️ Editar
                        </Button>

                        <Button
                            onClick={() => {
                                if (confirm("¿Estás seguro de que quieres eliminar esta noticia?")) {
                                    newsService.delete(news.id).then(() => navigate("/news"));
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            🗑️ Eliminar
                        </Button>
                    </div>
                </div>
            )}

            {/* ========== COMENTARIOS ========== */}
            <CommentSection
                entityType="news"
                entityId={news.id}
                currentUser={user ? {
                    id: user.id,
                    username: user.username,
                    isAdmin: isAdmin
                } : null}
            />
        </div>
    );
};

export default NewsDetailPage;

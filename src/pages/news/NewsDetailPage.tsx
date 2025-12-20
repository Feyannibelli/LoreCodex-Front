import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { News } from "../../interfaces/News.ts";
import newsService from "../../services/newsService.ts";
import UnifiedContentRenderer from "../../components/UnifiedContentRenderer";
import CommentSection from "../../components/comments/CommentSection";
import { Calendar, Tag } from "lucide-react";
import Button from "../../components/Button";

const NewsDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

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

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Noticia no encontrada
                    </h2>
                    <Button onClick={() => navigate('/news')}>
                        Volver a noticias
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
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                >
                    ← Volver
                </button>

                {/* Cover Image - FIXED: Better aspect ratio handling */}
                {news.coverImage && (
                    <div className="mb-6 rounded-xl overflow-hidden bg-muted">
                        <img
                            src={news.coverImage}
                            alt={news.title}
                            className="w-full h-auto max-h-[600px] object-contain"
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                )}

                {/* Title */}
                <h1 className="text-4xl font-bold text-foreground mb-4">
                    {news.title}
                </h1>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(news.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">By</span>
                        {news.authorId ? (
                            <Link to={`/profile/${news.authorId}`} className="font-medium hover:text-primary transition-colors text-foreground">
                                {news.authorUsername}
                            </Link>
                        ) : (
                            <span className="font-medium text-foreground">{news.authorUsername || "LoreCodex Team"}</span>
                        )}
                    </div>

                    {!news.published && (
                        <span className="bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium border border-yellow-500/20">
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
                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
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
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                    <UnifiedContentRenderer content={news.content} />
                </div>
            </article>

            {/* Admin Panel */}
            {isAdmin && (
                <div className="mt-8 p-6 bg-secondary/30 rounded-lg mb-8 border border-border">
                    <h3 className="font-semibold mb-4 text-foreground">
                        Acciones de Administrador
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {news.published ? (
                            <Button
                                onClick={() =>
                                    newsService.unpublish(news.id).then(res => setNews(res.data))
                                }
                                variant="secondary"
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/10"
                            >
                                🔒 Despublicar
                            </Button>
                        ) : (
                            <Button
                                onClick={() =>
                                    newsService.publish(news.id).then(res => setNews(res.data))
                                }
                                variant="default"
                            >
                                ✅ Publicar
                            </Button>
                        )}

                        <Button
                            onClick={() => navigate(`/admin/news/edit/${news.id}`)}
                            variant="outline"
                        >
                            ✏️ Editar
                        </Button>

                        <Button
                            onClick={() => {
                                if (confirm("¿Estás seguro de que quieres eliminar esta noticia?")) {
                                    newsService.delete(news.id).then(() => navigate("/news"));
                                }
                            }}
                            variant="destructive"
                        >
                            🗑️ Eliminar
                        </Button>
                    </div>
                </div>
            )}

            {/* Comments */}
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

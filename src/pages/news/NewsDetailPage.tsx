import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { News } from "../../interfaces/News.ts";
import newsService from "../../services/newsService.ts";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import { MentionDisplay, useMentions } from "../../components/MentionDisplay";

const NewsDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin } = useAuth();

    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);

    // Hook para extraer información de menciones
    const { mentions, hasMentions, mentionCount, getMentionsByType } = useMentions(news?.content || "");

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

    /* manejar clic en menciones */
    const handleMentionClick = (mention: any) => {
        // Navegar al contenido mencionado
        const baseUrl = mention.type.endsWith('s') ? mention.type : mention.type + 's';
        navigate(`/${baseUrl}/${mention.id}`);
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
                {hasMentions && (
                    <span>🔗 {mentionCount} {mentionCount === 1 ? 'mención' : 'menciones'}</span>
                )}
                {news.tags?.map(t => (
                    <span key={t} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        #{t}
                    </span>
                ))}
            </div>

            {/* Mostrar menciones destacadas si las hay */}
            {hasMentions && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        🔗 Contenido relacionado mencionado
                    </h3>
                    <div className="space-y-2">
                        {['games', 'guides', 'challenges', 'lists', 'news'].map(type => {
                            const typeMentions = getMentionsByType(type);
                            if (typeMentions.length === 0) return null;

                            return (
                                <div key={type} className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-gray-600 capitalize">
                                        {type.slice(0, -1)}s:
                                    </span>
                                    {typeMentions.map((mention, index) => (
                                        <span
                                            key={index}
                                            onClick={() => handleMentionClick(mention)}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200"
                                            title={`${type.slice(0, -1)}: ${mention.name}`}
                                        >
                                            {mention.name}
                                        </span>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Contenido con menciones renderizadas */}
            <article className="mb-8 bg-white">
                <div className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-pink-600 prose-code:bg-pink-50 prose-a:text-blue-600 prose-blockquote:text-gray-600 prose-blockquote:border-gray-300">
                    <MentionDisplay
                        text={news.content}
                        onMentionClick={handleMentionClick}
                    />
                </div>
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
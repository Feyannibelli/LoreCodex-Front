import { useEffect, useState } from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import { Guide } from "../../interfaces/Guide";
import { MentionDisplay, useMentions } from "../../components/MentionDisplay";
import { ParsedMention } from "../../utils/mentionParser";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import guideService from "../../services/guideService";
import { useAuth } from "../../context/AuthContext";

const GuideDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [guide, setGuide] = useState<Guide | null>(null);
    const [loading, setLoading] = useState(true);
    const {user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [authorUsername, setAuthorUsername] = useState<string | null>(null);
    const [renderMode, setRenderMode] = useState<'auto' | 'markdown' | 'mentions'>('auto');

    useEffect(() => {
        if (id) {
            guideService.getById(+id)
                .then(setGuide)
                .finally(() => setLoading(false));
        }
    }, [id]);

    useEffect(() => {
        if (guide?.authorId) {
            guideService.getAuthor(guide.authorId).then(setAuthorUsername);
        }
    }, [guide?.authorId]);

    // Hook para obtener información de las menciones
    const { mentions, hasMentions, mentionCount, getMentionsByType } = useMentions(guide?.content || '');

    // Detectar si el contenido parece ser Markdown
    const hasMarkdownSyntax = (text: string): boolean => {
        const markdownPatterns = [
            /^#{1,6}\s/m,           // Headers
            /\*\*.*\*\*/,           // Bold
            /\*.*\*/,               // Italic
            /`.*`/,                 // Inline code
            /^\* /m,                // Unordered lists
            /^\d+\. /m,             // Ordered lists
            /\[.*\]\(.*\)/,         // Links
            /^> /m                  // Blockquotes
        ];
        return markdownPatterns.some(pattern => pattern.test(text));
    };

    // Determinar el modo de renderizado automático
    const getAutoRenderMode = (): 'markdown' | 'mentions' => {
        if (!guide?.content) return 'markdown';

        const hasMarkdown = hasMarkdownSyntax(guide.content);
        const hasMentionsInContent = hasMentions;

        // Si tiene ambos, priorizar según la cantidad
        if (hasMarkdown && hasMentionsInContent) {
            // Contar elementos markdown vs menciones para decidir
            const markdownElements = (guide.content.match(/#{1,6}|[\*`]|\[.*\]\(.*\)|^[\*\d+\.]\s/gm) || []).length;
            return markdownElements > mentionCount ? 'markdown' : 'mentions';
        }

        if (hasMarkdown) return 'markdown';
        if (hasMentionsInContent) return 'mentions';

        return 'markdown'; // Default
    };

    const actualRenderMode = renderMode === 'auto' ? getAutoRenderMode() : renderMode;

    // Manejar clicks en menciones para navegar
    const handleMentionClick = (mention: ParsedMention) => {
        const encodedName = encodeURIComponent(mention.name);

        switch (mention.type) {
            case 'games':
                navigate(`/games/${encodedName}`);
                break;
            case 'guides':
                navigate(`/guides/search?q=${encodedName}`);
                break;
            case 'challenges':
                navigate(`/challenges/${encodedName}`);
                break;
            case 'lists':
                navigate(`/lists/${encodedName}`);
                break;
            case 'news':
                navigate(`/news/${encodedName}`);
                break;
            default:
                console.log('Unknown mention type:', mention.type);
        }
    };

    if (loading) return (
        <div className="p-4 max-w-3xl mx-auto">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    if (!guide) return (
        <div className="p-4 max-w-3xl mx-auto">
            <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Guide not found</h2>
                <p className="text-gray-600 mb-4">The guide you're looking for doesn't exist or has been removed.</p>
                <button
                    onClick={() => navigate('/guides')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Back to Guides
                </button>
            </div>
        </div>
    );

    const canEdit = guide.authorId === user?.id;

    // Estadísticas de menciones por tipo
    const mentionStats = {
        games: getMentionsByType('games').length,
        guides: getMentionsByType('guides').length,
        challenges: getMentionsByType('challenges').length,
        lists: getMentionsByType('lists').length,
        news: getMentionsByType('news').length,
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Cover Image */}
            {guide.coverImageUrl && (
                <div className="mb-6">
                    <img
                        src={guide.coverImageUrl}
                        alt={guide.title}
                        className="w-full max-h-96 object-cover rounded-lg shadow-lg"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            )}

            {/* Header */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{guide.title}</h1>

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
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>📅 {new Date(guide.createdAt).toLocaleDateString()}</span>
                    {guide.updatedAt !== guide.createdAt && (
                        <span>✏️ Updated {new Date(guide.updatedAt).toLocaleDateString()}</span>
                    )}
                    {!guide.published && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            📝 Draft
                        </span>
                    )}
                </div>

                {/* Tags */}
                {guide.tags && guide.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {guide.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Render Mode Selector */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">View as:</span>
                    <button
                        onClick={() => setRenderMode('auto')}
                        className={`px-2 py-1 text-xs rounded ${
                            renderMode === 'auto'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        🤖 Auto ({actualRenderMode})
                    </button>
                    <button
                        onClick={() => setRenderMode('markdown')}
                        className={`px-2 py-1 text-xs rounded ${
                            renderMode === 'markdown'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        📝 Markdown
                    </button>
                    <button
                        onClick={() => setRenderMode('mentions')}
                        className={`px-2 py-1 text-xs rounded ${
                            renderMode === 'mentions'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        🔗 Mentions
                    </button>
                </div>

                {/* Mention Statistics */}
                {hasMentions && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-700 mb-2">
                            📎 References ({mentionCount})
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm">
                            {mentionStats.games > 0 && (
                                <span className="flex items-center gap-1">
                                    🎮 {mentionStats.games} game{mentionStats.games !== 1 ? 's' : ''}
                                </span>
                            )}
                            {mentionStats.guides > 0 && (
                                <span className="flex items-center gap-1">
                                    📖 {mentionStats.guides} guide{mentionStats.guides !== 1 ? 's' : ''}
                                </span>
                            )}
                            {mentionStats.challenges > 0 && (
                                <span className="flex items-center gap-1">
                                    🏆 {mentionStats.challenges} challenge{mentionStats.challenges !== 1 ? 's' : ''}
                                </span>
                            )}
                            {mentionStats.lists > 0 && (
                                <span className="flex items-center gap-1">
                                    📝 {mentionStats.lists} list{mentionStats.lists !== 1 ? 's' : ''}
                                </span>
                            )}
                            {mentionStats.news > 0 && (
                                <span className="flex items-center gap-1">
                                    📰 {mentionStats.news} news
                                </span>
                            )}
                        </div>
                        {mentions.length > 0 && (
                            <details className="mt-2">
                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                    Show all references
                                </summary>
                                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                                    {mentions.map((m, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                            <span className="font-medium">{m.type}:</span>
                                            <span>{m.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        )}
                    </div>
                )}
            </header>

            {/* Content with Dynamic Rendering */}
            <article className="mb-8">
                {actualRenderMode === 'markdown' ? (
                    <MarkdownRenderer
                        content={guide.content}
                        className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed"
                    />
                ) : (
                    <div className="prose prose-slate max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                            <MentionDisplay
                                text={guide.content}
                                onMentionClick={handleMentionClick}
                                className="text-base"
                            />
                        </div>
                    </div>
                )}
            </article>

            {/* Action Buttons */}
            {canEdit && (
                <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="w-full font-semibold text-gray-700 mb-2">Actions:</h3>

                    {guide.published ? (
                        <button
                            onClick={() => guideService.unpublish(guide.id).then(setGuide)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                        >
                            📤 Unpublish
                        </button>
                    ) : (
                        <button
                            onClick={() => guideService.publish(guide.id).then(setGuide)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                            🚀 Publish
                        </button>
                    )}

                    <button
                        onClick={() => navigate(`/guides/edit/${guide.id}`)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        onClick={() => {
                            if (confirm(`Are you sure you want to delete "${guide.title}"? This action cannot be undone.`)) {
                                guideService.delete(guide.id).then(() => navigate("/guides"));
                            }
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}

            {/* Like Button */}
            {isAuthenticated && (
                <div className="flex items-center gap-4 pt-4 border-t">
                    <button
                        onClick={() => guideService.like(guide.id).then(() =>
                            guideService.getById(guide.id).then(setGuide)
                        )}
                        className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium"
                    >
                        ❤️ Like ({guide.likeCount || 0})
                    </button>

                    <button
                        onClick={() => {
                            const url = window.location.href;
                            navigator.clipboard.writeText(url);
                            alert('Link copied to clipboard!');
                        }}
                        className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        🔗 Share
                    </button>
                </div>
            )}
        </div>
    );
};

export default GuideDetailPage;

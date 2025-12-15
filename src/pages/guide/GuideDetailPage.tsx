import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Guide } from "../../interfaces/Guide";
import UnifiedContentRenderer from "../../components/UnifiedContentRenderer";
import CommentSection from "../../components/comments/CommentSection";
import guideService from "../../services/guideService";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { ArrowLeft, Calendar, Heart, Share2, Edit, Trash2, Upload, Lock } from "lucide-react";

const GuideDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [guide, setGuide] = useState<Guide | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [authorUsername, setAuthorUsername] = useState<string | null>(null);

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

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert('¡Enlace copiado al portapapeles!');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Guía no encontrada
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        La guía que buscas no existe o ha sido eliminada.
                    </p>
                    <Button onClick={() => navigate('/guides')}>
                        Volver a Guías
                    </Button>
                </div>
            </div>
        );
    }

    const canEdit = guide.authorId === user?.id;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/guides')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft size={20} />
                    Volver a Guías
                </button>

                {/* Cover Image */}
                {guide.coverImageUrl && (
                    <div className="mb-6">
                        <img
                            src={guide.coverImageUrl}
                            alt={guide.title}
                            className="w-full max-h-96 object-cover rounded-xl shadow-lg"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Title and Metadata */}
                <h1 className="text-4xl font-bold text-foreground mb-4">
                    {guide.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                        Por{" "}
                        {authorUsername ? (
                            <Link
                                to={`/profile/${guide.authorId}`}
                                className="text-primary hover:underline font-medium"
                            >
                                {authorUsername}
                            </Link>
                        ) : (
                            <span>Author ID: {guide.authorId}</span>
                        )}
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(guide.createdAt).toLocaleDateString()}
                    </div>
                    {guide.updatedAt !== guide.createdAt && (
                        <>
                            <span>·</span>
                            <span>Actualizado {new Date(guide.updatedAt).toLocaleDateString()}</span>
                        </>
                    )}
                    {!guide.published && (
                        <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                                <Lock size={12} />
                                Borrador
                            </span>
                        </>
                    )}
                </div>

                {/* Tags */}
                {guide.tags && guide.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {guide.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <article className="mb-8">
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <UnifiedContentRenderer content={guide.content} />
                </div>
            </article>

            {/* Action Buttons */}
            {isAuthenticated && (
                <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-border">
                    <Button
                        onClick={() => guideService.like(guide.id).then(() =>
                            guideService.getById(guide.id).then(setGuide)
                        )}
                        className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white border-none"
                    >
                        <Heart size={20} />
                        Like ({guide.likeCount || 0})
                    </Button>

                    <Button
                        onClick={handleShare}
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        <Share2 size={20} />
                        Compartir
                    </Button>
                </div>
            )}

            {/* Author Actions */}
            {canEdit && (
                <div className="p-6 bg-secondary/50 rounded-xl mb-8">
                    <h3 className="font-semibold text-foreground mb-4">
                        Acciones del Autor
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {guide.published ? (
                            <Button
                                onClick={() => guideService.unpublish(guide.id).then(setGuide)}
                                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white border-none"
                            >
                                <Lock size={16} />
                                Despublicar
                            </Button>
                        ) : (
                            <Button
                                onClick={() => guideService.publish(guide.id).then(setGuide)}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-none"
                            >
                                <Upload size={16} />
                                Publicar
                            </Button>
                        )}

                        <Button
                            onClick={() => navigate(`/guides/edit/${guide.id}`)}
                            variant="outline"
                            className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
                        >
                            <Edit size={16} />
                            Editar
                        </Button>

                        <Button
                            onClick={() => {
                                if (confirm(`¿Estás seguro de que quieres eliminar "${guide.title}"? Esta acción no se puede deshacer.`)) {
                                    guideService.delete(guide.id).then(() => navigate("/guides"));
                                }
                            }}
                            variant="destructive"
                            className="flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Eliminar
                        </Button>
                    </div>
                </div>
            )}

            {/* ========== COMENTARIOS ========== */}
            <CommentSection
                entityType="guide"
                entityId={guide.id}
                currentUser={user ? {
                    id: user.id,
                    username: user.username,
                    isAdmin: isAdmin
                } : null}
            />
        </div>
    );
};

export default GuideDetailPage;

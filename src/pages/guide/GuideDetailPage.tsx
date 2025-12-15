import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Guide } from "../../interfaces/Guide";
import UnifiedContentRenderer from "../../components/UnifiedContentRenderer";
import CommentSection from "../../components/comments/CommentSection";
import guideService from "../../services/guideService";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { ArrowLeft, Calendar, Heart, Share2, Edit, Trash2, Upload, Lock, Shield } from "lucide-react";

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

    const handleDelete = () => {
        if (!guide) return;

        const confirmMessage = isAdmin && guide.authorId !== user?.id
            ? `⚠️ ADMIN: ¿Estás seguro de eliminar la guía "${guide.title}" de otro usuario? Esta acción no se puede deshacer.`
            : `¿Estás seguro de eliminar "${guide.title}"? Esta acción no se puede deshacer.`;

        if (confirm(confirmMessage)) {
            guideService.delete(guide.id).then(() => navigate("/guides"));
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47E00]"></div>
                </div>
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Guía no encontrada
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        La guía que buscas no existe o ha sido eliminada.
                    </p>
                    <Button onClick={() => navigate('/guides')}>
                        Volver a Guías
                    </Button>
                </div>
            </div>
        );
    }

    // CORREGIDO: Verificar permisos correctamente
    const canEdit = guide.authorId === user?.id;
    const canDelete = guide.authorId === user?.id || isAdmin;
    const canPublish = guide.authorId === user?.id || isAdmin;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/guides')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
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
                            className="w-full max-h-96 object-cover rounded-lg shadow-lg"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Title and Metadata */}
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {guide.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                        Por{" "}
                        {authorUsername ? (
                            <Link
                                to={`/profile/${guide.authorId}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
                            <span className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium">
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
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <article className="mb-8">
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <UnifiedContentRenderer content={guide.content} />
                </div>
            </article>

            {/* Action Buttons */}
            {isAuthenticated && (
                <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <Button
                        onClick={() => guideService.like(guide.id).then(() =>
                            guideService.getById(guide.id).then(setGuide)
                        )}
                        className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700"
                    >
                        <Heart size={20} />
                        Like ({guide.likeCount || 0})
                    </Button>

                    <Button
                        onClick={handleShare}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
                    >
                        <Share2 size={20} />
                        Compartir
                    </Button>
                </div>
            )}

            {/* Author/Admin Actions */}
            {(canEdit || canPublish || canDelete) && (
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mb-8">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        {isAdmin && guide.authorId !== user?.id && (
                            <Shield size={20} className="text-red-500" />
                        )}
                        {isAdmin && guide.authorId !== user?.id ? 'Acciones de Admin' : 'Acciones del Autor'}
                    </h3>

                    {isAdmin && guide.authorId !== user?.id && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                ⚠️ Estás administrando la guía de otro usuario. Usa estos controles con precaución.
                            </p>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        {/* CORREGIDO: Solo mostrar botón de publicar/despublicar según el estado */}
                        {canPublish && !guide.published && (
                            <Button
                                onClick={() => guideService.publish(guide.id).then(updated => {
                                    setGuide(updated);
                                    // Recargar página para actualizar listas
                                    window.location.reload();
                                })}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                                <Upload size={16} />
                                Publicar
                            </Button>
                        )}

                        {canPublish && guide.published && (
                            <Button
                                onClick={() => guideService.unpublish(guide.id).then(updated => {
                                    setGuide(updated);
                                    // Recargar página para actualizar listas
                                    window.location.reload();
                                })}
                                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600"
                            >
                                <Lock size={16} />
                                Despublicar
                            </Button>
                        )}

                        {canEdit && (
                            <Button
                                onClick={() => navigate(`/guides/edit/${guide.id}`)}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                            >
                                <Edit size={16} />
                                Editar
                            </Button>
                        )}

                        {canDelete && (
                            <Button
                                onClick={handleDelete}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                            >
                                <Trash2 size={16} />
                                {isAdmin && guide.authorId !== user?.id ? 'Eliminar (Admin)' : 'Eliminar'}
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Comments */}
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

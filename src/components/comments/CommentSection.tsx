import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import commentService, { Comment } from '../../services/commentService';
import CommentItem from './CommentItem.tsx';

interface CommentSectionProps {
    entityType: 'guide' | 'news' | 'list' | 'challenge';
    entityId: number;
    currentUser?: {
        id: number;
        username: string;
        isAdmin: boolean;
    } | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({
                                                           entityType,
                                                           entityId,
                                                           currentUser
                                                       }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Cargar comentarios
    const loadComments = useCallback(async (pageNum: number = 0) => {
        try {
            setLoading(true);
            const data = await commentService.getComments(entityType, entityId, pageNum, 10);

            if (pageNum === 0) {
                setComments(data);
            } else {
                setComments(prev => [...prev, ...data]);
            }

            setHasMore(data.length === 10);
            setPage(pageNum);
        } catch (error) {
            console.error('Error cargando comentarios:', error);
        } finally {
            setLoading(false);
        }
    }, [entityType, entityId]);

    useEffect(() => {
        loadComments(0);
    }, [loadComments]);

    // Agregar comentario nuevo
    const handleAddComment = async () => {
        if (!newComment.trim() || !currentUser) return;

        setIsSubmitting(true);
        try {
            await commentService.addComment(entityType, entityId, newComment);
            setNewComment('');
            await loadComments(0); // Recargar comentarios
        } catch (error) {
            console.error('Error al agregar comentario:', error);
            alert('Error al agregar comentario. ¿Estás autenticado?');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Responder a un comentario
    const handleReply = async (parentId: number, content: string) => {
        if (!currentUser) return;

        await commentService.addComment(entityType, entityId, content, parentId);
        await loadComments(0); // Recargar para mostrar la nueva respuesta
    };

    // Eliminar comentario
    const handleDelete = async (commentId: number) => {
        await commentService.deleteComment(commentId);
        await loadComments(0); // Recargar después de eliminar
    };

    // Cargar más comentarios
    const loadMore = () => {
        if (!loading && hasMore) {
            loadComments(page + 1);
        }
    };

    return (
        <div className="bg-white dark:bg-[#313E3F] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="text-orange-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Comentarios ({comments.length})
                </h2>
            </div>

            {/* Formulario para nuevo comentario */}
            {currentUser ? (
                <div className="mb-6">
          <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              rows={4}
          />
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={16} />
                            {isSubmitting ? 'Enviando...' : 'Comentar'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Inicia sesión para comentar
                    </p>
                </div>
            )}

            {/* Lista de comentarios */}
            <div className="space-y-4">
                {loading && comments.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Cargando comentarios...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageCircle className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-gray-500 dark:text-gray-400">No hay comentarios aún</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Sé el primero en comentar</p>
                    </div>
                ) : (
                    <>
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                currentUser={currentUser}
                                onReply={handleReply}
                                onDelete={handleDelete}
                                level={0}
                            />
                        ))}

                        {/* Botón cargar más */}
                        {hasMore && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Cargando...' : 'Cargar más comentarios'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentSection;

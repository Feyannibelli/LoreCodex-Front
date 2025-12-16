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
        <div className="bg-card rounded-2xl shadow-sm border border-white/5 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                <MessageCircle className="text-primary" size={24} />
                <h2 className="text-xl font-bold text-foreground">
                    Comments ({comments.length})
                </h2>
            </div>

            {/* Formulario para nuevo comentario */}
            {currentUser ? (
                <div className="mb-8">
                    <div className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full px-4 py-3 bg-secondary/30 border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground placeholder:text-muted-foreground resize-none transition-all"
                            rows={3}
                        />
                        <div className="absolute right-2 bottom-2">
                            {/* Optional: Character count or similar */}
                        </div>
                    </div>
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                        >
                            <Send size={16} />
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-6 bg-secondary/20 rounded-xl border border-white/5 text-center">
                    <p className="text-muted-foreground mb-3">
                        Join the conversation
                    </p>
                    {/* Assuming there's a way to trigger login or link to it, strictly text for now per original */}
                    <p className="text-sm font-medium text-foreground">
                        Please log in to leave a comment.
                    </p>
                </div>
            )}

            {/* Lista de comentarios */}
            <div className="space-y-6">
                {loading && comments.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-4">Loading comments...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-12 bg-secondary/10 rounded-xl border border-dashed border-white/5">
                        <MessageCircle className="mx-auto text-muted-foreground/30 mb-3" size={48} />
                        <p className="text-muted-foreground font-medium">No comments yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
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
                        </div>

                        {/* Botón cargar más */}
                        {hasMore && (
                            <div className="text-center pt-6 border-t border-white/5 mt-6">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="px-6 py-2 text-primary hover:text-primary/80 font-medium disabled:opacity-50 text-sm hover:bg-primary/5 rounded-lg transition-colors"
                                >
                                    {loading ? 'Loading...' : 'Load more comments'}
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

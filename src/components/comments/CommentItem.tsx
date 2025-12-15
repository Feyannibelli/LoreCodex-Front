import React, { useState } from 'react';
import { Reply, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Comment } from '../../services/commentService';

interface CommentItemProps {
    comment: Comment;
    currentUser?: {
        id: number;
        username: string;
        isAdmin: boolean;
    } | null;
    onReply: (commentId: number, content: string) => Promise<void>;
    onDelete: (commentId: number) => Promise<void>;
    level: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
                                                     comment,
                                                     currentUser,
                                                     onReply,
                                                     onDelete,
                                                     level
                                                 }) => {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const canDelete = currentUser?.isAdmin || currentUser?.id === comment.userId;
    const maxLevel = 3; // Límite de anidación

    const handleReply = async () => {
        if (!replyContent.trim()) return;

        setIsReplying(true);
        try {
            await onReply(comment.id, replyContent);
            setReplyContent('');
            setShowReplyBox(false);
        } catch (error) {
            console.error('Error al responder:', error);
            alert('Error al enviar respuesta');
        } finally {
            setIsReplying(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de eliminar este comentario?')) return;

        try {
            await onDelete(comment.id);
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar comentario');
        }
    };

    return (
        <div className={`border-l-2 ${level === 0 ? 'border-orange-500/30' : 'border-gray-200 dark:border-gray-700'} pl-4 py-3`}>
            {/* Header del comentario */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                        {comment.username[0].toUpperCase()}
                    </div>
                    <div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {comment.username}
            </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
              })}
            </span>
                    </div>
                </div>

                {canDelete && (
                    <button
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Eliminar comentario"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {/* Contenido del comentario */}
            <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                {comment.content}
            </p>

            {/* Acciones */}
            <div className="flex items-center gap-4 text-sm">
                {currentUser && level < maxLevel && (
                    <button
                        onClick={() => setShowReplyBox(!showReplyBox)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        <Reply size={14} />
                        Responder
                    </button>
                )}

                {comment.replies.length > 0 && (
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                    >
                        {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {comment.replies.length} {comment.replies.length === 1 ? 'respuesta' : 'respuestas'}
                    </button>
                )}
            </div>

            {/* Caja de respuesta */}
            {showReplyBox && (
                <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              rows={3}
          />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => setShowReplyBox(false)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleReply}
                            disabled={!replyContent.trim() || isReplying}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={14} />
                            {isReplying ? 'Enviando...' : 'Responder'}
                        </button>
                    </div>
                </div>
            )}

            {/* Respuestas anidadas */}
            {showReplies && comment.replies.length > 0 && (
                <div className="mt-3 space-y-2">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentUser={currentUser}
                            onReply={onReply}
                            onDelete={onDelete}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;

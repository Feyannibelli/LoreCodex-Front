import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
    const maxLevel = 3; // Nesting limit

    const handleReply = async () => {
        if (!replyContent.trim()) return;

        setIsReplying(true);
        try {
            await onReply(comment.id, replyContent);
            setReplyContent('');
            setShowReplyBox(false);
        } catch (error) {
            console.error('Error replying:', error);
            alert('Error sending reply');
        } finally {
            setIsReplying(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            await onDelete(comment.id);
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error deleting comment');
        }
    };

    return (
        <div className={`relative ${level > 0 ? 'pl-6 mt-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-white/5' : ''}`}>
            {/* Comment Header */}
            <div className="flex items-start justify-between mb-3">
                <Link to={`/profile/${comment.userId}`} className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground font-semibold text-sm ring-1 ring-white/10 group-hover:ring-primary/50 transition-all">
                        {comment.username[0].toUpperCase()}
                    </div>
                    <div>
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors block leading-tight">
                            {comment.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </Link>

                {canDelete && (
                    <button
                        onClick={handleDelete}
                        className="text-muted-foreground hover:text-red-400 p-1.5 rounded-md hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete comment"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* Comment Content */}
            <div className={`group ${level === 0 ? '' : ''}`}>
                <p className="text-muted-foreground/90 leading-relaxed mb-3 whitespace-pre-wrap text-sm">
                    {comment.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 text-xs">
                    {currentUser && level < maxLevel && (
                        <button
                            onClick={() => setShowReplyBox(!showReplyBox)}
                            className="flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            <Reply size={12} />
                            Reply
                        </button>
                    )}

                    {comment.replies.length > 0 && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                            {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                    )}
                </div>
            </div>

            {/* Reply Box */}
            {showReplyBox && (
                <div className="mt-4 bg-secondary/20 rounded-xl p-4 border border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full px-3 py-2 bg-background/50 border border-white/5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground text-sm resize-none"
                        rows={2}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={() => setShowReplyBox(false)}
                            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReply}
                            disabled={!replyContent.trim() || isReplying}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            <Send size={12} />
                            {isReplying ? 'Sending...' : 'Reply'}
                        </button>
                    </div>
                </div>
            )}

            {/* Nested Replies */}
            {showReplies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-4">
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

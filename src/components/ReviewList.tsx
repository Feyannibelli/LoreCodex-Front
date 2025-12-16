import React, { useState, useEffect } from 'react';
import { Review } from '../interfaces/Review';
import reviewService from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { Star, ThumbsUp, ThumbsDown, Edit2, Trash2, User } from 'lucide-react';
import Button from './Button';
import { Link } from 'react-router-dom';

interface ReviewListProps {
    gameId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ gameId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingReview, setEditingReview] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const { user, isAuthenticated } = useAuth();

    // New review form state
    const [showNewReviewForm, setShowNewReviewForm] = useState(false);
    const [newReviewContent, setNewReviewContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [gameId]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const data = await reviewService.getGameReviews(gameId);
            setReviews(data);
            setError(null);
        } catch (err) {
            console.error('Error loading reviews:', err);
            setError('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReviewContent.trim()) return;

        setSubmitting(true);
        try {
            await reviewService.createReview(gameId, {
                content: newReviewContent,
                rating: 0
            });
            setNewReviewContent('');
            setShowNewReviewForm(false);
            await loadReviews();
        } catch (err: any) {
            const errorMessage = err.response?.data || err.message || 'Failed to create review';
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (review: Review) => {
        setEditingReview(review.id);
        setEditContent(review.content);
    };

    const handleSaveEdit = async (reviewId: number) => {
        try {
            await reviewService.updateReview(reviewId, {
                content: editContent,
                rating: 0
            });
            setEditingReview(null);
            await loadReviews();
        } catch (err) {
            console.error('Error updating review:', err);
            alert('Failed to update review');
        }
    };

    const handleDelete = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            await reviewService.deleteReview(reviewId);
            await loadReviews();
        } catch (err) {
            console.error('Error deleting review:', err);
            alert('Failed to delete review');
        }
    };

    const handleLike = async (reviewId: number) => {
        try {
            await reviewService.likeReview(reviewId);
            await loadReviews();
        } catch (err) {
            console.error('Error liking review:', err);
        }
    };

    const handleDislike = async (reviewId: number) => {
        try {
            await reviewService.dislikeReview(reviewId);
            await loadReviews();
        } catch (err) {
            console.error('Error disliking review:', err);
        }
    };

    const canModifyReview = (review: Review) => {
        return user && (user.id === review.userId || user.roles?.includes('ROLE_ADMIN'));
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-destructive">
                {error}
            </div>
        );
    }

    const userReview = reviews.find(r => r.userId === user?.id);
    const canWriteReview = isAuthenticated && !userReview;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
                {canWriteReview && !showNewReviewForm && (
                    <Button
                        onClick={() => setShowNewReviewForm(true)}
                        size="sm"
                        variant="outline"
                    >
                        Write a Review
                    </Button>
                )}
            </div>

            {/* New Review Form */}
            {showNewReviewForm && (
                <form onSubmit={handleCreateReview} className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-4">
                    <textarea
                        value={newReviewContent}
                        onChange={(e) => setNewReviewContent(e.target.value)}
                        placeholder="Share your thoughts about this game..."
                        className="w-full bg-background/50 border border-white/10 rounded-lg p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none min-h-[120px]"
                        required
                    />
                    <div className="flex gap-3">
                        <Button type="submit" disabled={submitting || !newReviewContent.trim()}>
                            {submitting ? 'Posting...' : 'Post Review'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowNewReviewForm(false);
                                setNewReviewContent('');
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            className="relative bg-card/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Link
                                        to={`/profile/${review.userId}`}
                                        className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-primary/50 transition-all"
                                    >
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </Link>
                                    <div>
                                        <Link
                                            to={`/profile/${review.userId}`}
                                            className="font-semibold text-foreground hover:text-primary transition-colors"
                                        >
                                            {review.username}
                                        </Link>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {renderStars(review.rating)}
                                            <span>•</span>
                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit/Delete buttons */}
                                {canModifyReview(review) && editingReview !== review.id && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(review)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-primary transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            {editingReview === review.id ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full bg-background/50 border border-white/10 rounded-lg p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none min-h-[120px]"
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleSaveEdit(review.id)}>
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingReview(null);
                                                setEditContent('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-foreground whitespace-pre-wrap mb-4 leading-relaxed">
                                        {review.content}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => handleLike(review.id)}
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                                            disabled={!isAuthenticated}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            <span>{review.likes}</span>
                                        </button>
                                        <button
                                            onClick={() => handleDislike(review.id)}
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-400 transition-colors"
                                            disabled={!isAuthenticated}
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                            <span>{review.dislikes}</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewList;

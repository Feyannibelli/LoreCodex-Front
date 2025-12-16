import React, { useState, useEffect } from 'react';
import { Review } from '../interfaces/Review';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import { useAuth } from '../context/AuthContext';
import reviewService from '../services/reviewService';
import ratingService from '../services/ratingService';
import Button from './Button';
import { AlertCircle } from 'lucide-react';

interface ReviewListProps {
    gameId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ gameId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [userHasRated, setUserHasRated] = useState(false);
    const [checkingRating, setCheckingRating] = useState(false);
    const { isAuthenticated, user } = useAuth();

    // Load reviews on component mount
    useEffect(() => {
        loadReviews();
    }, [gameId]);

    // Check if user has rated the game
    useEffect(() => {
        const checkUserRating = async () => {
            if (!isAuthenticated) {
                setUserHasRated(false);
                return;
            }

            setCheckingRating(true);
            try {
                const summary = await ratingService.getRatingSummary(gameId);
                setUserHasRated(summary.mine > 0);
            } catch (err) {
                console.error('Error checking user rating:', err);
                setUserHasRated(false);
            } finally {
                setCheckingRating(false);
            }
        };

        checkUserRating();
    }, [gameId, isAuthenticated]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const reviewsData = await reviewService.getGameReviews(gameId);
            setReviews(reviewsData);
            setError(null);
        } catch (err) {
            console.error('Error loading reviews:', err);
            setError('Failed to load reviews. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (content: string, rating: number) => {
        if (!isAuthenticated) {
            setError('You must be logged in to leave a review');
            return;
        }

        if (!userHasRated) {
            setError('You must rate this game before writing a review');
            return;
        }

        try {
            const newReview = await reviewService.createReview(gameId, { content, rating });
            setReviews([newReview, ...reviews]);
            setShowForm(false);
        } catch (err: any) {
            console.error('Error submitting review:', err);
            setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
        }
    };

    const handleEditReview = async (reviewId: number, content: string, rating: number) => {
        try {
            const updatedReview = await reviewService.updateReview(reviewId, { content, rating });
            setReviews(reviews.map(review =>
                review.id === reviewId ? updatedReview : review
            ));
        } catch (err) {
            console.error('Error updating review:', err);
            setError('Failed to update review. Please try again.');
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        try {
            await reviewService.deleteReview(reviewId);
            setReviews(reviews.filter(review => review.id !== reviewId));
        } catch (err) {
            console.error('Error deleting review:', err);
            setError('Failed to delete review. Please try again.');
        }
    };

    const hasUserReviewed = reviews.some(review => review.userId === user?.id);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20">
                    {error}
                </div>
            )}

            {isAuthenticated && !hasUserReviewed && !showForm && (
                <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-8 text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Played this game?</h3>
                    <p className="text-muted-foreground mb-4">Share your experience with the community.</p>

                    {checkingRating ? (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            <span className="text-sm">Checking rating...</span>
                        </div>
                    ) : !userHasRated ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 px-4 py-3 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <p className="text-sm font-medium">You must rate this game before writing a review</p>
                            </div>
                            <p className="text-xs text-muted-foreground">Scroll up to rate this game first, then come back to write your review.</p>
                        </div>
                    ) : (
                        <Button onClick={() => setShowForm(true)}>
                            Leave a review
                        </Button>
                    )}
                </div>
            )}

            {showForm && (
                <div className="animate-fade-in-up">
                    <ReviewForm
                        onSubmit={handleSubmitReview}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {reviews.length === 0 && !showForm ? (
                <div className="rounded-xl border border-white/5 bg-card py-12 text-center text-muted-foreground">
                    <p className="mb-2">No reviews yet.</p>
                    {isAuthenticated && !hasUserReviewed && userHasRated && (
                        <p className="text-sm">Be the first to share your thoughts!</p>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            onEdit={handleEditReview}
                            onDelete={handleDeleteReview}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewList;

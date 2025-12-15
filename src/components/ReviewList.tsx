import React, { useState, useEffect } from 'react';
import { Review } from '../interfaces/Review';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import { useAuth } from '../context/AuthContext';
import reviewService from '../services/reviewService';
import Button from './Button';

interface ReviewListProps {
    gameId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ gameId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const { isAuthenticated, user } = useAuth();

    // Load reviews on component mount
    useEffect(() => {
        loadReviews();
    }, [gameId]);

    // Load all reviews for the current game
    const loadReviews = async () => {
        try {
            setLoading(true);
            const [reviewsData] = await Promise.all([reviewService.getGameReviews(gameId)]);
            console.log("Reviews loaded:", reviewsData);
            setReviews(reviewsData);
            setError(null);
        } catch (err) {
            console.error('Error loading reviews:', err);
            setError('Failed to load reviews. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Handle creating a new review
    const handleSubmitReview = async (content: string, rating: number) => {
        if (!isAuthenticated) {
            setError('You must be logged in to leave a review');
            return;
        }

        try {
            const newReview = await reviewService.createReview(gameId, { content, rating });
            setReviews([newReview, ...reviews]);
            setShowForm(false);
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Failed to submit review. Please try again.');
        }
    };

    // Handle editing a review
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

    // Handle deleting a review
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
                    <Button onClick={() => setShowForm(true)}>
                        Leave a review
                    </Button>
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
                    {isAuthenticated && !hasUserReviewed && (
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
                        //onLike={handleLikeReview}
                        //onDislike={handleDislikeReview}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewList;
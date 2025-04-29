import React, { useState, useEffect } from 'react';
import { Review } from '../interfaces/Review';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import { useAuth } from '../context/AuthContext';
import reviewService from '../services/reviewService';
import '../css/ReviewList.css';

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

    // Handle liking a review
    const handleLikeReview = async (reviewId: number) => {
        if (!isAuthenticated) {
            setError('You must be logged in to like reviews');
            return;
        }

        try {
            const review = reviews.find(r => r.id === reviewId);
            if (review?.userHasLiked) {
                // If already liked, remove the like
                const updatedReview = await reviewService.removeReaction(reviewId);
                setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
            } else {
                // Add like
                const updatedReview = await reviewService.likeReview(reviewId);
                setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
            }
        } catch (err) {
            console.error('Error liking review:', err);
            setError('Failed to like review. Please try again.');
        }
    };

    // Handle disliking a review
    const handleDislikeReview = async (reviewId: number) => {
        if (!isAuthenticated) {
            setError('You must be logged in to dislike reviews');
            return;
        }

        try {
            const review = reviews.find(r => r.id === reviewId);
            if (review?.userHasDisliked) {
                // If already disliked, remove the dislike
                const updatedReview = await reviewService.removeReaction(reviewId);
                setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
            } else {
                // Add dislike
                const updatedReview = await reviewService.dislikeReview(reviewId);
                setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
            }
        } catch (err) {
            console.error('Error disliking review:', err);
            setError('Failed to dislike review. Please try again.');
        }
    };

    // Check if the current user has already submitted a review
    const hasUserReviewed = isAuthenticated && reviews.some(review => review.userId === user?.id);

    if (loading) return <div className="loading-reviews">Loading reviews...</div>;

    return (
        <div className="review-list-container">
            {error && <div className="error-message">{error}</div>}

            {isAuthenticated && !hasUserReviewed && !showForm && (
                <div className="review-prompt">
                    <button
                        className="write-review-button"
                        onClick={() => setShowForm(true)}
                    >
                        Leave a review
                    </button>
                </div>
            )}

            {showForm && (
                <ReviewForm
                    onSubmit={handleSubmitReview}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {reviews.length === 0 && !showForm ? (
                <div className="no-reviews">
                    <p>No reviews available for this game.</p>
                    {isAuthenticated && !hasUserReviewed && (
                        <p>Be the first to share your thoughts!</p>
                    )}
                </div>
            ) : (
                <div className="reviews-list">
                    {reviews.map(review => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            onEdit={handleEditReview}
                            onDelete={handleDeleteReview}
                            onLike={handleLikeReview}
                            onDislike={handleDislikeReview}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewList;
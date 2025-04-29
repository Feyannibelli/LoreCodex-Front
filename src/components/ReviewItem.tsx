import React, { useState } from 'react';
import { Review } from '../interfaces/Review';
import { useAuth } from '../context/AuthContext';
import ReviewForm from './ReviewForm';
import Modal from './Modal';
import '../css/ReviewItem.css';

interface ReviewItemProps {
    review: Review;
    onEdit: (reviewId: number, content: string, rating: number) => void;
    onDelete: (reviewId: number) => void;
    onLike: (reviewId: number) => void;
    onDislike: (reviewId: number) => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
                                                   review,
                                                   onEdit,
                                                   onDelete,
                                                   onLike,
                                                   onDislike
                                               }) => {
    const { user, isAuthenticated, isAdmin } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isOwner = user?.id === review.userId;
    const canEdit = isAuthenticated && isOwner;
    const canDelete = isAuthenticated && (isOwner || isAdmin);

    const formattedDate = new Date(review.createdAt).toLocaleDateString();

    const handleEditSubmit = (content: string, rating: number) => {
        onEdit(review.id, content, rating);
        setIsEditing(false);
    };

    const handleLike = () => {
        onLike(review.id);
    };

    const handleDislike = () => {
        onDislike(review.id);
    };

    const confirmDelete = () => {
        onDelete(review.id);
        setShowDeleteModal(false);
    };

    if (isEditing) {
        return (
            <div className="review-item">
                <ReviewForm
                    initialContent={review.content}
                    initialRating={review.rating}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setIsEditing(false)}
                    isEditing={true}
                />
            </div>
        );
    }

    return (
        <div className="review-item">
            <div className="review-header">
                <div className="user-info">
                    <div className="user-circle">{review.username.charAt(0).toUpperCase()}</div>
                    <span className="username">{review.username}</span>
                </div>
                <div className="review-rating">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <span key={index} className={index < review.rating ? "star filled" : "star"}>
                            ★
                        </span>
                    ))}
                </div>
            </div>

            <div className="review-content">
                {review.content}
            </div>

            <div className="review-footer">
                <div className="review-date">
                    {formattedDate}
                </div>

                <div className="review-actions">
                    {isAuthenticated && (
                        <div className="reaction-buttons">
                            <button
                                className={`like-button ${review.userHasLiked ? 'active' : ''}`}
                                onClick={handleLike}
                                title="Like"
                            >
                                <span className="like-icon">👍</span>
                                <span className="count">{review.likes}</span>
                            </button>

                            <button
                                className={`dislike-button ${review.userHasDisliked ? 'active' : ''}`}
                                onClick={handleDislike}
                                title="Dislike"
                            >
                                <span className="dislike-icon">👎</span>
                                <span className="count">{review.dislikes}</span>
                            </button>
                        </div>
                    )}

                    {!isAuthenticated && (
                        <div className="reaction-counts">
                            <span className="likes-count">👍 {review.likes}</span>
                            <span className="dislikes-count">👎 {review.dislikes}</span>
                        </div>
                    )}

                    {canEdit && (
                        <button
                            className="edit-button"
                            onClick={() => setIsEditing(true)}
                            title="Edit review"
                        >
                            ✏️
                        </button>
                    )}

                    {canDelete && (
                        <button
                            className="delete-button"
                            onClick={() => setShowDeleteModal(true)}
                            title="Delete review"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
            />
        </div>
    );
};

export default ReviewItem;
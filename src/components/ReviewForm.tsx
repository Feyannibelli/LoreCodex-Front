import React, { useState } from 'react';
import Button from './Button';
import '../css/ReviewForm.css';

interface ReviewFormProps {
    initialRating?: number;
    initialContent?: string;
    onSubmit: (content: string, rating: number) => void;
    onCancel?: () => void;
    isEditing?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
                                                   initialRating = 0,
                                                   initialContent = '',
                                                   onSubmit,
                                                   onCancel,
                                                   isEditing = false
                                               }) => {
    const [content, setContent] = useState(initialContent);
    const [rating, setRating] = useState(initialRating);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate content
        if (!content.trim()) {
            setError('Please write a review before submitting');
            return;
        }

        // Validate rating
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        onSubmit(content, rating);
    };

    return (
        <div className="review-form-container">
            <form onSubmit={handleSubmit} className="review-form">
                <h3>{isEditing ? 'Edit your review' : 'Write a review'}</h3>

                <div className="rating-select">
                    <div className="star-rating-select">
                        {[1, 2, 3, 4, 5].map(star => (
                            <span
                                key={star}
                                className={star <= rating ? "star filled" : "star"}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>

                <div className="review-textarea">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts about this game..."
                        rows={5}
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    {onCancel && (
                        <Button onClick={onCancel} className="cancel-button">
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" className="submit-button">
                        {isEditing ? 'Update Review' : 'Submit Review'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
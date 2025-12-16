import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Review } from '../interfaces/Review';
import { useAuth } from '../context/AuthContext';
import ReviewForm from './ReviewForm';
import Modal from './Modal';
import { Star, Pencil, Trash2 } from 'lucide-react';
import Button from './Button';

interface ReviewItemProps {
    review: Review;
    onEdit: (reviewId: number, content: string) => void;
    onDelete: (reviewId: number) => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
                                                   review,
                                                   onEdit,
                                                   onDelete
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

    const confirmDelete = () => {
        onDelete(review.id);
        setShowDeleteModal(false);
    };

    if (isEditing) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <ReviewForm
                    initialContent={review.content}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setIsEditing(false)}
                    isEditing={true}
                />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold ring-1 ring-white/10">
                        {review.username.charAt(0).toUpperCase()}
                    </div>
                    {/* SOLUCIÓN: Link al perfil del usuario */}
                    <Link
                        to={`/profile/${review.userId}`}
                        className="font-medium text-foreground hover:text-primary transition-colors hover:underline"
                    >
                        {review.username}
                    </Link>
                </div>
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                            key={index}
                            className={`h-4 w-4 ${
                                index < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                            }`}
                        />
                    ))}
                </div>
            </div>

            <div className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-wrap">
                {review.content}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="text-xs text-muted-foreground font-medium">
                    {formattedDate}
                </div>

                <div className="flex items-center gap-2">
                    {isAuthenticated && (
                        <>
                            {canEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                    title="Edit review"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}

                            {canDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                    title="Delete review"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </>
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

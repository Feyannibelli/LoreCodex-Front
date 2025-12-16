import React, { useState } from 'react';
import Button from './Button';
import { cn } from '../lib/utils';

interface ReviewFormProps {
    initialContent?: string;
    onSubmit: (content: string) => void;
    onCancel?: () => void;
    isEditing?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
                                                   initialContent = '',
                                                   onSubmit,
                                                   onCancel,
                                                   isEditing = false
                                               }) => {
    const [content, setContent] = useState(initialContent);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate content
        if (!content.trim()) {
            setError('Please write a review before submitting');
            return;
        }

        onSubmit(content);
    };

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                    {isEditing ? 'Edit your review' : 'Write a review'}
                </h3>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Review</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts about this game..."
                        rows={5}
                        className={cn(
                            "w-full rounded-lg border border-input bg-secondary/50 p-4 text-foreground placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                            "resize-y min-h-[120px] transition-all duration-200"
                        )}
                    />
                </div>

                {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                    {onCancel && (
                        <Button
                            variant="ghost"
                            onClick={onCancel}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button type="submit">
                        {isEditing ? 'Update Review' : 'Submit Review'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;

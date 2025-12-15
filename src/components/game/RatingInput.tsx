import React, { useState } from 'react';
import { Star } from 'lucide-react';
import Button from '../Button';

interface RatingInputProps {
    value: number; // Current rating 0-5
    onChange: (rating: number) => void;
    onSave?: () => void;
    saving?: boolean;
    autoSave?: boolean;
    className?: string;
}

const RatingInput: React.FC<RatingInputProps> = ({
    value,
    onChange,
    onSave,
    saving = false,
    autoSave = false,
    className = ''
}) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [hasChanged, setHasChanged] = useState(false);

    const displayRating = hoverRating !== null ? hoverRating : value;

    const handleStarClick = (rating: number) => {
        onChange(rating);
        setHasChanged(true);

        if (autoSave && onSave) {
            onSave();
            setHasChanged(false);
        }
    };

    const handleSave = () => {
        if (onSave) {
            onSave();
            setHasChanged(false);
        }
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            {/* Label */}
            <span className="text-sm text-muted-foreground">Your rating</span>

            <div className="flex items-center gap-3">
                {/* Interactive stars */}
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => handleStarClick(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded transition-all"
                            aria-label={`Rate ${star} out of 5 stars`}
                            disabled={saving}
                        >
                            <Star
                                className={`h-6 w-6 transition-all ${star <= displayRating
                                        ? 'text-primary fill-primary'
                                        : 'text-muted-foreground/30 group-hover:text-muted-foreground/50'
                                    } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            />
                        </button>
                    ))}
                </div>

                {/* Save button (only if not auto-save and has changed) */}
                {!autoSave && hasChanged && onSave && (
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                        variant="outline"
                        className="ml-2"
                    >
                        {saving ? 'Saving...' : 'Update'}
                    </Button>
                )}
            </div>

            {/* Current rating text */}
            {value > 0 && (
                <span className="text-xs text-muted-foreground">
                    {value === displayRating
                        ? `Your rating: ${value}/5`
                        : `Preview: ${displayRating}/5`
                    }
                </span>
            )}
        </div>
    );
};

export default RatingInput;

import React, { useState, useRef, useEffect } from 'react';
import { Star, X } from 'lucide-react';

interface RatingPopoverProps {
    currentRating: number; // 0 if no rating
    onSave: (rating: number) => Promise<void>;
    onClear?: () => Promise<void>;
    disabled?: boolean;
}

const RatingPopover: React.FC<RatingPopoverProps> = ({
    currentRating,
    onSave,
    onClear,
    disabled = false
}) => {
    const [open, setOpen] = useState(false);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [selectedRating, setSelectedRating] = useState(currentRating);
    const [saving, setSaving] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const displayRating = hoverRating !== null ? hoverRating : selectedRating;
    const hasRating = currentRating > 0;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    // Update selected rating when currentRating changes
    useEffect(() => {
        setSelectedRating(currentRating);
    }, [currentRating]);

    const handleStarClick = async (rating: number) => {
        setSelectedRating(rating);
        setSaving(true);

        try {
            await onSave(rating);
            setOpen(false);
        } catch (error) {
            console.error('Error saving rating:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleClear = async () => {
        if (!onClear) return;

        setSaving(true);
        try {
            await onClear();
            setSelectedRating(0);
            setOpen(false);
        } catch (error) {
            console.error('Error clearing rating:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative inline-block">
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                onClick={() => setOpen(!open)}
                disabled={disabled}
                className="text-base text-muted-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-2"
            >
                {hasRating ? (
                    <>
                        <span>Edit your rating</span>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= currentRating
                                            ? 'text-primary fill-primary'
                                            : 'text-muted-foreground/30'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <span>Rate this game</span>
                )}
            </button>

            {/* Popover Content */}
            {open && (
                <div
                    ref={popoverRef}
                    className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl p-6 shadow-2xl z-[100]"
                    style={{ position: 'absolute' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-foreground">Your rating</h3>
                        <button
                            onClick={() => setOpen(false)}
                            className="rounded-lg p-1 hover:bg-white/5 transition-colors"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Stars */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleStarClick(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    disabled={saving}
                                    className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={`Rate ${star} out of 5 stars`}
                                >
                                    <Star
                                        className={`h-8 w-8 transition-all ${star <= displayRating
                                                ? 'text-primary fill-primary scale-110'
                                                : 'text-muted-foreground/30 group-hover:text-muted-foreground/50'
                                            } ${saving ? 'opacity-50' : ''}`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Rating value display */}
                        {displayRating > 0 && (
                            <p className="text-center text-xs text-muted-foreground">
                                {displayRating}/5
                            </p>
                        )}

                        {/* Clear button */}
                        {hasRating && onClear && (
                            <>
                                <div className="h-px bg-white/10" />
                                <button
                                    onClick={handleClear}
                                    disabled={saving}
                                    className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Clear rating
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RatingPopover;

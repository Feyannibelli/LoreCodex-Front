import React from 'react';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
    rating: number; // 0-5
    count?: number; // Number of ratings
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
    className?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
    rating,
    count,
    size = 'md',
    showCount = true,
    className = ''
}) => {
    // Clamp rating between 0 and 5
    const clampedRating = Math.max(0, Math.min(5, rating));

    // Size configurations
    const sizeConfig = {
        sm: {
            number: 'text-2xl',
            stars: 'h-3 w-3',
            count: 'text-xs'
        },
        md: {
            number: 'text-3xl',
            stars: 'h-4 w-4',
            count: 'text-sm'
        },
        lg: {
            number: 'text-4xl',
            stars: 'h-5 w-5',
            count: 'text-base'
        }
    };

    const config = sizeConfig[size];

    // Generate stars with proportional fill
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const fillPercentage = Math.max(0, Math.min(1, clampedRating - (i - 1)));

            stars.push(
                <div key={i} className="relative">
                    {/* Empty star */}
                    <Star className={`${config.stars} text-muted-foreground/30`} />
                    {/* Filled star with gradient mask */}
                    {fillPercentage > 0 && (
                        <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ width: `${fillPercentage * 100}%` }}
                        >
                            <Star className={`${config.stars} text-primary fill-primary`} />
                        </div>
                    )}
                </div>
            );
        }
        return stars;
    };

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <div className="flex items-center gap-2">
                {/* Rating number */}
                <span className={`${config.number} font-bold text-primary`}>
                    {clampedRating.toFixed(1)}
                </span>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                    {renderStars()}
                </div>
            </div>

            {/* Rating count */}
            {showCount && count !== undefined && count > 0 && (
                <span className={`${config.count} text-muted-foreground`}>
                    ({count} {count === 1 ? 'rating' : 'ratings'})
                </span>
            )}
        </div>
    );
};

export default RatingDisplay;

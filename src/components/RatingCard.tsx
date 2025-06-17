// src/components/RatingCard.tsx
import React, { useEffect, useState } from 'react';
import ratingService, {RatingSummaryDto} from "../services/ratingService.ts";

interface RatingCardProps {
    gameId: number;
    imageUrl: string;
    isAuthenticated: boolean;
}

const RatingCard: React.FC<RatingCardProps> = ({ gameId, imageUrl, isAuthenticated }) => {
    const [summary, setSummary] = useState<RatingSummaryDto | null>(null);
    const [score, setScore] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    // Cargo promedio y “mi” rating
    useEffect(() => {
        ratingService.getRatingSummary(gameId)
            .then(data => {
                setSummary(data);
                if (data.mine !== null) setScore(data.mine);
            })
            .catch(console.error);
    }, [gameId]);

    // Envío mi rating
    const handleSubmit = async () => {
        if (!isAuthenticated || score === 0) return;
        setLoading(true);
        try {
            await ratingService.setRating(gameId, score);
            const updated = await ratingService.getRatingSummary(gameId);
            setSummary(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs mx-auto space-y-4">
            {/* --- Average Rating --- */}
            {summary && (
                <div className="flex items-center space-x-2">
                    {[1,2,3,4,5].map(i => (
                        <svg
                            key={i}
                            className={`w-6 h-6 ${i <= Math.round(summary.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor" viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 ..."/>
                        </svg>
                    ))}
                    <span className="text-gray-700 font-medium">
            {summary.average.toFixed(1)} / 5
          </span>
                </div>
            )}

            {/* --- Imagen vertical --- */}
            <div className="flex justify-center">
                <img
                    src={imageUrl}
                    alt="Game cover"
                    className="h-64 w-auto rounded-md object-cover"
                />
            </div>

            {/* --- User Rating --- */}
            {isAuthenticated && (
                <div>
                    <h3 className="text-sm font-medium mb-2">Your score</h3>
                    <div className="flex space-x-1 mb-3">
                        {[1,2,3,4,5].map(i => (
                            <button
                                key={i}
                                onClick={() => setScore(i)}
                                disabled={loading}
                            >
                                <svg
                                    className={`w-6 h-6 ${i <= score ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor" viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 ..."/>
                                </svg>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || score === 0}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        Rate Game
                    </button>
                </div>
            )}
        </div>
    );
};

export default RatingCard;

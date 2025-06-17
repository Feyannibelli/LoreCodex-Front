// src/components/GameRating.tsx
import React, { useEffect, useState } from 'react';

import AverageRatingDisplay from './AverageRatingDisplay';
import ratingService, {RatingSummaryDto} from "../services/ratingService.ts";

interface Props {
    gameId: number;
    isAuthenticated: boolean;
}

const GameRating: React.FC<Props> = ({ gameId }) => {
    const [summary, setSummary] = useState<RatingSummaryDto | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        ratingService.getRatingSummary(gameId)
            .then(setSummary)
            .catch(() => setError('No se pudo cargar el rating'));
    }, [gameId]);

    if (error) return <div>Error: {error}</div>;
    if (!summary) return <div>Cargando rating…</div>;

    return (
        <div className="bg-white p-0 space-y-4">
            {/* Promedio */}
            <div className="flex items-center">
                <AverageRatingDisplay rating={summary.average} size={24} />
                <span className="ml-2 text-xl font-bold text-gray-800">

        </span>
            </div>
        </div>
    );
};

export default GameRating;

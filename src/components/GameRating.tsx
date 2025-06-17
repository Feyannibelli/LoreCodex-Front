// src/components/GameRating.tsx
import React, { useEffect, useState } from 'react';

import AverageRatingDisplay from './AverageRatingDisplay';
import UserRatingDisplay from './UserRatingDisplay';
import ratingService, {RatingSummaryDto} from "../services/ratingService.ts";

interface Props {
    gameId: number;
    isAuthenticated: boolean;
}

const GameRating: React.FC<Props> = ({ gameId, isAuthenticated }) => {
    const [summary, setSummary] = useState<RatingSummaryDto | null>(null);
    const [newRating, setNewRating] = useState<number>(0);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        ratingService.getRatingSummary(gameId)
            .then(setSummary)
            .catch(() => setError('No se pudo cargar el rating'));
    }, [gameId]);

    const handleRate = async () => {
        if (!isAuthenticated) {
            setError('Debes iniciar sesión');
            return;
        }
        try {
            await ratingService.setRating(gameId, newRating);
            const updated = await ratingService.getRatingSummary(gameId);
            setSummary(updated);
            setSuccess(true);
            setError(null);
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            setError('Error al enviar tu puntuación');
        }
    };

    if (!summary) return <div>Cargando rating…</div>;

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
            {/* Promedio */}
            <div className="flex items-center">
                <AverageRatingDisplay rating={summary.average} size={24} />
                <span className="ml-2 text-xl font-semibold text-gray-800">
          {summary.average.toFixed(1)}/5
        </span>
            </div>

            {/* Tu rating (si ya votaste) */}
            {summary.mine !== null && (
                <div className="flex items-center">
                    <UserRatingDisplay rating={summary.mine} size={20} />
                    <span className="ml-2 text-sm text-gray-600">
            Tu rating: {summary.mine}/5
          </span>
                </div>
            )}

            {/* Selección de estrellas y botón */}
            {isAuthenticated && (
                <div className="space-y-2">
                    <div className="flex items-center">
                        {[1,2,3,4,5].map(n => (
                            <span
                                key={n}
                                className={`cursor-pointer text-2xl ${n <= newRating ? 'text-yellow-500' : 'text-gray-300'}`}
                                onClick={() => setNewRating(n)}
                            >★</span>
                        ))}
                    </div>
                    <button
                        onClick={handleRate}
                        disabled={newRating === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        {success ? '¡Listo!' : 'Enviar Rating'}
                    </button>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default GameRating;

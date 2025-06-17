// src/pages/Game.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Game as GameType } from "../../interfaces/Game";
import gameService from "../../services/gameService";
import { useAuth } from "../../context/AuthContext";
import ReviewList from "../../components/ReviewList";
import GameNotesSection from "../../components/GameNotesSection";
import GameRating from "../../components/GameRating";
import RatingCard from "../../components/RatingCard.tsx";

const Game2: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [game, setGame] = useState<GameType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("reviews");
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        gameService.getGameById(+id)
            .then(setGame)
            .catch(() => setError("Error loading game"))
            .finally(() => setLoading(false));
    }, [id]);

    if (authLoading || loading) {
        return <div className="p-8 text-center">Loading game...</div>;
    }
    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }
    if (!game) {
        return <div className="p-8 text-center">Game not found</div>;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
            {id && (
                <RatingCard
                    gameId={+id}
                    imageUrl={game.imageUrl || '/placeholder.png'}
                    isAuthenticated={isAuthenticated}
                />
            )}

            {/* --- Info dentro de un card --- */}
            <div className="md:col-span-2 bg-white shadow-lg rounded-lg p-6 flex flex-col space-y-6">
                {/* Título */}
                <h1 className="text-3xl font-bold text-gray-900">{game.name}</h1>

                {/* Rating */}
                {isAuthenticated && id && (
                    <GameRating
                        gameId={+id}
                        isAuthenticated={isAuthenticated}
                    />
                )}

                {/* --- Info del juego --- */}
                <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                    <h1 className="text-3xl font-bold">{game.name}</h1>

                    {/* Descripción */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-800 mb-2">Description</h2>
                        <p className="text-gray-700 leading-relaxed">{game.description}</p>
                    </div>

                    {/* Meta (género / release date / premios) */}
                    <div className="flex flex-wrap gap-x-6 text-sm text-gray-600">
            <span>
              <strong className="text-gray-800">Genre:</strong> {game.genre}
            </span>
                        <span>
              <strong className="text-gray-800">Release date:</strong>{" "}
                            {new Date(game.releaseDate).toLocaleDateString()}
            </span>
                        {game.awards && (
                            <span>
                <strong className="text-gray-800">Awards:</strong> {game.awards}
              </span>
                        )}
                    </div>
                </div>
            </div>

            {/* TABS */
            }
            <div className="border-b">
                <nav className="-mb-px flex space-x-4">
                {["reviews","guides","news","challenges","more","notes"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 px-4 text-sm font-medium ${
                                activeTab === tab
                                    ? "border-b-2 border-blue-600 text-blue-600"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-6">
                {activeTab === "reviews" && id && (
                    <ReviewList gameId={+id} />
                )}
                {activeTab === "notes" && id && (
                    <GameNotesSection gameId={+id} />
                )}
                {["guides","news","challenges","more"].includes(activeTab) && (
                    <p className="text-gray-600">
                        No {activeTab} available for this game.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Game2;

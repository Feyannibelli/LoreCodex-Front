import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Game as GameType } from "../../interfaces/Game.ts";
import gameService from "../../services/gameService.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import ReviewList from "../../components/ReviewList.tsx";
import "../../css/Game.css";
import GameNotesSection from "../../components/GameNotesSection.tsx";
import GameRating from "../../components/GameRating.tsx";
import UserRatingDisplay from "../../components/UserRatingDisplay.tsx";
import ratingService, {RatingSummaryDto} from "../../services/ratingService.ts";

const Game: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [game, setGame] = useState<GameType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("reviews");
    const [summary, setSummary] = useState<RatingSummaryDto | null>(null);

    //const [userRating, setUserRating] = useState<number>(0);

    // Use the auth context instead of direct auth service calls
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        if (id) loadGame();
    }, [id]);

    useEffect(() => {
        const fetchSummary = async () => {
            if (id) {
                try {
                    const res = await ratingService.getRatingSummary(parseInt(id));
                    setSummary(res);
                } catch (err) {
                    console.error("Error fetching rating summary:", err);
                }
            }
        };
        fetchSummary();
    }, [id]);


    const loadGame = async () => {
        try {
            setLoading(true);
            if (id) {
                const gameData = await gameService.getGameById(parseInt(id));
                //const avgRating = await gameService.getAverageRating(parseInt(id));
                setGame(gameData);
                //setAverageRating(avgRating);
                setError(null);
            }
        } catch (err) {
            console.error("Error loading game:", err);
            setError("Error loading game. Please try again later.");
        } finally {
            setLoading(false);
        }
    };


    /*
    const handleLike = async () => {
        if (!isAuthenticated) {
            setError("You must be logged in to like");
            return;
        }

        try {
            if (id) {
                const updatedGame = await gameService.likeGame(parseInt(id));
                setGame(updatedGame);
                setLikeSuccess(true);
                setTimeout(() => setLikeSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Error liking game:", err);
            setError("Error liking the game. Please try again later.");
        }
    };

    const handleRatingChange = (value: number) => {
        setUserRating(value);
    };

    const fetchAverageRating = async () => {
        if (id) {
            try {
                const rating = await gameService.getAverageRating(parseInt(id));
                setAverageRating(rating);
            } catch (err) {
                console.error("Error fetching average rating:", err);
            }
        }
    };

    const submitRating = async () => {
        if (!isAuthenticated) {
            setError("You must be logged in to rate");
            return;
        }

        try {
            if (id && userRating > 0) {
                const updatedGame = await gameService.rateGame(parseInt(id), userRating);
                setGame(updatedGame);
                await fetchAverageRating(); //actualizar el promedio
                setRatingSuccess(true);
                setTimeout(() => setRatingSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Error rating game:", err);
            setError("Error rating the game. Please try again later.");
        }
    };
    */


    // Show loading indicator while checking auth and loading game
    if (authLoading || loading) return <div className="loading-container">Loading game...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!game) return <div className="not-found">Game not found</div>;

    return (
        <div className="game-detail-container">
            <div className="game-detail-header">
                <div className="game-detail-image">
                    {game.imageUrl ? (
                        <img src={game.imageUrl} alt={game.name}/>
                    ) : (
                        <div className="no-image">No image</div>
                    )}
                </div>
                <div className="game-detail-info">
                    <h1 className="game-detail-name">{game.name}</h1>

                    {/* Componente reutilizable de rating */}
                        <GameRating
                            gameId={id ? parseInt(id, 10) : 0}
                            isAuthenticated={isAuthenticated}
                        />

                    <div className="game-detail-description">
                        <h2>Description</h2>
                        <p>{game.description}</p>
                    </div>

                    <div className="game-detail-meta">
                        <div className="meta-item">
                            <strong>Genre:</strong> {game.genre}
                        </div>
                        <div className="meta-item">
                            <strong>Release date:</strong> {new Date(game.releaseDate).toLocaleDateString()}
                        </div>
                        {game.awards && (
                            <div className="meta-item">
                                <strong>Awards:</strong> {game.awards}
                            </div>
                        )}
                    </div>
                </div>

            </div>
            <div className="user-rating-frame">
                <UserRatingDisplay
                    gameId={parseInt(id!)}
                    isAuthenticated={isAuthenticated}
                    initialRating={summary?.mine ?? null}
                    onRated={async (newRating) => {
                        // Actualiza el summary manteniendo el rating del usuario
                        try {
                            if (id) {
                                const res = await ratingService.getRatingSummary(parseInt(id));
                                setSummary({
                                    ...res,
                                    mine: newRating // Asegura que siempre mantenga el rating que acaba de dar
                                });
                                await loadGame();
                            }
                        } catch (err) {
                            console.error("Error updating rating summary:", err);
                            // En caso de error, al menos mantiene el rating localmente
                            setSummary(prev => prev ? { ...prev, mine: newRating } : { average: 0, mine: newRating });
                        }
                    }}
                />
            </div>

            <div className="game-detail-tabs">
                <div className="tab-buttons">
                    <button
                        className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
                        onClick={() => setActiveTab("reviews")}
                    >
                        Reviews
                    </button>
                    <button
                        className={`tab-button ${activeTab === "guides" ? "active" : ""}`}
                        onClick={() => setActiveTab("guides")}
                    >
                        Guides
                    </button>
                    <button
                        className={`tab-button ${activeTab === "news" ? "active" : ""}`}
                        onClick={() => setActiveTab("news")}
                    >
                        News
                    </button>
                    <button
                        className={`tab-button ${activeTab === "challenges" ? "active" : ""}`}
                        onClick={() => setActiveTab("challenges")}
                    >
                        Challenges
                    </button>
                    <button
                        className={`tab-button ${activeTab === "more" ? "active" : ""}`}
                        onClick={() => setActiveTab("more")}
                    >
                        More Info
                    </button>
                    <button
                        className={`tab-button ${activeTab === "notes" ? "active" : ""}`}
                        onClick={() => setActiveTab("notes")}
                    >
                        Notes
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === "reviews" && (
                        <div className="reviews-tab-content">
                            {id && <ReviewList gameId={parseInt(id)}/>}
                        </div>
                    )}

                    {activeTab === "notes" && id && (
                        <GameNotesSection gameId={parseInt(id)}/>
                    )}

                    {activeTab === "guides" && (
                        <div>
                            <p>No guides available for this game.</p>
                            {isAuthenticated && (
                                <button className="add-content-button">Create a guide</button>
                            )}
                        </div>
                    )}

                    {activeTab === "news" && (
                        <div>
                            <p>No news available for this game.</p>
                        </div>
                    )}

                    {activeTab === "challenges" && (
                        <div>
                            <p>No challenges available for this game.</p>
                        </div>
                    )}

                    {activeTab === "more" && (
                        <div>
                            <p>No additional information available for this game.</p>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
};

export default Game;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Game as GameType } from "../../interfaces/Game.ts";
import gameService from "../../services/gameService.ts";
import { useAuth } from "../../context/AuthContext.tsx"; // Import useAuth hook instead of authService
import ReviewList from "../../components/ReviewList.tsx";
import "../../css/Game.css";
import AverageRatingDisplay from "@/components/AverageRatingDisplay.tsx";
import ratingService from "@/services/ratingService.ts";
import UserRatingDisplay from "@/components/UserRatingDisplay.tsx";

const Game: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [game, setGame] = useState<GameType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("reviews");
    const [userRating, setUserRating] = useState<number>(0);
    const [likeSuccess, setLikeSuccess] = useState<boolean>(false);
    const [ratingSuccess, setRatingSuccess] = useState<boolean>(false);
    const [averageRating, setAverageRating] = useState<number | null>(null);


    // Use the auth context instead of direct auth service calls
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        if (id) loadGame();
    }, [id]);

    useEffect(() => {
        const fetchRatings = async () => {
            if (id) {
                fetchAverageRating(); // ya existente

                if (isAuthenticated) {
                    try {
                        const response = await ratingService.getMyRating(parseInt(id));
                        if (response.data) {
                            setUserRating(response.data.rating);
                        }
                    } catch (err) {
                        console.error("Error fetching user rating:", err);
                    }
                }
            }
        };

        fetchRatings();
    }, [id, isAuthenticated]);


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


    // Show loading indicator while checking auth and loading game
    if (authLoading || loading) return <div className="loading-container">Loading game...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!game) return <div className="not-found">Game not found</div>;

    return (
        <div className="game-detail-container">
            <div className="game-detail-header">
                <div className="game-detail-image">
                    {game.imageUrl ? (
                        <img src={game.imageUrl} alt={game.name} />
                    ) : (
                        <div className="no-image">No image</div>
                    )}
                </div>
                <div className="game-detail-info">
                    <h1 className="game-detail-name">{game.name}</h1>

                    <div className="game-detail-rating">
                        <div className="star-rating">
                            <AverageRatingDisplay rating={averageRating} />
                        </div>
                        <span>{averageRating !== null ? `${averageRating}/5` : "No rating"}</span>
                    </div>

                    <div className="game-detail-likes">
                        <button
                            className="like-button"
                            onClick={handleLike}
                            disabled={!isAuthenticated}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                            </svg>
                            <span>{game.likes || 0} likes</span>
                        </button>
                        {likeSuccess && <span className="success-message">Thanks for your like!</span>}
                    </div>

                    {isAuthenticated && (
                        <div className="user-rating">
                            {userRating > 0 && (
                                <p style={{ marginBottom: "4px" }}>Your rating: {userRating} / 5</p>
                            )}
                            {isAuthenticated && userRating > 0 && (
                                <UserRatingDisplay rating={userRating} />
                            )}
                            <h3>Rate this game:</h3>
                            <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        className={star <= userRating ? "rating-star active" : "rating-star"}
                                        onClick={() => handleRatingChange(star)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <button
                                className="submit-rating"
                                onClick={submitRating}
                                disabled={userRating === 0}
                            >
                                Submit rating
                            </button>
                            {ratingSuccess && <span className="success-message">Rating submitted!</span>}
                        </div>
                    )}

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

            <div className="game-detail-description">
                <h2>Description</h2>
                <p>{game.description}</p>
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
                </div>

                <div className="tab-content">
                    {activeTab === "reviews" && (
                        <div className="reviews-tab-content">
                            {id && <ReviewList gameId={parseInt(id)} />}
                        </div>
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
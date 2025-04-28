import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Game as GameType } from "../interfaces/Game";
import gameService from "../services/gameService";
import authService from "../services/authService";
import "../css/Game.css";

const Game: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [game, setGame] = useState<GameType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("reviews");
    const [userRating, setUserRating] = useState<number>(0);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [likeSuccess, setLikeSuccess] = useState<boolean>(false);
    const [ratingSuccess, setRatingSuccess] = useState<boolean>(false);

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
        loadGame();
    }, [id]);

    const loadGame = async () => {
        try {
            setLoading(true);
            if (id) {
                const gameData = await gameService.getGameById(parseInt(id));
                setGame(gameData);
                setError(null);
            }
        } catch (err) {
            console.error("Error loading game:", err);
            setError("Error al cargar el juego. Inténtalo de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            setError("Debes iniciar sesión para dar like");
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
            setError("Error al dar like al juego. Inténtalo de nuevo más tarde.");
        }
    };

    const handleRatingChange = (value: number) => {
        setUserRating(value);
    };

    const submitRating = async () => {
        if (!isAuthenticated) {
            setError("Debes iniciar sesión para calificar");
            return;
        }

        try {
            if (id && userRating > 0) {
                const updatedGame = await gameService.rateGame(parseInt(id), userRating);
                setGame(updatedGame);
                setRatingSuccess(true);
                setTimeout(() => setRatingSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Error rating game:", err);
            setError("Error al calificar el juego. Inténtalo de nuevo más tarde.");
        }
    };

    if (loading) return <div className="loading-container">Cargando juego...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!game) return <div className="not-found">Juego no encontrado</div>;

    return (
        <div className="game-detail-container">
            <div className="game-detail-header">
                <div className="game-detail-image">
                    {game.imageUrl ? (
                        <img src={game.imageUrl} alt={game.name} />
                    ) : (
                        <div className="no-image">Sin imagen</div>
                    )}
                </div>
                <div className="game-detail-info">
                    <h1 className="game-detail-name">{game.name}</h1>

                    <div className="game-detail-rating">
                        <div className="star-rating">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <span key={index} className={index < (game.rating || 0) ? "star filled" : "star"}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <span>{game.rating ? `${game.rating}/5` : "Sin calificación"}</span>
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
                        {likeSuccess && <span className="success-message">¡Gracias por tu like!</span>}
                    </div>

                    {isAuthenticated && (
                        <div className="user-rating">
                            <h3>Califica este juego:</h3>
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
                                Enviar calificación
                            </button>
                            {ratingSuccess && <span className="success-message">¡Calificación enviada!</span>}
                        </div>
                    )}

                    <div className="game-detail-meta">
                        <div className="meta-item">
                            <strong>Género:</strong> {game.genre}
                        </div>
                        <div className="meta-item">
                            <strong>Fecha de lanzamiento:</strong> {new Date(game.releaseDate).toLocaleDateString()}
                        </div>
                        {game.awards && (
                            <div className="meta-item">
                                <strong>Premios:</strong> {game.awards}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="game-detail-description">
                <h2>Descripción</h2>
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
                        <div>
                            <p>No hay reviews disponibles para este juego.</p>
                            {isAuthenticated && (
                                <button className="add-content-button">Escribir una review</button>
                            )}
                        </div>
                    )}

                    {activeTab === "guides" && (
                        <div>
                            <p>No hay guías disponibles para este juego.</p>
                            {isAuthenticated && (
                                <button className="add-content-button">Crear una guía</button>
                            )}
                        </div>
                    )}

                    {activeTab === "news" && (
                        <div>
                            <p>No hay noticias disponibles para este juego.</p>
                        </div>
                    )}

                    {activeTab === "challenges" && (
                        <div>
                            <p>No hay desafíos disponibles para este juego.</p>
                        </div>
                    )}

                    {activeTab === "more" && (
                        <div>
                            <p>No hay información adicional disponible para este juego.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Game;
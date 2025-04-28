// src/pages/Game.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import gameService, { Game as GameType } from '../services/gameService';
import '../css/Game.css';

const Game: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [game, setGame] = useState<GameType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userRating, setUserRating] = useState<number>(0);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const { isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGame = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const data = await gameService.getGameById(parseInt(id));
                setGame(data);
                setError(null);
            } catch (err) {
                console.error(`Error fetching game with id ${id}:`, err);
                setError('Error al cargar el juego');
            } finally {
                setLoading(false);
            }
        };

        fetchGame();
    }, [id]);

    const handleLike = async () => {
        if (!isAuthenticated || !game) return;

        try {
            const updatedGame = await gameService.likeGame(game.id);
            setGame(updatedGame);
        } catch (err) {
            console.error('Error liking game:', err);
        }
    };

    const handleRating = async (rating: number) => {
        if (!isAuthenticated || !game) return;

        try {
            setUserRating(rating);
            const updatedGame = await gameService.rateGame(game.id, rating);
            setGame(updatedGame);
        } catch (err) {
            console.error('Error rating game:', err);
        }
    };

    const handleEdit = () => {
        navigate(`/admin/games/edit/${id}`);
    };

    const confirmDelete = async () => {
        if (!game) return;

        try {
            await gameService.deleteGame(game.id);
            setShowDeleteModal(false);
            navigate('/games');
        } catch (err) {
            console.error('Error deleting game:', err);
            setError('Error al eliminar el juego');
        }
    };

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    if (error || !game) {
        return <div className="error-message">{error || 'No se pudo encontrar el juego'}</div>;
    }

    return (
        <div className="game-detail-container">
            <div className="game-header">
                <div className="game-image-container">
                    {game.imageUrl ? (
                        <img src={game.imageUrl} alt={game.title} className="game-image" />
                    ) : (
                        <div className="game-image-placeholder">Game</div>
                    )}
                </div>

                <div className="game-info-container">
                    <h1 className="game-title">{game.title}</h1>

                    <div className="game-rating-container">
                        <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${userRating >= star ? 'filled' : ''}`}
                                    onClick={() => isAuthenticated && handleRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        <button
                            className={`like-button ${game.likes > 0 ? 'liked' : ''}`}
                            onClick={handleLike}
                            disabled={!isAuthenticated}
                        >
                            ♥ <span className="like-count">{game.likes}</span>
                        </button>
                    </div>

                    <div className="game-meta">
                        <div className="game-genres">
                            <strong>Géneros:</strong>
                            <div className="genres-list">
                                {game.genres.map((genre, index) => (
                                    <span key={index} className="genre-tag">{genre}</span>
                                ))}
                            </div>
                        </div>

                        <div className="game-release">
                            <strong>Fecha de lanzamiento:</strong> {new Date(game.releaseDate).toLocaleDateString()}
                        </div>

                        {game.awards && game.awards.length > 0 && (
                            <div className="game-awards">
                                <strong>Premios:</strong>
                                <div className="awards-list">
                                    {game.awards.map((award, index) => (
                                        <span key={index} className="award-tag">{award}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="admin-actions">
                            <Button onClick={handleEdit} className="edit-button">Editar</Button>
                            <Button onClick={() => setShowDeleteModal(true)} className="delete-button">Eliminar</Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="game-description">
                <h2>Descripción</h2>
                <p>{game.description}</p>
            </div>

            <div className="game-tabs">
                <div className="tabs-header">
                    <button className="tab-button active">Reviews</button>
                    <button className="tab-button">Guides</button>
                    <button className="tab-button">News</button>
                    <button className="tab-button">Challenges</button>
                    <button className="tab-button">More Info</button>
                </div>

                <div className="tab-content">
                    {/* Contenido de pestañas (a implementar en el futuro) */}
                    <div className="tab-placeholder">
                        <p>No hay reviews disponibles para este juego.</p>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Confirmar eliminación"
                message={`¿Estás seguro de que deseas eliminar el juego "${game.title}"? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};

export default Game;
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Game } from "../interfaces/Game";
import gameService from "../services/gameService";
import Modal from "../components/Modal";
import "../css/AdminGames.css";

const AdminGames: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        try {
            setLoading(true);
            const data = await gameService.getAllGames();
            setGames(data);
            setError(null);
        } catch (err) {
            console.error("Error loading games:", err);
            setError("Error al cargar los juegos. Inténtalo de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (game: Game) => {
        setGameToDelete(game);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!gameToDelete) return;

        try {
            await gameService.deleteGame(gameToDelete.id);
            setGames(games.filter(g => g.id !== gameToDelete.id));
            setIsDeleteModalOpen(false);
            setGameToDelete(null);
        } catch (err) {
            console.error("Error deleting game:", err);
            setError("Error al eliminar el juego. Inténtalo de nuevo más tarde.");
        }
    };

    return (
        <div className="admin-games-container">
            <div className="admin-games-header">
                <h1>Administrar Juegos</h1>
                <Link to="/admin/games/create" className="create-game-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"/>
                    </svg>
                    Crear Juego
                </Link>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Cargando juegos...</div>
            ) : (
                <table className="games-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Género</th>
                        <th>Fecha de Lanzamiento</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {games.length > 0 ? (
                        games.map((game) => (
                            <tr key={game.id}>
                                <td>{game.id}</td>
                                <td>{game.name}</td>
                                <td>{game.genre}</td>
                                <td>{new Date(game.releaseDate).toLocaleDateString()}</td>
                                <td className="action-buttons">
                                    <button
                                        className="edit-button"
                                        onClick={() => navigate(`/admin/games/edit/${game.id}`)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(game)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5}>No hay juegos disponibles</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar eliminación"
                message={`¿Estás seguro de que deseas eliminar el juego "${gameToDelete?.name}"? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};

export default AdminGames;
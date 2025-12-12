import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gameService from "../../services/gameService.ts";
import Modal from "../../components/Modal.tsx";
import "../../css/AdminGames.css";
import {Game} from "../../interfaces/Game.ts";
import Button from "../../components/Button.tsx";
import {FileJson, Plus} from "lucide-react";

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
            setError("Error loading games. Please try again later.");
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
            setError("Error deleting game. Please try again later.");
        }
    };

    return (
        <div className="admin-games-container">
            <div className="admin-games-header">
                <h1>Manage Games</h1>
                <Link to="/admin/games/create">
                    <Button className="flex items-center gap-2">
                        <Plus size={20} /> Create Game
                    </Button>
                </Link>
                <div className="flex gap-3">
                    <Link to="/admin/games/create">
                        <Button className="flex items-center gap-2">
                            <Plus size={20} /> Create Game
                        </Button>
                    </Link>
                    <Link to="/admin/games/batch-import">
                        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                            <FileJson size={20} /> Batch Import
                        </Button>
                    </Link>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Loading games...</div>
            ) : (
                <table className="games-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Genre</th>
                        <th>Release Date</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {games.length > 0 ? (
                        games.map((game) => (
                            <tr key={game.id}>
                                <td>{game.id}</td>
                                <td>{game.name}</td>
                                <td>{game.genre}</td>
                                <td>{game.releaseDate}</td>
                                <td className="action-buttons">
                                    <Button
                                        className="edit-button"
                                        onClick={() => navigate(`/admin/games/edit/${game.id}`)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        className="delete-button"
                                        onClick={() => handleDelete(game)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5}>No games available</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm deletion"
                message={`Are you sure you want to delete the game "${gameToDelete?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default AdminGames;
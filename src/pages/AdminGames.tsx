// src/pages/AdminGames.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import '../css/AdminGames.css';

interface GameData {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    rating: number;
    likes: number;
    genre: string;
    releaseDate: string;
    awards: string;
}

const AdminGames: React.FC = () => {
    const [games, setGames] = useState<GameData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [selectedGame, setSelectedGame] = useState<GameData | null>(null);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [genre, setGenre] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [awards, setAwards] = useState('');

    // Delete confirmation
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [gameToDelete, setGameToDelete] = useState<number | null>(null);

    useEffect(() => {
        // Redirect if not admin
        if (!isAdmin) {
            navigate('/');
            return;
        }

        // Fetch games
        const fetchGames = async () => {
            setLoading(true);
            try {
                // Replace with actual API call
                // const response = await fetch('/api/admin/games');
                // const data = await response.json();

                // Placeholder data
                const mockGames: GameData[] = [
                    {
                        id: 1,
                        name: "The Last Guardian",
                        description: "An action-adventure game about a boy and a giant creature.",
                        imageUrl: "",
                        rating: 4.5,
                        likes: 1200,
                        genre: "Adventure",
                        releaseDate: "2023-06-15",
                        awards: "Game of the Year, Best Art Direction"
                    },
                    {
                        id: 2,
                        name: "Horizon Zero Dawn",
                        description: "Open world RPG set in a post-apocalyptic world.",
                        imageUrl: "",
                        rating: 4.8,
                        likes: 2500,
                        genre: "RPG",
                        releaseDate: "2022-12-10",
                        awards: "Best Narrative, Best Visual Design"
                    }
                ];

                setGames(mockGames);
            } catch (err) {
                console.error('Error fetching games:', err);
                setError('Error al cargar los juegos');
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [isAdmin, navigate]);

    const openAddForm = () => {
        // Reset form fields
        setName('');
        setDescription('');
        setImageUrl('');
        setGenre('');
        setReleaseDate('');
        setAwards('');
        setFormMode('add');
        setIsFormOpen(true);
    };

    const openEditForm = (game: GameData) => {
        setSelectedGame(game);
        setName(game.name);
        setDescription(game.description);
        setImageUrl(game.imageUrl);
        setGenre(game.genre);
        setReleaseDate(game.releaseDate);
        setAwards(game.awards);
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setSelectedGame(null);
    };

    const openDeleteModal = (gameId: number) => {
        setGameToDelete(gameId);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setGameToDelete(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const gameData = {
            name,
            description,
            imageUrl,
            genre,
            releaseDate,
            awards
        };

        try {
            if (formMode === 'add') {
                // API call to add game
                // await fetch('/api/admin/games', {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(gameData)
                // });

                // Mock adding a game
                const newGame: GameData = {
                    ...gameData,
                    id: games.length + 1,
                    rating: 0,
                    likes: 0
                };

                setGames([...games, newGame]);
            } else if (formMode === 'edit' && selectedGame) {
                // API call to update game
                // await fetch(`/api/admin/games/${selectedGame.id}`, {
                //   method: 'PUT',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(gameData)
                // });

                // Mock updating a game
                const updatedGames = games.map(game =>
                    game.id === selectedGame.id ?
                        { ...game, ...gameData } :
                        game
                );

                setGames(updatedGames);
            }

            closeForm();
        } catch (err) {
            console.error('Error saving game:', err);
            setError('Error al guardar el juego');
        }
    };

    const confirmDelete = async () => {
        if (gameToDelete === null) return;

        try {
            // API call to delete game
            // await fetch(`/api/admin/games/${gameToDelete}`, {
            //   method: 'DELETE'
            // });

            // Mock deleting a game
            setGames(games.filter(game => game.id !== gameToDelete));
            closeDeleteModal();
        } catch (err) {
            console.error('Error deleting game:', err);
            setError('Error al eliminar el juego');
            closeDeleteModal();
        }
    };

    if (loading) return <div>Cargando juegos...</div>;

    return (
        <div className="admin-games-container">
            <div className="admin-header">
                <h2>Administración de Juegos</h2>
                <Button onClick={openAddForm}>Añadir Juego</Button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <table className="games-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Género</th>
                    <th>Fecha de Lanzamiento</th>
                    <th>Rating</th>
                    <th>Likes</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {games.map(game => (
                    <tr key={game.id}>
                        <td>{game.id}</td>
                        <td>{game.name}</td>
                        <td>{game.genre}</td>
                        <td>{new Date(game.releaseDate).toLocaleDateString()}</td>
                        <td>{game.rating}</td>
                        <td>{game.likes}</td>
                        <td className="action-buttons">
                            <Button onClick={() => openEditForm(game)}>Editar</Button>
                            <Button
                                onClick={() => openDeleteModal(game.id)}
                                className="delete-button"
                            >
                                Eliminar
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Form modal */}
            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="form-modal">
                        <div className="modal-header">
                            <h3>{formMode === 'add' ? 'Añadir Juego Nuevo' : 'Editar Juego'}</h3>
                            <button className="close-button" onClick={closeForm}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Nombre del Juego</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Descripción</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="imageUrl">URL de la Imagen</label>
                                <input
                                    type="text"
                                    id="imageUrl"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="genre">Género</label>
                                <input
                                    type="text"
                                    id="genre"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="releaseDate">Fecha de Lanzamiento</label>
                                <input
                                    type="date"
                                    id="releaseDate"
                                    value={releaseDate}
                                    onChange={(e) => setReleaseDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="awards">Premios (separados por comas)</label>
                                <input
                                    type="text"
                                    id="awards"
                                    value={awards}
                                    onChange={(e) => setAwards(e.target.value)}
                                />
                            </div>

                            <div className="form-buttons">
                                <Button type="button" onClick={closeForm}>Cancelar</Button>
                                <Button type="submit">{formMode === 'add' ? 'Añadir' : 'Actualizar'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar este juego? Esta acción no se puede deshacer."
            />
        </div>
    );
};

export default AdminGames;
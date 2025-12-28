// src/pages/AdminGames.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import '../css/AdminGames.css';
import gameService from '../services/gameService';
import { Search } from 'lucide-react';

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

    // Search
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

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
                const response = await gameService.getGames({
                    page: 0,
                    size: 100,
                    sort: 'title,asc',
                    search: debouncedSearch
                });

                // Map to AdminGames format
                const mappedGames: GameData[] = response.content.map(game => ({
                    id: game.id,
                    name: game.title,
                    description: game.description,
                    imageUrl: game.coverImage || '',
                    rating: game.averageRating || 0,
                    likes: game.likes || 0,
                    genre: game.genres?.[0] || '',
                    releaseDate: game.releaseDate || '',
                    awards: game.awards?.join(', ') || ''
                }));

                setGames(mappedGames);
            } catch (err) {
                console.error('Error fetching games:', err);
                setError('Error loading games');
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [isAdmin, navigate, debouncedSearch]);

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
            setError('Error saving game');
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
            setError('Error deleting game');
            closeDeleteModal();
        }
    };

    if (loading) return <div>Loading games...</div>;

    return (
        <div className="admin-games-container">
            <div className="admin-header">
                <h2>Game Administration</h2>
                <div className="flex items-center gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search games by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-64 rounded-lg border border-white/10 bg-card/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <Button onClick={openAddForm}>Add Game</Button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <table className="games-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Genre</th>
                        <th>Release Date</th>
                        <th>Rating</th>

                        <th>Actions</th>
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

                            <td className="action-buttons">
                                <Button onClick={() => openEditForm(game)}>Edit</Button>
                                <Button
                                    onClick={() => openDeleteModal(game.id)}
                                    className="delete-button"
                                >
                                    Delete
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
                            <h3>{formMode === 'add' ? 'Add New Game' : 'Edit Game'}</h3>
                            <button className="close-button" onClick={closeForm}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Game Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="imageUrl">Image URL</label>
                                <input
                                    type="text"
                                    id="imageUrl"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="genre">Genre</label>
                                <input
                                    type="text"
                                    id="genre"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="releaseDate">Release Date</label>
                                <input
                                    type="date"
                                    id="releaseDate"
                                    value={releaseDate}
                                    onChange={(e) => setReleaseDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="awards">Awards (comma separated)</label>
                                <input
                                    type="text"
                                    id="awards"
                                    value={awards}
                                    onChange={(e) => setAwards(e.target.value)}
                                />
                            </div>

                            <div className="form-buttons">
                                <Button type="button" onClick={closeForm}>Cancel</Button>
                                <Button type="submit">{formMode === 'add' ? 'Add' : 'Update'}</Button>
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
                title="Confirm Deletion"
                message="Are you sure you want to delete this game? This action cannot be undone."
            />
        </div>
    );
};

export default AdminGames;
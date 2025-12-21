import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gameService from "../../services/gameService.ts";
import Modal from "../../components/Modal.tsx";
// import "../../css/AdminGames.css";
import { Game } from "../../interfaces/Game.ts";
import Button from "../../components/Button.tsx";
import { FileJson, Plus, Search } from "lucide-react";

const AdminGames: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async (query: string = "") => {
        try {
            setLoading(true);
            // Reusing getLibraryGamesPaginated: it supports 'title' as the 5th argument
            const data = await gameService.getLibraryGamesPaginated(0, 50, 'id,desc', undefined, query);
            setGames(data.content);
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
        <div className="min-h-screen py-12 px-4 bg-background">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-foreground">Manage Games</h1>
                    <div className="flex gap-3">
                        <Link to="/admin/games/create">
                            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Plus size={20} /> Create Game
                            </Button>
                        </Link>
                        <Link to="/admin/games/batch-import">
                            <Button className="flex items-center gap-2 bg-transparent text-primary border border-primary hover:bg-primary/10">
                                <FileJson size={20} /> Batch Import
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadGames(searchQuery)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>
                    <Button onClick={() => loadGames(searchQuery)} variant="secondary">
                        Search
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/50 p-4 text-destructive">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-12 text-center text-muted-foreground">Loading games...</div>
                ) : (
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary/50 border-b border-border">
                                    <th className="p-4 font-semibold text-foreground">ID</th>
                                    <th className="p-4 font-semibold text-foreground">Name</th>
                                    <th className="p-4 font-semibold text-foreground">Genre</th>
                                    <th className="p-4 font-semibold text-foreground">Release Date</th>
                                    <th className="p-4 font-semibold text-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {games.length > 0 ? (
                                    games.map((game) => (
                                        <tr key={game.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4 text-foreground">{game.id}</td>
                                            <td className="p-4 text-foreground font-medium">{game.title}</td>
                                            <td className="p-4 text-muted-foreground">{game.genres?.join(", ") || "N/A"}</td>
                                            <td className="p-4 text-muted-foreground">{game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'N/A'}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/games/edit/${game.id}`)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(game)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">No games available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Confirm deletion"
                    message={`Are you sure you want to delete the game "${gameToDelete?.title}"? This action cannot be undone.`}
                />
            </div>
        </div>
    );
};

export default AdminGames;

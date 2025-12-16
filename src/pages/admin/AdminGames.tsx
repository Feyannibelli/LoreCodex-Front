import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import gameService from "../../services/gameService.ts";
import Modal from "../../components/Modal.tsx";
import { Game } from "../../interfaces/Game.ts";
import Button from "../../components/Button.tsx";
import { FileJson, Plus } from "lucide-react";

const AdminGames: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const navigate = useNavigate();
    const observerRef = useRef<HTMLDivElement>(null);

    const loadGames = useCallback(async (pageNumber: number, append: boolean = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const data = await gameService.getLibraryGamesPaginated(pageNumber, 20);

            if (append) {
                setGames(prev => [...prev, ...data.content]);
            } else {
                setGames(data.content);
            }

            setHasMore(!data.last);
            setError(null);
        } catch (err) {
            console.error("Error loading games:", err);
            setError("Error loading games. Please try again later.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        loadGames(0, false);
    }, []);

    // Infinite scroll observer
    useEffect(() => {
        if (!observerRef.current || loading || loadingMore || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    loadGames(nextPage, true);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(observerRef.current);

        return () => observer.disconnect();
    }, [page, loading, loadingMore, hasMore, loadGames]);

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

                {error && (
                    <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/50 p-4 text-destructive">
                        {error}
                    </div>
                )}

                {loading && games.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">Loading games...</div>
                ) : (
                    <>
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

                        {/* Infinite Scroll Trigger */}
                        {hasMore && (
                            <div ref={observerRef} className="flex justify-center py-8">
                                {loadingMore && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <span>Loading more games...</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {!hasMore && games.length > 0 && (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                All {games.length} games loaded
                            </div>
                        )}
                    </>
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

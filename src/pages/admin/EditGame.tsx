import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import gameService from "../../services/gameService.ts";
import Button from "../../components/Button.tsx";
// import "../../css/AdminGames.css";
import { GameFormData } from "../../interfaces/Game.ts";

const EditGame: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = useState<GameFormData>({
        name: "",
        description: "",
        genre: "",
        releaseDate: "",
        imageUrl: "",
        awards: ""
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadGame = async () => {
            try {
                setLoading(true);
                if (id) {
                    const gameData = await gameService.getGameById(parseInt(id));

                    // Format the date for the date input
                    //const releaseDate = new Date(gameData.releaseDate);
                    //const formattedDate = releaseDate.toISOString().split('T')[0];
                    //console.log('releaseDate:', releaseDate);
                    //console.log('formattedDate:', formattedDate);
                    console.log('originalDate:', gameData.releaseDate);

                    setFormData({
                        name: gameData.name,
                        description: gameData.description,
                        genre: gameData.genre,
                        releaseDate: gameData.releaseDate,
                        imageUrl: gameData.imageUrl || "",
                        awards: gameData.awards || ""
                    });
                    setError(null);
                }
            } catch (err) {
                console.error("Error loading game:", err);
                setError("Error loading game. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadGame();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (id) {
                await gameService.updateGame(parseInt(id), formData);
                navigate("/admin/games");
            }
        } catch (err) {
            console.error("Error updating game:", err);
            setError("Error updating game. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-container">Loading game data...</div>;

    return (
        <div className="min-h-screen py-12 px-4 bg-background">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-foreground text-center">Edit Game</h1>

                {error && (
                    <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/50 p-4 text-destructive">
                        {error}
                    </div>
                )}

                <div className="bg-card rounded-xl border border-border shadow-sm p-6 md:p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-foreground">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-medium text-foreground">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={6}
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input resize-y min-h-[150px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="genre" className="block text-sm font-medium text-foreground">Genre</label>
                                <input
                                    type="text"
                                    id="genre"
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="releaseDate" className="block text-sm font-medium text-foreground">Release Date</label>
                                <input
                                    type="date"
                                    id="releaseDate"
                                    name="releaseDate"
                                    value={formData.releaseDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground">Image URL</label>
                            <input
                                type="text"
                                id="imageUrl"
                                name="imageUrl"
                                value={formData.imageUrl || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="awards" className="block text-sm font-medium text-foreground">Awards</label>
                            <input
                                type="text"
                                id="awards"
                                name="awards"
                                value={formData.awards || ""}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/admin/games")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="default"
                                disabled={submitting}
                            >
                                {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditGame;
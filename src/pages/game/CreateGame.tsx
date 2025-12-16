import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameFormData } from "../../interfaces/Game.ts";
import gameService from "../../services/gameService.ts";
import Button from "../../components/Button.tsx";

const CreateGame: React.FC = () => {
    const initialFormData: GameFormData = {
        name: "",
        description: "",
        genre: "",
        releaseDate: "",
        imageUrl: "",
        genres: [],
        tags: [],
        developersAndPublishers: []
    };

    const [formData, setFormData] = useState<GameFormData>(initialFormData);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Helper states for array inputs
    const [genresInput, setGenresInput] = useState<string>("");
    const [tagsInput, setTagsInput] = useState<string>("");
    const [devsInput, setDevsInput] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleGenresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGenresInput(value);
        const genresArray = value.split(",").map(g => g.trim()).filter(Boolean);
        setFormData(prev => ({
            ...prev,
            genres: genresArray,
            genre: genresArray[0] || ""
        }));
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTagsInput(value);
        setFormData(prev => ({
            ...prev,
            tags: value.split(",").map(t => t.trim()).filter(Boolean)
        }));
    };

    const handleDevsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDevsInput(value);
        setFormData(prev => ({
            ...prev,
            developersAndPublishers: value.split(",").map(d => d.trim()).filter(Boolean)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await gameService.createGame(formData);
            navigate("/admin/games");
        } catch (err) {
            console.error("Error creating game:", err);
            setError("Error creating game. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 bg-background">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-foreground text-center">Create New Game</h1>

                {error && (
                    <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/50 p-4 text-destructive">
                        {error}
                    </div>
                )}

                <div className="bg-card rounded-xl border border-border shadow-sm p-6 md:p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-foreground">Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter game name"
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-medium text-foreground">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={6}
                                placeholder="Enter game description"
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input resize-y min-h-[150px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Genres */}
                            <div className="space-y-2">
                                <label htmlFor="genres" className="block text-sm font-medium text-foreground">
                                    Genres *
                                    <span className="text-xs text-muted-foreground ml-2">(comma separated)</span>
                                </label>
                                <input
                                    type="text"
                                    id="genres"
                                    name="genres"
                                    value={genresInput}
                                    onChange={handleGenresChange}
                                    required
                                    placeholder="Action, RPG, Adventure"
                                    className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                                />
                                {formData.genres.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.genres.map((genre, i) => (
                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Release Date */}
                            <div className="space-y-2">
                                <label htmlFor="releaseDate" className="block text-sm font-medium text-foreground">Release Date *</label>
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

                        {/* Developers & Publishers */}
                        <div className="space-y-2">
                            <label htmlFor="developers" className="block text-sm font-medium text-foreground">
                                Developers & Publishers
                                <span className="text-xs text-muted-foreground ml-2">(comma separated)</span>
                            </label>
                            <input
                                type="text"
                                id="developers"
                                name="developers"
                                value={devsInput}
                                onChange={handleDevsChange}
                                placeholder="Valve, Electronic Arts, Ubisoft"
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            />
                            {formData.developersAndPublishers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.developersAndPublishers.map((dev, i) => (
                                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                                            {dev}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <label htmlFor="tags" className="block text-sm font-medium text-foreground">
                                Tags
                                <span className="text-xs text-muted-foreground ml-2">(comma separated)</span>
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={tagsInput}
                                onChange={handleTagsChange}
                                placeholder="Singleplayer, Multiplayer, Co-op"
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            />
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2">
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground">Cover Image URL</label>
                            <input
                                type="text"
                                id="imageUrl"
                                name="imageUrl"
                                value={formData.imageUrl || ""}
                                onChange={handleChange}
                                placeholder="https://example.com/cover.jpg"
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            />
                            {formData.imageUrl && (
                                <div className="mt-3">
                                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                                    <img
                                        src={formData.imageUrl}
                                        alt="Preview"
                                        className="h-48 w-auto object-cover rounded-lg border border-border"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
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
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create Game"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateGame;

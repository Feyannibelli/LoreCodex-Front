import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameFormData } from "../../interfaces/Game.ts";
import gameService from "../../services/gameService.ts";
import Button from "../../components/Button.tsx";
// import "../../css/AdminGames.css";

const CreateGame: React.FC = () => {
    const initialFormData: GameFormData = {
        name: "",
        description: "",
        genre: "",
        releaseDate: "",
        releaseYear: null,
        releaseDateUnknown: false,
        imageUrl: "",
        awards: "",
        genres: [],
        tags: [],
        developersAndPublishers: []
    };

    const [formData, setFormData] = useState<GameFormData>(initialFormData);

    type DateMode = 'full' | 'year' | 'unknown';
    const [dateMode, setDateMode] = useState<DateMode>('full');
    const [yearInput, setYearInput] = useState<string>("");
    const [devPubInput, setDevPubInput] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Prepare final payload based on mode
            const finalData = { ...formData };

            // Parse developers and publishers from string input to array
            finalData.developersAndPublishers = devPubInput.split(',').map(item => item.trim()).filter(Boolean);

            if (dateMode === 'unknown') {
                finalData.releaseDate = "";
                finalData.releaseYear = null;
                finalData.releaseDateUnknown = true;
            } else if (dateMode === 'year') {
                finalData.releaseDate = "";
                finalData.releaseDateUnknown = false;
                finalData.releaseYear = yearInput ? parseInt(yearInput) : null;
            } else {
                // Full date
                finalData.releaseYear = null;
                finalData.releaseDateUnknown = false;
                // releaseDate is already in formData
            }

            await gameService.createGame(finalData);
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
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-foreground">Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                                placeholder="Enter game name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-medium text-foreground">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={6}
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input resize-y min-h-[150px]"
                                placeholder="Enter game description"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="genre" className="block text-sm font-medium text-foreground">Genre *</label>
                                <input
                                    type="text"
                                    id="genre"
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                                    placeholder="e.g., Action, RPG, Adventure"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-foreground">Release Date Format</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDateMode('full')}
                                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${dateMode === 'full'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-muted-foreground border-input hover:bg-muted'}`}
                                    >
                                        Full Date
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDateMode('year')}
                                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${dateMode === 'year'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-muted-foreground border-input hover:bg-muted'}`}
                                    >
                                        Year Only
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDateMode('unknown')}
                                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${dateMode === 'unknown'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-muted-foreground border-input hover:bg-muted'}`}
                                    >
                                        Unknown
                                    </button>
                                </div>

                                {dateMode === 'full' && (
                                    <input
                                        type="date"
                                        id="releaseDate"
                                        name="releaseDate"
                                        value={formData.releaseDate}
                                        onChange={handleChange}
                                        required={dateMode === 'full'}
                                        className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                                    />
                                )}

                                {dateMode === 'year' && (
                                    <input
                                        type="number"
                                        placeholder="YYYY (e.g., 1998)"
                                        value={yearInput}
                                        onChange={(e) => setYearInput(e.target.value)}
                                        min="1950"
                                        max="2100"
                                        required={dateMode === 'year'}
                                        className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                                    />
                                )}

                                {dateMode === 'unknown' && (
                                    <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground italic border border-border">
                                        Release date will be set to "Unknown"
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="devPub" className="block text-sm font-medium text-foreground">Developers & Publishers (comma separated)</label>
                            <input
                                type="text"
                                id="devPub"
                                value={devPubInput}
                                onChange={(e) => setDevPubInput(e.target.value)}
                                placeholder="e.g., Nintendo, GameFreak"
                                className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            />
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
                                placeholder="https://example.com/image.jpg"
                            />
                            {formData.imageUrl && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                    Preview:
                                    <img src={formData.imageUrl} alt="Preview" className="mt-1 h-32 w-auto object-cover rounded-md border border-border" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="awards" className="block text-sm font-medium text-foreground">Awards</label>
                                <input
                                    type="text"
                                    id="awards"
                                    name="awards"
                                    value={formData.awards || ""}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                                    placeholder="e.g. GOTY 2020"
                                />
                            </div>
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

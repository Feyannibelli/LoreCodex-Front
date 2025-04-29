import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameFormData } from "../interfaces/Game";
import gameService from "../services/gameService";
import Button from "../components/Button";
import "../css/AdminGames.css";

const CreateGame: React.FC = () => {
    const initialFormData: GameFormData = {
        name: "",
        description: "",
        genre: "",
        releaseDate: "",
        imageUrl: "",
        awards: ""
    };

    const [formData, setFormData] = useState<GameFormData>(initialFormData);
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
        <div className="admin-games-container">
            <h1>Create New Game</h1>

            {error && <div className="error-message">{error}</div>}

            <form className="game-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="genre">Genre</label>
                    <input
                        type="text"
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="releaseDate">Release Date</label>
                    <input
                        type="date"
                        id="releaseDate"
                        name="releaseDate"
                        value={formData.releaseDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="imageUrl">Image URL</label>
                    <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="awards">Awards</label>
                    <input
                        type="text"
                        id="awards"
                        name="awards"
                        value={formData.awards || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-buttons">
                    <Button
                        type="button"
                        className="cancel-button"
                        onClick={() => navigate("/admin/games")}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="submit-button"
                        onClick={() => {}}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Game"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateGame;
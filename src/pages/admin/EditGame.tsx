import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import gameService from "../../services/gameService.ts";
import Button from "../../components/Button.tsx";
import "../../css/AdminGames.css";
import {GameFormData} from "@/interfaces/Game.ts";

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
                    console.log('otiginalDate:', gameData.releaseDate);

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
        <div className="admin-games-container">
            <h1>Edit Game</h1>

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
                    >
                        {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditGame;
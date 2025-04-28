import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameFormData } from "../interfaces/Game";
import gameService from "../services/gameService";
import Button from "../components/Button";
import "../css/AdminGames.css";

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

                    // Formatear la fecha para el input date
                    const releaseDate = new Date(gameData.releaseDate);
                    const formattedDate = releaseDate.toISOString().split('T')[0];

                    setFormData({
                        name: gameData.name,
                        description: gameData.description,
                        genre: gameData.genre,
                        releaseDate: formattedDate,
                        imageUrl: gameData.imageUrl || "",
                        awards: gameData.awards || ""
                    });
                    setError(null);
                }
            } catch (err) {
                console.error("Error loading game:", err);
                setError("Error al cargar el juego. Inténtalo de nuevo más tarde.");
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
            setError("Error al actualizar el juego. Por favor, inténtalo de nuevo.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-container">Cargando datos del juego...</div>;

    return (
        <div className="admin-games-container">
            <h1>Editar Juego</h1>

            {error && <div className="error-message">{error}</div>}

            <form className="game-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Nombre</label>
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
                    <label htmlFor="description">Descripción</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="genre">Género</label>
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
                    <label htmlFor="releaseDate">Fecha de Lanzamiento</label>
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
                    <label htmlFor="imageUrl">URL de la Imagen</label>
                    <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="awards">Premios</label>
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
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        className="submit-button"
                        onClick={() => {}}
                        disabled={submitting}
                    >
                        {submitting ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditGame;
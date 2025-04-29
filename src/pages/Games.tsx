import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Game } from "../interfaces/Game";
import gameService from "../services/gameService";
import "../css/Games.css";

const Games: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const location = useLocation();

    useEffect(() => {
        // Check if there's a search query in the URL
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');

        if (searchQuery) {
            setSearchTerm(searchQuery);
            handleSearch(null, searchQuery);
        } else {
            loadGames();
        }
    }, [location.search]);

    const loadGames = async () => {
        try {
            setLoading(true);
            const data = await gameService.getAllGames();
            setGames(data);
            setError(null);
        } catch (err) {
            console.error("Error loading games:", err);
            setError("Error al cargar los juegos. Inténtalo de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent | null, inputSearchTerm?: string) => {
        if (e) e.preventDefault();

        const term = inputSearchTerm || searchTerm;
        if (!term.trim()) {
            loadGames();
            return;
        }

        try {
            setLoading(true);
            const data = await gameService.searchGamesByName(term);
            setGames(data);
            setError(null);
        } catch (err) {
            console.error("Error searching games:", err);
            setError("Error al buscar juegos. Inténtalo de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="games-container">
            <h1>Juegos Generales</h1>

            {/* Barra de búsqueda */}
            <div className="games-search-container">
                <form className="games-search-bar" onSubmit={(e) => handleSearch(e)}>
                    <input
                        type="text"
                        className="games-search-input"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="games-search-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                        </svg>
                    </button>
                </form>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Cargando juegos...</div>
            ) : games.length > 0 ? (
                <div className="games-grid">
                    {games.map((game) => (
                        <Link to={`/games/${game.id}`} className="game-card" key={game.id}>
                            <div className="game-image">
                                {game.imageUrl ? (
                                    <img src={game.imageUrl} alt={game.name} />
                                ) : (
                                    "Game"
                                )}
                            </div>
                            <div className="game-info">
                                <div className="game-name">{game.name}</div>
                                <div className="game-genre">{game.genre}</div>
                                <div className="game-meta">
                                    <span>{new Date(game.releaseDate).getFullYear()}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="no-games-found">
                    No se encontraron juegos.
                </div>
            )}
        </div>
    );
};

export default Games;
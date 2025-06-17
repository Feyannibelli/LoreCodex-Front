import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Game } from "../../interfaces/Game.ts";
import gameService from "../../services/gameService.ts";
import searchService from "../../services/searchService.ts";
import GameFilters, { FiltersState } from "../../components/GameFilters.tsx";
import "../../css/Games.css";
import "../../css/GameFilters.css";

const Games: React.FC = () => {
    const [allGames, setAllGames] = useState<Game[]>([]);
    const [displayedGames, setDisplayedGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    const [activeFilters, setActiveFilters] = useState<FiltersState | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if there's a search query in the URL
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');

        if (searchQuery) {
            setSearchTerm(searchQuery);
        }

        loadGames();
    }, [location.search]);

    const loadGames = async () => {
        try {
            setLoading(true);
            const data = await gameService.getAllGames();
            setAllGames(data);

            // Extract available genres for filters
            const genres = searchService.getAvailableGenres(data);
            setAvailableGenres(genres);

            // Initial filtering based on URL search param
            const searchParams = new URLSearchParams(location.search);
            const searchQuery = searchParams.get('search') || "";

            if (searchQuery) {
                const filtered = searchService.filterGames(data, searchQuery);
                setDisplayedGames(filtered);
            } else {
                setDisplayedGames(data);
            }

            setError(null);
        } catch (err) {
            console.error("Error loading games:", err);
            setError("Error loading games. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent | null) => {
        if (e) e.preventDefault();

        if (!searchTerm.trim() && !activeFilters) {
            // If search is empty and no filters, show all games
            setDisplayedGames(allGames);

            // Update URL
            navigate('/games');
            return;
        }

        // Update URL with search term
        if (searchTerm.trim()) {
            navigate(`/games?search=${encodeURIComponent(searchTerm)}`);
        }

        // Apply filters to the games
        const filtered = searchService.filterGames(allGames, searchTerm, activeFilters || undefined);
        setDisplayedGames(filtered);
    };

    const handleFilterChange = (filters: FiltersState) => {
        setActiveFilters(filters);

        // Apply both search and filters
        const filtered = searchService.filterGames(allGames, searchTerm, filters);
        setDisplayedGames(filtered);
    };

    const resetFilters = () => {
        setActiveFilters(null);

        // Apply only search term without filters
        const filtered = searchService.filterGames(allGames, searchTerm);
        setDisplayedGames(filtered);
    };

    return (
        <div className="games-container">
            <h1>Games</h1>

            {/* Search bar */}
            <div className="games-search-container">
                <form className="games-search-bar" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="games-search-input"
                        placeholder="Search game titles or descriptions"
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

            {/* Filters */}
            <GameFilters
                availableGenres={availableGenres}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
            />

            {/* Results summary */}
            <div className="results-summary">
                {!loading && (
                    <p>Showing {displayedGames.length} of {allGames.length} games</p>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Loading games...</div>
            ) : displayedGames.length > 0 ? (
                <div className="games-grid">
                    {displayedGames.map((game) => (
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
                                    {game.averageRating !== undefined && (
                                        <span>★ {game.averageRating}</span>
                                    )}
                                </div>
                                {game.awards && (
                                    <div className="game-awards">
                                        <span>🏆</span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="no-games-found">
                    No games found with the current search criteria.
                    <button
                        onClick={resetFilters}
                        className="clear-filters-button"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default Games;
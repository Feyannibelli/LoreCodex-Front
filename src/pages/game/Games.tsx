import React, { useState, useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Game } from "../../interfaces/Game.ts";
import gameService from "../../services/gameService.ts";
import searchService from "../../services/searchService.ts";
import GameFilters, { FiltersState } from "../../components/GameFilters.tsx";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import "../../css/Games.css";
import "../../css/GameFilters.css";

const Games: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    const [activeFilters, setActiveFilters] = useState<FiltersState | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    const fetchGames = useCallback(async (page: number, pageSize: number): Promise<Game[]> => {
        const games = await gameService.getAllGamesPaginated(page, pageSize);
        return games;
    }, []);

    const {
        items: allGames,
        loading,
        hasMore,
        error,
        loadMore,
        refresh
    } = useInfiniteScroll({
        fetchFunction: fetchGames,
        pageSize: 12
    });

    useEffect(() => {
        const loadGenres = async () => {
            try {
                const genres = await gameService.getAllGenres();
                setAvailableGenres(genres);
            } catch (error) {
                console.error('Error loading genres:', error);
                if (allGames.length > 0) {
                    const extractedGenres = searchService.getAvailableGenres(allGames);
                    setAvailableGenres(extractedGenres);
                }
            }
        };

        loadGenres();
    }, []);

    useEffect(() => {
        if (allGames.length > 0 && availableGenres.length === 0) {
            const extractedGenres = searchService.getAvailableGenres(allGames);
            setAvailableGenres(extractedGenres);
        }
    }, [allGames, availableGenres.length]);

    const displayedGames = React.useMemo(() => {
        return searchService.filterGames(allGames, searchTerm, activeFilters || undefined);
    }, [allGames, searchTerm, activeFilters]);

    const handleSearch = async (e: React.FormEvent | null) => {
        if (e) e.preventDefault();

        if (searchTerm.trim()) {
            navigate(`/games?search=${encodeURIComponent(searchTerm)}`);
        } else {
            navigate('/games');
        }
    };

    const handleFilterChange = (filters: FiltersState) => {
        setActiveFilters(filters);
    };

    const resetFilters = () => {
        setActiveFilters(null);
        setSearchTerm("");
        refresh();
    };

    React.useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');
        if (searchQuery) {
            setSearchTerm(searchQuery);
        }
    }, [location.search]);

    return (
        <div className="games-container">
            <h1>Games</h1>

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

            <GameFilters
                availableGenres={availableGenres}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
            />

            <div className="results-summary">
                <p>Showing {displayedGames.length} games {hasMore && '(loading more...)'}</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading && allGames.length === 0 ? (
                <div className="loading">Loading games...</div>
            ) : displayedGames.length > 0 ? (
                <>
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
                                        {game.averageRating !== undefined && game.averageRating > 0 && (
                                            <span>★ {game.averageRating.toFixed(1)}</span>
                                        )}
                                    </div>
                                    {game.ratingCount !== undefined && game.ratingCount > 0 && (
                                        <div className="game-popularity">
                                            <span>{game.ratingCount} ratings</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    <InfiniteScrollTrigger
                        onIntersect={loadMore}
                        loading={loading}
                        hasMore={hasMore && displayedGames.length === allGames.length}
                    />
                </>
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

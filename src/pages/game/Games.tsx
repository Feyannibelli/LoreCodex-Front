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

    // Función para cargar juegos paginados
    const fetchGames = useCallback(async (page: number, pageSize: number): Promise<Game[]> => {
        const games = await gameService.getAllGamesPaginated(page, pageSize);
        console.log('Fetched games:', games); // DEBUG

        // Verificar datos de cada juego
        games.forEach(game => {
            console.log(`Game: ${game.name}`, {
                rating: game.averageRating,
                ratingCount: game.ratingCount,
                genre: game.genre
            });
        });

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

    // Cargar géneros desde el backend
    useEffect(() => {
        const loadGenres = async () => {
            try {
                const genres = await gameService.getAllGenres();
                console.log('Loaded genres from backend:', genres); // DEBUG
                setAvailableGenres(genres);
            } catch (error) {
                console.error('Error loading genres:', error);
                // Fallback: extraer de los juegos ya cargados
                if (allGames.length > 0) {
                    const extractedGenres = searchService.getAvailableGenres(allGames);
                    console.log('Extracted genres from games:', extractedGenres); // DEBUG
                    setAvailableGenres(extractedGenres);
                }
            }
        };

        loadGenres();
    }, []);

    // Actualizar géneros cuando se carguen más juegos
    useEffect(() => {
        if (allGames.length > 0 && availableGenres.length === 0) {
            const extractedGenres = searchService.getAvailableGenres(allGames);
            console.log('Extracted genres from loaded games:', extractedGenres); // DEBUG
            setAvailableGenres(extractedGenres);
        }
    }, [allGames, availableGenres.length]);

    // Aplicar filtros localmente a los juegos cargados
    const displayedGames = React.useMemo(() => {
        console.log('Applying filters:', {
            searchTerm,
            activeFilters,
            totalGames: allGames.length
        }); // DEBUG

        const filtered = searchService.filterGames(allGames, searchTerm, activeFilters || undefined);

        console.log('Filtered games:', filtered.length); // DEBUG
        return filtered;
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
        console.log('Filter changed:', filters); // DEBUG
        setActiveFilters(filters);
    };

    const resetFilters = () => {
        console.log('Resetting filters'); // DEBUG
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

            {/* Debug info - MEJORADO */}
            <div style={{
                background: '#1f2937',
                color: '#fff',
                padding: '15px',
                marginBottom: '20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'monospace'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>🔍 Debug Info:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <div><strong>Total Games:</strong> {allGames.length}</div>
                        <div><strong>Displayed Games:</strong> {displayedGames.length}</div>
                        <div><strong>Available Genres:</strong> {availableGenres.length}</div>
                    </div>
                    <div>
                        <div><strong>Selected Genres:</strong> {activeFilters?.genres.join(', ') || 'None'}</div>
                        <div><strong>Min Rating:</strong> {activeFilters?.minRating || 'None'}</div>
                        <div><strong>Sort By:</strong> {activeFilters?.sortBy || 'None'}</div>
                    </div>
                </div>
                <details style={{ marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Show All Genres</summary>
                    <div style={{ marginTop: '5px', padding: '10px', background: '#374151', borderRadius: '4px' }}>
                        {availableGenres.join(', ') || 'No genres loaded'}
                    </div>
                </details>
                <details style={{ marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Show Sample Games</summary>
                    <div style={{ marginTop: '5px', maxHeight: '200px', overflow: 'auto' }}>
                        {allGames.slice(0, 5).map(game => (
                            <div key={game.id} style={{ padding: '5px', borderBottom: '1px solid #4b5563' }}>
                                <div><strong>{game.name}</strong></div>
                                <div style={{ fontSize: '11px' }}>
                                    Rating: {game.averageRating || 0} |
                                    Ratings: {game.ratingCount || 0} |
                                    Genres: {game.genre || 'None'}
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            </div>

            {/* Filters */}
            <GameFilters
                availableGenres={availableGenres}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
            />

            {/* Results summary */}
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

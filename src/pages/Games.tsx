// src/pages/Games.tsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useGames } from '../context/GameContext';
import gameService, { Game } from '../services/gameService';
import '../css/Games.css';

const Games: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [displayGames, setDisplayGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { isAdmin } = useAuth();

    // Filtros y ordenación
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'recent');
    const [selectedGenre, setSelectedGenre] = useState<string>(searchParams.get('genre') || '');

    const { games, refreshGames } = useGames();

    // Cargar juegos basados en parámetros de URL
    useEffect(() => {
        const loadGames = async () => {
            try {
                setLoading(true);

                const sort = searchParams.get('sort');
                const genre = searchParams.get('genre');

                // Si hay parámetros específicos, cargamos datos específicos
                if (sort === 'popular') {
                    setSortBy('popular');
                    const popularGames = await gameService.getPopularGames();
                    setDisplayGames(popularGames);
                } else if (sort === 'recent') {
                    setSortBy('recent');
                    const recentGames = await gameService.getRecentlyAddedGames();
                    setDisplayGames(recentGames);
                } else {
                    // Por defecto, mostramos todos los juegos
                    await refreshGames();
                    setDisplayGames(games);
                }

                // Si hay un género seleccionado
                if (genre) {
                    setSelectedGenre(genre);
                }

                setError(null);
            } catch (err) {
                console.error('Error loading games:', err);
                setError('Error al cargar los juegos');
            } finally {
                setLoading(false);
            }
        };

        loadGames();
    }, [searchParams, refreshGames, games.length]);

    // Aplicar filtros y ordenación a los juegos mostrados
    useEffect(() => {
        let filtered = [...games];

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(game =>
                game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                game.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por género
        if (selectedGenre) {
            filtered = filtered.filter(game =>
                game.genres.includes(selectedGenre)
            );
        }

        // Ordenar
        if (sortBy === 'popular') {
            filtered.sort((a, b) => b.likes - a.likes);
        } else if (sortBy === 'recent') {
            filtered.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        }

        setDisplayGames(filtered);
    }, [games, searchTerm, selectedGenre, sortBy]);

    // Actualizar parámetros de URL cuando cambian los filtros
    useEffect(() => {
        const params = new URLSearchParams();

        if (sortBy) {
            params.set('sort', sortBy);
        }

        if (selectedGenre) {
            params.set('genre', selectedGenre);
        }

        setSearchParams(params);
    }, [sortBy, selectedGenre, setSearchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // La búsqueda se aplica automáticamente por el useEffect
    };

    const handleSortChange = (sort: string) => {
        setSortBy(sort);
    };

    const handleGenreChange = (genre: string) => {
        setSelectedGenre(genre === selectedGenre ? '' : genre);
    };

    // Obtener lista de géneros únicos de todos los juegos
    const allGenres = React.useMemo(() => {
        const genreSet = new Set<string>();
        games.forEach(game => {
            game.genres.forEach(genre => genreSet.add(genre));
        });
        return Array.from(genreSet);
    }, [games]);

    if (loading && games.length === 0) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="games-container">
            <div className="games-header">
                <h1>Juegos</h1>

                {isAdmin && (
                    <Link to="/admin/games/new">
                        <Button className="add-game-button">Añadir Juego</Button>
                    </Link>
                )}
            </div>

            <div className="games-filters">
                <form className="search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar juegos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="search-button">Buscar</button>
                </form>

                <div className="filter-options">
                    <div className="sort-options">
                        <span>Ordenar por:</span>
                        <button
                            className={`sort-button ${sortBy === 'recent' ? 'active' : ''}`}
                            onClick={() => handleSortChange('recent')}
                        >
                            Recientes
                        </button>
                        <button
                            className={`sort-button ${sortBy === 'popular' ? 'active' : ''}`}
                            onClick={() => handleSortChange('popular')}
                        >
                            Populares
                        </button>
                    </div>

                    <div className="genres-filter">
                        <span>Géneros:</span>
                        <div className="genre-buttons">
                            {allGenres.map(genre => (
                                <button
                                    key={genre}
                                    className={`genre-button ${selectedGenre === genre ? 'active' : ''}`}
                                    onClick={() => handleGenreChange(genre)}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="games-grid">
                {displayGames.length > 0 ? (
                    displayGames.map(game => (
                        <Link to={`/games/${game.id}`} key={game.id} className="game-card">
                            <div className="game-card-image">
                                {game.imageUrl ? (
                                    <img src={game.imageUrl} alt={game.title} />
                                ) : (
                                    <div className="game-image-placeholder">Game</div>
                                )}
                            </div>
                            <div className="game-card-info">
                                <h3 className="game-card-title">{game.title}</h3>
                                <div className="game-card-meta">
                                    <span className="game-card-rating">★ {game.rating.toFixed(1)}</span>
                                    <span className="game-card-likes">♥ {game.likes}</span>
                                </div>
                                <div className="game-card-genres">
                                    {game.genres.slice(0, 2).map((genre, index) => (
                                        <span key={index} className="game-card-genre">{genre}</span>
                                    ))}
                                    {game.genres.length > 2 && <span className="game-card-genre">+{game.genres.length - 2}</span>}
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="no-games-message">
                        <p>No se encontraron juegos que coincidan con los criterios de búsqueda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Games;
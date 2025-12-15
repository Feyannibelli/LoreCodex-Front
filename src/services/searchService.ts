import { Game } from '../interfaces/Game';
import { FiltersState } from '../components/GameFilters';

// Service for filtering games with advanced options
const searchService = {
    // Filter games based on search term and filter options
    filterGames: (games: Game[], searchTerm: string, filters?: FiltersState): Game[] => {
        // Start with all games
        let filteredGames = [...games];

        // Apply text search if provided
        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            filteredGames = filteredGames.filter(game =>
                game.name.toLowerCase().includes(term) ||
                game.description.toLowerCase().includes(term)
            );
        }

        // Apply filters if provided
        if (filters) {
            // Filter by genres - CORREGIDO
            if (filters.genres.length > 0) {
                console.log('Filtering by genres:', filters.genres); // DEBUG
                filteredGames = filteredGames.filter(game => {
                    // Si el juego no tiene géneros, no lo incluimos
                    if (!game.genre || game.genre.trim() === '') {
                        console.log(`Game ${game.name} excluded: no genres`); // DEBUG
                        return false;
                    }

                    // Dividir los géneros del juego por comas y limpiar espacios
                    const gameGenres = game.genre.split(',').map(g => g.trim().toLowerCase());
                    console.log(`Game ${game.name} genres:`, gameGenres); // DEBUG

                    // Verificar si alguno de los géneros seleccionados coincide
                    const matches = filters.genres.some(selectedGenre =>
                        gameGenres.some(gameGenre =>
                            gameGenre === selectedGenre.toLowerCase()
                        )
                    );

                    console.log(`Game ${game.name} matches genres: ${matches}`); // DEBUG
                    return matches;
                });
                console.log(`After genre filter: ${filteredGames.length} games`); // DEBUG
            }

            // Filter by release date - after
            if (filters.dateFilter.after) {
                const afterDate = new Date(filters.dateFilter.after);
                filteredGames = filteredGames.filter(game =>
                    new Date(game.releaseDate) >= afterDate
                );
            }

            // Filter by release date - before
            if (filters.dateFilter.before) {
                const beforeDate = new Date(filters.dateFilter.before);
                filteredGames = filteredGames.filter(game =>
                    new Date(game.releaseDate) <= beforeDate
                );
            }

            // Filter by minimum rating - CORREGIDO
            if (filters.minRating !== null && filters.minRating > 0) {
                console.log('Filtering by minimum rating:', filters.minRating); // DEBUG
                filteredGames = filteredGames.filter(game => {
                    const rating = game.averageRating || 0;
                    const passes = rating >= filters.minRating!;
                    console.log(`Game ${game.name}: rating ${rating}, min ${filters.minRating}, passes: ${passes}`); // DEBUG
                    return passes;
                });
            }

            // Apply sorting
            if (filters.sortBy) {
                filteredGames.sort((a, b) => {
                    let comparison = 0;

                    switch (filters.sortBy) {
                        case 'popularity':
                            // CORREGIDO: Sort by number of ratings (popularity)
                            const aRatingCount = a.ratingCount || 0;
                            const bRatingCount = b.ratingCount || 0;
                            console.log(`Comparing popularity: ${a.name} (${aRatingCount}) vs ${b.name} (${bRatingCount})`); // DEBUG
                            comparison = bRatingCount - aRatingCount;
                            break;

                        case 'releaseDate':
                            // Sort by release date
                            comparison = new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
                            break;

                        case 'name':
                            // Sort by name alphabetically
                            comparison = a.name.localeCompare(b.name);
                            break;
                    }

                    // Apply sort direction
                    return filters.sortOrder === 'asc' ? -comparison : comparison;
                });
            }
        }

        return filteredGames;
    },

    // Get unique genres from game list for filter options
    // MEJORADO: Extrae todos los géneros únicos de los juegos
    getAvailableGenres: (games: Game[]): string[] => {
        const genresSet = new Set<string>();

        games.forEach(game => {
            if (game.genre && game.genre.trim() !== '') {
                // Si el género contiene comas, dividirlo
                const gameGenres = game.genre.split(',').map(g => g.trim());
                gameGenres.forEach(genre => {
                    if (genre) {
                        genresSet.add(genre);
                    }
                });
            }
        });

        // Convertir a array y ordenar alfabéticamente
        return Array.from(genresSet).sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
        );
    }
};

export default searchService;

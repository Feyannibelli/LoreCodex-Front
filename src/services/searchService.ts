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
            // Filter by genres
            if (filters.genres.length > 0) {
                filteredGames = filteredGames.filter(game =>
                    filters.genres.some(genre =>
                        game.genre.toLowerCase() === genre.toLowerCase()
                    )
                );
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

            // Filter by awards
            if (filters.hasAwards) {
                filteredGames = filteredGames.filter(game =>
                    game.awards &&
                    (typeof game.awards === 'string'
                        ? game.awards.trim() !== ''
                        : game.awards.length > 0)
                );
            }

            // Filter by minimum rating
            if (filters.minRating !== null) {
                filteredGames = filteredGames.filter(game =>
                    game.rating !== undefined && game.rating >= filters.minRating!
                );
            }

            // Apply sorting
            if (filters.sortBy) {
                filteredGames.sort((a, b) => {
                    let comparison = 0;

                    switch (filters.sortBy) {
                        case 'popularity':
                            // Sort by likes (popularity)
                            comparison = (b.likes || 0) - (a.likes || 0);
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
    getAvailableGenres: (games: Game[]): string[] => {
        const genres = new Set<string>();

        games.forEach(game => {
            if (game.genre && game.genre.trim() !== '') {
                genres.add(game.genre.trim());
            }
        });

        return Array.from(genres).sort();
    }
};

export default searchService;
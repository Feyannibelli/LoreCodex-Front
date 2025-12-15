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
                game.title.toLowerCase().includes(term) ||
                game.description.toLowerCase().includes(term)
            );
        }

        // Apply filters if provided
        if (filters) {
            // Filter by genres
            if (filters.genres.length > 0) {
                filteredGames = filteredGames.filter(game =>
                    filters.genres.some(filterGenre =>
                        game.genres.some(gameGenre =>
                            gameGenre.toLowerCase() === filterGenre.toLowerCase()
                        )
                    )
                );
            }

            // Filter by release date - after
            if (filters.dateFilter.after) {
                const afterDate = new Date(filters.dateFilter.after);
                filteredGames = filteredGames.filter(game =>
                    game.releaseDate ? new Date(game.releaseDate) >= afterDate : false
                );
            }

            // Filter by release date - before
            if (filters.dateFilter.before) {
                const beforeDate = new Date(filters.dateFilter.before);
                filteredGames = filteredGames.filter(game =>
                    game.releaseDate ? new Date(game.releaseDate) <= beforeDate : false
                );
            }

            // Filter by awards
            if (filters.hasAwards) {
                filteredGames = filteredGames.filter(game => (game.awards?.length ?? 0) > 0);
            }

            // Filter by minimum rating
            if (filters.minRating !== null) {
                filteredGames = filteredGames.filter(game =>
                    game.averageRating != null && game.averageRating >= filters.minRating!
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
                            const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
                            const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
                            comparison = dateB - dateA;
                            break;

                        case 'name':
                            // Sort by name alphabetically
                            comparison = a.title.localeCompare(b.title);
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
            if (game.genres && Array.isArray(game.genres)) {
                game.genres.forEach(g => {
                    if (g.trim() !== '') {
                        genres.add(g.trim());
                    }
                });
            }
        });

        return Array.from(genres).sort();
    }
};

export default searchService;

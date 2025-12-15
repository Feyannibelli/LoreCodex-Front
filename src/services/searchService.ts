import { Game } from '../interfaces/Game';
import { FiltersState } from '../components/GameFilters';

const searchService = {
    filterGames: (games: Game[], searchTerm: string, filters?: FiltersState): Game[] => {
        let filteredGames = [...games];

        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            filteredGames = filteredGames.filter(game =>
                game.title.toLowerCase().includes(term) ||
                game.description.toLowerCase().includes(term)
            );
        }

        if (filters) {
            if (filters.genres.length > 0) {
                filteredGames = filteredGames.filter(game => {
                    if (!game.genre || game.genre.trim() === '') {
                        return false;
                    }

                    const gameGenres = game.genre.split(',').map(g => g.trim().toLowerCase());

                    return filters.genres.some(selectedGenre =>
                        gameGenres.some(gameGenre =>
                            gameGenre === selectedGenre.toLowerCase()
                        )
                    );
                });
            }

            if (filters.dateFilter.after) {
                const afterDate = new Date(filters.dateFilter.after);
                filteredGames = filteredGames.filter(game =>
                    game.releaseDate ? new Date(game.releaseDate) >= afterDate : false
                );
            }

            if (filters.dateFilter.before) {
                const beforeDate = new Date(filters.dateFilter.before);
                filteredGames = filteredGames.filter(game =>
                    game.releaseDate ? new Date(game.releaseDate) <= beforeDate : false
                );
            }

            if (filters.minRating !== null && filters.minRating > 0) {
                filteredGames = filteredGames.filter(game => {
                    const rating = game.averageRating || 0;
                    return rating >= filters.minRating!;
                });
            }

            if (filters.sortBy) {
                filteredGames.sort((a, b) => {
                    let comparison = 0;

                    switch (filters.sortBy) {
                        case 'popularity':
                            const aRatingCount = a.ratingCount || 0;
                            const bRatingCount = b.ratingCount || 0;
                            comparison = bRatingCount - aRatingCount;
                            break;

                        case 'releaseDate':
                            comparison = new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
                            break;

                        case 'name':
                            comparison = a.name.localeCompare(b.name);
                            break;
                    }

                    return filters.sortOrder === 'asc' ? -comparison : comparison;
                });
            }
        }

        return filteredGames;
    },

    getAvailableGenres: (games: Game[]): string[] => {
        const genresSet = new Set<string>();

        games.forEach(game => {
            if (game.genre && game.genre.trim() !== '') {
                const gameGenres = game.genre.split(',').map(g => g.trim());
                gameGenres.forEach(genre => {
                    if (genre) {
                        genresSet.add(genre);
                    }
                });
            }
        });

        return Array.from(genresSet).sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
        );
    }
};

export default searchService;

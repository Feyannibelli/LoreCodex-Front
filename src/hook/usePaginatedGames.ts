import { useState, useCallback, useEffect } from 'react';
import { Game } from '../interfaces/Game';
import gameService, { PagedResponse } from '../services/gameService';

export interface UsePaginatedGamesReturn {
    games: Game[];
    pagination: PagedResponse<Game> | null;
    loadPage: (page: number) => Promise<void>;
    page: number;
    loading: boolean;
    error: string | null;
}

export interface PaginationFilters {
    search?: string;
    tag?: string;
    sort?: string;
}

export const usePaginatedGames = (
    apiFunction: (page: number, size: number) => Promise<PagedResponse<Game>> = (p, s) => gameService.getDiscoveryGamesPaginated(p, s),
    filters?: PaginationFilters
): UsePaginatedGamesReturn => {
    const [page, setPage] = useState(0);
    const [games, setGames] = useState<Game[]>([]);
    const [pagination, setPagination] = useState<PagedResponse<Game> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPage = useCallback(async (nextPage: number) => {
        try {
            // Guard against NaN or negative numbers
            if (isNaN(nextPage) || nextPage < 0) {
                console.warn("Attempted to load invalid page:", nextPage);
                // Fallback to 0 if invalid
                nextPage = 0;
            }

            setLoading(true);
            // Default size 12 as requested
            const data = await apiFunction(nextPage, 12);
            setGames(data.content);
            setPagination(data);

            // Ensure we sync with backend page number, defaulting to requested page or 0 if invalid
            const backendPage = typeof data.number === 'number' && !isNaN(data.number) ? data.number : nextPage;
            setPage(backendPage);

            setError(null);
        } catch (err) {
            console.error("Error loading paginated games:", err);
            setError("Failed to load games. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    // Initial load
    useEffect(() => {
        loadPage(0);
    }, [loadPage]);

    // Reset to page 0 when filters change (search, tag, sort)
    useEffect(() => {
        if (filters) {
            loadPage(0);
        }
    }, [filters?.search, filters?.tag, filters?.sort]);

    return { games, pagination, loadPage, page, loading, error };
};

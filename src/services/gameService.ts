import { Game, GameFormData } from '../interfaces/Game';
import api from "../services/api.ts";
import apiAuth from "../services/apiAuth.ts";

export interface PagedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: { empty: boolean; sorted: boolean; unsorted: boolean };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface GameDetailResponse {
    id: number;
    igdbId?: number;
    title: string;
    description: string;
    coverImage: string;
    releaseDate: string | null;
    averageRating: number | null;
    likes: number | null;
    genres: string[];
    developersAndPublishers: string[];
    playerCount: string | null;
    awards?: string[];
    tags?: string[];
}

export interface GameSearchResponse extends GameDetailResponse { }

const adaptBackendToFrontend = (backendGame: GameDetailResponse): Game => {
    return {
        ...backendGame,
        genres: backendGame.genres || [],
        tags: backendGame.tags || [],
        developersAndPublishers: backendGame.developersAndPublishers || [],
        title: backendGame.title || "Untitled",
        coverImage: backendGame.coverImage || "",
    };
};

const adaptFrontendGameToBackend = (frontendGame: GameFormData): any => {
    return {
        title: frontendGame.name,
        description: frontendGame.description,
        coverImage: frontendGame.imageUrl || '',
        releaseDate: frontendGame.releaseDate,
        genre: frontendGame.genre,                              // Singular genre
        genres: frontendGame.genres || [],                      // Plural genres array
        tags: frontendGame.tags || [],                          // Tags array
        developersAndPublishers: frontendGame.developersAndPublishers || [], // Developers/Publishers
        rating: frontendGame.rating,                            // Rating value
        awards: frontendGame.awards ? [frontendGame.awards] : [] // Awards array
    };
};

const gameService = {

    // 1. GET /igdb/top
    getDiscoveryGamesPaginated: async (page: number, pageSize: number, sort: string = 'rating,desc'): Promise<PagedResponse<Game>> => {
        const params = { page, size: pageSize, sort };
        const response = await api.get<PagedResponse<GameDetailResponse>>('/igdb/top', { params });
        return {
            ...response.data,
            content: response.data.content.map(adaptBackendToFrontend)
        };
    },

    // 2. GET /igdb/search
    searchGamesPaginated: async (query: string, page: number, pageSize: number, sort: string = 'relevance,desc'): Promise<PagedResponse<Game>> => {
        const params = { query, page, size: pageSize, sort };
        const response = await api.get<PagedResponse<GameSearchResponse>>('/igdb/search', { params });
        return {
            ...response.data,
            content: response.data.content.map(adaptBackendToFrontend)
        };
    },

    // Search games by title in our database (for mentions, autocomplete, etc.)
    searchGamesByTitle: async (title: string, page: number = 0, size: number = 10): Promise<Game[]> => {
        const params = { title, page, size };
        const response = await api.get<Game[]>('/games/search', { params });
        return response.data;
    },

    // 3. GET /igdb/{igdbId}
    getIGDBGameDetail: async (igdbId: number): Promise<Game> => {
        const response = await api.get<GameDetailResponse>(`/igdb/${igdbId}`);
        return adaptBackendToFrontend(response.data);
    },

    // 4. POST /igdb/import/{igdbId}
    importIGDBGame: async (igdbId: number): Promise<Game> => {
        const response = await apiAuth.post<GameDetailResponse>(`/igdb/import/${igdbId}`);
        return adaptBackendToFrontend(response.data);
    },

    // GET /games/allGames - Primary endpoint for all game browsing
    // Supports: page, size, sort, tag (optional), title (optional)
    getLibraryGamesPaginated: async (page: number, pageSize: number, sort: string = 'rating,desc', tag?: string, title?: string): Promise<PagedResponse<Game>> => {
        const params: any = { page, size: pageSize, sort };
        if (tag) params.tag = tag;
        if (title) params.title = title;

        const response = await api.get<PagedResponse<GameDetailResponse>>('/games/allGames', { params });
        return {
            ...response.data,
            content: response.data.content.map(adaptBackendToFrontend)
        };
    },

    // 6. POST /games/{id}/like
    likeGame: async (id: number): Promise<Game> => {
        const response = await apiAuth.post<GameDetailResponse>(`/games/${id}/like`);
        return adaptBackendToFrontend(response.data);
    },

    // 7. POST /games/{id}/rate
    rateGame: async (id: number, rating: number): Promise<Game> => {
        const response = await apiAuth.post<GameDetailResponse>(`/games/${id}/rate?rating=${rating}`);
        return adaptBackendToFrontend(response.data);
    },

    // --- Legacy / Internal Endpoints (CRUD) ---

    // Get Library Game by DB ID
    getGameById: async (id: number): Promise<Game> => {
        const response = await api.get<GameDetailResponse>(`/games/${id}`);
        return adaptBackendToFrontend(response.data);
    },

    createGame: async (gameData: GameFormData): Promise<Game> => {
        const backendGame = adaptFrontendGameToBackend(gameData);
        const response = await apiAuth.post<GameDetailResponse>(`/games`, backendGame);
        return adaptBackendToFrontend(response.data);
    },

    updateGame: async (id: number, gameData: GameFormData): Promise<Game> => {
        const backendGame = adaptFrontendGameToBackend(gameData);
        const response = await apiAuth.put<GameDetailResponse>(`/games/${id}`, backendGame);
        return adaptBackendToFrontend(response.data);
    },

    deleteGame: async (id: number): Promise<void> => {
        await apiAuth.delete(`/games/${id}`);
    },

    getAverageRating: async (gameId: number): Promise<number> => {
        const response = await api.get(`/rating/${gameId}/average-rating`);
        return response.data;
    },

    // Unified Smart Flow: Using Internal /games Endpoints Only
    getGames: async (params: { page: number; size: number; sort: string; search?: string; tag?: string }): Promise<PagedResponse<Game>> => {
        const { page, size, sort, search, tag } = params;

        // Use /games/allGames for ALL scenarios
        // This endpoint supports: page, size, sort, tag (optional), title (optional)
        const queryParams: any = { page, size, sort };

        // Add tag filter if present
        if (tag?.trim()) {
            queryParams.tag = tag;
        }

        // Add title search if present
        if (search?.trim()) {
            queryParams.title = search;
        }

        const response = await api.get<PagedResponse<GameDetailResponse>>('/games/allGames', { params: queryParams });
        return {
            ...response.data,
            content: response.data.content.map(adaptBackendToFrontend)
        };
    },

    adaptBackendToFrontend
};

export default gameService;


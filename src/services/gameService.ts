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
    title: string;
    description: string;
    coverImage: string;
    releaseDate: string;
    rating: number;
    likes: number;
    ratingCount?: number; // NUEVO
    genres: string[];
    awards: string[];
}

interface BackendGameRequest {
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

const adaptBackendGameToFrontend = (backendGame: BackendGame): Game => {
    // Convertir array de géneros a string separado por comas
    const genreString = backendGame.genres?.length > 0
        ? backendGame.genres.join(', ')
        : '';

    return {
        id: backendGame.id,
        name: backendGame.title,
        description: backendGame.description,
        genre: genreString,
        releaseDate: backendGame.releaseDate,
        imageUrl: backendGame.coverImage,
        averageRating: backendGame.rating || 0,
        likes: backendGame.likes || 0,
        ratingCount: backendGame.ratingCount || 0 // NUEVO
    };
};

const adaptFrontendGameToBackend = (frontendGame: GameFormData): BackendGameRequest => {
    // Procesar awards como array
    let awardsArray: string[] = [];
    if (frontendGame.awards) {
        awardsArray = [frontendGame.awards];
    }

    // Procesar genres como array - dividir por comas si es necesario
    let genresArray: string[] = [];
    if (frontendGame.genre) {
        // Si contiene comas, dividir; sino, usar como un solo género
        genresArray = frontendGame.genre.includes(',')
            ? frontendGame.genre.split(',').map(g => g.trim())
            : [frontendGame.genre.trim()];
    }

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
    // Obtener todos los juegos
    getAllGames: async (): Promise<Game[]> => {
        try {
            const response = await api.get(`/games/allGames`);
            return response.data.map(adaptBackendGameToFrontend);
        } catch (error) {
            console.error('Error fetching games:', error);
            return [];
        }
    },

    // Obtener un juego por ID
    getGameById: async (id: number): Promise<Game> => {
        try {
            const response = await api.get(`/games/${id}`);
            return adaptBackendGameToFrontend(response.data);
        } catch (error) {
            console.error(`Error fetching game with id ${id}:`, error);
            throw error;
        }
    },

    // Buscar juegos por nombre
    searchGamesByName: async (name: string): Promise<Game[]> => {
        try {
            const response = await apiAuth.get(`/games/search?title=${name}`);
            return response.data.map(adaptBackendGameToFrontend);
        } catch (error) {
            console.error('Error searching games by name:', error);
            return [];
        }
    },

    // Crear un nuevo juego (solo admin)
    createGame: async (gameData: GameFormData): Promise<Game> => {
        const backendGame = adaptFrontendGameToBackend(gameData);
        const response = await apiAuth.post<GameDetailResponse>(`/games`, backendGame);
        return adaptBackendToFrontend(response.data);
    },

    // Actualizar un juego existente (solo admin)
    updateGame: async (id: number, gameData: GameFormData): Promise<Game> => {
        const backendGame = adaptFrontendGameToBackend(gameData);
        const response = await apiAuth.put<GameDetailResponse>(`/games/${id}`, backendGame);
        return adaptBackendToFrontend(response.data);
    },

    // Eliminar un juego (solo admin)
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

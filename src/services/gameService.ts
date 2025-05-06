import axios from 'axios';
import { Game, GameFormData } from '../interfaces/Game';
import api from "@/services/api.ts";

const API_URL = 'http://localhost:8081/api';

// Interfaces para adaptar el backend al frontend
interface BackendGame {
    id: number;
    title: string;
    description: string;
    coverImage: string;
    releaseDate: string;
    rating: number;
    likes: number;
    genres: string[];
    awards: string[];
}

interface BackendGameRequest {
    title: string;
    description: string;
    coverImage: string;
    releaseDate: string;
    genres: string[];
    awards: string[];
}

const adaptBackendGameToFrontend = (backendGame: BackendGame): Game => {
    return {
        id: backendGame.id,
        name: backendGame.title,
        description: backendGame.description,
        genre: backendGame.genres?.length > 0 ? backendGame.genres[0] : '',
        releaseDate: backendGame.releaseDate,
        imageUrl: backendGame.coverImage,
        //awards: backendGame.awards.join(', '),
        rating: backendGame.rating,
        likes: backendGame.likes
    };
};

const adaptFrontendGameToBackend = (frontendGame: GameFormData): BackendGameRequest => {
    // Procesar awards correctamente como array
    let awardsArray: string[] = [];
    if (frontendGame.awards) {
        awardsArray = [frontendGame.awards];
    }

    // Procesar genres como array
    let genresArray: string[] = [];
    if (frontendGame.genre) {
        genresArray = [frontendGame.genre];
    }

    return {
        title: frontendGame.name,
        description: frontendGame.description,
        coverImage: frontendGame.imageUrl || '',
        releaseDate: frontendGame.releaseDate,
        genres: genresArray,
        awards: awardsArray
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
            // Don't fail the entire app for non-critical errors
            return [];
        }
    },

    // Obtener un juego por ID
    getGameById: async (id: number): Promise<Game> => {
        try {
            const response = await axios.get(`${API_URL}/games/${id}`);
            return adaptBackendGameToFrontend(response.data);
        } catch (error) {
            console.error(`Error fetching game with id ${id}:`, error);
            throw error;
        }
    },

    // Buscar juegos por nombre
    searchGamesByName: async (name: string): Promise<Game[]> => {
        try {
            const response = await axios.get(`${API_URL}/games?title=${name}`);
            return response.data.map(adaptBackendGameToFrontend);
        } catch (error) {
            console.error('Error searching games:', error);
            return [];
        }
    },

    // Crear un nuevo juego (solo admin)
    createGame: async (gameData: GameFormData): Promise<Game> => {
        try {
            const backendGame = adaptFrontendGameToBackend(gameData);
            const response = await axios.post(`${API_URL}/games`, backendGame);
            return adaptBackendGameToFrontend(response.data);
        } catch (error) {
            console.error('Error creating game:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('API response error:', error.response.data);
            }
            throw error;
        }
    },

    // Actualizar un juego existente (solo admin)
    updateGame: async (id: number, gameData: GameFormData): Promise<Game> => {
        try {
            const backendGame = adaptFrontendGameToBackend(gameData);
            const response = await axios.put(`${API_URL}/games/${id}`, backendGame);
            return adaptBackendGameToFrontend(response.data);
        } catch (error) {
            console.error(`Error updating game with id ${id}:`, error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('API response error:', error.response.data);
            }
            throw error;
        }
    },

    // Eliminar un juego (solo admin)
    deleteGame: async (id: number): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/games/${id}`);
        } catch (error) {
            console.error(`Error deleting game with id ${id}:`, error);
            throw error;
        }
    },

    // Dar like a un juego
    likeGame: async (id: number): Promise<Game> => {
        try {
            const response = await axios.post(`${API_URL}/games/${id}/like`);
            return adaptBackendGameToFrontend(response.data);
        } catch (error) {
            console.error(`Error liking game with id ${id}:`, error);
            // Check if it's an auth error (401/403)
            if (axios.isAxiosError(error) && error.response &&
                (error.response.status === 401 || error.response.status === 403)) {
                throw new Error("Authentication required to like this game");
            }
            throw error;
        }
    },

    // Calificar un juego
    rateGame: async (id: number, rating: number): Promise<Game> => {
        try {
            const response = await axios.post(`${API_URL}/games/${id}/rate?rating=${rating}`);
            return adaptBackendGameToFrontend(response.data);
        } catch (error) {
            console.error(`Error rating game with id ${id}:`, error);
            // Check if it's an auth error (401/403)
            if (axios.isAxiosError(error) && error.response &&
                (error.response.status === 401 || error.response.status === 403)) {
                throw new Error("Authentication required to rate this game");
            }
            throw error;
        }
    },

    getAverageRating: async (gameId: number): Promise<number> => {
        const response = await axios.get(`${API_URL}/games/${gameId}/average-rating`);
        return response.data;
    }
};

export default gameService;
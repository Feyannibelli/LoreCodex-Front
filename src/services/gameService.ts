import axios from 'axios';
import { Game, GameFormData } from '../interfaces/Game';

const API_URL = 'http://localhost:8080/api';

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
        awards: backendGame.awards, // Ya no necesitamos join aquí si el backend devuelve un string
        rating: backendGame.rating,
        likes: backendGame.likes
    };
};

const adaptFrontendGameToBackend = (frontendGame: GameFormData): BackendGameRequest => {
    // Determinar cómo procesar el campo awards
    let awardsString = '';
    if (frontendGame.awards) {
        // Si awards es una cadena, usarla directamente
        if (typeof frontendGame.awards === 'string') {
            awardsString = frontendGame.awards.trim();
        }
        // Si awards es un array, convertirlo a string
        else if (Array.isArray(frontendGame.awards)) {
            awardsString = frontendGame.awards.join(', ');
        }
    }

    // Asegurar que genres siempre sea un array
    let genresArray: string[] = [];
    if (frontendGame.genre) {
        genresArray = [frontendGame.genre.trim()];
    }

    return {
        title: frontendGame.name,
        description: frontendGame.description,
        coverImage: frontendGame.imageUrl || '',
        releaseDate: frontendGame.releaseDate,
        genres: genresArray,
        awards: awardsString // Enviar como string en lugar de array
    };
};

const gameService = {
    // Obtener todos los juegos
    getAllGames: async (): Promise<Game[]> => {
        try {
            const response = await axios.get(`${API_URL}/games`);
            return response.data.map(adaptBackendGameToFrontend);
        } catch (error) {
            console.error('Error fetching games:', error);
            throw error;
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
            // Suponiendo que el backend tiene un endpoint para buscar juegos por título
            const response = await axios.get(`${API_URL}/games?title=${name}`);
            return response.data.map(adaptBackendGameToFrontend);
        } catch (error) {
            console.error('Error searching games:', error);
            throw error;
        }
    },

    // Crear un nuevo juego (solo admin)
    createGame: async (gameData: GameFormData): Promise<Game> => {
        try {
            const backendGame = adaptFrontendGameToBackend(gameData);
            console.log('Sending to backend:', JSON.stringify(backendGame)); // Log para debugging
            const response = await axios.post(`${API_URL}/games`, backendGame);
            return adaptBackendGameToFrontend(response.data);
        } catch (error) {
            console.error('Error creating game:', error);
            // Capturar y mostrar el error específico de la API
            if (axios.isAxiosError(error) && error.response) {
                console.error('API response error:', error.response.data);
                console.error('Status code:', error.response.status);
            }
            throw error;
        }
    },

    // Actualizar un juego existente (solo admin)
    updateGame: async (id: number, gameData: GameFormData): Promise<Game> => {
        try {
            const backendGame = adaptFrontendGameToBackend(gameData);
            console.log('Updating game, sending:', JSON.stringify(backendGame)); // Log para debugging
            const response = await axios.put(`${API_URL}/games/${id}`, backendGame);
            return adaptBackendGameToFrontend(response.data);
        } catch (error) {
            console.error(`Error updating game with id ${id}:`, error);
            // Capturar y mostrar el error específico de la API
            if (axios.isAxiosError(error) && error.response) {
                console.error('API response error:', error.response.data);
                console.error('Status code:', error.response.status);
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
            throw error;
        }
    }
};

export default gameService;
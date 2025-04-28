// src/services/gameService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080';

export interface Game {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    genres: string[];
    releaseDate: string;
    awards: string[];
    likes: number;
    rating: number;
}

export interface GameForm {
    title: string;
    description: string;
    imageFile?: File;
    imageUrl?: string;
    genres: string[];
    releaseDate: string;
    awards: string[];
}

const gameService = {
    // Obtener todos los juegos
    getAllGames: async (): Promise<Game[]> => {
        try {
            const response = await axios.get(`${API_URL}/games`);
            return response.data;
        } catch (error) {
            console.error('Error fetching games:', error);
            throw error;
        }
    },

    // Obtener un juego por ID
    getGameById: async (id: number): Promise<Game> => {
        try {
            const response = await axios.get(`${API_URL}/games/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching game with id ${id}:`, error);
            throw error;
        }
    },

    // Obtener juegos recién añadidos (ordenados por fecha de lanzamiento)
    getRecentlyAddedGames: async (limit?: number): Promise<Game[]> => {
        try {
            const response = await axios.get(`${API_URL}/games/recent${limit ? `?limit=${limit}` : ''}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching recently added games:', error);
            throw error;
        }
    },

    // Obtener juegos populares (ordenados por likes)
    getPopularGames: async (limit?: number): Promise<Game[]> => {
        try {
            const response = await axios.get(`${API_URL}/games/popular${limit ? `?limit=${limit}` : ''}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching popular games:', error);
            throw error;
        }
    },

    // Crear un nuevo juego (solo admin)
    createGame: async (gameData: GameForm): Promise<Game> => {
        try {
            // Si hay archivo de imagen, usar FormData
            if (gameData.imageFile) {
                const formData = new FormData();
                formData.append('title', gameData.title);
                formData.append('description', gameData.description);
                formData.append('image', gameData.imageFile);
                formData.append('genres', JSON.stringify(gameData.genres));
                formData.append('releaseDate', gameData.releaseDate);
                formData.append('awards', JSON.stringify(gameData.awards));

                const response = await axios.post(`${API_URL}/admin/games`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return response.data;
            } else {
                // Si no hay archivo, enviar como JSON normal
                const response = await axios.post(`${API_URL}/admin/games`, gameData);
                return response.data;
            }
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    },

    // Actualizar un juego existente (solo admin)
    updateGame: async (id: number, gameData: GameForm): Promise<Game> => {
        try {
            // Si hay archivo de imagen, usar FormData
            if (gameData.imageFile) {
                const formData = new FormData();
                formData.append('title', gameData.title);
                formData.append('description', gameData.description);
                formData.append('image', gameData.imageFile);
                formData.append('genres', JSON.stringify(gameData.genres));
                formData.append('releaseDate', gameData.releaseDate);
                formData.append('awards', JSON.stringify(gameData.awards));

                const response = await axios.put(`${API_URL}/admin/games/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return response.data;
            } else {
                // Si no hay archivo, enviar como JSON normal
                const response = await axios.put(`${API_URL}/admin/games/${id}`, gameData);
                return response.data;
            }
        } catch (error) {
            console.error(`Error updating game with id ${id}:`, error);
            throw error;
        }
    },

    // Eliminar un juego (solo admin)
    deleteGame: async (id: number): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/admin/games/${id}`);
        } catch (error) {
            console.error(`Error deleting game with id ${id}:`, error);
            throw error;
        }
    },

    // Dar like a un juego
    likeGame: async (id: number): Promise<Game> => {
        try {
            const response = await axios.post(`${API_URL}/games/${id}/like`);
            return response.data;
        } catch (error) {
            console.error(`Error liking game with id ${id}:`, error);
            throw error;
        }
    },

    // Calificar un juego
    rateGame: async (id: number, rating: number): Promise<Game> => {
        try {
            const response = await axios.post(`${API_URL}/games/${id}/rate`, { rating });
            return response.data;
        } catch (error) {
            console.error(`Error rating game with id ${id}:`, error);
            throw error;
        }
    }
};

export default gameService;
// src/services/gameService.ts
import axios from 'axios';
import { Game, GameFormData } from '../interfaces/Game';

const API_URL = 'http://localhost:8080';

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

    // Buscar juegos por nombre
    searchGamesByName: async (name: string): Promise<Game[]> => {
        try {
            const response = await axios.get(`${API_URL}/games/search?name=${name}`);
            return response.data;
        } catch (error) {
            console.error('Error searching games:', error);
            throw error;
        }
    },

    // Crear un nuevo juego (solo admin)
    createGame: async (gameData: GameFormData): Promise<Game> => {
        try {
            const response = await axios.post(`${API_URL}/admin/games`, gameData);
            return response.data;
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    },

    // Actualizar un juego existente (solo admin)
    updateGame: async (id: number, gameData: GameFormData): Promise<Game> => {
        try {
            const response = await axios.put(`${API_URL}/admin/games/${id}`, gameData);
            return response.data;
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
    }
};

export default gameService;
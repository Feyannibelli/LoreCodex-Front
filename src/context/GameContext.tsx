// src/context/GameContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import gameService, { Game } from '../services/gameService';

interface GameContextType {
    games: Game[];
    recentGames: Game[];
    popularGames: Game[];
    loading: boolean;
    error: string | null;
    refreshGames: () => Promise<void>;
    refreshRecentGames: () => Promise<void>;
    refreshPopularGames: () => Promise<void>;
}

const GameContext = createContext<GameContextType>({
    games: [],
    recentGames: [],
    popularGames: [],
    loading: true,
    error: null,
    refreshGames: async () => {},
    refreshRecentGames: async () => {},
    refreshPopularGames: async () => {},
});

export const useGames = () => useContext(GameContext);

interface GameProviderProps {
    children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [recentGames, setRecentGames] = useState<Game[]>([]);
    const [popularGames, setPopularGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refreshGames = async () => {
        try {
            setLoading(true);
            const data = await gameService.getAllGames();
            setGames(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching games:', err);
            setError('Error al cargar los juegos');
        } finally {
            setLoading(false);
        }
    };

    const refreshRecentGames = async (limit?: number) => {
        try {
            const data = await gameService.getRecentlyAddedGames(limit);
            setRecentGames(data);
        } catch (err) {
            console.error('Error fetching recent games:', err);
        }
    };

    const refreshPopularGames = async (limit?: number) => {
        try {
            const data = await gameService.getPopularGames(limit);
            setPopularGames(data);
        } catch (err) {
            console.error('Error fetching popular games:', err);
        }
    };

    // Cargar datos iniciales
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);

                // Cargar todos los juegos
                await refreshGames();

                // Cargar juegos recientes (10 por defecto)
                await refreshRecentGames(10);

                // Cargar juegos populares (8 por defecto)
                await refreshPopularGames(8);

                setError(null);
            } catch (err) {
                console.error('Error fetching initial game data:', err);
                setError('Error al cargar los datos de juegos');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    return (
        <GameContext.Provider
            value={{
                games,
                recentGames,
                popularGames,
                loading,
                error,
                refreshGames,
                refreshRecentGames,
                refreshPopularGames
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
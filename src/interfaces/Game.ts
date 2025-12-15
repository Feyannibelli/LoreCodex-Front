// src/interfaces/Game.ts
export interface Game {
    id: number;
    name: string;
    description: string;
    genre: string;
    releaseDate: string;
    imageUrl?: string;
    awards?: string;
    averageRating?: number;
    likes?: number;
    ratingCount?: number; // NUEVO: Cantidad de ratings que tiene el juego
}

export interface GameFormData {
    name: string;
    description: string;
    genre: string;
    releaseDate: string;
    imageUrl?: string;
    awards?: string;
}

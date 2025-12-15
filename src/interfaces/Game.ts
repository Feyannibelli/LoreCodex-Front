export interface Game {
    id: number;
    title: string;
    description: string;
    genres: string;
    releaseDate: string | null;
    coverImage: string;
    awards?: string;
    averageRating: number | null;
    likes: number | null;
    ratingCount?: number; // NUEVO: Cantidad de ratings que tiene el juego
    playerCount: string | null;
    tags: string[];
    igdbId?: number;
    developersAndPublishers: string[];
    createdAt?: string;
}

export interface GameFormData {
    name: string;              // Maps to title
    description: string;
    genre: string;             // Singular genre (for backward compatibility)
    genres: string[];          // Plural genres array (backend expects both)
    tags: string[];            // Tags array
    developersAndPublishers: string[]; // Developers and publishers array
    releaseDate: string;
    imageUrl?: string;         // Maps to coverImage
    awards?: string;           // Single award string (converted to array)
    rating?: number;           // Rating value
}
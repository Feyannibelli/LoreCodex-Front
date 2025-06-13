export interface Review {
    id: number;
    gameId: number;
    userId: number;
    username: string;
    content: string;
    rating: number;
    likes: number;
    dislikes: number;
    createdAt: string;
    updatedAt: string;
    userHasLiked?: boolean;
    userHasDisliked?: boolean;
    gameTitle?: string;
}

export interface ReviewFormData {
    content: string;
    rating: number;
}
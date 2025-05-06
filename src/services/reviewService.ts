import apiAuth from './apiAuth.ts';
import { Review, ReviewFormData } from '../interfaces/Review';
import api from "@/services/api.ts";

const reviewService = {
    getGameReviews: async (gameId: number): Promise<Review[]> => {
        const response = await api.get(`/games/reviews/game/${gameId}`);
        console.log("API response for reviews", response.data)
        return response.data;
    },

    createReview: async (gameId: number, reviewData: ReviewFormData): Promise<Review> => {
        const response = await apiAuth.post(`/games/reviews/game/${gameId}/createReview`, reviewData);
        return response.data;
    },

    updateReview: async (reviewId: number, reviewData: ReviewFormData): Promise<Review> => {
        const response = await apiAuth.put(`/games/reviews/${reviewId}`, reviewData);
        return response.data;
    },

    deleteReview: async (reviewId: number): Promise<void> => {
        await apiAuth.delete(`/games/reviews/${reviewId}`);
    },

    likeReview: async (reviewId: number): Promise<Review> => {
        const response = await apiAuth.post(`/games/reviews/${reviewId}/like`);
        return response.data;
    },

    dislikeReview: async (reviewId: number): Promise<Review> => {
        const response = await apiAuth.post(`/games/reviews/${reviewId}/dislike`);
        return response.data;
    },

    removeReaction: async (reviewId: number): Promise<Review> => {
        const response = await apiAuth.delete(`/reviews/${reviewId}/reaction`);
        return response.data;
    }
};

export default reviewService;

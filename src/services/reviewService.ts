import api from './api';
import { Review, ReviewFormData } from '../interfaces/Review';

const reviewService = {
    getGameReviews: async (gameId: number): Promise<Review[]> => {
        const response = await api.get(`/games/${gameId}/reviews`);
        return response.data;
    },

    createReview: async (gameId: number, reviewData: ReviewFormData): Promise<Review> => {
        const response = await api.post(`/games/${gameId}/reviews`, reviewData);
        return response.data;
    },

    updateReview: async (reviewId: number, reviewData: ReviewFormData): Promise<Review> => {
        const response = await api.put(`/reviews/${reviewId}`, reviewData);
        return response.data;
    },

    deleteReview: async (reviewId: number): Promise<void> => {
        await api.delete(`/reviews/${reviewId}`);
    },

    likeReview: async (reviewId: number): Promise<Review> => {
        const response = await api.post(`/reviews/${reviewId}/like`);
        return response.data;
    },

    dislikeReview: async (reviewId: number): Promise<Review> => {
        const response = await api.post(`/reviews/${reviewId}/dislike`);
        return response.data;
    },

    removeReaction: async (reviewId: number): Promise<Review> => {
        const response = await api.delete(`/reviews/${reviewId}/reaction`);
        return response.data;
    }
};

export default reviewService;

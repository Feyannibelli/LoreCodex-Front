// src/services/reviewService.ts
import axios from 'axios';
import { Review, ReviewFormData } from '../interfaces/Review';

const API_URL = 'http://localhost:8081/api';

const reviewService = {
    // Get all reviews for a game
    getGameReviews: async (gameId: number): Promise<Review[]> => {
        try {
            const response = await axios.get(`${API_URL}/games/${gameId}/reviews`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reviews for game ${gameId}:`, error);
            throw error;
        }
    },

    // Create a new review
    createReview: async (gameId: number, reviewData: ReviewFormData): Promise<Review> => {
        try {
            const response = await axios.post(`${API_URL}/games/${gameId}/reviews`, reviewData);
            return response.data;
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    },

    // Update an existing review
    updateReview: async (reviewId: number, reviewData: ReviewFormData): Promise<Review> => {
        try {
            const response = await axios.put(`${API_URL}/reviews/${reviewId}`, reviewData);
            return response.data;
        } catch (error) {
            console.error(`Error updating review ${reviewId}:`, error);
            throw error;
        }
    },

    // Delete a review
    deleteReview: async (reviewId: number): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/reviews/${reviewId}`);
        } catch (error) {
            console.error(`Error deleting review ${reviewId}:`, error);
            throw error;
        }
    },

    // Like a review
    likeReview: async (reviewId: number): Promise<Review> => {
        try {
            const response = await axios.post(`${API_URL}/reviews/${reviewId}/like`);
            return response.data;
        } catch (error) {
            console.error(`Error liking review ${reviewId}:`, error);
            throw error;
        }
    },

    // Dislike a review
    dislikeReview: async (reviewId: number): Promise<Review> => {
        try {
            const response = await axios.post(`${API_URL}/reviews/${reviewId}/dislike`);
            return response.data;
        } catch (error) {
            console.error(`Error disliking review ${reviewId}:`, error);
            throw error;
        }
    },

    // Remove like/dislike from a review
    removeReaction: async (reviewId: number): Promise<Review> => {
        try {
            const response = await axios.delete(`${API_URL}/reviews/${reviewId}/reaction`);
            return response.data;
        } catch (error) {
            console.error(`Error removing reaction from review ${reviewId}:`, error);
            throw error;
        }
    }
};

export default reviewService;
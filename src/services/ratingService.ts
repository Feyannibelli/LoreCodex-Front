// src/services/ratingService.ts
import api from "./api";
import apiAuth from "./apiAuth";

const ratingService = {
    setRating: async (gameId: number, rating: number) => {
        return apiAuth.post(`/games/rating/setRating/${gameId}`, { rating });
    },

    getMyRating: async (gameId: number) => {
        return apiAuth.get(`/games/rating/my/${gameId}`);
    },

    getAllRatingsForGame: async (gameId: number) => {
        return api.get(`/games/rating/all/game/${gameId}`);
    },

    getAllMyRatings: async () => {
        return api.get(`/games/rating/my`);
    },

    deleteMyRating: async (gameId: number) => {
        return apiAuth.delete(`/games/rating/delete/${gameId}`);
    },

    getAverageRating: async (gameId: number) => {
        const response = await api.get(`/games/rating/average-rating/${gameId}`);
        return response.data;
    }
};

export default ratingService;

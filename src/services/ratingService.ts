import api from "./api";
import apiAuth from "./apiAuth";

export interface UserRatingResponse {
    id: number;
    userId: number;
    gameId: number;
    rating: number;
}

export interface RatingSummaryDto {
    average: number;
    mine: number | null;
}

// El body que envías al back
export interface RatingRequest {
    rating: number;
}

const ratingService = {
    /**
     * Guarda o actualiza el rating de un usuario para un juego
     */
    async setRating(gameId: number, rating: number): Promise<UserRatingResponse> {
        const body: RatingRequest = { rating };
        const res = await apiAuth.post<UserRatingResponse>(`/rating/${gameId}`, body);
        return res.data;
    },

    /**
     * Trae tu rating para un juego (o 204 No Content si no votaste)
     */
    async getMyRatingForGame(gameId: number): Promise<number | null> {
        try {
            const res = await api.get<UserRatingResponse>(`/rating/my/${gameId}`);
            return res.data.rating;
        } catch (e: any) {
            if (e.response?.status === 204) return null;
            throw e;
        }
    },

    /**
     * Trae el promedio de todos los ratings para un juego
     */
    async getAverageRating(gameId: number): Promise<number> {
        const res = await api.get<number>(`/rating/${gameId}/average-rating`);
        return res.data;
    },

    /**
     * Trae { average, mine } en un solo request
     */
    async getRatingSummary(gameId: number): Promise<RatingSummaryDto> {
        const res = await apiAuth.get<RatingSummaryDto>(`/rating/${gameId}/rating-summary`);
        return res.data;
    },
};

export default ratingService;


/*const ratingService = {
    setRating: async (gameId: number, rating: number) => {
        return apiAuth.post(`/rating/setRating/${gameId}`, { rating });
    },

    getMyRating: async (gameId: number) => {
        return apiAuth.get(`/rating/my/${gameId}`);
    },

    getAllRatingsForGame: async (gameId: number) => {
        return api.get(`/rating/all/game/${gameId}`);
    },

    getAllMyRatings: async () => {
        return api.get(`/rating/my`);
    },

    deleteMyRating: async (gameId: number) => {
        return apiAuth.delete(`/rating/delete/${gameId}`);
    },

    getAverageRating: async (gameId: number) => {
        const response = await api.get(`/rating/average-rating/${gameId}`);
        return response.data;
    }
};

export default ratingService;*/

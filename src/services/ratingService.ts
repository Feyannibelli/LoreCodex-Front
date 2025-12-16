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
    mine: number;
    count: number; // Cantidad total de ratings - ya no es opcional
}

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
    async getMyRatingForGame(gameId: number): Promise<UserRatingResponse | null> {
        try {
            const res = await apiAuth.get<UserRatingResponse>(`/rating/my/${gameId}`);
            return res.data;
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
     * Trae { average, mine, count } en un solo request
     * ACTUALIZADO: Ahora incluye count (cantidad de ratings)
     */
    async getRatingSummary(gameId: number): Promise<RatingSummaryDto> {
        const res = await apiAuth.get<RatingSummaryDto>(`/rating/${gameId}/rating-summary`);
        return res.data;
    },

    /**
     * Borra tu rating para un juego
     */
    async deleteRating(gameId: number): Promise<void> {
        await apiAuth.delete(`/rating/delete/${gameId}`);
    },
};

export default ratingService;

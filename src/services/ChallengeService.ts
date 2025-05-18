import { API_URL } from './api';
import apiAuth from './apiAuth';

// Types for Challenge API
export interface ChallengeRequest {
    title: string;
    description?: string;
    gameId: number;
}

export interface ChallengeDifficultyRequest {
    difficultyLevel: number;
}

export interface ChallengeResponse {
    id: number;
    title: string;
    description: string;
    creatorId: number;
    creatorUsername: string;
    gameId: number;
    gameTitle: string;
    gameCoverImage: string;
    createdAt: string;
    participantCount: number;
    completionCount: number;
    averageDifficulty: number;
    userParticipating: boolean;
    userCompleted: boolean;
    userDifficultyRating: number | null;
}

export interface ChallengeParticipationResponse {
    id: number;
    userId: number;
    username: string;
    challengeId: number;
    challengeTitle: string;
    joinedAt: string;
    completed: boolean;
    completedAt: string | null;
}

// Challenge Difficulty Level enum
export enum ChallengeDifficultyLevel {
    VeryEasy = 1,
    Easy = 2,
    Medium = 3,
    Hard = 4,
    VeryHard = 5,
    Extreme = 6
}

/**
 * Service for interacting with Challenge-related endpoints
 */
class ChallengeService {
    // Get all challenges
    async getAllChallenges(): Promise<ChallengeResponse[]> {
        const response = await apiAuth.get<ChallengeResponse[]>(`challenges`);
        return response.data;
    }

    // Get challenge by ID
    async getChallengeById(id: number): Promise<ChallengeResponse> {
        const response = await apiAuth.get<ChallengeResponse>(`challenges/${id}`);
        return response.data;
    }

    // Get challenges by game
    async getChallengesByGame(gameId: number): Promise<ChallengeResponse[]> {
        const response = await apiAuth.get<ChallengeResponse[]>(`challenges/game/${gameId}`);
        return response.data;
    }

    // Get challenges created by current user (requires auth)
    async getMyChallenges(): Promise<ChallengeResponse[]> {
        const response = await apiAuth.get<ChallengeResponse[]>(`challenges/my-created`);
        return response.data;
    }

    // Get challenges where current user is participating (requires auth)
    async getMyParticipatedChallenges(): Promise<ChallengeParticipationResponse[]> {
        const response = await apiAuth.get<ChallengeParticipationResponse[]>(`challenges/my-participated`);
        return response.data;
    }

    // Create a new challenge (requires auth)
    async createChallenge(challenge: ChallengeRequest): Promise<ChallengeResponse> {
        const response = await apiAuth.post<ChallengeResponse>(`challenges`, challenge);
        return response.data;
    }

    // Update a challenge (requires auth)
    async updateChallenge(id: number, challenge: ChallengeRequest): Promise<ChallengeResponse> {
        const response = await apiAuth.put<ChallengeResponse>(`challenges/${id}`, challenge);
        return response.data;
    }

    // Delete a challenge (requires auth)
    async deleteChallenge(id: number): Promise<void> {
        await apiAuth.delete(`challenges/${id}`);
    }

    // Join a challenge (requires auth)
    async joinChallenge(id: number): Promise<ChallengeParticipationResponse> {
        const response = await apiAuth.post<ChallengeParticipationResponse>(`challenges/${id}/join`, {});
        return response.data;
    }

    // Complete a challenge (requires auth)
    async completeChallenge(id: number): Promise<ChallengeParticipationResponse> {
        const response = await apiAuth.post<ChallengeParticipationResponse>(`challenges/${id}/complete`, {});
        return response.data;
    }

    // Leave a challenge (requires auth)
    async leaveChallenge(id: number): Promise<void> {
        await apiAuth.delete(`challenges/${id}/leave`);
    }

    // Rate challenge difficulty (requires auth)
    async rateDifficulty(id: number, difficultyLevel: number): Promise<void> {
        await apiAuth.post(
            `challenges/${id}/rate-difficulty`,
            { difficultyLevel } as ChallengeDifficultyRequest
        );
    }

    // Get participants of a challenge
    async getChallengeParticipants(id: number): Promise<ChallengeParticipationResponse[]> {
        const response = await apiAuth.get<ChallengeParticipationResponse[]>(`challenges/${id}/participants`);
        return response.data;
    }

    // Get average difficulty of a challenge
    async getAverageDifficulty(id: number): Promise<number> {
        const response = await apiAuth.get<number>(`challenges/${id}/average-difficulty`);
        return response.data;
    }

    // Helper function to get difficulty level text
    getDifficultyLevelText(level: number | null): string {
        if (level === null) return 'No calificado';

        switch (level) {
            case ChallengeDifficultyLevel.VeryEasy:
                return 'Muy Fácil';
            case ChallengeDifficultyLevel.Easy:
                return 'Fácil';
            case ChallengeDifficultyLevel.Medium:
                return 'Medio';
            case ChallengeDifficultyLevel.Hard:
                return 'Difícil';
            case ChallengeDifficultyLevel.VeryHard:
                return 'Muy Difícil';
            case ChallengeDifficultyLevel.Extreme:
                return 'Extremo';
            default:
                return 'Desconocido';
        }
    }
}

export default new ChallengeService();
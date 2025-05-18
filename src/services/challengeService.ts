import { Challenge, ChallengeFormData } from '../interfaces/Challenge';
import apiAuth from './apiAuth';
import api from './api';

// Interface for backend Challenge format
interface BackendChallenge {
    id: number;
    title: string;
    description: string;
    creatorId: number;
    creatorName: string;
    gameId: number;
    gameName: string;
    gameCoverImage: string;
    difficultyRating: number;
    tasks: {
        id: number;
        description: string;
        isCompleted?: boolean;
    }[];
    completionsCount: number;
    participantsCount: number;
    mediaItems?: {
        type: 'image' | 'video';
        url: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

// Interface for creating/updating challenges
interface BackendChallengeRequest {
    title: string;
    description: string;
    gameId: number;
    difficultyRating: number;
    tasks: {
        description: string;
    }[];
    mediaItems?: {
        type: 'image' | 'video';
        url: string;
    }[];
}

// Adapters to convert between frontend and backend data structures
const adaptBackendChallengeToFrontend = (backendChallenge: BackendChallenge): Challenge => {
    return {
        id: backendChallenge.id,
        title: backendChallenge.title,
        description: backendChallenge.description,
        creatorId: backendChallenge.creatorId,
        creatorName: backendChallenge.creatorName,
        gameId: backendChallenge.gameId,
        gameName: backendChallenge.gameName,
        gameCoverImage: backendChallenge.gameCoverImage,
        difficultyRating: backendChallenge.difficultyRating,
        tasks: backendChallenge.tasks,
        completionsCount: backendChallenge.completionsCount,
        participantsCount: backendChallenge.participantsCount,
        mediaItems: backendChallenge.mediaItems || [],
        createdAt: new Date(backendChallenge.createdAt),
        updatedAt: new Date(backendChallenge.updatedAt)
    };
};

const adaptFrontendChallengeToBackend = (challengeData: ChallengeFormData): BackendChallengeRequest => {
    return {
        title: challengeData.title,
        description: challengeData.description,
        gameId: challengeData.gameId,
        difficultyRating: challengeData.difficultyRating,
        tasks: challengeData.tasks.map(task => ({ description: task.description })),
        mediaItems: challengeData.mediaItems
    };
};

const challengeService = {
    // Get all challenges
    getAllChallenges: async (): Promise<Challenge[]> => {
        try {
            const response = await api.get('/challenges');
            return response.data.map(adaptBackendChallengeToFrontend);
        } catch (error) {
            console.error('Error fetching challenges:', error);
            return [];
        }
    },

    // Get challenge by ID
    getChallengeById: async (id: number): Promise<Challenge> => {
        try {
            const response = await api.get(`/challenges/${id}`);
            return adaptBackendChallengeToFrontend(response.data);
        } catch (error) {
            console.error(`Error fetching challenge with id ${id}:`, error);
            throw error;
        }
    },

    // Create new challenge (requires authentication)
    createChallenge: async (challengeData: ChallengeFormData): Promise<Challenge> => {
        try {
            const backendChallenge = adaptFrontendChallengeToBackend(challengeData);
            const response = await apiAuth.post('/challenges', backendChallenge);
            return adaptBackendChallengeToFrontend(response.data);
        } catch (error) {
            console.error('Error creating challenge:', error);
            throw error;
        }
    },

    // Update existing challenge (only creator or admin)
    updateChallenge: async (id: number, challengeData: ChallengeFormData): Promise<Challenge> => {
        try {
            const backendChallenge = adaptFrontendChallengeToBackend(challengeData);
            const response = await apiAuth.put(`/challenges/${id}`, backendChallenge);
            return adaptBackendChallengeToFrontend(response.data);
        } catch (error) {
            console.error(`Error updating challenge with id ${id}:`, error);
            throw error;
        }
    },

    // Delete challenge (only creator or admin)
    deleteChallenge: async (id: number): Promise<void> => {
        try {
            await apiAuth.delete(`/challenges/${id}`);
        } catch (error) {
            console.error(`Error deleting challenge with id ${id}:`, error);
            throw error;
        }
    },

    // Join/participate in a challenge
    participateInChallenge: async (id: number): Promise<Challenge> => {
        try {
            const response = await apiAuth.post(`/challenges/${id}/participate`);
            return adaptBackendChallengeToFrontend(response.data);
        } catch (error) {
            console.error(`Error participating in challenge with id ${id}:`, error);
            throw error;
        }
    },

    // Update task completion status
    updateTaskCompletion: async (
        challengeId: number,
        taskId: number,
        isCompleted: boolean
    ): Promise<Challenge> => {
        try {
            const response = await apiAuth.post(`/challenges/${challengeId}/tasks/${taskId}`, {
                isCompleted
            });
            return adaptBackendChallengeToFrontend(response.data);
        } catch (error) {
            console.error(`Error updating task completion for challenge ${challengeId}:`, error);
            throw error;
        }
    },

    // Rate difficulty of a challenge
    rateDifficulty: async (challengeId: number, rating: number): Promise<Challenge> => {
        try {
            const response = await apiAuth.post(`/challenges/${challengeId}/rate-difficulty`, {
                rating
            });
            return adaptBackendChallengeToFrontend(response.data);
        } catch (error) {
            console.error(`Error rating difficulty for challenge ${challengeId}:`, error);
            throw error;
        }
    },

    // Get challenges by game ID
    getChallengesByGameId: async (gameId: number): Promise<Challenge[]> => {
        try {
            const response = await api.get(`/challenges/game/${gameId}`);
            return response.data.map(adaptBackendChallengeToFrontend);
        } catch (error) {
            console.error(`Error fetching challenges for game ${gameId}:`, error);
            return [];
        }
    },

    // Get challenges created by user
    getUserChallenges: async (): Promise<Challenge[]> => {
        try {
            const response = await apiAuth.get('/challenges/created');
            return response.data.map(adaptBackendChallengeToFrontend);
        } catch (error) {
            console.error('Error fetching user challenges:', error);
            return [];
        }
    },

    // Get challenges participated in by user
    getUserParticipations: async (): Promise<Challenge[]> => {
        try {
            const response = await apiAuth.get('/challenges/participated');
            return response.data.map(adaptBackendChallengeToFrontend);
        } catch (error) {
            console.error('Error fetching user participations:', error);
            return [];
        }
    }
};

export default challengeService;
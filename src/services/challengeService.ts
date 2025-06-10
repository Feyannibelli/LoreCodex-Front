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
    // Ensure tasks is always an array
    const tasks = Array.isArray(backendChallenge.tasks) ? backendChallenge.tasks : [];

    return {
        id: backendChallenge.id,
        title: backendChallenge.title || '',
        description: backendChallenge.description || '',
        creatorId: backendChallenge.creatorId,
        creatorName: backendChallenge.creatorName || '',
        gameId: backendChallenge.gameId,
        gameName: backendChallenge.gameName || '',
        gameCoverImage: backendChallenge.gameCoverImage || '',
        difficultyRating: backendChallenge.difficultyRating || 3,
        tasks: tasks,
        completionsCount: backendChallenge.completionsCount || 0,
        participantsCount: backendChallenge.participantsCount || 0,
        mediaItems: Array.isArray(backendChallenge.mediaItems) ? backendChallenge.mediaItems : [],
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
            console.log('Raw challenges response:', response.data); // Debug log

            if (!Array.isArray(response.data)) {
                console.warn('Challenges response is not an array:', response.data);
                return [];
            }

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
            console.log(`Raw challenge ${id} response:`, response.data); // Debug log

            if (!response.data) {
                throw new Error('Challenge not found');
            }

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
            console.log('Creating challenge with data:', backendChallenge); // Debug log

            const response = await apiAuth.post('/challenges', backendChallenge);
            console.log('Challenge creation response:', response.data); // Debug log

            if (!response.data) {
                throw new Error('Failed to create challenge - no data returned');
            }

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

            if (!response.data) {
                throw new Error('Failed to update challenge - no data returned');
            }

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

            if (!response.data) {
                throw new Error('Failed to participate in challenge - no data returned');
            }

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

            if (!response.data) {
                throw new Error('Failed to update task completion - no data returned');
            }

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

            if (!response.data) {
                throw new Error('Failed to rate difficulty - no data returned');
            }

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

            if (!Array.isArray(response.data)) {
                console.warn('Game challenges response is not an array:', response.data);
                return [];
            }

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

            if (!Array.isArray(response.data)) {
                console.warn('User challenges response is not an array:', response.data);
                return [];
            }

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

            if (!Array.isArray(response.data)) {
                console.warn('User participations response is not an array:', response.data);
                return [];
            }

            return response.data.map(adaptBackendChallengeToFrontend);
        } catch (error) {
            console.error('Error fetching user participations:', error);
            return [];
        }
    }
};

export default challengeService;
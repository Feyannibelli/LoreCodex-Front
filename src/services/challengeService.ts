import axios from 'axios';
import api from "./api";
import apiAuth from "./apiAuth";

// Interfaces para el frontend
export interface ChallengeItem {
    id?: number;
    description: string;
    order: number;
    completed?: boolean;
}

export interface Challenge {
    id: number;
    title: string;
    description: string;
    creatorUsername: string;
    creatorId?: number;
    items: ChallengeItem[];
    difficulty?: number;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'none';
}

export interface ChallengeFormData {
    title: string;
    description: string;
    items: string[];
    difficulty: number;
    mediaUrl?: string;
    mediaType: 'image' | 'video' | 'none';
}

export interface ChallengeProgress {
    challengeId: number;
    progress: number;
    completed: number;
    total: number;
    completedItems: number[];
}

// Interfaces para adaptar el backend
interface BackendChallenge {
    id: number;
    title: string;
    description: string;
    creatorUsername: string;
    creatorId?: number;
    items: {
        id: number;
        description: string;
        order: number;
    }[];
}

interface BackendChallengeRequest {
    title: string;
    description: string;
    items: string[];
    difficulty: number;
}

interface BackendProgressResponse {
    challengeId: number;
    progress: number;
    completed: number;
    total: number;
    completedItems?: number[];
}

const adaptFrontendChallengeToBackend = (frontendChallenge: ChallengeFormData): BackendChallengeRequest => {
    return {
        title: frontendChallenge.title,
        description: frontendChallenge.description,
        items: frontendChallenge.items,
        difficulty: frontendChallenge.difficulty
    };
};

const adaptBackendChallengeToFrontend = (backendChallenge: BackendChallenge): Challenge => {
    console.log('Backend challenge data:', backendChallenge);

    return {
        id: backendChallenge.id,
        title: backendChallenge.title,
        description: backendChallenge.description,
        creatorUsername: backendChallenge.creatorUsername,
        creatorId: backendChallenge.creatorId,
        items: (backendChallenge.items || []).map(item => ({
            id: item.id,
            description: item.description,
            order: item.order
        }))
    };
};

const adaptBackendProgressToFrontend = (backendProgress: BackendProgressResponse): ChallengeProgress => {
    return {
        challengeId: backendProgress.challengeId,
        progress: backendProgress.progress,
        completed: backendProgress.completed,
        total: backendProgress.total,
        completedItems: backendProgress.completedItems || []
    };
};

const challengeService = {
    getAllChallenges: async (): Promise<Challenge[]> => {
        try {
            const response = await api.get('/challenges');
            return response.data.map(adaptBackendChallengeToFrontend);
        } catch (error) {
            console.error('Error fetching challenges:', error);
            return [];
        }
    },

    getChallengeById: async (id: number): Promise<Challenge> => {
        try {
            const response = await api.get(`/challenges/${id}`);
            return adaptBackendChallengeToFrontend(response.data);
        } catch (error) {
            console.error(`Error fetching challenge with id ${id}:`, error);
            throw error;
        }
    },

    searchChallengesByTitle: async (title: string): Promise<Challenge[]> => {
        try {
            const response = await api.get(`/challenges/search?title=${title}`);
            return response.data.map(adaptBackendChallengeToFrontend);
        } catch (error) {
            console.error('Error searching challenges:', error);
            return [];
        }
    },

    createChallenge: async (challengeData: ChallengeFormData): Promise<void> => {
        try {
            const backendChallenge = adaptFrontendChallengeToBackend(challengeData);
            console.log('Sending to backend:', backendChallenge);

            await apiAuth.post('/challenges', backendChallenge);
            console.log('Challenge created successfully');
        } catch (error) {
            console.error('Error creating challenge:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('API response error:', error.response.data);
                console.error('API response status:', error.response.status);
            }
            throw error;
        }
    },

    getAllChallengesPaginated: async (page: number, pageSize: number): Promise<Challenge[]> => {
        try {
            const response = await api.get('/challenges', {
                params: { page, size: pageSize }
            });
            return response.data.map(adaptBackendChallengeToFrontend);
        } catch (error) {
            console.error('Error fetching paginated challenges:', error);
            return [];
        }
    },

    updateChallenge: async (id: number, challengeData: ChallengeFormData): Promise<Challenge> => {
        try {
            const backendChallenge = adaptFrontendChallengeToBackend(challengeData);
            const response = await apiAuth.put(`/challenges/${id}`, backendChallenge);
            return adaptBackendChallengeToFrontend(response.data);
        } catch (error) {
            console.error(`Error updating challenge with id ${id}:`, error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('API response error:', error.response.data);
            }
            throw error;
        }
    },

    deleteChallenge: async (id: number): Promise<void> => {
        try {
            await apiAuth.delete(`/challenges/${id}`);
        } catch (error) {
            console.error(`Error deleting challenge with id ${id}:`, error);
            throw error;
        }
    },

    joinChallenge: async (id: number): Promise<void> => {
        try {
            await apiAuth.post(`/challenges/${id}/join`);
        } catch (error) {
            console.error(`Error joining challenge with id ${id}:`, error);
            if (axios.isAxiosError(error) && error.response &&
                (error.response.status === 401 || error.response.status === 403)) {
                throw new Error("Authentication required to join this challenge");
            }
            throw error;
        }
    },

    leaveChallenge: async (challengeId: number): Promise<void> => {
        try {
            await apiAuth.post(`/challenges/${challengeId}/leave`);
        } catch (error) {
            console.error(`Error leaving challenge ${challengeId}:`, error);
            if (axios.isAxiosError(error) && error.response &&
                (error.response.status === 401 || error.response.status === 403)) {
                throw new Error("Authentication required to leave this challenge");
            }
            throw error;
        }
    },

    completeItem: async (challengeId: number, itemId: number): Promise<ChallengeProgress> => {
        try {
            const response = await apiAuth.post(`/challenges/${challengeId}/items/${itemId}/complete`);
            return adaptBackendProgressToFrontend(response.data);
        } catch (error) {
            console.error(`Error completing item ${itemId} in challenge ${challengeId}:`, error);
            if (axios.isAxiosError(error) && error.response &&
                (error.response.status === 401 || error.response.status === 403)) {
                throw new Error("Authentication required to complete challenge items");
            }
            throw error;
        }
    },

    uncompleteItem: async (challengeId: number, itemId: number): Promise<ChallengeProgress> => {
        try {
            const response = await apiAuth.post(`/challenges/${challengeId}/items/${itemId}/uncomplete`);
            return adaptBackendProgressToFrontend(response.data);
        } catch (error) {
            console.error(`Error uncompleting item ${itemId} in challenge ${challengeId}:`, error);
            if (axios.isAxiosError(error) && error.response &&
                (error.response.status === 401 || error.response.status === 403)) {
                throw new Error("Authentication required to uncomplete challenge items");
            }
            throw error;
        }
    },

    getChallengeProgress: async (challengeId: number): Promise<ChallengeProgress> => {
        try {
            const response = await apiAuth.get(`/challenges/${challengeId}/progress`);
            return adaptBackendProgressToFrontend(response.data);
        } catch (error) {
            console.error(`Error fetching progress for challenge ${challengeId}:`, error);
            if (axios.isAxiosError(error) && error.response &&
                (error.response.status === 401 || error.response.status === 403)) {
                throw new Error("Authentication required to view challenge progress");
            }
            throw error;
        }
    }
};

export default challengeService;

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
    // difficulty excluded
    // media excluded
    createdAt?: string; // Optional if not in backend response strictly, but good to have
    isTemporary?: boolean;
    // UI-only properties (for now, or future backend support)
    gameTitle?: string;
    gameCoverUrl?: string;
}

export interface ChallengeFormData {
    title: string;
    description: string;
    items: string[];
    // difficulty excluded
    // media excluded
}

// ... (ChallengeProgress stays same)
export interface ChallengeProgress {
    challengeId: number;
    progress: number;
    completed: number;
    total: number;
    completedItemIds: number[];    // updated to match backend DTO
}

// Interfaces para adaptar el backend
interface BackendChallenge {
    id: number;
    title: string;
    description: string;
    creatorUsername: string;
    creatorId?: number;
    creator_id?: number; // Fallback for snake_case
    game?: {
        id: number;
        title: string;
        coverUrl?: string; // or cover_url
        cover_url?: string;
    };
    gameId?: number; // Fallback if just ID
    game_id?: number;
    items: {
        id: number;
        description: string;
        order: number;
        completed?: boolean;
    }[];
}

interface BackendChallengeRequest {
    title: string;
    description: string;
    items: string[];
}

const adaptFrontendChallengeToBackend = (frontendChallenge: ChallengeFormData): BackendChallengeRequest => {
    return {
        title: frontendChallenge.title,
        description: frontendChallenge.description,
        items: frontendChallenge.items,
    };
};

const adaptBackendChallengeToFrontend = (backendChallenge: BackendChallenge): Challenge => {
    // Add logging to debug what's coming from backend
    console.log('Backend challenge data:', backendChallenge);

    const gameData = backendChallenge.game;

    // Attempt to resolve creatorId from multiple redundant sources/formats
    let resolvedCreatorId = backendChallenge.creatorId
        ?? backendChallenge.creator_id
        ?? (backendChallenge as any).creator?.id
        ?? (backendChallenge as any).user?.id
        ?? (backendChallenge as any).userId
        ?? (backendChallenge as any).user_id;

    // Fallback: If ID is still missing, try to find it in the included comments (if the creator commented)
    if (!resolvedCreatorId && (backendChallenge as any).comments && Array.isArray((backendChallenge as any).comments)) {
        const creatorComment = (backendChallenge as any).comments.find((c: any) =>
            c.username === (backendChallenge.creatorUsername || (backendChallenge as any).creator?.username)
        );
        if (creatorComment) {
            resolvedCreatorId = creatorComment.userId;
            console.log(`[ChallengeService] Recovered creatorId ${resolvedCreatorId} from comments for ${backendChallenge.creatorUsername}`);
        }
    }

    return {
        id: backendChallenge.id,
        title: backendChallenge.title,
        description: backendChallenge.description,
        creatorUsername: backendChallenge.creatorUsername || (backendChallenge as any).creator?.username || (backendChallenge as any).user?.username || 'Unknown',
        creatorId: resolvedCreatorId,
        items: (backendChallenge.items || []).map(item => ({
            id: item.id,
            description: item.description,
            order: item.order,
            completed: item.completed
        })),
        // Map Game Info if present
        gameTitle: gameData?.title,
        gameCoverUrl: gameData?.coverUrl ?? gameData?.cover_url
    };
};

const challengeService = {
    // Obtener todos los challenges
    getAllChallenges: async (): Promise<Challenge[]> => {
        try {
            const response = await api.get('/challenges');
            return response.data.map((c: any) => adaptBackendChallengeToFrontend(c));
        } catch (error) {
            console.error('Error fetching challenges:', error);
            return [];
        }
    },

    // Obtener un challenge por ID
    getChallengeById: async (id: number): Promise<Challenge> => {
        try {
            const response = await api.get(`/challenges/${id}`);
            return adaptBackendChallengeToFrontend(response.data);
        } catch (error) {
            console.error(`Error fetching challenge with id ${id}:`, error);
            throw error;
        }
    },

    // Buscar challenges por título
    searchChallengesByTitle: async (title: string): Promise<Challenge[]> => {
        try {
            const response = await api.get(`/challenges/search?title=${title}`);
            return response.data.map((c: any) => adaptBackendChallengeToFrontend(c));
        } catch (error) {
            console.error('Error searching challenges:', error);
            return [];
        }
    },

    // Crear un nuevo challenge
    createChallenge: async (challengeData: ChallengeFormData): Promise<Challenge> => {
        try {
            const backendChallenge = adaptFrontendChallengeToBackend(challengeData);
            console.log('Sending to backend (JSON):', backendChallenge);

            const response = await apiAuth.post('/challenges', backendChallenge);
            console.log('Backend response:', response);

            // 1. Try to get ID from Location header
            const locationHeader = response.headers['location'];
            if (locationHeader) {
                const idPart = locationHeader.split('/').pop();
                if (idPart && !isNaN(parseInt(idPart))) {
                    return {
                        id: parseInt(idPart),
                        title: challengeData.title,
                        description: challengeData.description,
                        creatorUsername: 'Me', // Temporary
                        items: challengeData.items.map((item, index) => ({
                            id: index, // Temp
                            description: item,
                            order: index
                        }))
                    };
                }
            }

            // 2. Fallback if no Location header or parsing failed (e.g. strict CORS hiding headers)
            // Check if response.data exists and has ID (unlikely per spec)
            if (response.data && response.data.id) {
                return adaptBackendChallengeToFrontend(response.data);
            }

            // 3. Last resort fallback: Temporary ID (will redirect to list)
            console.warn('Backend created challenge but returned empty response and no accessible Location header.');
            return {
                id: Date.now(), // Temporary ID
                title: challengeData.title,
                description: challengeData.description,
                creatorUsername: 'Me',
                items: challengeData.items.map((item, index) => ({
                    id: index + 1,
                    description: item,
                    order: index + 1
                })),
                isTemporary: true
            } as Challenge & { isTemporary?: boolean };

        } catch (error) {
            console.error('Error creating challenge:', error);
            throw error;
        }
    },

    getAllChallengesPaginated: async (page: number, pageSize: number): Promise<Challenge[]> => {
        try {
            const response = await api.get('/challenges', {
                params: { page, size: pageSize }
            });
            return response.data.map((c: any) => adaptBackendChallengeToFrontend(c));
        } catch (error) {
            console.error('Error fetching paginated challenges:', error);
            return [];
        }
    },

    // Actualizar un challenge existente
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

    // Eliminar un challenge
    deleteChallenge: async (id: number): Promise<void> => {
        try {
            await apiAuth.delete(`/challenges/${id}`);
        } catch (error) {
            console.error(`Error deleting challenge with id ${id}:`, error);
            throw error;
        }
    },

    // Unirse a un challenge
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

    completeItem: async (challengeId: number, itemId: number): Promise<ChallengeProgress> => {
        try {
            const response = await apiAuth.post(`/challenges/${challengeId}/items/${itemId}/complete`);
            return response.data;
        } catch (error) {
            console.error(`Error completing item ${itemId} in challenge ${challengeId}:`, error);
            if (axios.isAxiosError(error) && error.response &&
                (error.response.status === 401 || error.response.status === 403)) {
                throw new Error("Authentication required to complete challenge items");
            }
            throw error;
        }
    },

    // Desmarcar un ítem como completado y necesito que actualice el progreso del challenge
    uncompleteItem: async (challengeId: number, itemId: number): Promise<ChallengeProgress> => {
        try {
            const response = await apiAuth.post(`/challenges/${challengeId}/items/${itemId}/uncomplete`);
            return response.data;
        } catch (error) {
            console.error(`Error uncompleting item ${itemId} in challenge ${challengeId}:`, error);
            if (axios.isAxiosError(error) && error.response &&
                (error.response.status === 401 || error.response.status === 403)) {
                throw new Error("Authentication required to uncomplete challenge items");
            }
            throw error;
        }
    },

    // Obtener progreso del challenge
    getChallengeProgress: async (challengeId: number): Promise<ChallengeProgress> => {
        try {
            const response = await apiAuth.get(`/challenges/${challengeId}/progress`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching progress for challenge ${challengeId}:`, error);
            if (axios.isAxiosError(error) && error.response &&
                (error.response.status === 401 || error.response.status === 403)) {
                throw new Error("Authentication required to view challenge progress");
            }
            throw error;
        }
    },

    leaveChallenge: async (challengeId: number): Promise<void> => {
        try {
            await apiAuth.post(`/challenges/${challengeId}/leave`);
        } catch (error) {
            console.error(`Error leaving challenge ${challengeId}:`, error);
            throw error;
        }
    },

    isJoined: async (challengeId: number): Promise<boolean> => {
        try {
            const response = await apiAuth.get(`/challenges/${challengeId}/joined`);
            return response.data;
        } catch (error) {
            console.error(`Error checking if joined challenge ${challengeId}:`, error);
            return false;
        }
    },

    getCreatedChallenges: async (): Promise<Challenge[]> => {
        try {
            const response = await apiAuth.get('/challenges/me/created');
            return response.data.map((c: any) => adaptBackendChallengeToFrontend(c));
        } catch (error) {
            console.error('Error fetching created challenges:', error);
            return [];
        }
    },

    getJoinedChallenges: async (): Promise<Challenge[]> => {
        try {
            const response = await apiAuth.get('/challenges/me/joined');
            return response.data.map((c: any) => adaptBackendChallengeToFrontend(c));
        } catch (error) {
            console.error('Error fetching joined challenges:', error);
            return [];
        }
    }
};

export default challengeService;
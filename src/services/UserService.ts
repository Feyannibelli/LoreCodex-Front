import { UserProfileResponse } from "../interfaces/UserProfileResponse.ts";
import apiAuth from "./apiAuth.ts";
import api from "./api.ts";


export const getUserProfileById = async (userId: number): Promise<UserProfileResponse> => {
    const res = await apiAuth.get(`/user/profile/${userId}`);
    return res.data;
};

// Public endpoint to resolve ID from username
export const getIdByUsername = async (username: string): Promise<number | null> => {
    try {
        // Dynamically import token getter to avoid circular dependencies with apiAuth if any
        const { getAccessToken } = await import('../auth/token');
        const token = await getAccessToken();

        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        // Use 'api' instance but manually attach token if available
        // This avoids apiAuth's aggressive interceptors that redirect on 401/403
        const res = await api.get(`/user/id-by-username/${encodeURIComponent(username)}`, config);
        return res.data;
    } catch (error) {
        console.error(`Error resolving ID for username ${username}:`, error);
        return null;
    }
};

export const getCurrentUserProfile = async (): Promise<UserProfileResponse> => {
    const res = await apiAuth.get('/user/profile');
    return res.data;
};


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
        // Public endpoint to find user ID by username
        const response = await api.get(`/user/find/${username}`);
        return response.data.id;
    } catch (error) {
        console.error('Error fetching user ID by username:', error);
        return null;
    }
};

export const updateUsername = async (userId: number, username: string): Promise<any> => {
    // PATCH /user/{userId}/username
    // Auth required
    const response = await apiAuth.patch(`/user/${userId}/username`, { username });
    return response.data;
};

export const updateProfilePicture = async (userId: number, profilePicture: string): Promise<any> => {
    // PATCH /user/{userId}/profile-picture
    // Auth required
    const response = await apiAuth.patch(`/user/${userId}/profile-picture`, { profilePicture });
    return response.data;
};

export const isUsernameAvailable = async (candidate: string): Promise<boolean> => {
    // GET /user/username-available/{candidate}
    // Public
    try {
        const response = await api.get(`/user/username-available/${candidate}`);
        return response.data;
    } catch (error) {
        console.error('Error checking availability:', error);
        return false;
    }
};

export const getCurrentUserProfile = async (): Promise<UserProfileResponse> => {
    const res = await apiAuth.get('/user/profile');
    return res.data;
};


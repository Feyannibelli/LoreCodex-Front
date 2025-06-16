import {UserProfileResponse} from "../interfaces/UserProfileResponse.ts";
import apiAuth from "./apiAuth.ts";


export const getUserProfileById = async (userId: number): Promise<UserProfileResponse> => {
    const token = localStorage.getItem('token');
    const res = await apiAuth.get(`/user/profile/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};

export const getCurrentUserProfile = async (): Promise<UserProfileResponse> => {
    const token = localStorage.getItem('token');
    const res = await apiAuth.get('/user/profile', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};



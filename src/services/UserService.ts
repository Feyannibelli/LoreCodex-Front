import {UserProfileResponse} from "../interfaces/UserProfileResponse.ts";
import apiAuth from "./apiAuth.ts";


export const getUserProfileById = async (userId: number): Promise<UserProfileResponse> => {
    const res = await apiAuth.get(`/user/profile/${userId}`);
    return res.data;
};

export const getCurrentUserProfile = async (): Promise<UserProfileResponse> => {
    const res = await apiAuth.get('/user/profile');
    return res.data;
};


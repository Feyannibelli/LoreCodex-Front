import { UserProfileResponse } from '@/interfaces/UserProfileResponse';
import apiAuth from "@/services/apiAuth.ts";


export const getUserProfileById = async (userId: number): Promise<UserProfileResponse> => {
    const token = localStorage.getItem('token');
    const res = await apiAuth.get(`/user/profile/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};

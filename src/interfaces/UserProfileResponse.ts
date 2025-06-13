// src/interfaces/UserProfileResponse.ts

import {Guide} from "@/interfaces/Guide.ts";
import {Review} from "@/interfaces/Review.ts";

export interface UserProfileResponse {
    userId: number;
    username: string;
    avatarUrl?: string | null;
    bio?: string | null;
    followersCount: number;
    followingCount: number;
    isFollowedByCurrentUser: boolean;
    guides: Guide[];
    lists: UserListResponse[];
    reviews: Review[];
}


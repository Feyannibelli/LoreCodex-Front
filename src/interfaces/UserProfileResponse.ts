import { UserListResponse } from './UserListResponse';
import {Guide} from "@/interfaces/Guide.ts";
import {Review} from "@/interfaces/Review.ts";

export interface UserProfileResponse {
    userId: number;
    username: string;
    avatarUrl?: string | undefined;
    bio?: string | undefined;
    followersCount: number;
    followingCount: number;
    isFollowedByCurrentUser: boolean;
    guides: Guide[];
    lists: UserListResponse[];
    reviews: Review[];
}

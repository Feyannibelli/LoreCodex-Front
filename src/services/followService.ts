import apiAuth from './apiAuth'
import api from './api'

export interface UserResponse {
    id: number
    username: string
    email: string
    roles: string[]
}

const followService = {
    isFollowing: (followerId: number, followingId: number): Promise<boolean> =>
        apiAuth
            .get<boolean>(`/follow/${followerId}/is-following/${followingId}`)
            .then(res => res.data),

    followUser: (followerId: number, followingId: number): Promise<void> =>
        apiAuth.post(`/follow/${followerId}/follow/${followingId}`),

    unfollowUser: (followerId: number, followingId: number): Promise<void> =>
        apiAuth.delete(`/follow/${followerId}/unfollow/${followingId}`),

    getFollowers: (userId: number): Promise<UserResponse[]> =>
        api.get<UserResponse[]>(`/follow/${userId}/followers`).then(res => res.data),

    getFollowing: (userId: number): Promise<UserResponse[]> =>
        api.get<UserResponse[]>(`/follow/${userId}/following`).then(res => res.data),
}

export default followService

// src/interfaces/UserResponse.ts

/**
 * Equivalente TS de com.lorecodex.backend.dto.response.UserResponse
 */
export interface UserResponse {
    id: number;
    username: string;
    email: string;
    roles: string[];
}

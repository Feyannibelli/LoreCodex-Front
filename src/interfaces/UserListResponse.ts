// src/interfaces/UserListResponse.ts
import { ListItemResponse } from './ListItemResponse';

export interface UserListResponse {
    id: number;
    title: string;
    description: string;
    createdAt: string; // o Date si luego lo convertís con new Date()
    userId: number;
    items: ListItemResponse[];
}

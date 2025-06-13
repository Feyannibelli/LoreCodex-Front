import { ListItemResponse } from './ListItemResponse';

export interface UserListResponse {
    id: number;
    title: string;
    description: string;
    createdAt: string; // Puede ser Date si hacés la conversión
    userId: number;
    items: ListItemResponse[];
}

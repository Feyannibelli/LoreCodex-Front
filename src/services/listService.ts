// src/services/listService.ts
import apiAuth from './apiAuth';
import api from './api';

export enum ListItemType {
    GAME = 'GAME',
    GUIDE = 'GUIDE',
    CHALLENGE = 'CHALLENGE'
}

export interface ListItemRequest {
    type: ListItemType;
    referenceId: number;
    position: number;
}

export interface ListItemResponse {
    id: number;
    type: ListItemType;
    referenceId: number;
    position: number;
    title: string;
    thumbnailUrl?: string;
}

export interface UserListRequest {
    title: string;
    description: string;
    items: ListItemRequest[];
}

export interface UserListResponse {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    userId: number;
    username: string; // ← AÑADIDO
    items: ListItemResponse[];
}

export interface ReorderItemRequest {
    itemId: number;
    newPosition: number;
}

export const listService = {
    createList: async (userId: number, listData: UserListRequest): Promise<UserListResponse> => {
        const response = await apiAuth.post(`/lists/${userId}/create`, listData);
        return response.data;
    },

    getUserLists: async (userId: number): Promise<UserListResponse[]> => {
        const response = await api.get(`/lists/user/${userId}/get-lists`);
        return response.data;
    },

    getAllLists: async (): Promise<UserListResponse[]> => {
        const response = await api.get('/lists/get-all');
        return response.data;
    },

    getListById: async (listId: number): Promise<UserListResponse> => {
        const response = await api.get(`/lists/${listId}/get-list`);
        return response.data;
    },

    updateList: (id: number, body: UserListRequest) => {
        return apiAuth.put(`/lists/${id}/update`, body);
    },

    deleteList: async (listId: number): Promise<void> => {
        await apiAuth.delete(`/lists/${listId}/delete`);
    },

    getAllListsPaginated: async (page: number, pageSize: number): Promise<UserListResponse[]> => {
        const response = await api.get('/lists/get-all', {
            params: { page, size: pageSize }
        });
        return response.data;
    },

    addItemToList: async (listId: number, item: ListItemRequest): Promise<void> => {
        await apiAuth.post(`/lists/${listId}/items/add`, item);
    },

    removeItemFromList: async (listId: number, itemId: number): Promise<void> => {
        await apiAuth.delete(`/lists/${listId}/items/${itemId}/remove-item`);
    },

    reorderItems: async (listId: number, reorderData: ReorderItemRequest[]): Promise<void> => {
        await apiAuth.put(`/lists/${listId}/items/reorder`, reorderData);
    },

    getListAuthor: async (listId: number): Promise<string> => {
        const response = await api.get(`/lists/${listId}/author`);
        return response.data;
    }
};

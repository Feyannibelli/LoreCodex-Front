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
    username?: string;
    items: ListItemResponse[];
}

export interface ReorderItemRequest {
    itemId: number;
    newPosition: number;
}

export const listService = {
    // Crear una nueva lista
    createList: async (userId: number, listData: UserListRequest): Promise<UserListResponse> => {
        const response = await apiAuth.post(`/lists/${userId}/create`, listData);
        return response.data;
    },

    // Obtener listas de un usuario específico
    getUserLists: async (userId: number): Promise<UserListResponse[]> => {
        const response = await api.get(`/lists/user/${userId}/get-lists`);
        return response.data;
    },

    // Obtener todas las listas públicas
    getAllLists: async (): Promise<UserListResponse[]> => {
        const response = await api.get('/lists/1/get-all'); // El 1 es placeholder, el backend ignora este parámetro
        return response.data;
    },

    // Obtener una lista específica por ID
    getListById: async (listId: number): Promise<UserListResponse> => {
        const response = await api.get(`/lists/${listId}/get-list`);
        return response.data;
    },

    // Actualizar una lista
    updateList: async (listId: number, listData: UserListRequest): Promise<UserListResponse> => {
        const response = await apiAuth.put(`/lists/${listId}/update`, listData);
        return response.data;
    },

    // Eliminar una lista
    deleteList: async (listId: number): Promise<void> => {
        await apiAuth.delete(`/lists/${listId}/delete`);
    },

    // Agregar un item a una lista
    addItemToList: async (listId: number, item: ListItemRequest): Promise<void> => {
        await apiAuth.post(`/lists/${listId}/items/add`, item);
    },

    // Remover un item de una lista
    removeItemFromList: async (listId: number, itemId: number): Promise<void> => {
        await apiAuth.delete(`/lists/${listId}/items/${itemId}/remove-item`);
    },

    // Reordenar items en una lista
    reorderItems: async (listId: number, reorderData: ReorderItemRequest[]): Promise<void> => {
        await apiAuth.put(`/lists/${listId}/items/reorder`, reorderData);
    },

    // Obtener el autor de una lista
    getListAuthor: async (listId: number): Promise<string> => {
        const response = await api.get(`/lists/${listId}/author`);
        return response.data;
    }
};
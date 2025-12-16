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
    // Items are now managed atomically, not via the list payload
}

export interface CommentResponse {
    id: number;
    content: string;
    userId: number;
    username: string;
    createdAt: string;
    replies: CommentResponse[];
}

export interface UserListResponse {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    userId: number;
    username: string;
    items: ListItemResponse[];
    comments?: CommentResponse[];
}

export interface ReorderItemRequest {
    itemId: number;
    newPosition: number;
}

export const listService = {
    // Create a new list
    createList: async (userId: number, listData: UserListRequest): Promise<UserListResponse> => {
        const response = await apiAuth.post(`/lists/${userId}/create`, listData);
        return response.data;
    },

    // Get lists for a specific user
    getUserLists: async (userId: number): Promise<UserListResponse[]> => {
        const response = await api.get(`/lists/user/${userId}/get-lists`);
        return response.data;
    },

    // Get all public lists
    getAllLists: async (): Promise<UserListResponse[]> => {
        const response = await api.get('/lists/get-all');
        return response.data;
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

    // Add an item to a list
    addItemToList: async (listId: number, item: ListItemRequest): Promise<void> => {
        // Spec says POST /lists/{listId}/items/add
        await apiAuth.post(`/lists/${listId}/items/add`, item);
    },

    // Remove an item from a list
    removeItemFromList: async (listId: number, itemId: number): Promise<void> => {
        await apiAuth.delete(`/lists/${listId}/items/${itemId}/remove-item`);
    },

    // Reorder items in a list
    reorderItems: async (listId: number, reorderData: ReorderItemRequest[]): Promise<void> => {
        await apiAuth.put(`/lists/${listId}/items/reorder`, reorderData);
    },

    // Get the author of a list
    getListAuthor: async (listId: number): Promise<string> => {
        const response = await api.get(`/lists/${listId}/author`);
        return response.data;
    },

    // Get list by ID
    getListById: async (listId: number): Promise<UserListResponse> => {
        const response = await api.get(`/lists/${listId}`);
        return response.data;
    },

    // Update a list
    updateList: async (listId: number, listData: UserListRequest): Promise<UserListResponse> => {
        const response = await apiAuth.put(`/lists/${listId}/update`, listData);
        return response.data;
    }
};

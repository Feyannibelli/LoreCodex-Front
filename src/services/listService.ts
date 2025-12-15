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
    username: string;
    items: ListItemResponse[];
}

export interface ReorderItemRequest {
    itemId: number;
    newPosition: number;
}

export const listService = {
    createList: async (userId: number, listData: UserListRequest): Promise<UserListResponse> => {
        console.log('📤 Enviando datos de lista al backend:', listData);

        // Asegurar que los items tengan position correcta
        const normalizedData = {
            ...listData,
            items: listData.items.map((item, index) => ({
                type: item.type,
                referenceId: item.referenceId,
                position: item.position || index + 1
            }))
        };

        console.log('📤 Datos normalizados:', normalizedData);
        const response = await apiAuth.post(`/lists/${userId}/create`, normalizedData);
        console.log('✅ Respuesta del backend:', response.data);
        return response.data;
    },

    getUserLists: async (userId: number): Promise<UserListResponse[]> => {
        console.log(`📥 Obteniendo listas del usuario ${userId}`);
        const response = await api.get(`/lists/user/${userId}/get-lists`);
        console.log('📋 Listas del usuario:', response.data);
        return response.data;
    },

    // CORREGIDO: Este endpoint estaba mal - usa el del backend correcto
    getAllLists: async (page?: number, pageSize?: number): Promise<UserListResponse[]> => {
        const params = new URLSearchParams();
        if (page !== undefined) params.append('page', page.toString());
        if (pageSize !== undefined) params.append('size', pageSize.toString());

        const url = `/lists/get-all${params.toString() ? '?' + params : ''}`;
        console.log(`📥 Obteniendo todas las listas: ${url}`);

        const response = await api.get(url);
        console.log('📋 Todas las listas:', response.data);
        return response.data;
    },

    getListById: async (listId: number): Promise<UserListResponse> => {
        console.log(`📥 Obteniendo lista ${listId}`);
        const response = await api.get(`/lists/${listId}/get-list`);
        console.log('📋 Detalles de la lista:', response.data);

        // DEBUG: Verificar los items
        if (response.data.items) {
            console.log('🔍 Items en la lista:', response.data.items.length);
            response.data.items.forEach((item: ListItemResponse, index: number) => {
                console.log(`  Item ${index + 1}:`, {
                    id: item.id,
                    type: item.type,
                    referenceId: item.referenceId,
                    title: item.title,
                    thumbnailUrl: item.thumbnailUrl
                });
            });
        } else {
            console.warn('⚠️ No se encontraron items en la respuesta');
        }

        return response.data;
    },

    updateList: (id: number, body: UserListRequest) => {
        console.log(`📝 Actualizando lista ${id}:`, body);
        return apiAuth.put(`/lists/${id}/update`, body);
    },

    deleteList: async (listId: number): Promise<void> => {
        console.log(`🗑️ Eliminando lista ${listId}`);
        await apiAuth.delete(`/lists/${listId}/delete`);
    },

    getAllListsPaginated: async (page: number, pageSize: number): Promise<UserListResponse[]> => {
        console.log(`📥 Obteniendo listas paginadas: página ${page}, tamaño ${pageSize}`);
        const response = await api.get('/lists/get-all', {
            params: { page, size: pageSize }
        });
        console.log('📋 Listas paginadas:', response.data);
        return response.data;
    },

    addItemToList: async (listId: number, item: ListItemRequest): Promise<void> => {
        console.log(`➕ Añadiendo item a lista ${listId}:`, item);
        await apiAuth.post(`/lists/${listId}/items/add`, item);
    },

    removeItemFromList: async (listId: number, itemId: number): Promise<void> => {
        console.log(`➖ Eliminando item ${itemId} de lista ${listId}`);
        await apiAuth.delete(`/lists/${listId}/items/${itemId}/remove-item`);
    },

    reorderItems: async (listId: number, reorderData: ReorderItemRequest[]): Promise<void> => {
        console.log(`🔄 Reordenando items de lista ${listId}:`, reorderData);
        await apiAuth.put(`/lists/${listId}/items/reorder`, reorderData);
    },

    getListAuthor: async (listId: number): Promise<string> => {
        console.log(`👤 Obteniendo autor de lista ${listId}`);
        const response = await api.get(`/lists/${listId}/author`);
        console.log('👤 Autor:', response.data);
        return response.data;
    },
};

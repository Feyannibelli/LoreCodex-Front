import apiAuth from './apiAuth';
import api from "./api.ts";
import {UserListRequest} from "../interfaces/UserListRequest.ts";

export interface ListItemRequest {
    type: 'GAME' | 'GUIDE' | 'NEWS';
    referenceId: number;
    position: number;
}

export interface CreateListRequest {
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
    userUsername: string;
    items: {
        id: number;
        type: string;
        referenceId: number;
        position: number;
        title: string;
        thumbnailUrl: string;
    }[];
}

const userListService = {
    // crear una lista nueva
    createList: (userId: number, body: CreateListRequest) =>
        apiAuth.post<UserListResponse>(`/lists/${userId}/create`, body).then(r => r.data),

    /** Añade un ítem a la lista */
    addItemToList: (listId: number, item: ListItemRequest): Promise<void> =>
        apiAuth.post(`/lists/${listId}/items/add`, item).then(() => {}),

    /** Trae todas las listas publicadas */
    getAll: (): Promise<UserListResponse[]> =>
        // Backend expone GET /lists/{someId}/get-all que ignora el ID,
        // así que podemos pasar “0” como placeholder:
        api.get(`/lists/get-all`).then(r => r.data),

    /** Trae listas de un usuario */
    getForUser: (userId: number): Promise<UserListResponse[]> =>
        apiAuth.get(`/lists/user/${userId}/get-lists`).then(r => r.data),

    addItem: (listId: number, item: ListItemRequest): Promise<void> =>
        apiAuth.post(`/lists/${listId}/items`, item).then(() => {}),

    /** Elimina un ítem de la lista */
    removeItem: (listId: number, itemId: number): Promise<void> =>
        apiAuth.delete(`/lists/${listId}/items/${itemId}`).then(() => {}),

    /** Actualiza una lista */
    updateList: (listId: number, payload: UserListRequest): Promise<UserListResponse> =>
        apiAuth.put(`/lists/${listId}/update`, payload).then(r => r.data),

    /** Elimina una lista */
    deleteList: (listId: number): Promise<void> =>
        apiAuth.delete(`/lists/${listId}/delete`).then(() => {}),

    /** Obtiene una lista por ID */
    getListById: (listId: number): Promise<UserListResponse> =>
        apiAuth.get(`/lists/${listId}/get-list`).then(r => r.data),

    /** Obtiene las listas creadas por el usuario autenticado */
    getMyLists: (): Promise<UserListResponse[]> =>
        apiAuth.get('/lists/my-created').then(r => r.data),

    /** Busca listas por título */
    search: (query: string): Promise<UserListResponse[]> =>
        apiAuth.get(`/lists/search`, { params: { query } }).then(r => r.data),

    /** Obtiene el autor de una lista por ID de la lista*/
    getListAuthor: (listId: number): Promise<string> =>
        apiAuth.get(`/lists/${listId}/author`).then(r => r.data),
};

export default userListService;

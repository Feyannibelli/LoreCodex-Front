import apiAuth from './apiAuth';
import api from "./api.ts";
import { UserListRequest } from "../interfaces/UserListRequest.ts";

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
    // create a new list
    createList: (userId: number, body: CreateListRequest) =>
        apiAuth.post<UserListResponse>(`/lists/${userId}/create`, body).then(r => r.data),

    /** Add an item to the list */
    addItemToList: (listId: number, item: ListItemRequest): Promise<void> =>
        apiAuth.post(`/lists/${listId}/items/add`, item).then(() => { }),

    /** Fetch all published lists */
    getAll: (): Promise<UserListResponse[]> =>
        // Backend exposes GET /lists/{someId}/get-all which ignores the ID,
        // so we can pass "0" as a placeholder:
        api.get(`/lists/get-all`).then(r => r.data),

    /** Fetch lists for a user */
    getForUser: (userId: number): Promise<UserListResponse[]> =>
        apiAuth.get(`/lists/user/${userId}/get-lists`).then(r => r.data),

    addItem: (listId: number, item: ListItemRequest): Promise<void> =>
        apiAuth.post(`/lists/${listId}/items`, item).then(() => { }),

    /** Remove an item from the list */
    removeItem: (listId: number, itemId: number): Promise<void> =>
        apiAuth.delete(`/lists/${listId}/items/${itemId}`).then(() => { }),

    /** Update a list */
    updateList: (listId: number, payload: UserListRequest): Promise<UserListResponse> =>
        apiAuth.put(`/lists/${listId}/update`, payload).then(r => r.data),

    /** Delete a list */
    deleteList: (listId: number): Promise<void> =>
        apiAuth.delete(`/lists/${listId}/delete`).then(() => { }),

    /** Get a list by ID */
    getListById: (listId: number): Promise<UserListResponse> =>
        apiAuth.get(`/lists/${listId}/get-list`).then(r => r.data),

    /** Get lists created by the authenticated user */
    getMyLists: (): Promise<UserListResponse[]> =>
        apiAuth.get('/lists/my-created').then(r => r.data),

    /** Search lists by title */
    search: (query: string): Promise<UserListResponse[]> =>
        apiAuth.get(`/lists/search`, { params: { query } }).then(r => r.data),

    /** Get the author of a list by list ID */
    getListAuthor: (listId: number): Promise<string> =>
        apiAuth.get(`/lists/${listId}/author`).then(r => r.data),
};

export default userListService;

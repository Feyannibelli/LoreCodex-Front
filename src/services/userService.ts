import { API_URL } from '../api/config';

export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
}

export interface UpdateUserData {
    username?: string;
    email?: string;
    password?: string;
}

export const getAuthToken = () => localStorage.getItem('token');

export const getCurrentUserId = () => localStorage.getItem('userId');

export const getUserProfile = async (): Promise<User> => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Usuario no autenticado');

    const response = await fetch(`${API_URL}/user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error('Error al obtener el perfil');
    }

    return response.json();
};

export const updateUserProfile = async (data: UpdateUserData): Promise<User> => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Usuario no autenticado');

    const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el perfil');
    }

    return response.json();
};

export const deleteUserAccount = async (password: string): Promise<void> => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Usuario no autenticado');

    const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la cuenta');
    }
};
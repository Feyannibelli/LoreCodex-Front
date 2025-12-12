import api from './api';
import apiAuth from './apiAuth';
import { jwtDecode } from 'jwt-decode';

export interface LoginData { username: string; password: string; }
export interface RegisterData { username: string; email: string; password: string; }
export interface AuthResponse { token: string; userId: number; }
export interface UserData {
    id: number;
    username: string;
    email: string;
    emailNotificationsEnabled?: boolean;
    roles?: string[];
    profilePicture?: string;
}

interface JwtPayload { sub: string; roles?: string[]; exp: number; }

const authService = {
    login: async (loginData: LoginData): Promise<AuthResponse> => {
        const res = await api.post('/auth/login', loginData);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.userId.toString());
        return res.data;
    },

    register: async (registerData: RegisterData): Promise<AuthResponse> => {
        const res = await api.post('/auth/register', registerData);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.userId.toString());
        return res.data;
    },

    getCurrentUser: async (): Promise<UserData | null> => {
        try {
            // Si hay token de Auth0, usar ese endpoint
            const auth0Token = localStorage.getItem('auth0Token');
            if (auth0Token) {
                const res = await api.get('/auth0/me', {
                    headers: {
                        Authorization: `Bearer ${auth0Token}`
                    }
                });
                return res.data;
            }

            // Si no, usar el endpoint tradicional
            const res = await apiAuth.get('/user/me');
            return res.data;
        } catch {
            return null;
        }
    },

    // Nueva función para sincronizar usuario de Auth0 con el backend
    syncAuth0User: async (auth0Token: string): Promise<UserData> => {
        const res = await api.post('/auth0/sync', {}, {
            headers: {
                Authorization: `Bearer ${auth0Token}`
            }
        });
        return res.data.user;
    },

    isAuthenticated: (): boolean => {
        // Verificar si hay token de Auth0
        const auth0Token = localStorage.getItem('auth0Token');
        if (auth0Token) {
            try {
                const decoded = jwtDecode<JwtPayload>(auth0Token);
                return decoded.exp > Date.now() / 1000;
            } catch {
                return false;
            }
        }

        // Verificar token tradicional
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            return decoded.exp > Date.now() / 1000;
        } catch {
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('auth0Token');
    },

    isAdmin: (): boolean => {
        // Verificar primero Auth0
        const auth0Token = localStorage.getItem('auth0Token');
        if (auth0Token) {
            try {
                const decoded = jwtDecode<JwtPayload>(auth0Token);
                // Auth0 usa "permissions" en lugar de "roles"
                return decoded.roles?.includes('ROLE_ADMIN') || false;
            } catch {
                return false;
            }
        }

        // Verificar token tradicional
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            return decoded.roles?.includes('ROLE_ADMIN') || false;
        } catch {
            return false;
        }
    },

    // Helper para verificar admin desde UserData
    isAdminFromUserData: (userData: UserData): boolean => {
        return userData.roles?.includes('ROLE_ADMIN') || false;
    },

    getAllUsers: async (): Promise<UserData[]> => {
        const res = await apiAuth.get('/admin/users');
        return res.data;
    },

    deleteUser: async (userId: number): Promise<void> => {
        await apiAuth.delete(`/admin/users/${userId}`);
    }
};

export default authService;
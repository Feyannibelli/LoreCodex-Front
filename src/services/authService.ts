import api from './api';         // sin token
import apiAuth from './apiAuth'; // con token
import { jwtDecode } from 'jwt-decode';

export interface LoginData { username: string; password: string; }
export interface RegisterData { username: string; email: string; password: string; }
export interface AuthResponse { token: string; userId: number; }
export interface UserData { id: number; username: string; email: string; profilePicture?: string; emailNotificationsEnabled?: boolean; roles?: string[]; createdAt?: string; }

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
            const res = await apiAuth.get('/user/me');
            return res.data;
        } catch {
            return null;
        }
    },

    isAuthenticated: (): boolean => {
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
    },

    isAdmin: (): boolean => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            return decoded.roles?.includes('ROLE_ADMIN') || false;
        } catch {
            return false;
        }
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

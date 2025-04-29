// src/services/authService.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8081';

export interface LoginData {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    userId: number;
}

export interface UserData {
    id: number;
    username: string;
    email: string;
    roles?: string[];
}

interface JwtPayload {
    sub: string;
    roles?: string[];
    exp: number;
}

// Configuración de axios para incluir el token en las solicitudes
export const setupAxiosInterceptors = () => {
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            // Only redirect to login for auth-specific endpoints if token exists
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                // Check if this is a secure/auth endpoint (not a public endpoint like getting game info)
                const isSecureEndpoint = error.config && (
                    error.config.url.includes('/auth/') ||
                    error.config.url.includes('/user/') ||
                    error.config.url.includes('/admin/') ||
                    // Only redirect for authorized game actions, not for viewing games
                    (error.config.url.includes('/games/') &&
                        (error.config.url.includes('/like') ||
                            error.config.url.includes('/rate') ||
                            error.config.method !== 'get'))
                );

                if (localStorage.getItem('token') && isSecureEndpoint) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );
};

const authService = {
    // Iniciar sesión
    login: async (loginData: LoginData): Promise<AuthResponse> => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, loginData);

            // Guardar el token y userId en localStorage
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId.toString());
            }

            return response.data;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    },

    // Registrar usuario
    register: async (registerData: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, registerData);

            // Guardar el token y userId en localStorage después del registro exitoso
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId.toString());
            }

            return response.data;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    },

    // Obtener datos del usuario actual
    getCurrentUser: async (): Promise<UserData | null> => {
        const userId = localStorage.getItem('userId');
        if (!userId) return null;

        try {
            const response = await axios.get(`${API_URL}/user/me`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    },

    // Verificar si el usuario está autenticado
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const decoded = jwtDecode<JwtPayload>(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            return false;
        }
    },

    // Cerrar sesión
    logout: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
    },

    // Verificar si el usuario tiene rol de admin
    isAdmin: (): boolean => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const decoded = jwtDecode<JwtPayload>(token);
            return decoded.roles?.includes('ROLE_ADMIN') || false;
        } catch (e) {
            return false;
        }
    },

    // Obtener todos los usuarios (solo para admin)
    getAllUsers: async (): Promise<UserData[]> => {
        try {
            const response = await axios.get(`${API_URL}/admin/users`);
            // With our updated backend, the response should be a direct array of UserDTO objects
            return response.data;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    },

    // Eliminar un usuario (solo para admin)
    deleteUser: async (userId: number): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/admin/users/${userId}`);
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }
};

function extractErrorMessage(error: any): string {
    if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
            return error.response.data;
        }
        if (error.response.data.message) {
            return error.response.data.message;
        }
    }
    return 'An unexpected error occurred. Please try again later.';
}

export default authService;
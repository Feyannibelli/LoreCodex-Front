import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080';

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
    password?: string;
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
};

const authService = {
    // Iniciar sesión
    login: async (loginData: LoginData): Promise<AuthResponse> => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, loginData);

            // Guardar el token y userId en localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId.toString());
            }

            return response.data;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    },

    // Registrar usuario
    register: async (registerData: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, registerData);

            // Guardar el token y userId en localStorage después del registro exitoso
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId.toString());
            }

            return response.data;
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
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
        return localStorage.getItem('token') !== null;
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
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && typeof response.data === 'object') {
                const usersArray = response.data.users || response.data.content || [];
                if (Array.isArray(usersArray)) {
                    return usersArray;
                }
                console.error('Unexpected response format:', response.data);
                return [];
            }
            console.error('Unexpected response format:', response.data);
            return [];
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Eliminar un usuario (solo para admin)
    deleteUser: async (userId: number): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/admin/users/${userId}`);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
};

export default authService;
import axios from 'axios';

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
            const response = await axios.post(`${API_URL}/user/login`, loginData);

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
            const response = await axios.post(`${API_URL}/user/register`, registerData);

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
            const response = await axios.get(`${API_URL}/user/${userId}`);
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
    }
};

export default authService;
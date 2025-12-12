// src/services/apiAuth.ts
import axios from 'axios';
import { API_URL } from './api';

const apiAuth = axios.create({
    baseURL: API_URL,
});

apiAuth.interceptors.request.use(
    (config) => {
        // Primero intentar con Auth0 token
        const auth0Token = localStorage.getItem('auth0Token');
        if (auth0Token && config.headers) {
            config.headers['Authorization'] = `Bearer ${auth0Token}`;
            return config;
        }

        // Si no hay Auth0 token, usar el tradicional
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// manejo de errores 401/403
apiAuth.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
        ) {
            const isSecureEndpoint =
                error.config?.url?.includes('/user') ||
                error.config?.url?.includes('/admin') ||
                (error.config?.url?.includes('/games') &&
                    (error.config?.url?.includes('/like') ||
                        error.config?.url?.includes('/rate') ||
                        error.config?.method !== 'get'));

            const hasToken = localStorage.getItem('token') || localStorage.getItem('auth0Token');

            if (hasToken && isSecureEndpoint) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('auth0Token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiAuth;

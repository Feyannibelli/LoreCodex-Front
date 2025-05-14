// src/services/apiAuth.ts
import axios from 'axios';
import { API_URL } from './api';

const apiAuth = axios.create({
    baseURL: API_URL,
});

apiAuth.interceptors.request.use(
    (config) => {
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

            if (localStorage.getItem('token') && isSecureEndpoint) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiAuth;

// src/services/apiAuth.ts
import axios from 'axios';
import { API_URL } from './api';
import { getAccessToken } from '../auth/token';

const apiAuth = axios.create({
    baseURL: API_URL,
});

apiAuth.interceptors.request.use(
    async (config) => {
        const token = await getAccessToken();
        if (token) {
            config.headers = config.headers ?? {};
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

            if (isSecureEndpoint) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiAuth;

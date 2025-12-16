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
    (error: any) => {
        if (error.response && error.response.status === 401) {
            // Only redirect on 401 (Unauthorized - Token invalid/expired)
            // 403 (Forbidden) means token is valid but permission denied, 
            // so we should let the UI handle it (e.g. show error message instead of kicking user out)
            const isSecureEndpoint =
                error.config?.url?.includes('/user') ||
                error.config?.url?.includes('/admin') ||
                (error.config?.url?.includes('/games') &&
                    (error.config?.url?.includes('/like') ||
                        error.config?.url?.includes('/rate') ||
                        error.config?.method !== 'get'));

            if (isSecureEndpoint) {
                // Determine if we should redirect or just let the app handle it
                // For now, redirecting on 401 is standard
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiAuth;

// src/services/apiAuth.ts
import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

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
    (error) => {
        return Promise.reject(error);
    }
);

export default apiAuth;

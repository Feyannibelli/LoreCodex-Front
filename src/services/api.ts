// src/services/api.ts
import axios from 'axios';

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8081').replace(/\/+$/, '');
const api = axios.create({
    baseURL: API_URL,
});

export default api;

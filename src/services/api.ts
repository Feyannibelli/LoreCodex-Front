import axios from 'axios';

// Configuración básica para solicitudes públicas (no necesitan autorización)
const API_URL = 'http://localhost:8081/api';

const api = axios.create({
    baseURL: API_URL,
});

export default api;
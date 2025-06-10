import api from "./api";
import apiAuth from "./apiAuth";
import { News, NewsForm } from "@/interfaces/News";

const ENDPOINT = "/news";

const newsService = {
    /* ---------- lecturas públicas ---------- */
    getAll:       ()                 => api.get<News[]>(ENDPOINT),
    getById:      (id: number)       => api.get<News>(`${ENDPOINT}/${id}`),
    getRecent:    (limit = 5)        =>
        api.get<News[]>(`${ENDPOINT}/recent`, { params: { limit } }),
    getByTag:     (tag: string)      => api.get<News[]>(`${ENDPOINT}/tag/${tag}`),
    getByUser:    (userId: number)   => api.get<News[]>(`${ENDPOINT}/user/${userId}`),

    /* ---------- acciones de usuario ---------- */
    toggleLike:   (id: number)       =>
        apiAuth.post<News>(`${ENDPOINT}/${id}/toggle-like`),

    /* ---------- admin (crear / editar / borrar / publish) ---------- */
    create:       (data: NewsForm)   => apiAuth.post<News>(ENDPOINT, data),
    update:       (id: number, data: NewsForm) =>
        apiAuth.put<News>(`${ENDPOINT}/${id}`, data),
    delete:       (id: number)       => apiAuth.delete(`${ENDPOINT}/${id}`),
    publish:      (id: number)       =>
        apiAuth.patch<News>(`${ENDPOINT}/${id}/publish`),
    unpublish:    (id: number)       =>
        apiAuth.patch<News>(`${ENDPOINT}/${id}/unpublish`),
};

export default newsService;

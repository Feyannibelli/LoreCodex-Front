import api     from "./api";
import apiAuth from "./apiAuth";
import { Guide, GuideForm } from "../interfaces/Guide";

/* ---- mappers ---- */
const toFrontend = (b: any): Guide => ({
    id: b.id,
    title: b.title,
    content: b.content,
    coverImageUrl: b.coverImageUrl,
    published: b.isPublished,
    draft: b.isDraft,
    tags: b.tags,
    authorId: b.userId,  // CORREGIDO: userId del backend
    likeCount: b.likeCount || 0,
    comments: b.comments ?? [],
    images: b.images ?? [],
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
});

// CORREGIDO: Los nombres ahora coinciden con GuideRequest del backend
const toBackend = (f: GuideForm) => ({
    title:         f.title,
    content:       f.content,
    coverImageUrl: f.coverImageUrl || null,
    // IMPORTANTE: Los nombres deben coincidir exactamente con GuideRequest
    isPublished:   f.published ?? false,
    isDraft:       f.draft ?? true,
    tags:          f.tags ?? [],
    images:        f.images ?? [],
});

/* ---- service ---- */
const guideService = {
    /* lecturas públicas */
    getById: (id: number) =>
        api.get(`/guides/${id}`).then(r => toFrontend(r.data)),

    getPublishedGuidesByTitle: (title: string) =>
        api.get(`/guides/search?title=${encodeURIComponent(title)}`)
            .then(r => r.data.map(toFrontend)),

    getPublishedGuides: () =>
        api.get(`/guides/all/published`).then(r => r.data.map(toFrontend)),

    getPublishedGuidesPaginated: (page: number, pageSize: number) =>
        api.get('/guides/all/published', {
            params: { page, size: pageSize }
        }).then(r => r.data.map(toFrontend)),

    /* Drafts del usuario */
    getDraftsByUser: (userId: number) =>
        apiAuth
            .get(`/guides/user/${userId}/drafts`)
            .then(r => r.data.map(toFrontend)),

    /* guías por titulo (search) */
    search: (query: string) =>
        api.get(`/guides/search?title=${encodeURIComponent(query)}`)
            .then(r => r.data.map(toFrontend)),

    /* admin o listados completos */
    getAll: () =>
        apiAuth.get(`/guides/all`).then(r => r.data.map(toFrontend)),

    /* CRUD */
    create: (data: GuideForm) =>
        apiAuth.post(`/guides/create`, toBackend(data)).then(r => toFrontend(r.data)),

    update: (id: number, data: GuideForm) =>
        apiAuth.put(`/guides/update/${id}`, toBackend(data)).then(r => toFrontend(r.data)),

    delete: (id: number) =>
        apiAuth.delete(`/guides/deleteGuide/${id}`),

    /* acciones */
    publish:   (id: number) => apiAuth.post(`/guides/${id}/publish`).then(r => toFrontend(r.data)),
    unpublish: (id: number) => apiAuth.post(`/guides/${id}/unpublish`).then(r => toFrontend(r.data)),
    like:      (id: number) => apiAuth.post(`/guides/${id}/like`),
    getAuthor: (authorId: number) =>
        api.get(`/guides/${authorId}/author`).then(r => r.data),

    searchGuidesByTitle: (title: string) =>
        api.get(`/guides/search?title=${encodeURIComponent(title)}`)
            .then(r => r.data.map(toFrontend))
};

export default guideService;

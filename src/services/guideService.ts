import api from "./api";
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
    authorId: b.userId, // Mapped from backend 'userId'
    authorUsername: b.creatorUsername || 'Unknown', // Mapped from backend 'creatorUsername'
    likeCount: b.likeCount,
    comments: b.comments ?? [],
    images: b.images ?? [],
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    gameId: b.gameId
});

// mapper to backend (GuideForm -> GuideRequest)
const toBackend = (f: GuideForm) => ({
    title: f.title,
    content: f.content,
    coverImageUrl: f.coverImageUrl,
    /* Backend ignores these on create, but we send them for update */
    isPublished: f.published,
    isDraft: f.draft,
    tags: f.tags,
    images: f.images,
    gameId: f.gameId
});

/* ---- service ---- */
const guideService = {
    /* lecturas públicas */
    getById: (id: number) =>
        api.get(`/guides/${id}`).then(r => toFrontend(r.data)),

    getPublishedGuidesByTitle: (title: string) =>
        api.get(`/guides/search?title=${title}`)
            .then(r => r.data.map(toFrontend)),

    getPublishedGuides: () =>
        api.get(`/guides/all/published`).then(r => r.data.map(toFrontend)),

    getPublishedGuidesPaginated: (page: number, pageSize: number) =>
        api.get('/guides/all/published', {
            params: { page, size: pageSize }
        }).then(r => r.data.map(toFrontend)),

    /* Drafts del usuario (por ID - público si se quisiera ver perfil, pero enfocado en 'mis drafts') */
    getDraftsByUser: (userId: number) =>
        apiAuth
            .get(`/guides/user/${userId}/drafts`)
            .then(r => r.data.map(toFrontend)),

    /* Shortcut: Mis borradores (requiere token) */
    getMyDrafts: () =>
        apiAuth.get('/user/my-drafts').then(r => r.data.map(toFrontend)),

    /* search general */
    search: (query: string) =>
        api.get(`/guides/search?title=${encodeURIComponent(query)}`) // Adjusted param name to 'title' per spec
            .then(r => r.data.map(toFrontend)),

    /* admin o listados completos */
    getAll: () =>
        apiAuth.get(`/guides/all`).then(r => r.data.map(toFrontend)),

    /* CRUD */
    create: (data: GuideForm) =>
        // Backend forces draft=true, published=false on create
        apiAuth.post(`/guides/create`, toBackend(data)).then(r => toFrontend(r.data)),

    update: (id: number, data: GuideForm) =>
        apiAuth.put(`/guides/update/${id}`, toBackend(data)).then(r => toFrontend(r.data)),

    delete: (id: number) =>
        apiAuth.delete(`/guides/deleteGuide/${id}`),

    /* acciones de estado */
    publish: (id: number) => apiAuth.post(`/guides/${id}/publish`, {}).then(r => toFrontend(r.data)),
    unpublish: (id: number) => apiAuth.post(`/guides/${id}/unpublish`, {}).then(r => toFrontend(r.data)),
    like: (id: number) => apiAuth.post(`/guides/${id}/like`, {}),

    // Deprecated: author info is now in the guide response, but keeping just in case
    getAuthor: (id: number) =>
        api.get(`/guides/${id}/author`).then(r => r.data),
};

export default guideService;

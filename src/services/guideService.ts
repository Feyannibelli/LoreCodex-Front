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
    authorId: b.authorId,
    likeCount: b.likeCount,
    comments: b.comments ?? [],
    images: b.images ?? [],
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
});

// guideService.ts  – mapper a backend
// guideService.ts – mapper a backend
const toBackend = (f: GuideForm) => ({
    title:         f.title,
    content:       f.content,
    coverImageUrl: f.coverImageUrl,
    /* ¡los nombres deben coincidir con GuideRequest! */
    isPublished:   f.published,
    isDraft:       f.draft,
    tags:          f.tags,
    images:        f.images,
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

    /* Drafts del usuario (nuevo endpoint) */
    getDraftsByUser: (userId: number) =>
        apiAuth
            .get(`/guides/user/${userId}/drafts`)
            .then(r => r.data.map(toFrontend)),

    /*guías por titulo (search) */
    search: (query: string) =>
        api.get(`/guides/search?query=${encodeURIComponent(query)}`)
            .then(r => r.data.map(toFrontend)),

    /* admin o listados completos */
    getAll: () =>
        apiAuth.get(`/guides/all`).then(r => r.data.map(toFrontend)),

    /* CRUD */
    /*@PostMapping("/create")
    public ResponseEntity<GuideResponse> createGuide(
            @RequestBody GuideRequest request,
            @AuthenticationPrincipal User user
    ) {
        GuideResponse response = guideService.createGuide(request, user.getUsername(), null);
        return ResponseEntity.ok(response);
    }*/
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
    getAuthor: (id: number) =>
        api.get(`/guides/${id}/author`).then(r => r.data),

    searchGuidesByTitle: (title:string) => apiAuth.get(`/guides/search?title=${encodeURIComponent(title)}`)
};

export default guideService;

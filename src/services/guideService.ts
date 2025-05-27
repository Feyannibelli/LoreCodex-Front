// src/services/guideService.ts
import api from './api';
import apiAuth from './apiAuth';

interface GuideData {
    title: string;
    content: string;
    coverImageUrl?: string | null;
    gameId: number;
    isDraft: boolean;
    isPublished: boolean;
}

const guideService = {
    getPublishedGuides: async () => {
        const res = await api.get('/guides/published');
        return res.data;
    },

    getGuideById: async (id: string) => {
        const res = await api.get(`/guides/${id}`);
        return res.data;
    },

    getDrafts: async () => {
        const res = await apiAuth.get('/user/my-drafts');
        return res.data;
    },

    createGuide: async (guideData: GuideData) => {
        const res = await apiAuth.post('/guides/create', {
            title: guideData.title,
            content: guideData.content,
            coverImageUrl: guideData.coverImageUrl,
            gameId: guideData.gameId,
            isDraft: guideData.isDraft,
            isPublished: guideData.isPublished
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return res.data;
    },

    updateGuide: async (id: string, guideData: GuideData) => {
        const res = await apiAuth.put(`/guides/${id}`, {
            title: guideData.title,
            content: guideData.content,
            coverImageUrl: guideData.coverImageUrl,
            gameId: guideData.gameId,
            isDraft: guideData.isDraft,
            isPublished: guideData.isPublished
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return res.data;
    },

    deleteGuide: async (id: number) => {
        const res = await apiAuth.delete(`/guides/deleteGuide/${id}`);
        return res.data;
    },

    // Get guides by game ID
    getGuidesByGameId: async (gameId: number) => {
        const res = await api.get(`/guides/game/${gameId}`);
        return res.data;
    },

    // Search guides by title
    searchGuides: async (query: string) => {
        const res = await api.get(`/guides/search?q=${encodeURIComponent(query)}`);
        return res.data;
    }
};

export default guideService;
// src/services/guideService.ts
import api from './api';
import apiAuth from './apiAuth';

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

    createGuide: async (formData: FormData) => {
        const res = await apiAuth.post('/guides/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    updateGuide: async (id: string, formData: FormData) => {
        const res = await apiAuth.put(`/guides/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    deleteGuide: async (id: number) => {
        const res = await apiAuth.delete(`/guides/deleteGuide/${id}`);
        return res.data;
    }
};

export default guideService;

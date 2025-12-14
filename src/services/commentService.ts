import apiAuth from './apiAuth';
import api from './api';

export interface Comment {
    id: number;
    content: string;
    userId: number;
    username: string;
    createdAt: string;
    replies: Comment[];
}

const commentService = {
    // Obtener comentarios (público para GET)
    getComments: async (
        type: 'guide' | 'news' | 'list' | 'challenge',
        id: number,
        page?: number,
        size?: number
    ): Promise<Comment[]> => {
        const params = new URLSearchParams();
        if (page !== undefined) params.append('page', page.toString());
        if (size !== undefined) params.append('size', size.toString());

        const url = `/comments/${type}/${id}${params.toString() ? '?' + params : ''}`;

        const response = await api.get(url);
        return response.data;
    },

    // Agregar comentario (requiere autenticación)
    addComment: async (
        type: 'guide' | 'news' | 'list' | 'challenge',
        id: number,
        content: string,
        parentId?: number
    ): Promise<void> => {
        await apiAuth.post(`/comments/${type}/${id}`, {
            content,
            parentId: parentId || null
        });
    },

    // Eliminar comentario (requiere autenticación)
    deleteComment: async (commentId: number): Promise<void> => {
        await apiAuth.delete(`/comments/${commentId}`);
    }
};

export default commentService;
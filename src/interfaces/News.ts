// src/interfaces/News.ts
export interface News {
    id: number;
    title: string;
    content: string;
    summary?: string;  // ✅ AGREGAR summary
    coverImage: string | null;  // ✅ YA está correcto
    tags: string[];
    publishedAt?: string;
    createdAt: string;
    published: boolean;
    likes: number;
    authorUsername: string;
    authorId?: number;
}

export interface NewsForm {
    title: string;
    content: string;
    summary?: string;  // ✅ AGREGAR summary
    coverImage?: string;  // ✅ YA está correcto
    publishedAt?: string;
    tags?: string[];
}

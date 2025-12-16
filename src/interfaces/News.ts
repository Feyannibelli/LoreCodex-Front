export interface News {
    id: number;
    title: string;
    content: string;
    summary?: string;
    coverImage: string | null;
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
    summary?: string;
    coverImage?: string;
    publishedAt?: string;
    tags?: string[];
}

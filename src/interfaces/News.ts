export interface News {
    id: number;
    title: string;
    content: string;
    coverImage: string | null;
    tags: string[];
    createdAt: string;
    published: boolean;
    likes: number;
    authorUsername: string;
}

export interface NewsForm {
    title: string;
    content: string;
    coverImage?: string;
    tags?: string[];
}

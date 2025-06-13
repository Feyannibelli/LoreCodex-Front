export interface GuideImage {
    id: number;
    url: string;
}

export interface Comment {
    id: number;
    content: string;
    username: string;
    createdAt: string;
}

export interface Guide {
    id: number;
    title: string;
    content: string;
    coverImageUrl: string | null;
    published: boolean;      // mapea isPublished
    draft: boolean;          // mapea isDraft
    tags: string[];
    authorId: number;
    authorUsername?: string; // opcional, si se quiere mostrar el nombre de usuario
    likeCount: number;
    comments: Comment[];
    images: GuideImage[];
    createdAt: string;
    updatedAt: string;
}

/* dto para crear/editar */
export interface GuideForm {
    title: string;
    content: string;
    coverImageUrl?: string;
    published?: boolean;   // true = publicar
    draft?: boolean;       // true = guardar como draft
    tags?: string[];
    images?: { url: string }[];
}

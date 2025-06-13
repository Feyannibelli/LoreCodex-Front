export interface ListItemResponse {
    id: number;
    type: 'GAME' | 'GUIDE' | 'CHALLENGE'; // tenemos un enum
    referenceId: number;
    position: number;

    // campos para mostrar en el front
    title: string;
    thumbnailUrl: string;
}

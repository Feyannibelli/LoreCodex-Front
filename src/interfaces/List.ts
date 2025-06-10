export enum ListItemType {
    GAME = 'GAME',
    GUIDE = 'GUIDE',
    CHALLENGE = 'CHALLENGE'
}

export enum ListCategory {
    TOP = 'TOP',
    RELATED = 'RELATED'
}

export interface ListItem {
    id: number;
    type: ListItemType;
    referenceId: number;
    position: number;
}

export interface UserList {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    userId: number;
    items: ListItem[];
    category?: ListCategory; // Para diferenciar entre TOP y RELATED
}

export interface CreateListRequest {
    title: string;
    description: string;
    category?: ListCategory;
}

export interface AddItemRequest {
    type: ListItemType;
    referenceId: number;
    position: number;
}

export interface ReorderItemRequest {
    itemId: number;
    newPosition: number;
}

// Para mostrar información completa de los items
export interface PopulatedListItem extends ListItem {
    name: string;
    imageUrl?: string;
    gameTitle?: string; // Para guides y challenges
}

export interface PopulatedUserList extends Omit<UserList, 'items'> {
    items: PopulatedListItem[];
}
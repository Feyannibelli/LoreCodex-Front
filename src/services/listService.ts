import apiAuth from './apiAuth';
import api from './api';
import { UserList, CreateListRequest, AddItemRequest, ReorderItemRequest, PopulatedUserList } from '../interfaces/List';
import gameService from './gameService';
import guideService from './guideService';

const listService = {
    // Crear una nueva lista
    createList: async (userId: number, listData: CreateListRequest): Promise<UserList> => {
        try {
            const response = await apiAuth.post(`/lists/${userId}/create`, {
                title: listData.title,
                description: listData.description
            });
            return response.data;
        } catch (error) {
            console.error('Error creating list:', error);
            throw error;
        }
    },

    // Obtener listas de un usuario
    getListsForUser: async (userId: number): Promise<UserList[]> => {
        try {
            const response = await api.get(`/lists/user/${userId}/get-lists`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user lists:', error);
            throw error;
        }
    },

    // Obtener listas del usuario autenticado
    getMyLists: async (): Promise<UserList[]> => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) throw new Error('User not authenticated');

            return await listService.getListsForUser(parseInt(userId));
        } catch (error) {
            console.error('Error fetching my lists:', error);
            throw error;
        }
    },

    // Actualizar una lista
    updateList: async (listId: number, listData: CreateListRequest): Promise<UserList> => {
        try {
            const response = await apiAuth.put(`/lists/${listId}/update`, {
                title: listData.title,
                description: listData.description
            });
            return response.data;
        } catch (error) {
            console.error('Error updating list:', error);
            throw error;
        }
    },

    // Eliminar una lista
    deleteList: async (listId: number): Promise<void> => {
        try {
            await apiAuth.delete(`/lists/${listId}/delete`);
        } catch (error) {
            console.error('Error deleting list:', error);
            throw error;
        }
    },

    // Agregar item a la lista
    addItemToList: async (listId: number, item: AddItemRequest): Promise<void> => {
        try {
            await apiAuth.post(`/lists/${listId}/items/add`, item);
        } catch (error) {
            console.error('Error adding item to list:', error);
            throw error;
        }
    },

    // Remover item de la lista
    removeItemFromList: async (listId: number, itemId: number): Promise<void> => {
        try {
            await apiAuth.delete(`/lists/${listId}/items/${itemId}/remove-item`);
        } catch (error) {
            console.error('Error removing item from list:', error);
            throw error;
        }
    },

    // Reordenar items
    reorderItems: async (listId: number, newOrder: ReorderItemRequest[]): Promise<void> => {
        try {
            await apiAuth.put(`/lists/${listId}/items/reorder`, newOrder);
        } catch (error) {
            console.error('Error reordering items:', error);
            throw error;
        }
    },

    // Poblar lista con información completa de los items
    populateList: async (list: UserList): Promise<PopulatedUserList> => {
        try {
            const populatedItems = await Promise.all(
                list.items.map(async (item) => {
                    let name = '';
                    let imageUrl = '';
                    let guideTitle = '';

                    try {
                        switch (item.type) {
                            case 'GAME':
                                { const game = await gameService.getGameById(item.referenceId);
                                name = game.name;
                                imageUrl = game.imageUrl || '';
                                break; }
                            case 'GUIDE':
                                { const guide = await guideService.getById(item.id);
                                name = guide.title;
                                imageUrl = guide.coverImageUrl || '';
                                guideTitle = guide.title || '';
                                break; }
                            /* 
                        case 'CHALLENGE':
                            // Asumo que tienes un challengeService similar
                            // const challenge = await challengeService.getChallengeById(item.referenceId);
                            // name = challenge.title;
                            name = `Challenge ${item.referenceId}`; // Placeholder
                            break;
                         */
                            default:
                                name = 'Unknown Item';
                        }
                    } catch (error) {
                        console.error(`Error fetching item ${item.type}:${item.referenceId}`, error);
                        name = `${item.type} (Error loading)`;
                    }

                    return {
                        ...item,
                        name,
                        imageUrl,
                        guideTitle
                    };
                })
            );

            return {
                ...list,
                items: populatedItems.sort((a, b) => a.position - b.position)
            };
        } catch (error) {
            console.error('Error populating list:', error);
            throw error;
        }
    },

    // Validaciones para listas TOP
    validateTopList: (items: AddItemRequest[], category?: string): { isValid: boolean; message?: string } => {
        if (category === 'TOP') {
            if (items.length < 5) {
                return { isValid: false, message: 'Las listas TOP deben tener al menos 5 elementos' };
            }
            if (items.length > 10) {
                return { isValid: false, message: 'Las listas TOP no pueden tener más de 10 elementos' };
            }
        }
        return { isValid: true };
    }
};

export default listService;
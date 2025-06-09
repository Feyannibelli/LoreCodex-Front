import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ListCategory, ListItemType, AddItemRequest } from '../../interfaces/List';
import { Game } from '../../interfaces/Game';
import listService from '../../services/listService';
import gameService from '../../services/gameService';
import guideService from '../../services/guideService';
import Button from '../../components/Button';
import { Search, X, GripVertical, Plus } from 'lucide-react';

interface GuideItem {
    id: number;
    title: string;
    coverImageUrl?: string;
    gameTitle?: string;
}

const CreateListPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ListCategory>(ListCategory.RELATED);
    const [items, setItems] = useState<AddItemRequest[]>([]);
    const [loading, setLoading] = useState(false);

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<ListItemType>(ListItemType.GAME);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [games, setGames] = useState<Game[]>([]);
    const [guides, setGuides] = useState<GuideItem[]>([]);

    useEffect(() => {
        loadGamesAndGuides();
    }, []);

    const loadGamesAndGuides = async () => {
        try {
            const [gamesData, guidesData] = await Promise.all([
                gameService.getAllGames(),
                guideService.getPublishedGuides()
            ]);
            setGames(gamesData);
            setGuides(guidesData);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            let results: any[] = [];

            if (searchType === ListItemType.GAME) {
                results = games.filter(game =>
                    game.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            } else if (searchType === ListItemType.GUIDE) {
                results = guides.filter(guide =>
                    guide.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const addItem = (item: any) => {
        // Check if item already exists
        const exists = items.find(existingItem =>
            existingItem.referenceId === item.id && existingItem.type === searchType
        );

        if (exists) {
            alert('Este elemento ya está en la lista');
            return;
        }

        // Validate for TOP lists
        if (category === ListCategory.TOP && items.length >= 10) {
            alert('Las listas TOP no pueden tener más de 10 elementos');
            return;
        }

        const newItem: AddItemRequest = {
            type: searchType,
            referenceId: item.id,
            position: items.length + 1
        };

        setItems([...items, newItem]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index)
            .map((item, i) => ({ ...item, position: i + 1 }));
        setItems(newItems);
    };

    const moveItem = (fromIndex: number, toIndex: number) => {
        const newItems = [...items];
        const [movedItem] = newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, movedItem);

        // Update positions
        const updatedItems = newItems.map((item, i) => ({ ...item, position: i + 1 }));
        setItems(updatedItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        // Validation
        if (category === ListCategory.TOP) {
            if (items.length < 5) {
                alert('Las listas TOP deben tener al menos 5 elementos');
                return;
            }
        } else {
            if (items.length < 2) {
                alert('Las listas deben tener al menos 2 elementos');
                return;
            }
        }

        setLoading(true);
        try {
            // Create the list first
            const newList = await listService.createList(user.id, {
                title,
                description,
                category
            });

            // Add items to the list
            for (const item of items) {
                await listService.addItemToList(newList.id, item);
            }

            navigate('/my-lists');
        } catch (error) {
            console.error('Error creating list:', error);
            alert('Error al crear la lista');
        } finally {
            setLoading(false);
        }
    };

    const getItemName = (item: AddItemRequest): string => {
        if (item.type === ListItemType.GAME) {
            const game = games.find(g => g.id === item.referenceId);
            return game?.name || 'Juego desconocido';
        } else if (item.type === ListItemType.GUIDE) {
            const guide = guides.find(g => g.id === item.referenceId);
            return guide?.title || 'Guía desconocida';
        }
        return 'Elemento desconocido';
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Crear Nueva Lista</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Información Básica</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Título</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 border rounded-lg"
                                required
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Descripción</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-3 border rounded-lg"
                                rows={3}
                                maxLength={500}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Categoría</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as ListCategory)}
                                className="w-full p-3 border rounded-lg"
                            >
                                <option value={ListCategory.RELATED}>Lista Relacionada</option>
                                <option value={ListCategory.TOP}>Lista TOP (5-10 elementos)</option>
                            </select>
                            <p className="text-sm text-gray-600 mt-1">
                                {category === ListCategory.TOP
                                    ? 'Las listas TOP deben tener entre 5 y 10 elementos ordenados por ranking'
                                    : 'Listas de elementos relacionados por tema, género, etc.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Add Items */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Agregar Elementos</h2>

                    <div className="flex gap-4 mb-4">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as ListItemType)}
                            className="p-3 border rounded-lg"
                        >
                            <option value={ListItemType.GAME}>Juegos</option>
                            <option value={ListItemType.GUIDE}>Guías</option>
                        </select>

                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Buscar ${searchType === ListItemType.GAME ? 'juegos' : 'guías'}...`}
                                className="flex-1 p-3 border rounded-lg"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} disabled={isSearching}>
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mb-4 border rounded-lg p-4 max-h-60 overflow-y-auto">
                            <h3 className="font-medium mb-2">Resultados de búsqueda:</h3>
                            <div className="space-y-2">
                                {searchResults.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex items-center gap-3">
                                            {item.imageUrl && (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name || item.title}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium">{item.name || item.title}</p>
                                                {item.gameTitle && (
                                                    <p className="text-sm text-gray-600">{item.gameTitle}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button onClick={() => addItem(item)}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Current Items */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">
                        Elementos de la Lista ({items.length}
                        {category === ListCategory.TOP && '/5-10'})
                    </h2>

                    {items.length === 0 ? (
                        <p className="text-gray-600">No hay elementos en la lista</p>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={`${item.type}-${item.referenceId}`} className="flex items-center gap-3 p-3 border rounded-lg">
                                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                {category === ListCategory.TOP ? `#${index + 1}` : item.type}
                                            </span>
                                            <span className="font-medium">{getItemName(item)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => removeItem(index)}
                                        className="text-red-600 hover:bg-red-50 p-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        onClick={() => navigate('/my-lists')}
                        className="bg-gray-500 hover:bg-gray-600"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || items.length < (category === ListCategory.TOP ? 5 : 2)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? 'Creando...' : 'Crear Lista'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateListPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listService, ListItemType, ListItemRequest } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import gameService from '../../services/gameService';
import guideService from '../../services/guideService';
import challengeService from '../../services/challengeService';

interface SearchableItem {
    id: number;
    title: string;
    type: ListItemType;
    thumbnailUrl?: string;
}

const CreateListPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedItems, setSelectedItems] = useState<ListItemRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchableItem[]>([]);
    const [searchType, setSearchType] = useState<ListItemType>(ListItemType.GAME);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (searchTerm.trim()) {
            performSearch();
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, searchType]);

    const performSearch = async () => {
        setIsSearching(true);
        try {
            let results: SearchableItem[] = [];

            switch (searchType) {
                case ListItemType.GAME: {
                    const games = await gameService.searchGamesByName(searchTerm);
                    results = games.map(game => ({
                        id: game.id,
                        title: game.name,
                        type: ListItemType.GAME,
                        thumbnailUrl: game.imageUrl
                    }));
                    break;
                }

                case ListItemType.GUIDE: {
                    const guides = await guideService.getPublishedGuides();
                    const filteredGuides = guides.filter((guide: { id: number; title: string; coverImageUrl?: string }) =>
                        guide.title.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    results = filteredGuides.map((guide: { id: number; title: string; coverImageUrl?: string }) => ({
                        id: guide.id,
                        title: guide.title,
                        type: ListItemType.GUIDE,
                        thumbnailUrl: guide.coverImageUrl || undefined
                    }));
                    break;
                }

                case ListItemType.CHALLENGE:{
                    const challenges = await challengeService.searchChallengesByTitle(searchTerm);
                    results = challenges.map(challenge => ({
                        id: challenge.id,
                        title: challenge.title,
                        type: ListItemType.CHALLENGE
                    }));
                    break;
                }
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const addItemToList = (item: SearchableItem) => {
        const isAlreadyAdded = selectedItems.some(
            selectedItem => selectedItem.referenceId === item.id && selectedItem.type === item.type
        );

        if (!isAlreadyAdded) {
            const newItem: ListItemRequest = {
                type: item.type,
                referenceId: item.id,
                position: selectedItems.length + 1
            };
            setSelectedItems([...selectedItems, newItem]);
        }
    };

    const removeItemFromList = (index: number) => {
        const newItems = selectedItems.filter((_, i) => i !== index);
        // Actualizar posiciones
        const updatedItems = newItems.map((item, i) => ({
            ...item,
            position: i + 1
        }));
        setSelectedItems(updatedItems);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...selectedItems];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newItems.length) {
            [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
            // Actualizar posiciones
            const updatedItems = newItems.map((item, i) => ({
                ...item,
                position: i + 1
            }));
            setSelectedItems(updatedItems);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            const listData = {
                title,
                description,
                items: selectedItems
            };

            await listService.createList(user.id, listData);
            navigate('/my-lists');
        } catch (error) {
            console.error('Error creating list:', error);
            alert('Error creating list. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getItemDisplayName = (item: ListItemRequest) => {
        const searchItem = searchResults.find(r => r.id === item.referenceId && r.type === item.type);
        return searchItem ? searchItem.title : `${item.type} #${item.referenceId}`;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New List</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">List Information</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter list title..."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe your list..."
                        />
                    </div>
                </div>

                {/* Add Items */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Add Items</h2>

                    <div className="flex gap-4 mb-4">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as ListItemType)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={ListItemType.GAME}>Games</option>
                            <option value={ListItemType.GUIDE}>Guides</option>
                            <option value={ListItemType.CHALLENGE}>Challenges</option>
                        </select>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Search ${searchType.toLowerCase()}s...`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Search Results */}
                    {isSearching && <div className="text-center py-4">Searching...</div>}

                    {searchResults.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-medium mb-2">Search Results:</h3>
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                                {searchResults.map((item) => (
                                    <div
                                        key={`${item.type}-${item.id}`}
                                        className="flex items-center justify-between p-3 border-b hover:bg-gray-50"
                                    >
                                        <div className="flex items-center">
                                            {item.thumbnailUrl && (
                                                <img
                                                    src={item.thumbnailUrl}
                                                    alt={item.title}
                                                    className="w-10 h-10 object-cover rounded mr-3"
                                                />
                                            )}
                                            <div>
                                                <span className="font-medium">{item.title}</span>
                                                <span className="text-sm text-gray-500 ml-2">({item.type})</span>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => addItemToList(item)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Selected Items */}
                {selectedItems.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Selected Items ({selectedItems.length})</h2>

                        <div className="space-y-2">
                            {selectedItems.map((item, index) => (
                                <div
                                    key={`${item.type}-${item.referenceId}-${index}`}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                                >
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-500 mr-3">#{index + 1}</span>
                                        <span className="font-medium">{getItemDisplayName(item)}</span>
                                        <span className="text-sm text-gray-500 ml-2">({item.type})</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => moveItem(index, 'up')}
                                            disabled={index === 0}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
                                        >
                                            ↑
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => moveItem(index, 'down')}
                                            disabled={index === selectedItems.length - 1}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
                                        >
                                            ↓
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => removeItemFromList(index)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        disabled={!title.trim() || selectedItems.length === 0 || isSubmitting}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating...' : 'Create List'}
                    </Button>

                    <Button
                        type="button"
                        onClick={() => navigate('/lists')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateListPage;
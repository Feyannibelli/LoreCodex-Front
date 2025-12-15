import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listService, ListItemType, ListItemRequest } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import gameService from '../../services/gameService';
import guideService from '../../services/guideService';
import challengeService from '../../services/challengeService';
import UnifiedContentEditor from '../../components/UnifiedContentEditor';

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

    if (!user) {
        return (
            <div className="min-h-screen bg-bg py-12">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="text-center py-12">
                        <p className="text-text-muted">You need to be logged in to create a list.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg py-12">
            <div className="mx-auto max-w-6xl px-4">
                <div className="relative overflow-hidden rounded-3xl border border bg-surface shadow-sm mb-8">
                    <div className="px-8 py-10">
                        <div className="mb-6">
                            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500 mb-2">Create</p>
                            <h1 className="text-4xl font-bold text-text">Create New List</h1>
                            <p className="text-sm text-text-muted mt-1">
                                Create and share your list of favorite games
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="relative overflow-hidden rounded-3xl border border bg-surface shadow-sm">
                        <div className="px-8 py-10">
                            <h2 className="text-2xl font-bold text-text mb-6">List Information</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-text mb-2">
                                    List Title *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border bg-surface-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                                    placeholder="Ex: My favorite games of 2024"
                                    maxLength={100}
                                />
                                <p className="text-xs text-text-muted mt-1">{title.length}/100 characters</p>
                            </div>

                            <div>
                                <UnifiedContentEditor
                                    label="Description"
                                    value={description}
                                    onChange={setDescription}
                                    rows={8}
                                    helpText="Describe your list. You can use Markdown for text formatting."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Items */}
                    <div className="relative overflow-hidden rounded-3xl border border bg-surface shadow-sm">
                        <div className="px-8 py-10">
                            <h2 className="text-2xl font-bold text-text mb-6">Add Games *</h2>

                            <div className="flex gap-4 mb-6">
                                <select
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value as ListItemType)}
                                    className="px-4 py-3 rounded-lg border border bg-surface-2 text-text focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
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
                                    className="flex-1 px-4 py-3 rounded-lg border border bg-surface-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                                />
                            </div>

                            {/* Search Results */}
                            {isSearching && (
                                <div className="text-center py-4 text-text-muted">Searching...</div>
                            )}

                            {searchResults.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-medium text-text mb-3">Search Results:</h3>
                                    <div className="max-h-60 overflow-y-auto rounded-lg border border bg-surface-2">
                                        {searchResults.map((item) => (
                                            <div
                                                key={`${item.type}-${item.id}`}
                                                className="flex items-center justify-between p-3 border-b border last:border-b-0 hover:bg-[rgba(245,126,0,0.06)] transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.thumbnailUrl && (
                                                        <img
                                                            src={item.thumbnailUrl}
                                                            alt={item.title}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                    )}
                                                    <div>
                                                        <span className="font-medium text-text">{item.title}</span>
                                                        <span className="text-sm text-text-muted ml-2">({item.type})</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={() => addItemToList(item)}
                                                    variant="default"
                                                    size="sm"
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selected Items */}
                    {selectedItems.length > 0 && (
                        <div className="relative overflow-hidden rounded-3xl border border bg-surface shadow-sm">
                            <div className="px-8 py-10">
                                <h2 className="text-2xl font-bold text-text mb-6">Selected Items ({selectedItems.length})</h2>

                                <div className="space-y-3">
                                    {selectedItems.map((item, index) => (
                                        <div
                                            key={`${item.type}-${item.referenceId}-${index}`}
                                            className="flex items-center justify-between p-4 rounded-lg border border bg-surface-2"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-text-muted w-8">#{index + 1}</span>
                                                <span className="font-medium text-text">{getItemDisplayName(item)}</span>
                                                <span className="text-sm text-text-muted">({item.type})</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={() => moveItem(index, 'up')}
                                                    disabled={index === 0}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    ↑
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => moveItem(index, 'down')}
                                                    disabled={index === selectedItems.length - 1}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    ↓
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeItemFromList(index)}
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={!title.trim() || selectedItems.length === 0 || isSubmitting}
                            variant="default"
                        >
                            {isSubmitting ? 'Creating...' : 'Create List'}
                        </Button>

                        <Button
                            type="button"
                            onClick={() => navigate('/lists')}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListPage;

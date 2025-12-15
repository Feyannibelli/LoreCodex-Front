import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListItemType, ListItemRequest } from '../../services/listService';
import gameService from '../../services/gameService';
import guideService from '../../services/guideService';
import challengeService from '../../services/challengeService';
import UnifiedContentEditor from '../UnifiedContentEditor';
import ProEditorLayout from '../layout/ProEditorLayout';
import ProInput from '../ui/ProInput';
import Button from '../Button';
import { Save, Plus, Search, Trash2, ArrowUp, ArrowDown, Hash, FileText, List as ListIcon, Gamepad2, BookOpen, Trophy } from 'lucide-react';

interface SearchableItem {
    id: number;
    title: string;
    type: ListItemType;
    thumbnailUrl?: string;
}

interface ListFormProps {
    initialTitle?: string;
    initialDescription?: string;
    initialItems?: ListItemRequest[];
    initialDisplayNames?: { [key: string]: string };
    onSubmit: (data: { title: string; description: string; items: ListItemRequest[] }) => void;
    submitLabel: string;
    pageTitle: string;
    breadcrumbs: { label: string; href?: string }[];
    isSubmitting?: boolean;
}

const ListForm: React.FC<ListFormProps> = ({
    initialTitle = '',
    initialDescription = '',
    initialItems = [],
    initialDisplayNames = {},
    onSubmit,
    submitLabel,
    pageTitle,
    breadcrumbs,
    isSubmitting = false
}) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [selectedItems, setSelectedItems] = useState<ListItemRequest[]>(initialItems);
    const [itemDisplayNames, setItemDisplayNames] = useState<{ [key: string]: string }>(initialDisplayNames);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchableItem[]>([]);
    const [searchType, setSearchType] = useState<ListItemType>(ListItemType.GAME);
    const [isSearching, setIsSearching] = useState(false);

    // Status for Layout
    const [status, setStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');

    useEffect(() => {
        if (title !== initialTitle || description !== initialDescription || selectedItems.length !== initialItems.length) {
            setStatus('unsaved');
        }
    }, [title, description, selectedItems, initialTitle, initialDescription, initialItems]);

    useEffect(() => {
        if (searchTerm.trim()) {
            const timer = setTimeout(performSearch, 500); // Debounce
            return () => clearTimeout(timer);
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
                    const filtered = guides.filter((g: any) => g.title.toLowerCase().includes(searchTerm.toLowerCase()));
                    results = filtered.map((g: any) => ({
                        id: g.id,
                        title: g.title,
                        type: ListItemType.GUIDE,
                        thumbnailUrl: g.coverImageUrl
                    }));
                    break;
                }
                case ListItemType.CHALLENGE: {
                    const challenges = await challengeService.searchChallengesByTitle(searchTerm);
                    results = challenges.map(c => ({
                        id: c.id,
                        title: c.title,
                        type: ListItemType.CHALLENGE
                    }));
                    break;
                }
            }
            setSearchResults(results.slice(0, 10)); // Limit results
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const addItem = (item: SearchableItem) => {
        const isAdded = selectedItems.some(i => i.referenceId === item.id && i.type === item.type);
        if (!isAdded) {
            const newItem: ListItemRequest = {
                type: item.type,
                referenceId: item.id,
                position: selectedItems.length + 1
            };
            setSelectedItems([...selectedItems, newItem]);

            // Cache name
            const key = `${item.type}-${item.id}`;
            setItemDisplayNames(prev => ({ ...prev, [key]: item.title }));
        }
        setSearchTerm(''); // Clear search after add? Optional.
    };

    const removeItem = (index: number) => {
        const newItems = selectedItems.filter((_, i) => i !== index).map((item, i) => ({
            ...item,
            position: i + 1
        }));
        setSelectedItems(newItems);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...selectedItems];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newItems.length) {
            [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
            // Re-assign positions
            const updated = newItems.map((item, i) => ({ ...item, position: i + 1 }));
            setSelectedItems(updated);
        }
    };

    const getItemName = (item: ListItemRequest) => {
        const key = `${item.type}-${item.referenceId}`;
        return itemDisplayNames[key] || `${item.type} #${item.referenceId}`;
    };

    const handleSubmit = () => {
        setStatus('saving');
        onSubmit({ title, description, items: selectedItems });
    };

    // Helper for Type Icons
    const TypeIcon = ({ type }: { type: ListItemType }) => {
        switch (type) {
            case ListItemType.GAME: return <Gamepad2 className="h-3 w-3" />;
            case ListItemType.GUIDE: return <BookOpen className="h-3 w-3" />;
            case ListItemType.CHALLENGE: return <Trophy className="h-3 w-3" />;
            default: return null;
        }
    };

    const Actions = (
        <Button
            onClick={handleSubmit}
            disabled={!title.trim() || selectedItems.length === 0 || isSubmitting}
            className="gap-2"
        >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
    );

    return (
        <ProEditorLayout
            title={pageTitle}
            breadcrumbs={breadcrumbs}
            actions={Actions}
            status={isSubmitting ? 'saving' : status}
            className="pb-20"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Properties */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-6 sticky top-24">
                        <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-white/5">
                            <ListIcon className="h-4 w-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">List Details</h3>
                        </div>

                        <ProInput
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My Awesome List"
                            required
                            icon={Hash}
                            helperText={`${title.length}/100 characters`}
                            maxLength={100}
                        />

                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1">
                                Description
                            </label>
                            <div className="rounded-lg border border-white/10 bg-black/20 overflow-hidden">
                                <UnifiedContentEditor
                                    value={description}
                                    onChange={setDescription}
                                    rows={8}
                                    placeholder="Describe your list..."
                                // wrapperClassName="border-0 bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Items */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Search / Add */}
                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-4">
                        <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-white/5">
                            <Plus className="h-4 w-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Add Items</h3>
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value as ListItemType)}
                                className="h-10 rounded-lg border border-white/10 bg-secondary/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value={ListItemType.GAME}>Games</option>
                                <option value={ListItemType.GUIDE}>Guides</option>
                                <option value={ListItemType.CHALLENGE}>Challenges</option>
                            </select>
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={`Search ${searchType.toLowerCase()}s...`}
                                    className="h-10 w-full rounded-lg border border-white/10 bg-secondary/30 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        {/* Results Dropdown/Area */}
                        {searchResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                {searchResults.map(item => (
                                    <button
                                        key={`${item.type}-${item.id}`}
                                        onClick={() => addItem(item)}
                                        className="flex items-center gap-3 p-2 rounded-lg border border-white/5 bg-secondary/10 hover:bg-secondary/30 hover:border-primary/30 transition-all text-left group"
                                    >
                                        <div className="h-10 w-10 rounded bg-black/40 overflow-hidden shrink-0">
                                            {item.thumbnailUrl ? (
                                                <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
                                                    <TypeIcon type={item.type} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.title}</p>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <TypeIcon type={item.type} /> {item.type}
                                            </p>
                                        </div>
                                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                    </button>
                                ))}
                            </div>
                        )}
                        {/* Empty Search State */}
                        {isSearching && searchResults.length === 0 && (
                            <p className="text-center text-xs text-muted-foreground py-2">Searching...</p>
                        )}
                        {!isSearching && searchTerm && searchResults.length === 0 && (
                            <p className="text-center text-xs text-muted-foreground py-2">No results found.</p>
                        )}
                    </div>

                    {/* Selected Items List */}
                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5">
                        <div className="flex items-center justify-between text-muted-foreground pb-4 border-b border-white/5 mb-4">
                            <div className="flex items-center gap-2">
                                <ListIcon className="h-4 w-4" />
                                <h3 className="text-xs font-bold uppercase tracking-wider">Items in List ({selectedItems.length})</h3>
                            </div>
                        </div>

                        {selectedItems.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                                <p className="text-muted-foreground text-sm">No items added yet. Use the search above to build your list.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedItems.map((item, index) => (
                                    <div
                                        key={`${item.type}-${item.referenceId}-${index}`}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-card/50 hover:bg-card hover:border-white/10 transition-all group"
                                    >
                                        <div className="flex flex-col items-center justify-center w-8 text-muted-foreground/50 font-mono text-xs">
                                            {index + 1}
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{getItemName(item)}</p>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wide">
                                                <TypeIcon type={item.type} /> {item.type}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => moveItem(index, 'up')}
                                                disabled={index === 0}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => moveItem(index, 'down')}
                                                disabled={index === selectedItems.length - 1}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                onClick={() => removeItem(index)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProEditorLayout>
    );
};

export default ListForm;

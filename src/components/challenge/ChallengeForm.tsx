import React, { useState, useEffect } from 'react';
import { Game } from '../../interfaces/Game';
import { ChallengeFormData } from '../../services/challengeService';
import gameService from '../../services/gameService';
import UnifiedContentEditor from '../UnifiedContentEditor';
import ProEditorLayout from '../layout/ProEditorLayout';
import ProInput from '../ui/ProInput';
import Button from '../Button';
import {
    Save,
    Plus,
    Trash2,
    Search,
    Trophy,
    Gamepad2,
    X,
    Swords,
    Target
} from 'lucide-react';

interface ChallengeFormProps {
    initialData?: ChallengeFormData;
    initialGame?: Game | null;
    onSubmit: (data: ChallengeFormData) => Promise<void>;
    submitLabel?: string;
    pageTitle: string;
    breadcrumbs: { label: string; href?: string }[];
    isSubmitting?: boolean;
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({
    initialData,
    initialGame = null,
    onSubmit,
    submitLabel = 'Save Challenge',
    pageTitle,
    breadcrumbs,
    isSubmitting = false
}) => {
    // Form State
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    // difficulty removed
    const [items, setItems] = useState<string[]>(initialData?.items || ['']);

    // Game Selection State
    const [selectedGame, setSelectedGame] = useState<Game | null>(initialGame);
    const [gameSearchTerm, setGameSearchTerm] = useState('');
    const [games, setGames] = useState<Game[]>([]); // Should ideally use searching

    const [showGameSearch, setShowGameSearch] = useState(false);

    // Layout Status
    const [status, setStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');

    // Load games for search (ideally should be efficient search, simplified here as per original)
    useEffect(() => {
        const loadGames = async () => {
            try {
                const response = await gameService.getGames({ page: 0, size: 50, sort: 'title,asc' }); // Optimization: use search endpoint if available
                setGames(response.content);
            } catch (err) {
                console.error("Error loading games", err);
            }
        };
        // Only load if we are searching or need to? For now load on mount as per original
        if (games.length === 0) loadGames();
    }, [games.length]);

    useEffect(() => {
        if (
            title !== (initialData?.title || '') ||
            description !== (initialData?.description || '') ||
            items !== (initialData?.items || [])
        ) {
            setStatus('unsaved');
        }
    }, [title, description, items, initialData]);

    const handleAddItem = () => {
        setItems([...items, '']);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        setItems(newItems);
    };

    const filteredGames = games.filter(g =>
        g.title.toLowerCase().includes(gameSearchTerm.toLowerCase())
    ).slice(0, 10);

    const handleGameSelect = (game: Game) => {
        setSelectedGame(game);
        setShowGameSearch(false);
        setGameSearchTerm('');

        // Auto-inject game info if not present
        if (!description.includes(game.title)) {
            // Optional: Don't force this if user doesn't want it, but original did it.
            // We'll leave it as a user choice or subtle suggestion in PRO editor, 
            // but for parity we can append it or just let the user link it.
            // For now, let's keep it clean and just link the ID/Name in metadata if needed.
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            // Toast error?
            return;
        }

        setStatus('saving');
        await onSubmit({
            title,
            description,
            // difficulty removed
            // itemType: 'checklist', // Default - Removed as not in interface
            items: items.filter(i => i.trim() !== ''),
            // gameId: selectedGame?.id // If backend supports gameId direct link
            // targetGameId: selectedGame?.id
        });
        setStatus('saved');
    };

    const Actions = (
        <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
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
                {/* Left Column: Core Info */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-6 sticky top-24">
                        <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-white/5">
                            <Trophy className="h-4 w-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Challenge Details</h3>
                        </div>

                        <ProInput
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="E.g. No Damage Run"
                            required
                            icon={Swords}
                        />

                        {/* Game Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1">
                                Related Game
                            </label>
                            {selectedGame ? (
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5 group">
                                    <div className="h-10 w-10 rounded bg-black/40 overflow-hidden shrink-0">
                                        {selectedGame.coverImage ? (
                                            <img src={selectedGame.coverImage} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground"><Gamepad2 className="h-5 w-5" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{selectedGame.title}</p>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                        onClick={() => setSelectedGame(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <ProInput
                                        value={gameSearchTerm}
                                        onChange={(e) => {
                                            setGameSearchTerm(e.target.value);
                                            setShowGameSearch(true);
                                        }}
                                        placeholder="Search game..."
                                        icon={Search}
                                        onFocus={() => setShowGameSearch(true)}
                                    />
                                    {showGameSearch && gameSearchTerm && (
                                        <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl border border-white/10 bg-card shadow-xl z-50 max-h-60 overflow-y-auto">
                                            {filteredGames.length > 0 ? (
                                                filteredGames.map(game => (
                                                    <button
                                                        key={game.id}
                                                        onClick={() => handleGameSelect(game)}
                                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left transition-colors"
                                                    >
                                                        <img src={game.coverImage || ''} className="h-8 w-8 rounded bg-black/50 object-cover" alt="" />
                                                        <span className="text-sm truncate">{game.title}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-xs text-muted-foreground p-2 text-center">No games found.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Difficulty Input Removed */}


                    </div>
                </div>

                {/* Right Column: Description & Tasks */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-4">
                        <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-white/5">
                            <Target className="h-4 w-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Description</h3>
                        </div>
                        <UnifiedContentEditor
                            value={description}
                            onChange={setDescription}
                            rows={8}
                            placeholder="Explain the rules of the challenge..."
                        />
                    </div>

                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Swords className="h-4 w-4" />
                                <h3 className="text-xs font-bold uppercase tracking-wider">Objectives / Tasks</h3>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleAddItem} className="h-7 text-xs gap-1">
                                <Plus className="h-3 w-3" /> Add Task
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 group">
                                    <div className="flex h-10 w-8 items-center justify-center text-muted-foreground/30 font-mono text-xs">
                                        {index + 1}
                                    </div>
                                    <ProInput
                                        value={item}
                                        onChange={(e) => handleItemChange(index, e.target.value)}
                                        placeholder={`Task #${index + 1}`}
                                        className="flex-1"
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRemoveItem(index)}
                                        className="h-10 w-10 text-muted-foreground/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ProEditorLayout>
    );
};

export default ChallengeForm;

import { useState, useEffect } from "react";
import { GuideForm as Form } from "../../interfaces/Guide";
import { Game } from "../../interfaces/Game";
import gameService from "../../services/gameService";
import UnifiedContentEditor from "../UnifiedContentEditor";
import ProInput from "../ui/ProInput";
import ProEditorLayout from "../layout/ProEditorLayout";
import Button from "../Button";
import { Save, Send, Image as ImageIcon, Tag, Hash, FileText, Eye, Gamepad2, Search, X } from "lucide-react";


interface Props {
    initial?: Form;
    submitLabel: string;
    onSubmit: (data: Form) => void;
    onPublish?: (data: Form) => void;
    publishLabel?: string;
    pageTitle: string;
    breadcrumbs: { label: string; href?: string }[];
}

const GuideForm: React.FC<Props> = ({
    initial,
    submitLabel,
    onSubmit,
    onPublish,
    publishLabel = "Publish Guide",
    pageTitle,
    breadcrumbs
}) => {
    // Form State
    const [form, setForm] = useState<Form>(
        initial ?? {
            title: "",
            content: "",
            coverImageUrl: "",
            tags: [],
            published: false,
            draft: true,
            gameId: undefined
        }
    );

    // Game Selection State
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [gameSearchTerm, setGameSearchTerm] = useState('');
    const [showGameSearch, setShowGameSearch] = useState(false);
    const [games, setGames] = useState<Game[]>([]);

    // Tag Input State (Local to allow typing commas without immediate format/wipe)
    const [tagInput, setTagInput] = useState(initial?.tags?.join(", ") || "");

    // Save Status State (simulated for UI feedback)
    const [status, setStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');

    // Load initial game if editing and gameId exists
    useEffect(() => {
        if (initial?.gameId && !selectedGame) {
            gameService.getGameById(initial.gameId).then(setSelectedGame);
        }
    }, [initial?.gameId]);

    // Load games for search
    useEffect(() => {
        const loadGames = async () => {
            try {
                const response = await gameService.getGames({ page: 0, size: 50, sort: 'title,asc' });
                setGames(response.content);
            } catch (err) {
                console.error("Error loading games", err);
            }
        };
        if (games.length === 0) loadGames();
    }, [games.length]);

    // Mark as unsaved on change
    useEffect(() => {
        setStatus('unsaved');
    }, [form, selectedGame]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleContentChange = (value: string) => {
        setForm(prev => ({ ...prev, content: value }));
    };

    const handleTags = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTagInput(val);
        setForm(prev => ({
            ...prev,
            tags: val.split(",").map(t => t.trim()).filter(Boolean),
        }));
    };

    // Game Selection Handlers
    const filteredGames = games.filter(g =>
        g.title.toLowerCase().includes(gameSearchTerm.toLowerCase())
    ).slice(0, 10);

    const handleGameSelect = (game: Game) => {
        setSelectedGame(game);
        setForm(prev => ({ ...prev, gameId: game.id }));
        setShowGameSearch(false);
        setGameSearchTerm('');
    };

    const handleRemoveGame = () => {
        setSelectedGame(null);
        setForm(prev => ({ ...prev, gameId: undefined }));
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setStatus('saving');
        onSubmit({ ...form, gameId: selectedGame?.id });
    };

    const handlePublish = () => {
        if (onPublish) {
            setStatus('saving');
            onPublish({ ...form, published: true, draft: false, gameId: selectedGame?.id });
        }
    };

    // Actions Component for Header
    const FormActions = (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSubmit()}
                className="text-muted-foreground hover:text-foreground hidden sm:flex"
            >
                <Save className="h-4 w-4 mr-2" />
                {submitLabel}
            </Button>

            {onPublish && (
                <Button
                    variant="default"
                    size="sm"
                    onClick={handlePublish}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
                >
                    <Send className="h-4 w-4 mr-2" />
                    {publishLabel}
                </Button>
            )}
        </div>
    );

    return (
        <ProEditorLayout
            title={pageTitle}
            breadcrumbs={breadcrumbs}
            actions={FormActions}
            status={status}
            className="pb-20"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Basics & Metadata (Sticky on Desktop) */}
                <div className="space-y-6 lg:col-span-1">
                    {/* BASICS CARD */}
                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-6">
                        <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-white/5">
                            <FileText className="h-4 w-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Basics</h3>
                        </div>

                        <ProInput
                            label="Title"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Guide Title"
                            required
                            icon={Hash}
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
                                        onClick={handleRemoveGame}
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

                        <div className="space-y-3">
                            <ProInput
                                label="Cover Image"
                                name="coverImageUrl"
                                value={form.coverImageUrl ?? ""}
                                onChange={handleChange}
                                placeholder="https://..."
                                icon={ImageIcon}
                            />

                            {/* Small Cover Preview */}
                            <div className="aspect-video w-full rounded-lg bg-black/40 border border-white/5 overflow-hidden relative group">
                                {form.coverImageUrl ? (
                                    <img
                                        src={form.coverImageUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40">
                                        <ImageIcon className="h-8 w-8 mb-2" />
                                        <span className="text-xs">No cover image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* METADATA CARD */}
                    <div className="rounded-xl border border-white/5 bg-card/60 backdrop-blur-sm p-5 space-y-6">
                        <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-white/5">
                            <Tag className="h-4 w-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Metadata</h3>
                        </div>

                        <div className="space-y-2">
                            <ProInput
                                label="Tags"
                                name="tags"
                                value={tagInput}
                                onChange={handleTags}
                                placeholder="comma, separated, tags"
                                helperText="Press comma to separate"
                                icon={Tag}
                            />
                            {/* Tags Preview Pills */}
                            {form.tags && form.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {form.tags.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Content Editor */}
                <div className="lg:col-span-2 min-h-[500px]">
                    <div className="rounded-xl border border-white/5 bg-card/90 shadow-sm overflow-hidden h-full flex flex-col">
                        {/* Optional Toolbar Header provided by UnifiedContentEditor logic usually, simplified here */}
                        <div className="p-1 border-b border-white/5 bg-muted/20 flex items-center justify-between px-4 py-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase">MD Editor</span>
                            <Eye className="h-3 w-3 text-muted-foreground" />
                        </div>

                        <div className="flex-1 p-0">
                            {/* Passing a wrapper style via className logic if supported, or modifying UnifiedContentEditor */}
                            <UnifiedContentEditor
                                value={form.content}
                                onChange={handleContentChange}
                                rows={30}
                                placeholder="# Start writing your masterpiece..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProEditorLayout>
    );
};

export default GuideForm;

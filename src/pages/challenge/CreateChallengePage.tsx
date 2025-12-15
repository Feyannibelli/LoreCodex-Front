import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { ChallengeFormData } from '../../services/challengeService';
import gameService from '../../services/gameService';
import { Game } from '../../interfaces/Game';
import Button from '../../components/Button';
import UnifiedContentEditor from '../../components/UnifiedContentEditor';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Search,
    X
} from 'lucide-react';

const CreateChallengePage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Game[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showGameSearch, setShowGameSearch] = useState(false);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);

    const [formData, setFormData] = useState<ChallengeFormData>({
        title: '',
        description: '',
        items: [''],
        difficulty: 3,
        mediaUrl: '',
        mediaType: 'none'
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchGames = async () => {
            try {
                const gamesData = await gameService.getAllGames();
                setGames(gamesData);
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        };

        fetchGames();
    }, [isAuthenticated, navigate]);

    const filteredGames = games.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = <K extends keyof ChallengeFormData>(
        field: K,
        value: ChallengeFormData[K]
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...formData.items];
        newItems[index] = value;
        setFormData(prev => ({
            ...prev,
            items: newItems
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, '']
        }));
    };

    const removeItem = (index: number) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                items: newItems
            }));
        }
    };

    const handleGameSelect = (game: Game) => {
        setSelectedGame(game);
        setShowGameSearch(false);
        if (!formData.description.includes(game.name)) {
            const gameInfo = `\n\n## Juego: ${game.name}\n${game.description}\n`;
            setFormData(prev => ({
                ...prev,
                description: prev.description + gameInfo
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('El título es obligatorio');
            return;
        }

        if (!formData.description.trim()) {
            alert('La descripción es obligatoria');
            return;
        }

        if (formData.items.some(item => !item.trim())) {
            alert('Todas las tareas deben tener contenido');
            return;
        }

        if (formData.mediaType !== 'none' && !formData.mediaUrl?.trim()) {
            alert('Debes proporcionar una URL para la imagen o video');
            return;
        }

        setLoading(true);
        try {
            const challenge = await challengeService.createChallenge(formData);
            navigate(`/challenges/${challenge.id}`);
        } catch (error) {
            console.error('Error creating challenge:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/challenges')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft size={20} />
                    Volver a Challenges
                </button>

                <h1 className="text-3xl font-bold text-foreground">
                    Crear Nuevo Challenge
                </h1>
                <p className="text-muted-foreground mt-2">
                    Crea un challenge para que otros usuarios puedan completar
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información básica */}
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        Información Básica
                    </h2>

                    <div className="space-y-4">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Título del Challenge *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Ej: Completar Dark Souls sin morir"
                                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-input bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                                required
                            />
                        </div>

                        {/* Juego relacionado */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Juego Relacionado (Opcional)
                            </label>
                            {selectedGame ? (
                                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                    {selectedGame.imageUrl && (
                                        <img
                                            src={selectedGame.imageUrl}
                                            alt={selectedGame.name}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-foreground">
                                            {selectedGame.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedGame.genre} • {selectedGame.releaseDate}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGame(null)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowGameSearch(!showGameSearch)}
                                        className="w-full px-3 py-2 border border-input rounded-lg text-left text-muted-foreground hover:bg-secondary/50"
                                    >
                                        <Search className="inline mr-2" size={16} />
                                        Buscar juego...
                                    </button>

                                    {showGameSearch && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                            <div className="p-3 border-b border-border">
                                                <input
                                                    type="text"
                                                    placeholder="Buscar juego..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full px-3 py-2 border border-input rounded focus:ring-2 focus:ring-ring focus:border-input bg-background text-foreground"
                                                />
                                            </div>
                                            <div className="max-h-40 overflow-y-auto">
                                                {filteredGames.slice(0, 10).map((game) => (
                                                    <button
                                                        key={game.id}
                                                        type="button"
                                                        onClick={() => handleGameSelect(game)}
                                                        className="w-full p-3 text-left hover:bg-muted/50 flex items-center gap-3"
                                                    >
                                                        {game.imageUrl && (
                                                            <img
                                                                src={game.imageUrl}
                                                                alt={game.name}
                                                                className="w-8 h-8 object-cover rounded"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-foreground">
                                                                {game.name}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {game.genre}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Descripción - UNIFICADO */}
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <UnifiedContentEditor
                        label="Descripción del Challenge *"
                        value={formData.description}
                        onChange={(value) => handleInputChange('description', value)}
                        rows={12}
                        helpText="Describe tu challenge en detalle. Puedes usar Markdown para dar formato y menciones para referenciar otros contenidos."
                    />
                </div>

                {/* Tareas/Checklist */}
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-foreground">
                            Tareas del Challenge
                        </h2>
                        <Button
                            type="button"
                            onClick={addItem}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Agregar Tarea
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {formData.items.map((item, index) => (
                            <div key={index} className="flex gap-3 items-start">
                                <span className="text-sm font-medium text-muted-foreground mt-2 min-w-[3rem]">
                                    Tarea {index + 1}
                                </span>
                                <textarea
                                    value={item}
                                    onChange={(e) => handleItemChange(index, e.target.value)}
                                    placeholder="Describe la tarea..."
                                    rows={2}
                                    className="flex-1 px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-input bg-secondary/50 text-foreground resize-vertical placeholder:text-muted-foreground"
                                    required
                                />
                                {formData.items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="text-destructive hover:text-destructive/80 mt-2"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-muted-foreground mt-4">
                        Las tareas se mostrarán en orden y los usuarios podrán marcarlas como completadas.
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 justify-end">
                    <Button
                        type="button"
                        onClick={() => navigate('/challenges')}
                        variant="ghost"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                                Creating...
                            </>
                        ) : (
                            'Create Challenge'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateChallengePage;

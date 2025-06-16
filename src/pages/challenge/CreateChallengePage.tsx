import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { ChallengeFormData } from '../../services/challengeService';
import gameService from '../../services/gameService';
import { Game } from '../../interfaces/Game';
import Button from '../../components/Button';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Image,
    Video,
    FileText,
    Star,
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

    const [mediaMode, setMediaMode] = useState<'image' | 'video' | 'comment'>('comment');
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Cargar juegos para el buscador
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

    const handleMediaModeChange = (mode: 'image' | 'video' | 'comment') => {
        setMediaMode(mode);
        if (mode === 'comment') {
            setFormData(prev => ({
                ...prev,
                mediaType: 'none',
                mediaUrl: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                mediaType: mode,
                mediaUrl: ''
            }));
        }
    };

    const handleGameSelect = (game: Game) => {
        setSelectedGame(game);
        setShowGameSearch(false);
        // Opcionalmente, agregar información del juego a la descripción
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

        // Validaciones
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

    const getDifficultyLabel = (difficulty: number) => {
        const labels = {
            1: 'Super Fácil',
            2: 'Fácil',
            3: 'Normal',
            4: 'Difícil',
            5: 'Super Difícil',
            6: 'Extremo'
        };
        return labels[difficulty as keyof typeof labels];
    };

    const getDifficultyColor = (difficulty: number) => {
        const colors = {
            1: 'bg-green-100 text-green-800',
            2: 'bg-blue-100 text-blue-800',
            3: 'bg-yellow-100 text-yellow-800',
            4: 'bg-orange-100 text-orange-800',
            5: 'bg-red-100 text-red-800',
            6: 'bg-purple-100 text-purple-800'
        };
        return colors[difficulty as keyof typeof colors];
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/challenges')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                >
                    <ArrowLeft size={20} />
                    Volver a Challenges
                </button>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Crear Nuevo Challenge
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Crea un challenge para que otros usuarios puedan completar
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información básica */}
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Información Básica
                    </h2>

                    <div className="space-y-4">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Título del Challenge *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Ej: Completar Dark Souls sin morir"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F47E00] focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        {/* Dificultad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nivel de Dificultad
                            </label>
                            <div className="space-y-3">
                                <input
                                    type="range"
                                    min="1"
                                    max="6"
                                    value={formData.difficulty}
                                    onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                                <div className="flex justify-between items-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(formData.difficulty)}`}>
                                        {getDifficultyLabel(formData.difficulty)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 6 }, (_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={i < formData.difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Juego relacionado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Juego Relacionado (Opcional)
                            </label>
                            {selectedGame ? (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    {selectedGame.imageUrl && (
                                        <img
                                            src={selectedGame.imageUrl}
                                            alt={selectedGame.name}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {selectedGame.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedGame.genre} • {selectedGame.releaseDate}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGame(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowGameSearch(!showGameSearch)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-left text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <Search className="inline mr-2" size={16} />
                                        Buscar juego...
                                    </button>

                                    {showGameSearch && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                                <input
                                                    type="text"
                                                    placeholder="Buscar juego..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-[#F47E00] focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div className="max-h-40 overflow-y-auto">
                                                {filteredGames.slice(0, 10).map((game) => (
                                                    <button
                                                        key={game.id}
                                                        type="button"
                                                        onClick={() => handleGameSelect(game)}
                                                        className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                                                    >
                                                        {game.imageUrl && (
                                                            <img
                                                                src={game.imageUrl}
                                                                alt={game.name}
                                                                className="w-8 h-8 object-cover rounded"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {game.name}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
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

                {/* Media */}
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Contenido Media
                    </h2>

                    <div className="space-y-4">
                        {/* Selector de tipo de media */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleMediaModeChange('comment')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                    mediaMode === 'comment'
                                        ? 'bg-[#F47E00] text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <FileText size={16} />
                                Solo Texto
                            </button>
                            <button
                                type="button"
                                onClick={() => handleMediaModeChange('image')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                    mediaMode === 'image'
                                        ? 'bg-[#F47E00] text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <Image size={16} />
                                Imagen
                            </button>
                            <button
                                type="button"
                                onClick={() => handleMediaModeChange('video')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                    mediaMode === 'video'
                                        ? 'bg-[#F47E00] text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <Video size={16} />
                                Video
                            </button>
                        </div>

                        {/* URL de media */}
                        {mediaMode !== 'comment' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    URL de {mediaMode === 'image' ? 'Imagen' : 'Video'} *
                                </label>
                                <input
                                    type="url"
                                    value={formData.mediaUrl || ''}
                                    onChange={(e) => handleInputChange('mediaUrl', e.target.value)}
                                    placeholder={`https://ejemplo.com/${mediaMode === 'image' ? 'imagen.jpg' : 'video.mp4'}`}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F47E00] focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required={mediaMode === 'image' || mediaMode === 'video'}
                                    />
                            </div>
                        )}

                        {/* Preview de media */}
                        {formData.mediaUrl && mediaMode !== 'comment' && (
                            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                                    Preview:
                                </div>
                                <div className="p-4">
                                    {mediaMode === 'image' ? (
                                        <img
                                            src={formData.mediaUrl}
                                            alt="Preview"
                                            className="max-w-full h-auto max-h-64 object-contain mx-auto"
                                            onError={(e) => {
                                                e.currentTarget.src = '';
                                                e.currentTarget.alt = 'Error cargando imagen';
                                            }}
                                        />
                                    ) : (
                                        <video
                                            src={formData.mediaUrl}
                                            controls
                                            className="max-w-full h-auto max-h-64 mx-auto"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Descripción */}
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Descripción del Challenge *
                        </h2>
                        <button
                            type="button"
                            onClick={() => setPreviewMode(!previewMode)}
                            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            {previewMode ? 'Editar' : 'Preview'}
                        </button>
                    </div>

                    {previewMode ? (
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-32 bg-gray-50 dark:bg-gray-700">
                            <MarkdownViewer content={formData.description} />
                        </div>
                    ) : (
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe tu challenge en detalle. Puedes usar Markdown para dar formato..."
                            rows={8}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F47E00] focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical"
                            required
                        />
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Soporta Markdown: **negrita**, *cursiva*, `código`, etc.
                    </p>
                </div>

                {/* Tareas/Checklist */}
                <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Tareas del Challenge
                        </h2>
                        <Button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Agregar Tarea
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {formData.items.map((item, index) => (
                            <div key={index} className="flex gap-3 items-start">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 min-w-[3rem]">
                                    Tarea {index + 1}
                                </span>
                                <textarea
                                    value={item}
                                    onChange={(e) => handleItemChange(index, e.target.value)}
                                    placeholder="Describe la tarea... (soporta Markdown)"
                                    rows={2}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F47E00] focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical"
                                    required
                                />
                                {formData.items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="text-red-500 hover:text-red-700 mt-2"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Las tareas se mostrarán en orden y los usuarios podrán marcarlas como completadas.
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 justify-end">
                    <Button
                        type="button"
                        onClick={() => navigate('/challenges')}
                        className="bg-gray-500 hover:bg-gray-600"
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
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creando...
                            </>
                        ) : (
                            'Crear Challenge'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateChallengePage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import gameService from '@/services/gameService';
import challengeService from '@/services/challengeService';
import { ChallengeFormData, MediaItem } from '@/interfaces/Challenge';
import Button from '@/components/Button';
import { PlusCircle, MinusCircle, Image, Film } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Game {
    id: number;
    name: string;
    coverImage: string;
}

const CreateChallengePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [previewMode, setPreviewMode] = useState<boolean>(false);

    // Form state
    const [formData, setFormData] = useState<ChallengeFormData>({
        title: '',
        description: '',
        gameId: 0,
        difficultyRating: 3, // Default to medium
        tasks: [{ description: '' }],
        mediaItems: []
    });

    // Media input state
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [mediaUrl, setMediaUrl] = useState<string>('');

    // Load games on component mount
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesData = await gameService.getAllGames();
                setGames(gamesData);
                // Set default game if available
                if (gamesData.length > 0) {
                    setFormData(prev => ({ ...prev, gameId: gamesData[0].id }));
                }
            } catch (error) {
                console.error("Failed to fetch games:", error);
            }
        };

        fetchGames();
    }, []);

    // Create challenge handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!formData.title.trim()) {
            alert("Please enter a title for your challenge");
            return;
        }

        if (!formData.description.trim()) {
            alert("Please enter a description for your challenge");
            return;
        }

        if (formData.gameId === 0) {
            alert("Please select a game for your challenge");
            return;
        }

        if (formData.tasks.length === 0 || formData.tasks.some(task => !task.description.trim())) {
            alert("Please add at least one task with a description");
            return;
        }

        try {
            setLoading(true);
            const newChallenge = await challengeService.createChallenge(formData);
            navigate(`/challenges/${newChallenge.id}`);
        } catch (error) {
            console.error("Failed to create challenge:", error);
            alert("Failed to create challenge. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Input change handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'gameId' || name === 'difficultyRating' ? Number(value) : value
        }));
    };

    // Task handlers
    const handleAddTask = () => {
        setFormData(prev => ({
            ...prev,
            tasks: [...prev.tasks, { description: '' }]
        }));
    };

    const handleRemoveTask = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.filter((_, i) => i !== index)
        }));
    };

    const handleTaskChange = (index: number, value: string) => {
        setFormData(prev => {
            const newTasks = [...prev.tasks];
            newTasks[index].description = value;
            return { ...prev, tasks: newTasks };
        });
    };

    // Media handlers
    const handleAddMedia = () => {
        if (!mediaUrl.trim()) {
            alert("Please enter a valid URL for your media");
            return;
        }

        const newMediaItem: MediaItem = {
            type: mediaType,
            url: mediaUrl
        };

        setFormData(prev => ({
            ...prev,
            mediaItems: [...(prev.mediaItems || []), newMediaItem]
        }));

        // Reset media input
        setMediaUrl('');
    };

    const handleRemoveMedia = (index: number) => {
        setFormData(prev => ({
            ...prev,
            mediaItems: (prev.mediaItems || []).filter((_, i) => i !== index)
        }));
    };

    // Find selected game
    const selectedGame = games.find(game => game.id === formData.gameId);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Button onClick={() => navigate("/challenges")} className="text-sm">
                    ← Back to Challenges
                </Button>
            </div>

            <div className="bg-white dark:bg-[#1E2A2B] rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700">
                    <h1 className="text-2xl font-bold">Create New Challenge</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Create a challenge for other players to complete and track their progress.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic info section */}
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md dark:bg-[#1A2425] dark:border-gray-700"
                                    placeholder="Enter challenge title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Game</label>
                                <select
                                    name="gameId"
                                    value={formData.gameId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md dark:bg-[#1A2425] dark:border-gray-700"
                                    required
                                >
                                    <option value={0} disabled>Select a game</option>
                                    {games.map(game => (
                                        <option key={game.id} value={game.id}>{game.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Difficulty Rating</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    name="difficultyRating"
                                    min="1"
                                    max="6"
                                    value={formData.difficultyRating}
                                    onChange={handleInputChange}
                                    className="w-full"
                                />
                                <span className={`text-sm font-medium px-3 py-1 rounded text-white ${
                                    formData.difficultyRating <= 2 ? 'bg-green-500' :
                                        formData.difficultyRating <= 4 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>
                  {formData.difficultyRating === 1 && 'Very Easy'}
                                    {formData.difficultyRating === 2 && 'Easy'}
                                    {formData.difficultyRating === 3 && 'Medium'}
                                    {formData.difficultyRating === 4 && 'Hard'}
                                    {formData.difficultyRating === 5 && 'Very Hard'}
                                    {formData.difficultyRating === 6 && 'Extreme'}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description section with markdown */}
                    <div className="p-6 border-b dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Description</h2>
                            <div>
                                <Button
                                    type="button"
                                    onClick={() => setPreviewMode(!previewMode)}
                                    className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white text-sm"
                                >
                                    {previewMode ? 'Edit' : 'Preview'}
                                </Button>
                            </div>
                        </div>

                        {previewMode ? (
                            <div className="border p-4 rounded-md min-h-[200px] dark:bg-[#1A2425] dark:border-gray-700">
                                <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                                    {formData.description}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full p-3 border rounded-md min-h-[200px] dark:bg-[#1A2425] dark:border-gray-700"
                                placeholder="Describe your challenge using Markdown formatting..."
                                required
                            />
                        )}

                        <div className="text-xs text-gray-500 mt-2">
                            You can use Markdown formatting: **bold**, *italic*, # headings, etc.
                        </div>
                    </div>

                    {/* Media items section */}
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Media Items</h2>

                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex-1">
                                <div className="flex gap-2 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setMediaType('image')}
                                        className={`flex items-center gap-1 px-3 py-1 rounded ${
                                            mediaType === 'image'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }`}
                                    >
                                        <Image size={16} /> Image
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMediaType('video')}
                                        className={`flex items-center gap-1 px-3 py-1 rounded ${
                                            mediaType === 'video'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }`}
                                    >
                                        <Film size={16} /> Video
                                    </button>
                                </div>
                                <input
                                    type="url"
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                    className="w-full p-2 border rounded-md dark:bg-[#1A2425] dark:border-gray-700"
                                    placeholder={`Enter ${mediaType} URL...`}
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleAddMedia}
                                className="bg-[#F47E00] text-white"
                            >
                                Add Media
                            </Button>
                        </div>

                        {/* Media preview */}
                        {formData.mediaItems && formData.mediaItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {formData.mediaItems.map((item, index) => (
                                    <div key={index} className="relative border rounded-md overflow-hidden dark:border-gray-700">
                                        {item.type === 'image' ? (
                                            <img
                                                src={item.url}
                                                alt={`Media ${index + 1}`}
                                                className="w-full h-auto"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
                                                }}
                                            />
                                        ) : (
                                            <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <div className="text-center p-4">
                                                    <Film className="mx-auto h-8 w-8 text-gray-400" />
                                                    <p className="mt-1 text-sm text-gray-500">Video: {item.url}</p>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMedia(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            <MinusCircle size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border rounded-md bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No media items added yet. Add images or videos to enhance your challenge.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tasks section */}
                    <div className="p-6 border-b dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Challenge Tasks</h2>
                            <Button
                                type="button"
                                onClick={handleAddTask}
                                className="bg-[#F47E00] text-white text-sm"
                            >
                                <PlusCircle size={16} className="mr-1" /> Add Task
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {formData.tasks.map((task, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={task.description}
                                            onChange={(e) => handleTaskChange(index, e.target.value)}
                                            className="w-full p-2 border rounded-md dark:bg-[#1A2425] dark:border-gray-700"
                                            placeholder="Describe what players need to accomplish..."
                                            required
                                        />
                                    </div>
                                    {formData.tasks.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTask(index)}
                                            className="p-2 text-red-500 hover:text-red-700"
                                        >
                                            <MinusCircle size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preview section */}
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Challenge Preview</h2>

                        <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                            {/* Game cover preview */}
                            <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                                {selectedGame?.coverImage ? (
                                    <img
                                        src={selectedGame.coverImage}
                                        alt={selectedGame.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                        {selectedGame ? selectedGame.name : 'No game selected'}
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    <h3 className="text-xl font-bold text-white">
                                        {formData.title || 'Challenge Title'}
                                    </h3>
                                    <p className="text-white text-opacity-90">
                                        {selectedGame?.name || 'Game Name'}
                                    </p>
                                </div>
                            </div>

                            {/* Challenge stats preview */}
                            <div className="p-4 bg-gray-50 dark:bg-[#1A2425] border-t dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`text-sm font-medium px-3 py-1 rounded text-white ${
                                            formData.difficultyRating <= 2 ? 'bg-green-500' :
                                                formData.difficultyRating <= 4 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}>
                                            {formData.difficultyRating === 1 && 'Very Easy'}
                                            {formData.difficultyRating === 2 && 'Easy'}
                                            {formData.difficultyRating === 3 && 'Medium'}
                                            {formData.difficultyRating === 4 && 'Hard'}
                                            {formData.difficultyRating === 5 && 'Very Hard'}
                                            {formData.difficultyRating === 6 && 'Extreme'}
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                      By {user?.username || 'You'}
                    </span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">{formData.tasks.length}</span> tasks
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className="p-6 bg-gray-50 dark:bg-[#1A2425] flex justify-end">
                        <Button
                            type="submit"
                            className="bg-[#F47E00] text-white"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Challenge'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateChallengePage;
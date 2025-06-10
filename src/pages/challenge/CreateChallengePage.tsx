import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChallengeFormData, DifficultyLevel, difficultyLabels, MediaItem } from '../../interfaces/Challenge';
import challengeService from '../../services/challengeService';
import gameService from '../../services/gameService';
import { Game } from '../../interfaces/Game';
import Button from '../../components/Button';
import '../../css/ChallengeCreate.css';

const CreateChallengePage: React.FC = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    // Form State
    const [formData, setFormData] = useState<ChallengeFormData>({
        title: '',
        description: '',
        gameId: 0,
        difficultyRating: 3, // Default to Medium
        tasks: [{ description: '' }],
        mediaItems: []
    });

    useEffect(() => {
        // Load games for the dropdown
        const loadGames = async () => {
            try {
                setLoading(true);
                const gamesData = await gameService.getAllGames();
                setGames(gamesData);
                setError(null);
            } catch (err) {
                console.error("Error loading games:", err);
                setError("Failed to load games. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadGames();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'gameId' || name === 'difficultyRating' ? parseInt(value) : value
        }));
    };

    const handleTaskChange = (index: number, value: string) => {
        const updatedTasks = [...formData.tasks];
        updatedTasks[index] = { ...updatedTasks[index], description: value };
        setFormData(prev => ({
            ...prev,
            tasks: updatedTasks
        }));
    };

    const addTask = () => {
        setFormData(prev => ({
            ...prev,
            tasks: [...prev.tasks, { description: '' }]
        }));
    };

    const removeTask = (index: number) => {
        const updatedTasks = [...formData.tasks];
        updatedTasks.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            tasks: updatedTasks
        }));
    };

    const handleMediaChange = (index: number, field: keyof MediaItem, value: string) => {
        const updatedMediaItems = [...(formData.mediaItems || [])];
        updatedMediaItems[index] = {
            ...updatedMediaItems[index],
            [field]: value
        };

        setFormData(prev => ({
            ...prev,
            mediaItems: updatedMediaItems
        }));
    };

    const addMediaItem = () => {
        setFormData(prev => ({
            ...prev,
            mediaItems: [...(prev.mediaItems || []), { type: 'image', url: '' }]
        }));
    };

    const removeMediaItem = (index: number) => {
        const updatedMediaItems = [...(formData.mediaItems || [])];
        updatedMediaItems.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            mediaItems: updatedMediaItems
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            setError("Title is required");
            return;
        }

        if (!formData.description.trim()) {
            setError("Description is required");
            return;
        }

        if (formData.gameId === 0) {
            setError("Please select a game");
            return;
        }

        if (formData.tasks.some(task => !task.description.trim())) {
            setError("Task descriptions cannot be empty");
            return;
        }

        // Filter out empty media URLs
        const filteredMediaItems = formData.mediaItems?.filter(item => item.url.trim()) || [];

        try {
            setSubmitting(true);
            setError(null);

            // Create challenge with filtered data
            const challengeToSubmit = {
                ...formData,
                mediaItems: filteredMediaItems.length > 0 ? filteredMediaItems : undefined,
                tasks: formData.tasks.filter(task => task.description.trim())
            };

            const createdChallenge = await challengeService.createChallenge(challengeToSubmit);

            setSuccess(true);
            setTimeout(() => {
                navigate(`/challenges/${createdChallenge.id}`);
            }, 1500);
        } catch (err) {
            console.error("Error creating challenge:", err);
            setError("Failed to create challenge. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="challenge-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="challenge-form-container">
            <h1 className="challenge-form-title">Create New Challenge</h1>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {success && (
                <div className="success-message">
                    Challenge created successfully! Redirecting...
                </div>
            )}

            <form onSubmit={handleSubmit} className="challenge-form">
                {/* Basic Info Section */}
                <div className="challenge-form-section">
                    <h2 className="challenge-form-section-title">Basic Information</h2>

                    <div className="challenge-form-field">
                        <label htmlFor="title" className="challenge-form-label">Challenge Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="challenge-form-input"
                            placeholder="Enter a catchy title for your challenge"
                        />
                    </div>

                    <div className="challenge-form-field">
                        <label htmlFor="gameId" className="challenge-form-label">Select Game</label>
                        <select
                            id="gameId"
                            name="gameId"
                            value={formData.gameId}
                            onChange={handleChange}
                            className="challenge-form-select"
                        >
                            <option value={0}>-- Select a Game --</option>
                            {games.map(game => (
                                <option key={game.id} value={game.id}>
                                    {game.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="challenge-form-field">
                        <label htmlFor="difficultyRating" className="challenge-form-label">Difficulty Level</label>
                        <select
                            id="difficultyRating"
                            name="difficultyRating"
                            value={formData.difficultyRating}
                            onChange={handleChange}
                            className="challenge-form-select"
                        >
                            {Object.entries(difficultyLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {value} - {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description Section */}
                <div className="challenge-form-section">
                    <h2 className="challenge-form-section-title">Challenge Description</h2>

                    <div className="challenge-form-field">
                        <label htmlFor="description" className="challenge-form-label">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="challenge-form-textarea"
                            placeholder="Describe your challenge in detail. What should players do to complete it?"
                        />
                    </div>
                </div>

                {/* Media Section */}
                <div className="challenge-form-section">
                    <div className="challenge-form-section-header">
                        <h2 className="challenge-form-section-title">Media (Optional)</h2>
                        <button
                            type="button"
                            onClick={addMediaItem}
                            className="challenge-form-add-button"
                        >
                            + Add Media
                        </button>
                    </div>

                    <p className="challenge-form-help-text">
                        Add images or videos to illustrate your challenge.
                    </p>

                    {formData.mediaItems && formData.mediaItems.map((item, index) => (
                        <div key={`media-${index}`} className="challenge-form-item-row">
                            <select
                                value={item.type}
                                onChange={(e) => handleMediaChange(index, 'type', e.target.value as 'image' | 'video')}
                                className="challenge-form-select-small"
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                            <input
                                type="text"
                                value={item.url}
                                onChange={(e) => handleMediaChange(index, 'url', e.target.value)}
                                placeholder={`Enter ${item.type} URL`}
                                className="challenge-form-item-input"
                            />
                            <button
                                type="button"
                                onClick={() => removeMediaItem(index)}
                                className="challenge-form-remove-button"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                {/* Tasks Section */}
                <div className="challenge-form-section">
                    <div className="challenge-form-section-header">
                        <h2 className="challenge-form-section-title">Challenge Tasks</h2>
                        <button
                            type="button"
                            onClick={addTask}
                            className="challenge-form-add-button"
                        >
                            + Add Task
                        </button>
                    </div>

                    <p className="challenge-form-help-text">
                        Add tasks that users need to complete for this challenge.
                    </p>

                    {formData.tasks.map((task, index) => (
                        <div key={`task-${index}`} className="challenge-form-item-row">
                            <input
                                type="text"
                                value={task.description}
                                onChange={(e) => handleTaskChange(index, e.target.value)}
                                placeholder="Enter task description"
                                className="challenge-form-item-input"
                            />
                            <button
                                type="button"
                                onClick={() => removeTask(index)}
                                className="challenge-form-remove-button"
                                disabled={formData.tasks.length === 1}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="challenge-form-footer">
                    <Button
                        type="button"
                        onClick={() => navigate('/challenges')}
                        className="cancel-button"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="submit-button"
                        disabled={submitting}
                    >
                        {submitting ? 'Creating...' : 'Create Challenge'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateChallengePage;
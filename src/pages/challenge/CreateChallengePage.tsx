import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChallengeFormData, difficultyLevels } from '../../interfaces/Challenge';
import challengeService from '../../services/challengeService';
import gameService from '../../services/gameService';
import { Game } from '../../interfaces/Game';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import '../../css/ChallengeCreate.css';

const CreateChallengePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
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
        difficulty: 3, // Default to Medium
        checklistItems: [''],
        mediaUrls: [''],
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
            [name]: name === 'gameId' ? parseInt(value) : value
        }));
    };

    const handleChecklistChange = (index: number, value: string) => {
        const updatedItems = [...formData.checklistItems];
        updatedItems[index] = value;
        setFormData(prev => ({
            ...prev,
            checklistItems: updatedItems
        }));
    };

    const addChecklistItem = () => {
        setFormData(prev => ({
            ...prev,
            checklistItems: [...prev.checklistItems, '']
        }));
    };

    const removeChecklistItem = (index: number) => {
        const updatedItems = [...formData.checklistItems];
        updatedItems.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            checklistItems: updatedItems
        }));
    };

    const handleMediaChange = (index: number, value: string) => {
        const updatedUrls = [...(formData.mediaUrls || [''])];
        updatedUrls[index] = value;
        setFormData(prev => ({
            ...prev,
            mediaUrls: updatedUrls
        }));
    };

    const addMediaUrl = () => {
        setFormData(prev => ({
            ...prev,
            mediaUrls: [...(prev.mediaUrls || []), '']
        }));
    };

    const removeMediaUrl = (index: number) => {
        const updatedUrls = [...(formData.mediaUrls || [])];
        updatedUrls.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            mediaUrls: updatedUrls
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

        if (formData.checklistItems.some(item => !item.trim())) {
            setError("Checklist items cannot be empty");
            return;
        }

        // Filter out empty media URLs
        const filteredMediaUrls = formData.mediaUrls?.filter(url => url.trim()) || [];

        try {
            setSubmitting(true);
            setError(null);

            // Create challenge with filtered data
            const challengeToSubmit = {
                ...formData,
                mediaUrls: filteredMediaUrls.length > 0 ? filteredMediaUrls : undefined,
                checklistItems: formData.checklistItems.filter(item => item.trim())
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
                        <label htmlFor="difficulty" className="challenge-form-label">Difficulty Level</label>
                        <select
                            id="difficulty"
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            className="challenge-form-select"
                        >
                            {Object.entries(difficultyLevels).map(([value, label]) => (
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
                            onClick={addMediaUrl}
                            className="challenge-form-add-button"
                        >
                            + Add Media
                        </button>
                    </div>

                    <p className="challenge-form-help-text">
                        Add images or videos to illustrate your challenge. For videos, paste YouTube, Vimeo, or direct video URLs.
                    </p>

                    {formData.mediaUrls?.map((url, index) => (
                        <div key={`media-${index}`} className="challenge-form-item-row">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => handleMediaChange(index, e.target.value)}
                                placeholder="Enter image or video URL"
                                className="challenge-form-item-input"
                            />
                            <button
                                type="button"
                                onClick={() => removeMediaUrl(index)}
                                className="challenge-form-remove-button"
                                disabled={formData.mediaUrls?.length === 1}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                {/* Checklist Section */}
                <div className="challenge-form-section">
                    <div className="challenge-form-section-header">
                        <h2 className="challenge-form-section-title">Challenge Checklist</h2>
                        <button
                            type="button"
                            onClick={addChecklistItem}
                            className="challenge-form-add-button"
                        >
                            + Add Item
                        </button>
                    </div>

                    <p className="challenge-form-help-text">
                        Add tasks that users need to complete for this challenge.
                    </p>

                    {formData.checklistItems.map((item, index) => (
                        <div key={`checklist-${index}`} className="challenge-form-item-row">
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => handleChecklistChange(index, e.target.value)}
                                placeholder="Enter checklist item"
                                className="challenge-form-item-input"
                            />
                            <button
                                type="button"
                                onClick={() => removeChecklistItem(index)}
                                className="challenge-form-remove-button"
                                disabled={formData.checklistItems.length === 1}
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
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Challenge, UserChallenge, difficultyLevels, ChecklistItem } from '../../interfaces/Challenge';
import challengeService from '../../services/challengeService';
import { useAuth } from '../../context/AuthContext';
import ChallengeProgress from '../../components/ChallengeProgress';
import Button from '../../components/Button';
import '../../css/ChallengeDetail.css';

const ChallengeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const challengeId = parseInt(id || '0');
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [userChallenge, setUserChallenge] = useState<UserChallenge | null>(null);
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const { isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (challengeId > 0) {
            loadChallengeData();
        }
    }, [challengeId]);

    const loadChallengeData = async () => {
        try {
            setLoading(true);
            const challengeData = await challengeService.getChallengeById(challengeId);
            setChallenge(challengeData);

            // Initialize checklist items from challenge data
            setChecklistItems(challengeData.checklistItems.map(item => ({
                ...item,
                completed: false
            })));

            // If user is authenticated, load their progress
            if (isAuthenticated) {
                const userProgress = await challengeService.getUserChallenge(challengeId);
                if (userProgress) {
                    setUserChallenge(userProgress);

                    // Update checklist items with user progress
                    setChecklistItems(challengeData.checklistItems.map(item => ({
                        ...item,
                        completed: userProgress.completedItems.includes(item.id)
                    })));

                    // Calculate progress percentage
                    const completedCount = userProgress.completedItems.length;
                    const totalItems = challengeData.checklistItems.length;
                    setProgress(totalItems > 0 ? (completedCount / totalItems) * 100 : 0);
                }
            }

            setError(null);
        } catch (err) {
            console.error("Error loading challenge:", err);
            setError("Failed to load challenge details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleChecklistItemToggle = async (itemId: number, completed: boolean) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/challenges/${challengeId}` } });
            return;
        }

        try {
            // Update UI immediately for responsiveness
            const updatedItems = checklistItems.map(item =>
                item.id === itemId ? { ...item, completed } : item
            );
            setChecklistItems(updatedItems);

            // Calculate new completed items array
            const completedItemIds = updatedItems
                .filter(item => item.completed)
                .map(item => item.id);

            // Calculate new progress
            const newProgress = (completedItemIds.length / updatedItems.length) * 100;
            setProgress(newProgress);

            // Send update to server
            const updated = await challengeService.updateProgress(challengeId, completedItemIds);
            setUserChallenge(updated);
        } catch (err) {
            console.error("Error updating progress:", err);
            // Revert changes on error
            loadChallengeData();
        }
    };

    const joinChallenge = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/challenges/${challengeId}` } });
            return;
        }

        try {
            await challengeService.joinChallenge(challengeId);
            loadChallengeData(); // Reload data to show join status
        } catch (err) {
            console.error("Error joining challenge:", err);
        }
    };

    const handleDeleteChallenge = async () => {
        if (!isAdmin || !window.confirm("Are you sure you want to delete this challenge?")) {
            return;
        }

        try {
            await challengeService.deleteChallenge(challengeId);
            navigate('/challenges');
        } catch (err) {
            console.error("Error deleting challenge:", err);
        }
    };

    if (loading) {
        return (
            <div className="challenge-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error || !challenge) {
        return (
            <div className="challenge-detail-container">
                <div className="error-message">
                    {error || "Challenge not found"}
                </div>
                <div className="challenge-detail-back">
                    <Link to="/challenges">
                        Back to Challenges
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="challenge-detail-container">
            <div className="challenge-detail-back">
                <Link to="/challenges">
                    ← Back to Challenges
                </Link>
            </div>

            {/* Game info and header */}
            <div className="challenge-detail-header">
                {challenge.gameImageUrl && (
                    <div className="challenge-detail-image">
                        <img
                            src={challenge.gameImageUrl}
                            alt={challenge.gameName}
                        />
                    </div>
                )}

                <div className="challenge-detail-info">
                    <h1 className="challenge-detail-title">{challenge.title}</h1>
                    <div className="challenge-detail-game">
                        <Link to={`/games/${challenge.gameId}`}>
                            {challenge.gameName}
                        </Link>
                        <span className="separator">•</span>
                        <span>Created by {challenge.creatorName}</span>
                    </div>

                    <div className="challenge-detail-meta">
                        <div className={`difficulty-badge badge-difficulty-${challenge.difficulty}`}>
                            Difficulty: {difficultyLevels[challenge.difficulty]}
                        </div>
                        <div className="challenge-detail-stats">
                            <span>{challenge.participantsCount} Participants</span>
                            <span>{challenge.completionsCount} Completions</span>
                        </div>
                    </div>

                    {isAdmin && (
                        <Button
                            onClick={handleDeleteChallenge}
                            className="delete-button"
                        >
                            Delete Challenge
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress bar for authenticated users who joined */}
            {userChallenge && (
                <ChallengeProgress
                    completed={checklistItems.filter(item => item.completed).length}
                    total={checklistItems.length}
                    progress={progress}
                />
            )}

            {/* Description */}
            <div className="challenge-detail-section">
                <h2 className="challenge-detail-section-title">Description</h2>
                <div className="challenge-detail-content">
                    {challenge.description}
                </div>
            </div>

            {/* Media section (if any) */}
            {challenge.mediaUrls && challenge.mediaUrls.length > 0 && (
                <div className="challenge-detail-section">
                    <h2 className="challenge-detail-section-title">Media</h2>
                    <div className="challenge-media-grid">
                        {challenge.mediaUrls.map((url, index) => {
                            // Check if it's a video URL (simplified check)
                            const isVideo = url.includes('youtube.com') || url.includes('youtu.be') ||
                                url.includes('vimeo.com') || url.endsWith('.mp4');

                            return isVideo ? (
                                <div key={index} className="challenge-media-item challenge-media-video">
                                    <iframe
                                        src={url}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div key={index} className="challenge-media-item">
                                    <img src={url} alt={`Media ${index+1}`} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Checklist */}
            <div className="challenge-detail-section">
                <h2 className="challenge-detail-section-title">Challenge Checklist</h2>
                <div className="challenge-checklist">
                    {checklistItems.map((item) => (
                        <div key={item.id} className="challenge-checklist-item">
                            <input
                                id={`item-${item.id}`}
                                type="checkbox"
                                checked={item.completed}
                                onChange={(e) => handleChecklistItemToggle(item.id, e.target.checked)}
                                disabled={!userChallenge}
                                className="challenge-checklist-checkbox"
                            />
                            <label htmlFor={`item-${item.id}`}>
                                {item.description}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Join button for non-participants */}
            {isAuthenticated && !userChallenge && (
                <Button
                    onClick={joinChallenge}
                    className="join-button"
                >
                    Accept Challenge
                </Button>
            )}

            {/* Login prompt for non-authenticated users */}
            {!isAuthenticated && (
                <div className="challenge-join-prompt">
                    <p>
                        <Link to="/login" className="prompt-link">
                            Log in
                        </Link> or <Link to="/register" className="prompt-link">
                        create an account
                    </Link> to join this challenge and track your progress!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ChallengeDetailPage;
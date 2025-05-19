import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Challenge, ChallengeTask } from '../../interfaces/Challenge';
import challengeService from '../../services/challengeService';
import { useAuth } from '../../context/AuthContext';
import ChallengeProgress from '../../components/ChallengeProgress';
import Button from '../../components/Button';
import '../../css/ChallengeDetail.css';

const ChallengeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const challengeId = parseInt(id || '0');
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [userProgress, setUserProgress] = useState<{
        completedTasks: number[];
        totalTasks: number;
    } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
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

            // If user is authenticated, check if they've joined this challenge
            if (isAuthenticated) {
                try {
                    // This would be a call to get user progress for the specific challenge
                    // For now, we'll mock this functionality since the service doesn't have it yet
                    const participations = await challengeService.getUserParticipations();
                    const userChallenge = participations.find(c => c.id === challengeId);

                    if (userChallenge) {
                        // Set user progress - this would normally come from backend
                        // For now we'll set it to empty array if they've joined
                        setUserProgress({
                            completedTasks: [], // This would be populated from actual user data
                            totalTasks: challengeData.tasks.length
                        });
                    }
                } catch (err) {
                    console.error("Error loading user progress:", err);
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

    const handleChecklistItemToggle = async (taskId: number, completed: boolean) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/challenges/${challengeId}` } });
            return;
        }

        if (!challenge) return;

        try {
            // Update locally first for immediate feedback
            const updatedProgress = { ...userProgress };
            if (!updatedProgress) return;

            if (completed) {
                // Add task ID to completed tasks
                updatedProgress.completedTasks.push(taskId);
            } else {
                // Remove task ID from completed tasks
                updatedProgress.completedTasks = updatedProgress.completedTasks.filter(id => id !== taskId);
            }

            setUserProgress(updatedProgress);

            // Update task completion on the server
            await challengeService.updateTaskCompletion(challengeId, taskId, completed);
        } catch (err) {
            console.error("Error updating task status:", err);
            // Refresh data if there was an error
            loadChallengeData();
        }
    };

    const joinChallenge = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/challenges/${challengeId}` } });
            return;
        }

        try {
            await challengeService.participateInChallenge(challengeId);

            // After joining, set up initial progress
            if (challenge) {
                setUserProgress({
                    completedTasks: [],
                    totalTasks: challenge.tasks.length
                });
            }
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
                {challenge.gameCoverImage && (
                    <div className="challenge-detail-image">
                        <img
                            src={challenge.gameCoverImage}
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
                        <div className="difficulty-badge">
                            Difficulty: {challenge.difficultyRating}/6
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
            {userProgress && (
                <ChallengeProgress
                    completed={userProgress.completedTasks.length}
                    total={userProgress.totalTasks}
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
            {challenge.mediaItems && challenge.mediaItems.length > 0 && (
                <div className="challenge-detail-section">
                    <h2 className="challenge-detail-section-title">Media</h2>
                    <div className="challenge-media-grid">
                        {challenge.mediaItems.map((media, index) => {
                            return media.type === 'video' ? (
                                <div key={index} className="challenge-media-item challenge-media-video">
                                    <iframe
                                        src={media.url}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div key={index} className="challenge-media-item">
                                    <img src={media.url} alt={`Media ${index+1}`} />
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
                    {challenge.tasks.map((task: ChallengeTask) => (
                        <div key={task.id} className="challenge-checklist-item">
                            <input
                                id={`item-${task.id}`}
                                type="checkbox"
                                checked={userProgress?.completedTasks.includes(task.id) || false}
                                onChange={(e) => handleChecklistItemToggle(task.id, e.target.checked)}
                                disabled={!userProgress}
                                className="challenge-checklist-checkbox"
                            />
                            <label htmlFor={`item-${task.id}`}>
                                {task.description}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Join button for non-participants */}
            {isAuthenticated && !userProgress && (
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
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Challenge, ChallengeTask, difficultyLabels, DifficultyLevel } from '../../interfaces/Challenge';
import challengeService from '../../services/challengeService';
import { useAuth } from '../../context/AuthContext';
import ChallengeProgress from '../../components/ChallengeProgress';
import Button from '../../components/Button';
import '../../css/ChallengeDetail.css';

const ChallengeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const challengeId = parseInt(id || '0');
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [tasks, setTasks] = useState<ChallengeTask[]>([]);
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
            setTasks(challengeData.tasks);

            // If tasks have completion status, calculate progress
            if (challengeData.tasks.some(task => task.isCompleted !== undefined)) {
                const completedCount = challengeData.tasks.filter(task => task.isCompleted).length;
                const totalItems = challengeData.tasks.length;
                setProgress(totalItems > 0 ? (completedCount / totalItems) * 100 : 0);
            }

            setError(null);
        } catch (err) {
            console.error("Error loading challenge:", err);
            setError("Failed to load challenge details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleTaskToggle = async (taskId: number, completed: boolean) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/challenges/${challengeId}` } });
            return;
        }

        try {
            // Update UI immediately for responsiveness
            const updatedTasks = tasks.map(task =>
                task.id === taskId ? { ...task, isCompleted: completed } : task
            );
            setTasks(updatedTasks);

            // Calculate new progress
            const completedCount = updatedTasks.filter(task => task.isCompleted).length;
            const newProgress = (completedCount / updatedTasks.length) * 100;
            setProgress(newProgress);

            // Send update to server
            await challengeService.updateTaskCompletion(challengeId, taskId, completed);
        } catch (err) {
            console.error("Error updating task completion:", err);
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
            await challengeService.participateInChallenge(challengeId);
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

    // Determine if user is participating (has task completion data)
    const isParticipating = tasks.some(task => task.isCompleted !== undefined);
    const difficulty = challenge.difficultyRating as DifficultyLevel;

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
                        <div className={`difficulty-badge badge-difficulty-${difficulty}`}>
                            Difficulty: {difficultyLabels[difficulty]}
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
            {isParticipating && (
                <ChallengeProgress
                    completed={tasks.filter(task => task.isCompleted).length}
                    total={tasks.length}
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
            {challenge.mediaItems && challenge.mediaItems.length > 0 && (
                <div className="challenge-detail-section">
                    <h2 className="challenge-detail-section-title">Media</h2>
                    <div className="challenge-media-grid">
                        {challenge.mediaItems.map((item, index) => {
                            return item.type === 'video' ? (
                                <div key={index} className="challenge-media-item challenge-media-video">
                                    <iframe
                                        src={item.url}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div key={index} className="challenge-media-item">
                                    <img src={item.url} alt={`Media ${index+1}`} />
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
                    {tasks.map((task) => (
                        <div key={task.id} className="challenge-checklist-item">
                            <input
                                id={`task-${task.id}`}
                                type="checkbox"
                                checked={!!task.isCompleted}
                                onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                                disabled={!isAuthenticated}
                                className="challenge-checklist-checkbox"
                            />
                            <label htmlFor={`task-${task.id}`}>
                                {task.description}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Join button for non-participants */}
            {isAuthenticated && !isParticipating && (
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
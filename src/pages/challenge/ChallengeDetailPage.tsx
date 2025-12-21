import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import challengeService, { Challenge, ChallengeProgress } from '../../services/challengeService';
import { useAuth } from '../../context/AuthContext';
import { Crown, User, Play, Circle, Trash2, Gamepad2, Edit } from 'lucide-react';
import Button from '../../components/Button';
import UnifiedContentRenderer from '../../components/UnifiedContentRenderer';
import PrettyCheckbox from '../../components/PrettyCheckbox';

import CommentSection from '../../components/comments/CommentSection';
import Confetti from 'react-confetti';

// Simple hook for window size
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

const ChallengeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated, user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [progress, setProgress] = useState<ChallengeProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasJoined, setHasJoined] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();

    const isItemCompleted = (itemId: number) => {
        return progress?.completedItemIds?.includes(Number(itemId)) || false;
    };

    const [isCreator, setIsCreator] = useState(false);

    useEffect(() => {
        if (progress && progress.progress === 100) {
            setShowConfetti(true);
            // Optional: Stop confetti after a few seconds
            // const timer = setTimeout(() => setShowConfetti(false), 8000);
            // return () => clearTimeout(timer);
        } else {
            setShowConfetti(false); // Hide if they uncheck an item
        }
    }, [progress?.progress]);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                if (!id) return;
                const challengeIdInt = parseInt(id);
                const fetchedChallenge = await challengeService.getChallengeById(challengeIdInt);
                setChallenge(fetchedChallenge);

                if (isAuthenticated) {
                    try {
                        const [progressData, joinedStatus, createdChallenges] = await Promise.all([
                            challengeService.getChallengeProgress(challengeIdInt).catch(() => null),
                            challengeService.isJoined(challengeIdInt),
                            challengeService.getCreatedChallenges().catch(() => [])
                        ]);

                        setHasJoined(joinedStatus);

                        // Robust ownership check: Is this challenge in my created list?
                        const ownershipConfirmed = createdChallenges.some(c => c.id === challengeIdInt);
                        setIsCreator(ownershipConfirmed);

                        // Progress is only available if joined; if not joined, progressData might be null or error
                        if (joinedStatus && progressData) {
                            setProgress(progressData);
                        } else {
                            setProgress(null);
                        }
                    } catch (err: any) {
                        console.log("Error checking status", err);
                    }
                }
            } catch (err) {
                console.error('Error fetching challenge:', err);
                setError('Failed to load challenge. It may not exist.');
            } finally {
                setLoading(false);
            }
        };

        fetchChallenge();
    }, [id, isAuthenticated]);

    const handleJoin = async () => {
        if (!challenge || !isAuthenticated) return;
        try {
            await challengeService.joinChallenge(challenge.id);
            setHasJoined(true);
            const initialProgress: ChallengeProgress = {
                challengeId: challenge.id,
                progress: 0,
                completed: 0,
                total: challenge.items.length,
                completedItemIds: []
            };
            setProgress(initialProgress);
        } catch (error) {
            console.error('Error joining challenge:', error);
        }
    };

    const handleToggleItem = async (itemId: number) => {
        if (!challenge || !isAuthenticated || !hasJoined || !progress) return;

        const currentlyCompleted = isItemCompleted(itemId);
        const numericItemId = Number(itemId);

        // Optimistic Update
        const currentCompletedIds = progress.completedItemIds || [];
        const newCompletedIds = currentlyCompleted
            ? currentCompletedIds.filter(id => id !== numericItemId)
            : [...currentCompletedIds, numericItemId];

        const newCompletedCount = newCompletedIds.length;
        const newPercentage = (newCompletedCount / challenge.items.length) * 100;

        const optimisticProgress: ChallengeProgress = {
            ...progress,
            completedItemIds: newCompletedIds,
            completed: newCompletedCount,
            progress: newPercentage
        };

        setProgress(optimisticProgress);

        try {
            let serverProgress;
            if (currentlyCompleted) {
                serverProgress = await challengeService.uncompleteItem(challenge.id, itemId);
            } else {
                serverProgress = await challengeService.completeItem(challenge.id, itemId);
            }
            // Sync with server response to be sure
            setProgress(serverProgress);

        } catch (error) {
            console.error('Error toggling item:', error);
            // Revert on error - re-fetch truth
            try {
                const freshProgress = await challengeService.getChallengeProgress(challenge.id);
                setProgress(freshProgress);
            } catch (fetchErr) {
                console.error("Failed to revert state", fetchErr);
            }
        }
    };



    const handleDeleteChallenge = async () => {
        if (!challenge || !confirm("Are you sure you want to delete this challenge? This action cannot be undone.")) return;
        try {
            await challengeService.deleteChallenge(challenge.id);
            navigate('/challenges/me');
        } catch (error) {
            console.error("Error deleting challenge", error);
            setError("Failed to delete challenge. Please try again.");
        }
    }

    const handleLeaveChallenge = async () => {
        if (!challenge || !confirm("Are you sure you want to leave this challenge? Your progress will be reset.")) return;
        try {
            await challengeService.leaveChallenge(challenge.id);
            setHasJoined(false);
            setProgress(null);
        } catch (error) {
            console.error("Error leaving challenge", error);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !challenge) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-white mb-4">Challenge not found</h2>
                <Link to="/challenges">
                    <Button variant="outline">Back to Challenges</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20 relative">
            {showConfetti && (
                <div className="fixed inset-0 z-[9999] pointer-events-none">
                    <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
                </div>
            )}

            {/* Header / Banner Area */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                {/* Congratulations Banner */}
                {progress && progress.progress === 100 && (
                    <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 md:p-8 text-center relative overflow-hidden animate-in fade-in zoom-in duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent animate-pulse" />
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center ring-2 ring-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                                <Crown className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Congratulations, Champion! 🏆</h2>
                                <p className="text-muted-foreground">You've mastered this challenge. Great work!</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Summary & Actions (Sticky) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-6 shadow-xl shadow-black/20">

                            {/* Title moved here */}
                            <h1 className="text-2xl font-bold text-white mb-6 leading-tight">{challenge.title}</h1>

                            {/* Creator */}
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5 relative z-10">
                                <div className="flex items-center gap-3">
                                    {(challenge.creatorId !== null && challenge.creatorId !== undefined && challenge.creatorId > 0) ? (
                                        <Link to={`/profile/${challenge.creatorId}`} className="group/avatar relative z-50 pointer-events-auto block">
                                            <div className="h-10 w-10 rounded-full bg-secondary ring-2 ring-background flex items-center justify-center group-hover/avatar:ring-primary/50 transition-all">
                                                <User className="h-5 w-5 text-muted-foreground group-hover/avatar:text-primary transition-colors" />
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-secondary ring-2 ring-background flex items-center justify-center cursor-help" title="User profile not available">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs text-muted-foreground">Created by</p>
                                        {challenge.creatorId ? (
                                            <Link
                                                to={`/profile/${challenge.creatorId}`}
                                                className="text-sm font-medium text-white hover:text-primary hover:underline transition-colors relative z-50 pointer-events-auto inline-block"
                                            >
                                                {challenge.creatorUsername}
                                            </Link>
                                        ) : (
                                            <p className="text-sm font-medium text-white cursor-help" title="User profile not available">
                                                {challenge.creatorUsername}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Related Game Placeholder (Since backend doesn't provide game yet) */}
                            <div className="mb-6 p-4 rounded-xl bg-background/50 border border-white/5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                    <Gamepad2 className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white truncate">Target Game</h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                        Unknown Title
                                    </p>
                                </div>
                            </div>

                            {/* Progress Section */}
                            {isAuthenticated && hasJoined && (
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Your Progress</span>
                                        <span className="text-primary font-bold">{progress ? Math.round(progress.progress) : 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-1000 ease-out relative overflow-hidden"
                                            style={{ width: `${progress ? progress.progress : 0}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground">
                                        {progress ? progress.completed : 0} of {challenge.items.length} tasks completed
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            {isAuthenticated && (
                                <div className="space-y-3">
                                    {!hasJoined ? (
                                        <Button
                                            className="w-full shadow-lg shadow-primary/20"
                                            onClick={handleJoin}
                                        >
                                            <Play className="h-4 w-4 mr-2 fill-current" /> Start Challenge
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                            onClick={handleLeaveChallenge}
                                        >
                                            Leave Challenge
                                        </Button>
                                    )}

                                    {/* Creator or Admin Actions */}
                                    {(isCreator || isAdmin) && (
                                        <div className="pt-4 mt-6 border-t border-white/5 space-y-4">
                                            <Link to={`/challenges/edit/${challenge.id}`} className="block w-full">
                                                <Button
                                                    variant="outline" // Using outline to differentiate from "Delete"
                                                    className="w-full border-primary/20 text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Edit className="h-4 w-4" /> Edit Challenge
                                                </Button>
                                            </Link>

                                            <Button
                                                variant="outline"
                                                className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center justify-center gap-2"
                                                onClick={handleDeleteChallenge}
                                            >
                                                <Trash2 className="h-4 w-4" /> Delete Challenge
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Content & Tasks */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="rounded-2xl border border-white/5 bg-card/40 p-6 md:p-8">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Crown className="h-5 w-5 text-primary" /> Challenge Rules
                            </h3>
                            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                                <UnifiedContentRenderer content={challenge.description || ''} />
                            </div>
                        </div>

                        {/* Tasks List */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Circle className="h-2 w-2 fill-primary text-primary animate-pulse" />
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Tasks Checklist</h3>
                            </div>

                            <div className="grid gap-3">
                                {challenge.items.map((item) => {
                                    const completed = isItemCompleted(item.id!);
                                    return (
                                        <div
                                            key={item.id}
                                            className={`
                                                group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300
                                                ${completed
                                                    ? 'bg-primary/5 border-primary/20 shadow-[0_0_15px_-5px_var(--primary)]'
                                                    : 'bg-card/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                                                }
                                            `}
                                        >
                                            <div className="pt-0.5 shrink-0">
                                                <PrettyCheckbox
                                                    checked={completed}
                                                    onToggle={() => item.id && handleToggleItem(item.id)}
                                                    disabled={!isAuthenticated || !hasJoined}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-relaxed transition-all ${completed ? 'text-muted-foreground line-through decoration-primary/50' : 'text-gray-200'}`}>
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {!isAuthenticated && (
                                <div className="mt-8 p-6 rounded-xl border border-primary/20 bg-primary/5 text-center">
                                    <p className="text-sm text-muted-foreground mb-3">Join the community to track your progress on this challenge.</p>
                                    <Link to="/login">
                                        <Button className="font-semibold shadow-lg shadow-primary/20">Sign In to Join</Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div className="pt-8">
                            <CommentSection
                                entityType="challenge"
                                entityId={challenge.id}
                                currentUser={isAuthenticated && user ? {
                                    id: user.id,
                                    username: user.username,
                                    isAdmin: isAdmin
                                } : null}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChallengeDetailPage;

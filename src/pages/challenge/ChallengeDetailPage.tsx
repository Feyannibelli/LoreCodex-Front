import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import challengeService from '@/services/challengeService';
import { Challenge, ChallengeTask, difficultyLabels, DifficultyLevel } from '@/interfaces/Challenge';
import Button from '@/components/Button';

const ChallengeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, user } = useAuth();

    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isParticipating, setIsParticipating] = useState<boolean>(false);
    const [selectedRating, setSelectedRating] = useState<DifficultyLevel | null>(null);
    const [showRatingModal, setShowRatingModal] = useState<boolean>(false);

    // Calculate completion percentage
    const progressPercentage = useMemo(() => {
        if (!challenge || !challenge.tasks.length) return 0;

        const completedTasks = challenge.tasks.filter(task => task.isCompleted).length;
        return Math.round((completedTasks / challenge.tasks.length) * 100);
    }, [challenge]);

    useEffect(() => {
        const fetchChallenge = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const data = await challengeService.getChallengeById(Number(id));
                setChallenge(data);

                // Check if user tasks have completion status (indicating participation)
                if (data.tasks.some(task => task.isCompleted !== undefined)) {
                    setIsParticipating(true);
                }
            } catch (error) {
                console.error("Failed to fetch challenge:", error);
                setError("Failed to load challenge. It may have been removed or you don't have permission to view it.");
            } finally {
                setLoading(false);
            }
        };

        fetchChallenge();
    }, [id]);

    const handleParticipate = async () => {
        if (!isAuthenticated || !id) return;

        try {
            const updatedChallenge = await challengeService.participateInChallenge(Number(id));
            setChallenge(updatedChallenge);
            setIsParticipating(true);
        } catch (error) {
            console.error("Failed to participate in challenge:", error);
        }
    };

    const handleTaskToggle = async (taskId: number, isCompleted: boolean) => {
        if (!isAuthenticated || !id || !isParticipating) return;

        try {
            const updatedChallenge = await challengeService.updateTaskCompletion(
                Number(id),
                taskId,
                isCompleted
            );
            setChallenge(updatedChallenge);
        } catch (error) {
            console.error("Failed to update task completion:", error);
        }
    };

    const handleRatingSubmit = async () => {
        if (!isAuthenticated || !id || !selectedRating) return;

        try {
            const updatedChallenge = await challengeService.rateDifficulty(Number(id), selectedRating);
            setChallenge(updatedChallenge);
            setShowRatingModal(false);
        } catch (error) {
            console.error("Failed to rate challenge difficulty:", error);
        }
    };

    const handleDelete = async () => {
        if (!isAdmin && (!user || user.id !== challenge?.creatorId)) return;

        if (window.confirm("Are you sure you want to delete this challenge? This action cannot be undone.")) {
            try {
                await challengeService.deleteChallenge(Number(id));
                navigate("/challenges");
            } catch (error) {
                console.error("Failed to delete challenge:", error);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading challenge...</div>;
    }

    if (error || !challenge) {
        return (
            <div className="container mx-auto py-8 px-4 text-center">
                <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="text-red-800 dark:text-red-300">{error || "Challenge not found."}</p>
                </div>
                <Button onClick={() => navigate("/challenges")} className="mt-4">
                    Back to Challenges
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-4">
                <Button onClick={() => navigate("/challenges")} className="text-sm">
                    ← Back to Challenges
                </Button>
            </div>

            {/* Challenge Header */}
            <div className="bg-white dark:bg-[#1E2A2B] rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                    {/* Game Cover Image */}
                    <div className="h-64 bg-gray-200 dark:bg-gray-700">
                        {challenge.gameCoverImage ? (
                            <img
                                src={challenge.gameCoverImage}
                                alt={challenge.gameName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                No cover image
                            </div>
                        )}
                    </div>

                    {/* Challenge Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <h1 className="text-3xl font-bold text-white">{challenge.title}</h1>
                        <div className="flex items-center mt-2">
                            <span className="text-white opacity-90">For {challenge.gameName}</span>
                            <span className="mx-2 text-white">•</span>
                            <span className="text-white opacity-90">By {challenge.creatorName}</span>
                        </div>
                    </div>
                </div>

                {/* Challenge Stats */}
                <div className="p-6 border-b dark:border-gray-700">
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex items-center">
                            <div className={`text-sm font-medium px-3 py-1 rounded text-white ${
                                challenge.difficultyRating <= 2 ? 'bg-green-500' :
                                    challenge.difficultyRating <= 4 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                                {difficultyLabels[challenge.difficultyRating as DifficultyLevel] || `Rating: ${challenge.difficultyRating}/6`}
                            </div>

                            {isAuthenticated && !isParticipating && (
                                <button
                                    onClick={() => setShowRatingModal(true)}
                                    className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Rate difficulty
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <div>
                                <span className="font-medium">{challenge.tasks.length}</span> tasks
                            </div>
                            <div>
                                <span className="font-medium">{challenge.participantsCount}</span> participants
                            </div>
                            <div>
                                <span className="font-medium">{challenge.completionsCount}</span> completions
                            </div>
                        </div>

                        {/* Admin/Creator actions */}
                        {(isAdmin || (user && user.id === challenge.creatorId)) && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => navigate(`/challenges/edit/${challenge.id}`)}
                                    className="bg-blue-600 text-white text-sm"
                                >
                                    Edit
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    className="bg-red-600 text-white text-sm"
                                >
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description and Media */}
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p>{challenge.description}</p>
                    </div>

                    {/* Media items (images/videos) */}
                    {challenge.mediaItems && challenge.mediaItems.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold mb-4">Media</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {challenge.mediaItems.map((item, index) => (
                                    <div key={index} className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        {item.type === 'image' ? (
                                            <img
                                                src={item.url}
                                                alt={`Challenge media ${index + 1}`}
                                                className="w-full h-auto"
                                            />
                                        ) : (
                                            <div className="aspect-video">
                                                <iframe
                                                    src={item.url}
                                                    title={`Challenge video ${index + 1}`}
                                                    className="w-full h-full"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tasks & Progress */}
                <div className="p-6 bg-gray-50 dark:bg-[#1A2425]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Challenge Tasks</h2>

                        {isAuthenticated && !isParticipating ? (
                            <Button onClick={handleParticipate} className="bg-[#F47E00] text-white">
                                Accept Challenge
                            </Button>
                        ) : isParticipating && (
                            <div className="text-right">
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                    Your progress: {progressPercentage}%
                                </div>
                                <div className="w-40 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#F47E00]"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {challenge.tasks.map((task: ChallengeTask) => (
                            <div
                                key={task.id}
                                className={`p-3 rounded-md ${
                                    isParticipating && task.isCompleted
                                        ? 'bg-green-100 dark:bg-green-900/20'
                                        : 'bg-white dark:bg-[#1E2A2B]'
                                }`}
                            >
                                <div className="flex items-start">
                                    {isParticipating ? (
                                        <input
                                            type="checkbox"
                                            checked={!!task.isCompleted}
                                            onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                                            className="mt-1 mr-3"
                                        />
                                    ) : (
                                        <div className="h-4 w-4 mt-1 mr-3 border border-gray-300 dark:border-gray-600 rounded"></div>
                                    )}
                                    <span className={isParticipating && task.isCompleted ? 'line-through opacity-70' : ''}>
                    {task.description}
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Difficulty Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#1E2A2B] p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Rate Challenge Difficulty</h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                            How difficult do you find this challenge?
                        </p>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {Object.entries(difficultyLabels).map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => setSelectedRating(Number(value) as DifficultyLevel)}
                                    className={`p-2 rounded-md border ${
                                        selectedRating === Number(value)
                                            ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400'
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                >
                                    <div className="text-sm font-medium">{label}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{value}/6</div>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => setShowRatingModal(false)}
                                className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRatingSubmit}
                                className="bg-blue-600 text-white"
                                disabled={selectedRating === null}
                            >
                                Submit Rating
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChallengeDetailPage;
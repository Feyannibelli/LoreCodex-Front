import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import challengeService from '@/services/challengeService.ts';
import { Challenge, difficultyLabels } from '@/interfaces/Challenge';
import Button from '@/components/Button';

const ChallengesPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const data = await challengeService.getAllChallenges();
                setChallenges(data);
            } catch (error) {
                console.error("Failed to fetch challenges:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, []);

    const getDifficultyClass = (rating: number) => {
        if (rating <= 2) return 'bg-green-500';
        if (rating <= 4) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading challenges...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Game Challenges</h1>
                {isAuthenticated && (
                    <Link to="/challenges/create">
                        <Button className="bg-[#F47E00] text-white">Create Challenge</Button>
                    </Link>
                )}
            </div>

            {challenges.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        No challenges found. Be the first to create one!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map(challenge => (
                        <Link
                            to={`/challenges/${challenge.id}`}
                            key={challenge.id}
                            className="block bg-white dark:bg-[#1E2A2B] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
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
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    <h2 className="text-white text-lg font-semibold truncate">{challenge.title}</h2>
                                    <p className="text-white text-sm opacity-90">{challenge.gameName}</p>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    by <span className="font-medium">{challenge.creatorName}</span>
                  </span>
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded text-white ${getDifficultyClass(challenge.difficultyRating)}`}
                                    >
                    {difficultyLabels[challenge.difficultyRating as 1|2|3|4|5|6] || `Rating: ${challenge.difficultyRating}/6`}
                  </span>
                                </div>

                                <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <div>
                                        <span className="font-medium">{challenge.tasks.length}</span> tasks
                                    </div>
                                    <div>
                                        <span className="font-medium">{challenge.participantsCount}</span> participants •
                                        <span className="font-medium ml-1">{challenge.completionsCount}</span> completions
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChallengesPage;
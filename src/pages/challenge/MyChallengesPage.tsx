import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { Challenge } from '../../services/challengeService';
import { Trophy, Users, ArrowLeft } from 'lucide-react';

const MyChallengesPage: React.FC = () => {
    const { user } = useAuth();
    const [createdChallenges, setCreatedChallenges] = useState<Challenge[]>([]);
    const [participatingChallenges, setParticipatingChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');

    useEffect(() => {
        const fetchMyChallenges = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const allChallenges = await challengeService.getAllChallenges();

                // Filtrar challenges creados por el usuario
                const created = allChallenges.filter(
                    c => c.creatorUsername === user.username
                );
                setCreatedChallenges(created);

                // Para los challenges en los que participa, necesitamos verificar el progreso
                const participating: Challenge[] = [];
                for (const challenge of allChallenges) {
                    try {
                        await challengeService.getChallengeProgress(challenge.id);
                        // Si no lanza error, significa que está participando
                        if (challenge.creatorUsername !== user.username) {
                            participating.push(challenge);
                        }
                    } catch {
                        // No está participando en este challenge
                    }
                }
                setParticipatingChallenges(participating);
            } catch (error) {
                console.error('Error fetching challenges:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyChallenges();
    }, [user]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47E00]"></div>
                </div>
            </div>
        );
    }

    const displayChallenges = activeTab === 'created' ? createdChallenges : participatingChallenges;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/challenges"
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                >
                    <ArrowLeft size={20} />
                    Volver a Challenges
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Mis Challenges
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Gestiona los challenges que has creado y en los que participas
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('created')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                        activeTab === 'created'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <Trophy size={20} />
                    Creados por mí ({createdChallenges.length})
                </button>
                <button
                    onClick={() => setActiveTab('participating')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                        activeTab === 'participating'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <Users size={20} />
                    Participando ({participatingChallenges.length})
                </button>
            </div>

            {/* Challenge List */}
            {displayChallenges.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {activeTab === 'created'
                            ? 'No has creado ningún challenge'
                            : 'No estás participando en ningún challenge'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {activeTab === 'created'
                            ? '¡Crea tu primer challenge y comparte el desafío con la comunidad!'
                            : '¡Únete a un challenge y comienza a completar tareas!'}
                    </p>
                    {activeTab === 'created' && (
                        <Link
                            to="/challenges/create"
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Crear Challenge
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayChallenges.map((challenge) => (
                        <div
                            key={challenge.id}
                            className="bg-white dark:bg-[#313E3F] rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                        >
                            {challenge.mediaUrl && (
                                <div className="aspect-video rounded-t-lg overflow-hidden">
                                    {challenge.mediaType === 'image' ? (
                                        <img
                                            src={challenge.mediaUrl}
                                            alt={challenge.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : challenge.mediaType === 'video' ? (
                                        <video
                                            src={challenge.mediaUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                            loop
                                        />
                                    ) : null}
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {challenge.title}
                                    </h3>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                    {challenge.description}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Trophy size={16} />
                                        <span>{challenge.items.length} tareas</span>
                                    </div>
                                    {activeTab === 'created' && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            Creador
                                        </span>
                                    )}
                                </div>

                                <Link
                                    to={`/challenges/${challenge.id}`}
                                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Ver Challenge
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyChallengesPage;
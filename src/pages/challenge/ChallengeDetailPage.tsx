import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { Challenge, ChallengeProgress } from '../../services/challengeService';
import MarkdownViewer from '../../components/MarkdownViewer';
import Button from '../../components/Button';
import { ArrowLeft, Play, CheckCircle, Circle, Trophy, User, Clock, Star } from 'lucide-react';

const ChallengeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [progress, setProgress] = useState<ChallengeProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
        const fetchChallenge = async () => {
            if (!id) return;

            try {
                const challengeData = await challengeService.getChallengeById(parseInt(id));
                setChallenge(challengeData);

                // Si está autenticado, verificar si ya se unió y obtener progreso
                if (isAuthenticated) {
                    try {
                        const progressData = await challengeService.getChallengeProgress(parseInt(id));
                        setProgress(progressData);
                        setHasJoined(true);
                    } catch (error) {
                        // Si da error, probablemente no se ha unido aún
                        setHasJoined(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching challenge:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenge();
    }, [id, isAuthenticated]);

    const handleJoinChallenge = async () => {
        if (!challenge || !isAuthenticated) return;

        setJoining(true);
        try {
            await challengeService.joinChallenge(challenge.id);
            setHasJoined(true);
            // Obtener progreso inicial
            const progressData = await challengeService.getChallengeProgress(challenge.id);
            setProgress(progressData);
        } catch (error) {
            console.error('Error joining challenge:', error);
            alert('Error al unirse al challenge. Por favor, intenta de nuevo.');
        } finally {
            setJoining(false);
        }
    };

    const handleCompleteItem = async (itemId: number) => {
        if (!challenge || !hasJoined) return;

        try {
            const updatedProgress = await challengeService.completeItem(challenge.id, itemId);
            setProgress(updatedProgress);
        } catch (error) {
            console.error('Error completing item:', error);
            alert('Error al completar la tarea. Por favor, intenta de nuevo.');
        }
    };

    const getDifficultyLabel = (difficulty?: number) => {
        const labels = {
            1: 'Super Fácil',
            2: 'Fácil',
            3: 'Normal',
            4: 'Difícil',
            5: 'Super Difícil',
            6: 'Extremo'
        };
        return difficulty ? labels[difficulty as keyof typeof labels] : 'Sin especificar';
    };

    const getDifficultyColor = (difficulty?: number) => {
        const colors = {
            1: 'bg-green-100 text-green-800',
            2: 'bg-blue-100 text-blue-800',
            3: 'bg-yellow-100 text-yellow-800',
            4: 'bg-orange-100 text-orange-800',
            5: 'bg-red-100 text-red-800',
            6: 'bg-purple-100 text-purple-800'
        };
        return difficulty ? colors[difficulty as keyof typeof colors] : 'bg-gray-100 text-gray-800';
    };

    const getStarRating = (difficulty?: number) => {
        if (!difficulty) return [];
        return Array.from({ length: 6 }, (_, i) => i < difficulty);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47E00]"></div>
                </div>
                </div>
        );
    }

    if (!challenge) {
        return (
            <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Challenge no encontrado
        </h2>
        <Button onClick={() => navigate('/challenges')}>
        Volver a Challenges
        </Button>
        </div>
        </div>
    );
    }

    const progressPercentage = progress ? (progress.completed / progress.total) * 100 : 0;
    const isOwner = user?.username === challenge.creatorUsername;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
    <button
        onClick={() => navigate('/challenges')}
    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
    >
    <ArrowLeft size={20} />
    Volver a Challenges
    </button>

    <div className="flex flex-col lg:flex-row gap-6">
        {/* Media */}
    {challenge.mediaUrl && (
        <div className="lg:w-1/2">
        <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
            {challenge.mediaType === 'image' ? (
                        <img
                            src={challenge.mediaUrl}
                    alt={challenge.title}
                className="w-full h-full object-cover"
                />
    ) : challenge.mediaType === 'video' ? (
            <video
                src={challenge.mediaUrl}
        controls
        className="w-full h-full object-cover"
            />
    ) : null}
        </div>
        </div>
    )}

    {/* Info */}
    <div className={`${challenge.mediaUrl ? 'lg:w-1/2' : 'w-full'}`}>
    <div className="flex items-start justify-between mb-4">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {challenge.title}
        </h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
    {getDifficultyLabel(challenge.difficulty)}
    </span>
    </div>

    {/* Difficulty stars */}
    <div className="flex items-center gap-1 mb-4">
        {getStarRating(challenge.difficulty).map((filled, index) => (
        <Star
            key={index}
    size={20}
    className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
    />
))}
    </div>

    {/* Challenge info */}
    <div className="space-y-3 mb-6">
    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
    <User size={18} />
    <span>Creado por <strong>{challenge.creatorUsername}</strong></span>
    </div>
    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
    <Clock size={18} />
    <span>{challenge.items.length} tareas</span>
    </div>
    </div>

    {/* Progress bar (solo si se unió) */}
    {hasJoined && progress && (
        <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progreso: {progress.completed}/{progress.total}
    </span>
    <span className="text-sm text-gray-500 dark:text-gray-400">
        {Math.round(progressPercentage)}%
        </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
    <div
        className="bg-[#F47E00] h-3 rounded-full transition-all duration-300"
        style={{ width: `${progressPercentage}%` }}
        />
        </div>
        {progressPercentage === 100 && (
            <div className="flex items-center gap-2 mt-2 text-green-600">
            <Trophy size={20} />
        <span className="font-medium">¡Challenge completado!</span>
        </div>
        )}
        </div>
    )}

    {/* Actions */}
    <div className="space-y-3">
        {!isAuthenticated ? (
        <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 mb-3">
            Inicia sesión para unirte a este challenge
    </p>
    <Button onClick={() => navigate('/login')}>
    Iniciar Sesión
    </Button>
    </div>
) : !hasJoined && !isOwner ? (
            <Button
                onClick={handleJoinChallenge}
        disabled={joining}
    className="w-full flex items-center justify-center gap-2"
    >
    <Play size={20} />
    {joining ? 'Uniéndose...' : 'Unirse al Challenge'}
    </Button>
) : isOwner ? (
        <div className="text-center p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
        <p className="text-blue-800 dark:text-blue-200">
            Eres el creador de este challenge
    </p>
    </div>
) : null}
    </div>
    </div>
    </div>
    </div>

    {/* Description */}
    <div className="mb-8">
    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Descripción
        </h2>
        <div className="bg-white dark:bg-[#313E3F] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <MarkdownViewer content={challenge.description} />
    </div>
    </div>

    {/* Tasks/Checklist */}
    <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Tareas ({challenge.items.length})
        </h2>
        <div className="space-y-3">
        {challenge.items
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                    const isCompleted = hasJoined && progress && progress.completed > item.order - 1;
                    return (
                        <div
                            key={item.id}
                    className={`bg-white dark:bg-[#313E3F] rounded-lg p-4 shadow-sm border transition-all ${
                        isCompleted
                            ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        {hasJoined ? (
                                <button
                                    onClick={() => item.id && handleCompleteItem(item.id)}
                    disabled={isCompleted}
                    className="mt-1 flex-shrink-0"
                        >
                        {isCompleted ? (
                                <CheckCircle className="text-green-600" size={24} />
                ) : (
                        <Circle className="text-gray-400 hover:text-gray-600" size={24} />
                )}
                    </button>
                ) : (
                        <Circle className="text-gray-400 mt-1 flex-shrink-0" size={24} />
                )}
                    <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Tarea {item.order}
                    </span>
                    {isCompleted && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Completado
                            </span>
                    )}
                    </div>
                    <MarkdownViewer
                    content={item.description}
                    className={isCompleted ? 'text-green-700 dark:text-green-300' : ''}
                    />
                    </div>
                    </div>
                    </div>
                );
                })}
        </div>
        </div>
        </div>
);
};

export default ChallengeDetailPage;
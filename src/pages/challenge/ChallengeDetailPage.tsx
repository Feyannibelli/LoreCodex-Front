import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { Challenge, ChallengeProgress } from '../../services/challengeService';
import MarkdownViewer from '../../components/MarkdownViewer';
import { MentionDisplay } from '../../components/MentionDisplay';
import Button from '../../components/Button';
import { ArrowLeft, Play, Circle, Trophy, User, Clock, Crown } from 'lucide-react';
import PrettyCheckbox from "../../components/PrettyCheckbox.tsx";

const ChallengeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [progress, setProgress] = useState<ChallengeProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchChallenge = async () => {
            if (!id) return;

            try {
                const challengeData = await challengeService.getChallengeById(parseInt(id));
                setChallenge(challengeData);

                // Si el usuario está autenticado, intentar obtener progreso (incluye autores)
                if (isAuthenticated) {
                    try {
                        const progressData = await challengeService.getChallengeProgress(parseInt(id));
                        setProgress(progressData);
                        setHasJoined(true);
                    } catch (error) {
                        console.error('Error fetching challenge progress:', error);
                        // Si no hay progreso, significa que no se ha unido al challenge
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
    }, [id, isAuthenticated, user]);

    const handleMentionClick = (mention: any) => {
        const baseUrl = mention.type.endsWith('s') ? mention.type : mention.type + 's';
        navigate(`/${baseUrl}/${mention.id}`);
    };

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

    const handleToggleItem = async (itemId: number, isCompletedNow: boolean) => {
        if (!challenge || !hasJoined) return;

        // 1️⃣  Actualización optimista
        setProgress(prev =>
            prev
                ? {
                    ...prev,
                    completedItems: isCompletedNow
                        ? (prev.completedItems ?? []).filter(id => id !== itemId)
                        : [...(prev.completedItems ?? []), itemId],
                    completed: isCompletedNow ? prev.completed - 1 : prev.completed + 1
                }
                : prev
        );

        // 2️⃣  Llamada real al API
        try {
            const newProgress = isCompletedNow
                ? await challengeService.uncompleteItem(challenge.id, itemId)
                : await challengeService.completeItem(challenge.id, itemId);

            // 3️⃣  Asegurarse de tener el dato definitivo que devuelve el back
            setProgress(newProgress);
        } catch (err) {
            console.error('Error toggling item completion:', err);
            alert('No se pudo actualizar la tarea');
        }
    };

    const handleLeaveChallenge = async () => {
        if (!challenge) return;
        setLeaving(true);
        try {
            await challengeService.leaveChallenge(challenge.id);
            setHasJoined(false);
            setProgress(null);
        } catch (error) {
            console.error('Error leaving challenge:', error);
            alert('Error al salir del challenge');
        } finally {
            setLeaving(false);
        }
    };

    const handleDeleteChallenge = async () => {
        if (!challenge) return;
        if (!window.confirm('¿Seguro que quieres eliminar este challenge? Esta acción no se puede deshacer.')) return;
        setDeleting(true);
        try {
            await challengeService.deleteChallenge(challenge.id);
            navigate('/challenges');
        } catch (error) {
            console.error('Error deleting challenge:', error);
            alert('Error al eliminar el challenge');
        } finally {
            setDeleting(false);
        }
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
                        </div>

                        {/* Challenge info */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <User size={18}/>
                                <span>Creado por{' '}
                                    <strong className="cursor-pointer text-blue-600 hover:underline" onClick={() => navigate(`/profile/${challenge?.creatorId}`)}>
                                        {challenge.creatorUsername}
                                    </strong>
                                    {isOwner && (
                                        <Crown size={16} className="inline ml-1 text-yellow-500" title="Eres el creador" />
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Clock size={18}/>
                                <span>{challenge.items.length} tareas</span>
                            </div>
                        </div>

                        {/* Progress bar (si se unió o es el autor participando) */}
                        {hasJoined && progress && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Progreso: {progress.completed}/{progress.total}
                                        {isOwner && (
                                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                Creador participando
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {Math.round(progressPercentage)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                {progressPercentage === 100 && (
                                    <div className="flex items-center gap-2 mt-2 text-green-600">
                                        <Trophy size={20} />
                                        <span className="font-medium">
                                            ¡Challenge completado!
                                            {isOwner && " 🎉 ¡Completaste tu propio challenge!"}
                                        </span>
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
                            ) : !hasJoined ? (
                                // Ahora cualquier usuario autenticado puede unirse, incluido el autor
                                <Button
                                    onClick={handleJoinChallenge}
                                    disabled={joining}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <Play size={20} />
                                    {joining ? 'Uniéndose...' : isOwner ? 'Participar en mi Challenge' : 'Unirse al Challenge'}
                                </Button>
                            ) : (
                                // Usuario ya unido (puede ser autor o no)
                                <div className="space-y-2">
                                    {isOwner && (
                                        <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                                Estás participando en tu propio challenge
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleLeaveChallenge}
                                            disabled={leaving}
                                            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600"
                                        >
                                            {leaving ? 'Saliendo...' : 'Salir del Challenge'}
                                        </Button>
                                        {isOwner && (
                                            <Button
                                                onClick={handleDeleteChallenge}
                                                disabled={deleting}
                                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                                            >
                                                {deleting ? 'Eliminando...' : 'Eliminar Challenge'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
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
                    <MentionDisplay
                        text={challenge.description}
                        onMentionClick={handleMentionClick}
                        className="prose dark:prose-invert max-w-none"
                    />
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
                            const isCompleted = (
                                hasJoined &&
                                item.id !== undefined &&
                                Array.isArray(progress?.completedItems) &&
                                progress.completedItems.includes(item.id)
                            );
                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white dark:bg-[#313E3F] rounded-lg p-4 shadow-sm border transition-all ${isCompleted ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10 animate-pulse-once' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {hasJoined ? (
                                            <PrettyCheckbox
                                                checked={isCompleted}
                                                disabled={false}
                                                onToggle={() => handleToggleItem(item.id!, isCompleted)}
                                            />
                                        ) : (
                                            <Circle size={24} className="text-gray-400 mt-1 flex-shrink-0"/>
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
                                            <MentionDisplay
                                                text={item.description}
                                                onMentionClick={handleMentionClick}
                                                className={`prose dark:prose-invert max-w-none ${isCompleted ? 'text-green-700 dark:text-green-300' : ''}`}
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
}

export default ChallengeDetailPage;
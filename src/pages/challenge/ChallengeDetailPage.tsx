import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { Challenge, ChallengeProgress } from '../../services/challengeService';
import UnifiedContentRenderer from '../../components/UnifiedContentRenderer';
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

                if (isAuthenticated) {
                    try {
                        const progressData = await challengeService.getChallengeProgress(parseInt(id));
                        setProgress(progressData);
                        setHasJoined(true);
                    } catch (error) {
                        console.error('Error fetching challenge progress:', error);
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

    const handleJoinChallenge = async () => {
        if (!challenge || !isAuthenticated) return;

        setJoining(true);
        try {
            await challengeService.joinChallenge(challenge.id);
            setHasJoined(true);
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

        try {
            const newProgress = isCompletedNow
                ? await challengeService.uncompleteItem(challenge.id, itemId)
                : await challengeService.completeItem(challenge.id, itemId);

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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
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
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft size={20} />
                    Volver a Challenges
                </button>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Media */}
                    {challenge.mediaUrl && (
                        <div className="lg:w-1/2">
                            <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-muted">
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
                            <h1 className="text-3xl font-bold text-foreground">
                                {challenge.title}
                            </h1>
                        </div>

                        {/* Challenge info */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User size={18} />
                                <span>Creado por{' '}
                                    <strong className="cursor-pointer text-primary hover:underline" onClick={() => navigate(`/profile/${challenge?.creatorId}`)}>
                                        {challenge.creatorUsername}
                                    </strong>
                                    {isOwner && (
                                        <span title="Eres el creador">
                                            <Crown size={16} className="inline ml-1 text-primary" />
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock size={18} />
                                <span>{challenge.items.length} tareas</span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        {hasJoined && progress && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-foreground">
                                        Progreso: {progress.completed}/{progress.total}
                                        {isOwner && (
                                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                Creador participando
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round(progressPercentage)}%
                                    </span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-3">
                                    <div
                                        className="bg-primary h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                {progressPercentage === 100 && (
                                    <div className="flex items-center gap-2 mt-2 text-primary">
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
                                <div className="text-center p-4 bg-secondary/50 rounded-xl">
                                    <p className="text-muted-foreground mb-3">
                                        Inicia sesión para unirte a este challenge
                                    </p>
                                    <Button onClick={() => navigate('/login')}>
                                        Iniciar Sesión
                                    </Button>
                                </div>
                            ) : !hasJoined ? (
                                <Button
                                    onClick={handleJoinChallenge}
                                    disabled={joining}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <Play size={20} />
                                    {joining ? 'Uniéndose...' : isOwner ? 'Participar en mi Challenge' : 'Unirse al Challenge'}
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    {isOwner && (
                                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                                            <p className="text-primary text-sm">
                                                Estás participando en tu propio challenge
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleLeaveChallenge}
                                            disabled={leaving}
                                            variant="destructive"
                                            className="flex-1 flex items-center justify-center gap-2"
                                        >
                                            {leaving ? 'Saliendo...' : 'Salir del Challenge'}
                                        </Button>
                                        {isOwner && (
                                            <Button
                                                onClick={handleDeleteChallenge}
                                                disabled={deleting}
                                                variant="destructive"
                                                className="flex-1 flex items-center justify-center gap-2"
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

            {/* Description - UNIFICADO */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Descripción
                </h2>
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <UnifiedContentRenderer content={challenge.description} />
                </div>
            </div>

            {/* Tasks/Checklist */}
            <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
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
                                    className={`bg-card rounded-xl p-4 shadow-sm border transition-all ${isCompleted ? 'border-primary/50 bg-primary/5 animate-pulse-once' : 'border-border'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {hasJoined ? (
                                            <PrettyCheckbox
                                                checked={isCompleted}
                                                disabled={false}
                                                onToggle={() => handleToggleItem(item.id!, isCompleted)}
                                            />
                                        ) : (
                                            <Circle size={24} className="text-muted-foreground mt-1 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Tarea {item.order}
                                                </span>
                                                {isCompleted && (
                                                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                                        Completado
                                                    </span>
                                                )}
                                            </div>
                                            <UnifiedContentRenderer
                                                content={item.description}
                                                className={`prose dark:prose-invert max-w-none ${isCompleted ? 'text-primary' : ''}`}
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

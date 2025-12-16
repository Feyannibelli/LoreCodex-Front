import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Challenge } from '../../services/challengeService';
import { Trophy, User, Award } from 'lucide-react';

interface ChallengeCardProps {
    challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/challenges/${challenge.id}`);
    };

    const isCompleted = challenge.items && challenge.items.length > 0 && challenge.items.every(item => item.completed);

    return (
        <div
            onClick={handleCardClick}
            className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-card shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 cursor-pointer ${isCompleted ? 'ring-2 ring-green-500/50' : ''}`}
        >
            {/* Completed Badge */}
            {isCompleted && (
                <div className="absolute top-4 right-4 z-20 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-in zoom-in duration-300">
                    <Trophy className="h-3 w-3 fill-current" />
                    COMPLETED
                </div>
            )}
            {/* Content */}
            <div className="flex flex-col flex-1 p-5 relative z-20">
                {/* Header with Game Info (Mock/Placeholder) */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                        {challenge.gameCoverUrl ? (
                            <img src={challenge.gameCoverUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <Trophy className="h-4 w-4 text-primary/60" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
                            {challenge.title}
                        </h2>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {challenge.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-dashed border-white/5 mt-auto">
                    <div className="flex items-center gap-2 relative z-20">
                        {challenge.creatorId ? (
                            <Link
                                to={`/profile/${challenge.creatorId}`}
                                className="flex items-center gap-2 group/user hover:opacity-80 transition-opacity relative z-50 pointer-events-auto"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center ring-1 ring-white/10 group-hover/user:ring-primary/50 transition-all">
                                    <User className="h-3 w-3 text-muted-foreground group-hover/user:text-primary transition-colors" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground group-hover/user:text-primary transition-colors">
                                    {challenge.creatorUsername || 'Unknown'}
                                </span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center ring-1 ring-white/10">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">
                                    {challenge.creatorUsername || 'Unknown'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1 bg-secondary/30 px-2 py-1 rounded-md border border-white/5">
                        <Award className="h-3 w-3 text-primary" />
                        {challenge.items?.length || 0} Tasks
                    </div>
                </div>
            </div>

            {/* Inner Highlight Border */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5 pointer-events-none group-hover:ring-primary/20 transition-all duration-500 z-10" />
        </div>
    );
};

export default ChallengeCard;

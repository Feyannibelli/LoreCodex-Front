import React from 'react';
import { Link } from 'react-router-dom';
import { Challenge, difficultyLabels, DifficultyLevel } from '../interfaces/Challenge';
import '../css/ChallengeCard.css';

interface ChallengeCardProps {
    challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
    const difficulty = challenge.difficultyRating as DifficultyLevel;

    return (
        <Link to={`/challenges/${challenge.id}`} className="challenge-card">
            <div className="challenge-card-image">
                {challenge.gameCoverImage && (
                    <img
                        src={challenge.gameCoverImage}
                        alt={challenge.gameName}
                        className="challenge-game-cover"
                    />
                )}
                <div className={`difficulty-badge badge-difficulty-${difficulty}`}>
                    {difficultyLabels[difficulty]}
                </div>
            </div>

            <div className="challenge-card-content">
                <h3 className="challenge-card-title">{challenge.title}</h3>
                <div className="challenge-card-game">{challenge.gameName}</div>

                <div className="challenge-card-meta">
                    <div className="challenge-card-creator">
                        By {challenge.creatorName}
                    </div>
                    <div className="challenge-card-stats">
                        <span>{challenge.participantsCount} participants</span>
                    </div>
                </div>

                <div className="challenge-card-tasks">
                    <span>{challenge.tasks.length} tasks</span>
                </div>
            </div>
        </Link>
    );
};

export default ChallengeCard;
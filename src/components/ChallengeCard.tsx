import React from 'react';
import { Link } from 'react-router-dom';
import { Challenge, difficultyLevels } from '../interfaces/Challenge.ts';
import '../css/ChallengeCard.css';

interface ChallengeCardProps {
    challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
    return (
        <Link
            to={`/challenges/${challenge.id}`}
            className="challenge-card"
        >
            {challenge.gameImageUrl && (
                <div className="challenge-card-image">
                    <img
                        src={challenge.gameImageUrl}
                        alt={challenge.gameName}
                    />
                </div>
            )}
            <div className="challenge-card-content">
                <h2 className="challenge-card-title">{challenge.title}</h2>
                <div className="challenge-card-game">
                    <span>Game: {challenge.gameName}</span>
                </div>
                <div className="challenge-card-meta">
                    <div className={`difficulty-badge badge-difficulty-${challenge.difficulty}`}>
                        {difficultyLevels[challenge.difficulty]}
                    </div>
                    <span className="challenge-card-creator">
                        By: {challenge.creatorName}
                    </span>
                </div>
                <div className="challenge-card-stats">
                    <span>{challenge.participantsCount} Participants</span>
                    <span>{challenge.completionsCount} Completions</span>
                </div>
            </div>
        </Link>
    );
};

export default ChallengeCard;
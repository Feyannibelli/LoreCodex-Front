import React from 'react';
import { Link } from 'react-router-dom';
import { Challenge, difficultyLabels, DifficultyLevel } from '../interfaces/Challenge';
import '../css/ChallengeCard.css';

interface ChallengeCardProps {
    challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
    // Safely handle the difficulty rating
    const difficulty = (challenge.difficultyRating || 3) as DifficultyLevel;

    // Safely handle tasks array
    const tasks = Array.isArray(challenge.tasks) ? challenge.tasks : [];

    // Safely handle counts
    const participantsCount = challenge.participantsCount || 0;

    return (
        <Link to={`/challenges/${challenge.id}`} className="challenge-card">
            <div className="challenge-card-image">
                {challenge.gameCoverImage && (
                    <img
                        src={challenge.gameCoverImage}
                        alt={challenge.gameName || 'Game cover'}
                        className="challenge-game-cover"
                    />
                )}
                <div className={`difficulty-badge badge-difficulty-${difficulty}`}>
                    {difficultyLabels[difficulty] || 'Medium'}
                </div>
            </div>

            <div className="challenge-card-content">
                <h3 className="challenge-card-title">{challenge.title || 'Untitled Challenge'}</h3>
                <div className="challenge-card-game">{challenge.gameName || 'Unknown Game'}</div>

                <div className="challenge-card-meta">
                    <div className="challenge-card-creator">
                        By {challenge.creatorName || 'Unknown'}
                    </div>
                    <div className="challenge-card-stats">
                        <span>{participantsCount} participants</span>
                    </div>
                </div>

                <div className="challenge-card-tasks">
                    <span>{tasks.length} tasks</span>
                </div>
            </div>
        </Link>
    );
};

export default ChallengeCard;
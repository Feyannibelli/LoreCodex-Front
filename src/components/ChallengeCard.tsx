import React from 'react';
import { Link } from 'react-router-dom';
import { Challenge } from '../interfaces/Challenge.ts';
import '../css/ChallengeCard.css';

interface ChallengeCardProps {
    challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
    // Helper function to get difficulty level label
    const getDifficultyLabel = (rating: number): string => {
        if (rating <= 1) return 'Very Easy';
        if (rating <= 2) return 'Easy';
        if (rating <= 3) return 'Medium';
        if (rating <= 4) return 'Hard';
        if (rating <= 5) return 'Very Hard';
        return 'Extreme';
    };

    // Helper function to get difficulty class
    const getDifficultyClass = (rating: number): string => {
        if (rating <= 1) return 'very-easy';
        if (rating <= 2) return 'easy';
        if (rating <= 3) return 'medium';
        if (rating <= 4) return 'hard';
        if (rating <= 5) return 'very-hard';
        return 'extreme';
    };

    return (
        <Link
            to={`/challenges/${challenge.id}`}
            className="challenge-card"
        >
            {challenge.gameCoverImage && (
                <div className="challenge-card-image">
                    <img
                        src={challenge.gameCoverImage}
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
                    <div className={`difficulty-badge badge-difficulty-${getDifficultyClass(challenge.difficultyRating)}`}>
                        {getDifficultyLabel(challenge.difficultyRating)}
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
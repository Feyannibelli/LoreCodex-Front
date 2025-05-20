import React from 'react';
import '../css/ChallengeProgress.css';

interface ChallengeProgressProps {
    completed: number;
    total: number;
    progress: number;
}

const ChallengeProgress: React.FC<ChallengeProgressProps> = ({ completed, total, progress }) => {
    return (
        <div className="challenge-progress-container">
            <div className="challenge-progress-info">
                <div className="challenge-progress-status">
                    <span className="challenge-progress-completed">{completed}</span>
                    <span className="challenge-progress-separator">/</span>
                    <span className="challenge-progress-total">{total}</span>
                    <span className="challenge-progress-label">tasks completed</span>
                </div>
                <div className="challenge-progress-percentage">
                    {Math.round(progress)}%
                </div>
            </div>
            <div className="challenge-progress-bar-container">
                <div
                    className="challenge-progress-bar"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ChallengeProgress;
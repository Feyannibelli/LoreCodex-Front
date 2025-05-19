import React from 'react';
import '../css/ChallengeProgress.css';

interface ChallengeProgressProps {
    completed: number;
    total: number;
}

const ChallengeProgress: React.FC<ChallengeProgressProps> = ({ completed, total }) => {
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="challenge-progress">
            <div className="challenge-progress-header">
                <span className="challenge-progress-label">Challenge Progress</span>
                <span className="challenge-progress-percent">{progressPercent}%</span>
            </div>
            <div className="challenge-progress-bar-container">
                <div
                    className="challenge-progress-bar"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
            <div className="challenge-progress-stats">
                {completed} of {total} tasks completed
            </div>
        </div>
    );
};

export default ChallengeProgress;
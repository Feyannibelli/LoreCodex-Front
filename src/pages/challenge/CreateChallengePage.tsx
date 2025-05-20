import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Challenge } from '../../interfaces/Challenge';
import challengeService from '../../services/challengeService';
import { useAuth } from '../../context/AuthContext';
import ChallengeCard from '../../components/ChallengeCard';
import '../../css/Challenge.css';

const ChallengesPage: React.FC = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = async () => {
        try {
            setLoading(true);
            const data = await challengeService.getAllChallenges();
            setChallenges(data);
            setError(null);
        } catch (err) {
            console.error("Error loading challenges:", err);
            setError("Failed to load challenges. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="challenges-container">
            <div className="challenges-header">
                <h1 className="challenges-title">Community Challenges</h1>
                {isAuthenticated && (
                    <Link
                        to="/challenges/create"
                        className="primary-button"
                    >
                        Create Challenge
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="challenge-loading">
                    <div className="loading-spinner"></div>
                </div>
            ) : error ? (
                <div className="error-message">
                    {error}
                </div>
            ) : (
                <div className="challenges-grid">
                    {challenges.length > 0 ? (
                        challenges.map((challenge) => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                        ))
                    ) : (
                        <div className="challenge-empty-state">
                            No challenges found. Be the first to create one!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChallengesPage;
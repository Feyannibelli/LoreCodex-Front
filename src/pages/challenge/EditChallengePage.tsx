import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { ChallengeFormData } from '../../services/challengeService';


import ChallengeForm from '../../components/challenge/ChallengeForm';

const EditChallengePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState<ChallengeFormData | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (id) {
            fetchChallenge();
        }
    }, [id, isAuthenticated]);

    const fetchChallenge = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const challenge = await challengeService.getChallengeById(parseInt(id));

            // Check ownership
            if (user && challenge.creatorId !== user.id && !user.roles?.includes('ADMIN')) {
                // handle unauthorized?
            }

            setInitialData(challenge as unknown as ChallengeFormData);

            // If connected to a game logic removed as targetGameId does not exist on Challenge interface

        } catch (error) {
            console.error("Error loading challenge", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: ChallengeFormData) => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            await challengeService.updateChallenge(parseInt(id), data);
            navigate(`/challenges/${id}`);
        } catch (error) {
            console.error('Error updating challenge:', error);
            // Toast
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
    }

    if (!initialData) return null;

    const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Challenges', href: '/challenges' },
        { label: `Edit: ${initialData.title}` },
    ];

    return (
        <ChallengeForm
            pageTitle="Edit Challenge"
            breadcrumbs={breadcrumbs}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            initialData={initialData}
            isSubmitting={isSubmitting}
        />
    );
};

export default EditChallengePage;

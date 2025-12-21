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

            // Check ownership - Convert to strings for safe comparison
            const creatorId = String(challenge.creatorId);
            const userId = String(user?.id);
            const isAdmin = user?.roles?.includes('ADMIN');

            if (user && creatorId !== userId && !isAdmin) {
                console.warn(`Unauthorized access: User ${userId} is not creator ${creatorId}`);
                // Instead of redirecting immediately, maybe show a "Not Authorized" message or redirect to detail
                navigate(`/challenges/${id}`);
                return;
            }

            // Map Challenge to ChallengeFormData
            const formData: ChallengeFormData = {
                title: challenge.title,
                description: challenge.description,
                items: challenge.items.map(item => item.description)
            };

            setInitialData(formData);

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

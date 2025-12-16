import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { ChallengeFormData } from '../../services/challengeService';
import ChallengeForm from '../../components/challenge/ChallengeForm';

const CreateChallengePage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <p className="text-muted-foreground">You must be logged in to create a challenge.</p>
            </div>
        );
    }

    const handleSubmit = async (data: ChallengeFormData) => {
        setIsSubmitting(true);
        try {
            const challenge = await challengeService.createChallenge(data);

            if (challenge.isTemporary) {
                // If backend didn't return an ID, we can't navigate to the specific challenge.
                // Go to the list instead.
                // You might want to replace this with a proper toast notification.
                // alert('Challenge created successfully! (Redirecting to list)');
                navigate('/challenges');
            } else {
                navigate(`/challenges/${challenge.id}`);
            }
        } catch (error) {
            console.error('Error creating challenge:', error);
            // Add toast here
        } finally {
            setIsSubmitting(false);
        }
    };

    const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Challenges', href: '/challenges' },
        { label: 'Create New Challenge' },
    ];

    return (
        <ChallengeForm
            pageTitle="Create New Challenge"
            breadcrumbs={breadcrumbs}
            onSubmit={handleSubmit}
            submitLabel="Publish Challenge"
            isSubmitting={isSubmitting}
        />
    );
};

export default CreateChallengePage;

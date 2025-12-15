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
            await challengeService.createChallenge(formData);
            // Redirigir a la lista de challenges después de crear
            alert('¡Challenge creado exitosamente!');
            navigate('/challenges');
        } catch (error) {
            console.error('Error creating challenge:', error);
            alert('Error al crear el challenge. Por favor, intenta de nuevo.');
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

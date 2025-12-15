import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listService, ListItemRequest } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import ListForm from '../../components/list/ListForm';

const CreateListPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: { title: string; description: string; items: ListItemRequest[] }) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await listService.createList(user.id, data);
            navigate('/my-lists');
        } catch (error) {
            console.error('Error creating list:', error);
            // Could add toast here
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <p className="text-muted-foreground">You must be logged in to create a list.</p>
            </div>
        );
    }

    const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Lists', href: '/lists' },
        { label: 'Create New List' },
    ];

    return (
        <ListForm
            pageTitle="Create New List"
            breadcrumbs={breadcrumbs}
            submitLabel="Create List"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
        />
    );
};

export default CreateListPage;

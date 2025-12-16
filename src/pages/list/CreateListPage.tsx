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
            // 1. Create Shell
            const listShell = await listService.createList(user.id, {
                title: data.title,
                description: data.description,
            });

            // 2. Add Items loop (Sequential to preserve order/simplicity or Promise.all if supported)
            if (data.items && data.items.length > 0) {
                // Ensure positions are correct
                const itemsToAdd = data.items.map((item, index) => ({
                    ...item,
                    position: index // 0-based or 1-based, backend spec says 'int' but typically reorder handles it.
                }));

                for (const item of itemsToAdd) {
                    try {
                        await listService.addItemToList(listShell.id, item);
                    } catch (err) {
                        console.error(`Failed to add item ${item.referenceId}`, err);
                        // Optional: Continue or abort? We'll continue to try adding the rest.
                    }
                }
            }

            navigate(`/lists/${listShell.id}`);
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

    return (
        <ListForm
            pageTitle="Create New List"
            breadcrumbs={[]}
            submitLabel="Create List"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
        />
    );
};

export default CreateListPage;

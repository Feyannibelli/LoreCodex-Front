import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listService, ListItemRequest, ListItemResponse } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import ListForm from '../../components/list/ListForm';

const EditListPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState<any>(null); // Using any temporarily for ease, or specific type
    const [displayNames, setDisplayNames] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchListData();
        }
    }, [id]);

    const fetchListData = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const listData = await listService.getListById(parseInt(id));

            if (!user || user.id !== listData.userId) {
                navigate('/lists');
                return;
            }

            // Map existing items to requests
            const existingItems: ListItemRequest[] = listData.items.map((item: ListItemResponse) => ({
                type: item.type,
                referenceId: item.referenceId,
                position: item.position
            }));

            // Map names
            const names: { [key: string]: string } = {};
            listData.items.forEach((item: ListItemResponse) => {
                const key = `${item.type}-${item.referenceId}`;
                names[key] = item.title;
            });

            setInitialData({
                title: listData.title,
                description: listData.description,
                items: existingItems
            });
            setDisplayNames(names);

        } catch (error) {
            console.error('Error fetching list:', error);
            navigate('/lists');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: { title: string; description: string; items: ListItemRequest[] }) => {
        if (!id || !user) return;
        setIsSubmitting(true);
        try {
            const updatedItems = data.items.map((item, index) => ({
                ...item,
                position: index + 1
            }));

            await listService.updateList(parseInt(id), {
                ...data,
                items: updatedItems
            });
            navigate(`/lists/${id}`);
        } catch (error) {
            console.error('Error updating list:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading list...</p></div>;
    }

    if (!initialData) return null;

    const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Lists', href: '/lists' },
        { label: `Edit: ${initialData.title}` },
    ];

    return (
        <ListForm
            pageTitle={`Edit: ${initialData.title}`}
            breadcrumbs={breadcrumbs}
            submitLabel="Save Changes"
            onSubmit={handleSubmit}
            initialTitle={initialData.title}
            initialDescription={initialData.description}
            initialItems={initialData.items}
            initialDisplayNames={displayNames}
            isSubmitting={isSubmitting}
        />
    );
};

export default EditListPage;

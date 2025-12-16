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
    const [initialData, setInitialData] = useState<any>(null);
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
            const listId = parseInt(id);

            // 1. Update Meta
            await listService.updateList(listId, {
                title: data.title,
                description: data.description,
            });

            // 2. Sync Items logic
            // Fetch fresh state for accurate diffing
            const currentList = await listService.getListById(listId);
            const currentItems = currentList.items;

            const newItemsHash = new Set(data.items.map(i => `${i.type}-${i.referenceId}`));
            const currentItemsHash = new Set(currentItems.map(i => `${i.type}-${i.referenceId}`));

            // A. REMOVE deleted items
            const itemsToRemove = currentItems.filter(i => !newItemsHash.has(`${i.type}-${i.referenceId}`));
            for (const item of itemsToRemove) {
                await listService.removeItemFromList(listId, item.id);
            }

            // B. ADD new items
            const itemsToAdd = data.items.filter(i => !currentItemsHash.has(`${i.type}-${i.referenceId}`));
            for (const item of itemsToAdd) {
                // Add with temporary position, reorder will fix it
                await listService.addItemToList(listId, { ...item, position: 9999 });
            }

            // C. REORDER (Update positions for ALL items to match form order)
            // Fetch updated list to get IDs of newly added items
            const updatedList = await listService.getListById(listId);

            const reorderPayload: { itemId: number; newPosition: number }[] = [];

            data.items.forEach((desiredItem, index) => {
                const match = updatedList.items.find(serverItem =>
                    serverItem.type === desiredItem.type && serverItem.referenceId === desiredItem.referenceId
                );
                if (match) {
                    reorderPayload.push({
                        itemId: match.id,
                        newPosition: index // 0-based index
                    });
                }
            });

            if (reorderPayload.length > 0) {
                await listService.reorderItems(listId, reorderPayload);
            }

            navigate(`/lists/${id}`);
        } catch (error) {
            console.error('Error updating list:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading list...</p>
            </div>
        );
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listService, UserListResponse, ListItemType } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import CommentSection from '../../components/comments/CommentSection';
import Button from '../../components/Button';
import UnifiedContentRenderer from '../../components/UnifiedContentRenderer';

const ListDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [list, setList] = useState<UserListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchListDetail();
        }
    }, [id]);

    const fetchListDetail = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const listData = await listService.getListById(parseInt(id));
            setList(listData);
        } catch (error) {
            console.error('Error fetching list:', error);
            setError('Failed to load list');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteList = async () => {
        if (!list || !user || user.id !== list.userId) return;

        if (!window.confirm('Are you sure you want to delete this list?')) {
            return;
        }

        try {
            await listService.deleteList(list.id);
            navigate('/my-lists');
        } catch (error) {
            console.error('Error deleting list:', error);
            alert('Error deleting list. Please try again.');
        }
    };

    const getItemIcon = (type: ListItemType) => {
        switch (type) {
            case ListItemType.GAME:
                return '🎮';
            case ListItemType.GUIDE:
                return '📖';
            case ListItemType.CHALLENGE:
                return '🏆';
            default:
                return '📄';
        }
    };

    const getItemRoute = (item: any) => {
        switch (item.type) {
            case ListItemType.GAME:
                return `/games/${item.referenceId}`;
            case ListItemType.GUIDE:
                return `/guides/${item.referenceId}`;
            case ListItemType.CHALLENGE:
                return `/challenges/${item.referenceId}`;
            default:
                return '#';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background py-12">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-muted-foreground">Loading list...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !list) {
        return (
            <div className="min-h-screen bg-background py-12">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="px-8 py-10 text-center">
                            <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
                            <p className="text-muted-foreground mb-6">{error || 'List not found'}</p>
                            <Button onClick={() => navigate('/lists')} variant="default">
                                Back to Lists
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isOwner = user && user.id === list.userId;

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="mx-auto max-w-6xl px-4 space-y-8">
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="px-8 py-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                                <div className="mb-4">
                                    <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Community List</p>
                                    <h1 className="text-4xl font-bold text-foreground mb-4">{list.title}</h1>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>
                                            By{' '}
                                            <Link to={`/profile/${list.userId}`} className="text-primary hover:text-primary/90 transition-colors">
                                                {list.username}
                                            </Link>
                                        </span>
                                        <span>•</span>
                                        <span>{list.items.length} items</span>
                                        <span>•</span>
                                        <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {list.description && (
                                    <div className="border-t border-border pt-6">
                                        <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
                                        <div className="rounded-xl border border-border bg-secondary/50 p-4">
                                            <UnifiedContentRenderer content={list.description} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isOwner && (
                                <div className="flex gap-2 ml-4">
                                    <Link to={`/lists/edit/${list.id}`}>
                                        <Button variant="outline">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={handleDeleteList}
                                        variant="destructive"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="px-8 py-10">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Items</h2>

                        {list.items.length === 0 ? (
                            <div className="text-center py-12 rounded-xl border border-border bg-secondary/30">
                                <p className="text-muted-foreground">This list is empty.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {list.items
                                    .sort((a, b) => a.position - b.position)
                                    .map((item, index) => (
                                        <Link
                                            key={item.id}
                                            to={getItemRoute(item)}
                                            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition"
                                        >
                                            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-full font-semibold text-sm flex-shrink-0">
                                                {index + 1}
                                            </div>

                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="text-2xl flex-shrink-0">{getItemIcon(item.type)}</span>

                                                {item.thumbnailUrl && (
                                                    <img
                                                        src={item.thumbnailUrl}
                                                        alt={item.title}
                                                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                                                    <p className="text-sm text-muted-foreground capitalize">{item.type.toLowerCase()}</p>
                                                </div>
                                            </div>

                                            <span className="text-primary font-medium flex-shrink-0">
                                                View →
                                            </span>
                                        </Link>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Comments */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="px-8 py-10">
                        <CommentSection
                            entityType="list"
                            entityId={list.id}
                            currentUser={user ? {
                                id: user.id,
                                username: user.username,
                                isAdmin: isAdmin
                            } : null}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <Button
                        onClick={() => navigate('/lists')}
                        variant="outline"
                    >
                        ← Back to Lists
                    </Button>

                    {isOwner && (
                        <Link
                            to="/my-lists"
                            className="text-primary hover:text-primary/90 font-medium transition-colors"
                        >
                            View My Lists →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListDetailPage;

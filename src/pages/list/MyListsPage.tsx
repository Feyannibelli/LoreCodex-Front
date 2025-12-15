import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listService, UserListResponse } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { useInfiniteScroll } from '../../hook/useInfiniteScroll';
import InfiniteScrollTrigger from '../../components/InfiniteScrollTrigger';

const MyListsPage: React.FC = () => {
    const { user } = useAuth();

    const fetchUserLists = useCallback(async (_page: number, _pageSize: number): Promise<UserListResponse[]> => {
        if (!user) return [];
        return await listService.getUserLists(user.id);
    }, [user]);

    const {
        items: lists,
        loading,
        hasMore,
        error,
        loadMore,
        refresh
    } = useInfiniteScroll({
        fetchFunction: fetchUserLists,
        pageSize: 12
    });

    const handleDeleteList = async (listId: number) => {
        if (!window.confirm('Are you sure you want to delete this list?')) {
            return;
        }

        try {
            await listService.deleteList(listId);
            refresh();
        } catch (error) {
            console.error('Error deleting list:', error);
            alert('Error deleting list. Please try again.');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-bg py-12">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="text-center py-12">
                        <p className="text-text-muted">Please log in to view your lists.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg py-12">
            <div className="mx-auto max-w-6xl px-4">
                <div className="relative overflow-hidden rounded-3xl border border bg-surface shadow-sm">
                    <div className="relative px-8 py-10">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">My Lists</p>
                                <h1 className="text-4xl font-bold text-text mt-1">My Lists</h1>
                                <p className="text-sm text-text-muted mt-1">
                                    Manage and organize your personal collections
                                </p>
                            </div>
                            <Link to="/lists/create">
                                <Button variant="default" type="button">
                                    + Create New List
                                </Button>
                            </Link>
                        </div>

                        {error && (
                            <div className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="px-8 py-10 bg-surface border-t border space-y-8">
                        {loading && lists.length === 0 ? (
                            <div className="text-center py-12 text-text-muted">
                                Loading your lists...
                            </div>
                        ) : lists.length === 0 ? (
                            <div className="text-center py-12 rounded-2xl border border bg-surface-2">
                                <h3 className="text-xl font-semibold text-text mb-4">No Lists Yet</h3>
                                <p className="text-text-muted mb-6">
                                    You haven't created any lists yet. Start by creating your first list!
                                </p>
                                <Link to="/lists/create">
                                    <Button variant="default" type="button">
                                        Create Your First List
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {lists.map((list) => (
                                        <div
                                            key={list.id}
                                            className="flex flex-col rounded-2xl border border bg-surface-2 shadow-sm transition hover:bg-[rgba(245,126,0,0.06)]"
                                        >
                                            <div className="p-6 flex flex-col gap-4">
                                                <div>
                                                    <h3 className="text-2xl font-semibold text-text mb-2">
                                                        <Link
                                                            to={`/lists/${list.id}`}
                                                            className="hover:text-brand-500 transition-colors"
                                                        >
                                                            {list.title}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-base text-text-muted line-clamp-3 mb-4">
                                                        {list.description || 'No description provided.'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-text-muted mb-4">
                                                    <span>{list.items.length} items</span>
                                                    <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                {list.items.length > 0 && (
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-medium text-text mb-2">Items:</h4>
                                                        <div className="space-y-1">
                                                            {list.items.slice(0, 3).map((item, index) => (
                                                                <div key={item.id} className="text-sm text-text-muted flex items-center">
                                                                    <span className="text-xs text-text-muted mr-2">{index + 1}.</span>
                                                                    <span className="truncate">{item.title}</span>
                                                                    <span className="text-xs text-text-muted ml-2">({item.type})</span>
                                                                </div>
                                                            ))}
                                                            {list.items.length > 3 && (
                                                                <div className="text-xs text-text-muted">
                                                                    +{list.items.length - 3} more items
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 mt-auto">
                                                    <Link
                                                        to={`/lists/${list.id}`}
                                                        className="flex-1"
                                                    >
                                                        <Button variant="default" className="w-full" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Link
                                                        to={`/lists/edit/${list.id}`}
                                                        className="flex-1"
                                                    >
                                                        <Button variant="outline" className="w-full" size="sm">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        onClick={() => handleDeleteList(list.id)}
                                                        variant="destructive"
                                                        className="flex-1"
                                                        size="sm"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <InfiniteScrollTrigger
                                    onIntersect={loadMore}
                                    loading={loading}
                                    hasMore={hasMore}
                                />
                            </>
                        )}
                    </div>

                    <div className="px-8 py-6 border-t border text-center">
                        <Link
                            to="/lists"
                            className="text-brand-500 hover:text-brand-600 font-medium transition-colors"
                        >
                            ← Browse All Community Lists
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyListsPage;

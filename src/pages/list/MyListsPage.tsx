import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, ArrowRight, Edit, Trash2, LayoutGrid } from 'lucide-react';
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
    } = useInfiniteScroll<UserListResponse>({
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
        <div className="min-h-screen bg-background pb-20 pt-24">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 -mt-20 -ml-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 -mb-32 -mr-32 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto max-w-6xl px-4 relative z-10 space-y-8">

                {/* Header Card */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50" />

                    <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary font-medium tracking-wider text-xs uppercase">
                                <span className="bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                                    Personal Library
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-foreground tracking-tight">
                                My Lists
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-xl">
                                Manage and organize your personal collections of games, guides, and challenges.
                            </p>
                        </div>
                        <Link to="/lists/create">
                            <Button variant="default" size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                                <Plus className="w-5 h-5 mr-2" />
                                Create New List
                            </Button>
                        </Link>
                    </div>

                    {error && (
                        <div className="px-8 pb-8">
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div className="relative min-h-[400px]">
                    {loading && lists.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-64 rounded-3xl bg-card/30 border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : lists.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-white/10 bg-card/20 p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-2">
                                <LayoutGrid className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">No Lists Yet</h3>
                            <p className="max-w-md mx-auto">
                                You haven't created any lists yet. Start curating your favorite content found on LoreCodex.
                            </p>
                            <Link to="/lists/create" className="mt-4">
                                <Button variant="outline">
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
                                        className="group relative flex flex-col rounded-3xl border border-white/10 bg-card/40 hover:bg-card/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20"
                                    >
                                        <div className="p-6 flex flex-col h-full gap-4">
                                            {/* Header */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <span className="bg-secondary/50 px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground border border-white/5">
                                                        {list.items.length} ITEMS
                                                    </span>
                                                </div>

                                                <Link to={`/lists/${list.id}`} className="block">
                                                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                                        {list.title}
                                                    </h3>
                                                </Link>

                                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                                    {list.description || 'No description provided.'}
                                                </p>
                                            </div>

                                            {/* Preview Items */}
                                            {list.items.length > 0 && (
                                                <div className="py-3 border-t border-white/5 border-b mb-1">
                                                    <div className="space-y-1.5">
                                                        {list.items.slice(0, 3).map((item, index) => (
                                                            <div key={item.id} className="flex items-center text-xs text-muted-foreground/80">
                                                                <span className="w-4 mr-1 opacity-50 font-mono">{index + 1}.</span>
                                                                <span className="truncate">{item.title}</span>
                                                            </div>
                                                        ))}
                                                        {list.items.length > 3 && (
                                                            <div className="text-[10px] text-primary/70 pl-5 font-medium">
                                                                +{list.items.length - 3} more items
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                                                <Link to={`/lists/${list.id}`} className="col-span-2">
                                                    <Button variant="outline" className="w-full justify-between group/btn hover:border-primary/50 hover:bg-primary/5">
                                                        View List
                                                        <ArrowRight className="w-4 h-4 text-primary opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                                                    </Button>
                                                </Link>
                                                <Link to={`/lists/edit/${list.id}`}>
                                                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground">
                                                        <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    onClick={() => handleDeleteList(list.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
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

                {/* Back Link */}
                <div className="flex justify-center pt-8">
                    <Link to="/lists">
                        <Button variant="link" className="text-muted-foreground hover:text-primary">
                            Browse Community Lists
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MyListsPage;

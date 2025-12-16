import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listService, UserListResponse } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { useInfiniteScroll } from '../../hook/useInfiniteScroll';
import InfiniteScrollTrigger from '../../components/InfiniteScrollTrigger';
import { Layers, Plus, ListChecks, Edit2, Trash2, Calendar } from 'lucide-react';

const MyListsPage: React.FC = () => {
    const { user } = useAuth();

    const fetchUserLists = useCallback(async (_page: number, _pageSize: number): Promise<UserListResponse[]> => {
        if (!user) return [];
        // Note: The API might assume page/size, but currently listService.getUserLists takes only userId.
        // If the backend doesn't support pagination for getUserLists, this might fetch all.
        // We'll wrap it to conform to the hook's expectation if needed, or assume it returns all.
        // Based on previous code, it returns UserListResponse[].
        return await listService.getUserLists(user.id);
    }, [user]);

    const {
        items: lists,
        loading,
        hasMore,
        // error, // Unused in this simple view
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
            <div className="min-h-screen bg-background py-12">
                <div className="mx-auto max-w-6xl px-4 text-center">
                    <p className="text-muted-foreground">Please log in to view your lists.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8 md:py-12 mb-20 animate-fade-in">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* 1. Header Section - Consistent with ListsPage/GamesPage */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
                    <div className="max-w-3xl space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="h-0.5 w-8 bg-primary/60 rounded-full"></span>
                            <p className="text-sm font-bold uppercase tracking-widest text-primary">
                                Personal Collection
                            </p>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                            My Lists
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            Manage and organize your personal collections of games and content.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pb-1">
                        <Link to="/lists/create">
                            <Button className="shadow-lg shadow-primary/20 font-semibold px-6 gap-2">
                                <Plus className="h-4 w-4" />
                                Create New List
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* 2. Content Grid */}
                <div className="space-y-8">
                    {loading && lists.length === 0 ? (
                        /* Skeletons */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-card/40 p-5 h-[320px] animate-pulse">
                                    <div className="h-40 w-full rounded-2xl bg-white/5" />
                                    <div className="h-6 w-3/4 rounded bg-white/5" />
                                    <div className="h-4 w-1/2 rounded bg-white/5" />
                                </div>
                            ))}
                        </div>
                    ) : lists.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-card/30 py-24 text-center backdrop-blur-sm">
                            <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6 ring-8 ring-secondary/20">
                                <ListChecks className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No lists created yet</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                Start curating your favorite games and challenges by creating your first list.
                            </p>
                            <Link to="/lists/create">
                                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create First List
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {lists.map(list => (
                                <div
                                    key={list.id}
                                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-card shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20"
                                >
                                    <Link to={`/lists/${list.id}`} className="block relative">
                                        {/* Collage Cover - Premium Look */}
                                        <div className="aspect-video w-full overflow-hidden bg-muted/30 relative">
                                            {list.items && list.items.length > 0 ? (
                                                <div className="grid grid-cols-2 h-full w-full">
                                                    {list.items.slice(0, 4).map((item, idx) => (
                                                        <div key={idx} className="relative w-full h-full overflow-hidden border-[0.5px] border-card/30">
                                                            {item.thumbnailUrl ? (
                                                                <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover opacity-80" />
                                                            ) : (
                                                                <div className="w-full h-full bg-secondary/40 flex items-center justify-center">
                                                                    <Layers className="h-4 w-4 opacity-20" />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/20" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-secondary/20 text-muted-foreground">
                                                    <ListChecks className="h-12 w-12 opacity-10" />
                                                </div>
                                            )}

                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-90" />

                                            {/* Item Count Badge */}
                                            <div className="absolute top-3 right-3">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/10 shadow-sm">
                                                    <Layers className="h-3 w-3 text-primary" />
                                                    {list.items.length}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-5 pt-2 relative z-10">
                                        <Link to={`/lists/${list.id}`}>
                                            <h2 className="text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                                {list.title}
                                            </h2>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed h-8">
                                                {list.description || "No description provided."}
                                            </p>
                                        </Link>

                                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-white/5 mt-auto">
                                            {list.createdAt && (
                                                <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(list.createdAt).toLocaleDateString()}
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1">
                                                <Link to={`/lists/edit/${list.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary">
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDeleteList(list.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inner Highlight Border */}
                                    <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5 pointer-events-none group-hover:ring-primary/20 transition-all duration-500" />
                                </div>
                            ))}
                        </div>
                    )}

                    <InfiniteScrollTrigger
                        onIntersect={loadMore}
                        loading={loading}
                        hasMore={hasMore}
                    />
                </div>
            </div>
        </div>
    );
};

export default MyListsPage;

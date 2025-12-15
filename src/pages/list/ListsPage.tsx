import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listService, UserListResponse } from '../../services/listService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { Search, ArrowUpDown, ListChecks, Plus, User, Calendar, Layers } from "lucide-react";
import { cn } from "../../lib/utils.ts";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";

const ListsPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLists, setFilteredLists] = useState<UserListResponse[]>([]);
    const [activeFilter, setActiveFilter] = useState("All");

    const fetchLists = useCallback(async (page: number, pageSize: number): Promise<UserListResponse[]> => {
        return await listService.getAllListsPaginated(page, pageSize);
    }, []);

    const {
        items: lists,
        loading,
        hasMore,
        error,
        loadMore
    } = useInfiniteScroll<UserListResponse>({
        fetchFunction: fetchLists,
        pageSize: 12
    });

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredLists(lists);
        } else {
            const lowerSearch = searchTerm.toLowerCase();
            const filtered = lists.filter(list =>
                list.title.toLowerCase().includes(lowerSearch) ||
                list.description.toLowerCase().includes(lowerSearch)
            );
            setFilteredLists(filtered);
        }
    }, [searchTerm, lists]);

    const filters = ["All", "Empty", "Populated"]; // Example filters

    const displayedLists = filteredLists.filter(list => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Empty") return list.items.length === 0;
        if (activeFilter === "Populated") return list.items.length > 0;
        return true;
    });

    return (
        <div className="min-h-screen bg-background py-8 md:py-12 mb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* 1. Header Section - Aligned */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
                    <div className="max-w-3xl space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="h-0.5 w-8 bg-primary/60 rounded-full"></span>
                            <p className="text-sm font-bold uppercase tracking-widest text-primary">
                                Community
                            </p>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                            Community Lists
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            Discover collections of games, guides, and challenges created by the community.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pb-1">
                        {isAuthenticated && (
                            <>
                                <Link to="/my-lists">
                                    <Button variant="secondary" className="font-semibold px-6 gap-2">
                                        <ListChecks className="h-4 w-4" />
                                        My Lists
                                    </Button>
                                </Link>
                                <Link to="/lists/create">
                                    <Button className="shadow-lg shadow-primary/20 font-semibold px-6 gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create List
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* 2. Toolbar Section - Premium Surface */}
                <div className="sticky top-20 z-30 mb-8 rounded-2xl border border-white/5 bg-card/80 p-2 shadow-xl shadow-black/20 backdrop-blur-xl">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center p-2">

                        {/* Search Input - Compact & Local */}
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search lists..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 w-full rounded-lg border border-white/5 bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        {/* Divider on desktop */}
                        <div className="hidden h-6 w-px bg-white/5 md:block"></div>

                        {/* Controls */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <button className="flex h-10 items-center gap-2 rounded-lg border border-white/5 bg-secondary/30 px-4 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors whitespace-nowrap">
                                <ArrowUpDown className="h-3.5 w-3.5" />
                                <span>Sort</span>
                            </button>

                            {/* Filter Chips */}
                            <div className="flex items-center gap-1.5 bg-secondary/20 p-1 rounded-lg border border-white/5">
                                {filters.map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap",
                                            activeFilter === filter
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        )}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Content Grid */}
                <div className="space-y-8">
                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-4 text-red-400 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">⚠️</span>
                                <p className="font-medium">{error}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                Retry
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading && lists.length === 0 ? (
                            /* Skeletons */
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-card/40 p-5 h-[320px] animate-pulse">
                                    <div className="h-40 w-full rounded-2xl bg-white/5" />
                                    <div className="h-6 w-3/4 rounded bg-white/5" />
                                    <div className="h-4 w-1/2 rounded bg-white/5" />
                                </div>
                            ))
                        ) : displayedLists.length === 0 ? (
                            /* Empty State */
                            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-card/30 py-24 text-center backdrop-blur-sm">
                                <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6 ring-8 ring-secondary/20">
                                    <ListChecks className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">No lists found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                    We couldn't find any lists matching "{searchTerm}".
                                </p>
                                {isAuthenticated && (
                                    <Link to="/lists/create">
                                        <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary gap-2">
                                            <Plus className="h-4 w-4" />
                                            Create New List
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            displayedLists.map(list => (
                                <Link
                                    to={`/lists/${list.id}`}
                                    key={list.id}
                                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-card shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20"
                                >
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
                                                        {/* Darken overlay for uniformity */}
                                                        <div className="absolute inset-0 bg-black/20" />
                                                    </div>
                                                ))}
                                                {/* If less than 4 items, fill blanks or just show what we have (flex/grid adapts) */}
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

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-5 pt-2 relative z-10">
                                        <h2 className="text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                            {list.title}
                                        </h2>

                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed h-8">
                                            {list.description || "No description provided."}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-white/5 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center ring-1 ring-white/10">
                                                    <User className="h-3 w-3 text-primary" />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {list.username || 'Anonymous'}
                                                </span>
                                            </div>

                                            {list.createdAt && (
                                                <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(list.createdAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inner Highlight Border */}
                                    <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5 pointer-events-none group-hover:ring-primary/20 transition-all duration-500" />
                                </Link>
                            ))
                        )}
                    </div>

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

export default ListsPage;

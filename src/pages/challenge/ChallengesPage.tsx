import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { Challenge } from '../../services/challengeService';
import { Plus, Trophy, Search, ArrowUpDown, Target, Award, User } from 'lucide-react';
import { useInfiniteScroll } from '../../hook/useInfiniteScroll';
import InfiniteScrollTrigger from '../../components/InfiniteScrollTrigger';
import Button from '../../components/Button';
import { cn } from "../../lib/utils.ts";

const ChallengesPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
    const [activeFilter, setActiveFilter] = useState("All");

    const fetchChallenges = useCallback(async (page: number, pageSize: number): Promise<Challenge[]> => {
        return await challengeService.getAllChallengesPaginated(page, pageSize);
    }, []);

    const {
        items: challenges,
        loading,
        hasMore,
        error,
        loadMore
    } = useInfiniteScroll<Challenge>({
        fetchFunction: fetchChallenges,
        pageSize: 12
    });

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredChallenges(challenges);
        } else {
            const filtered = challenges.filter(challenge =>
                challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredChallenges(filtered);
        }
    }, [searchTerm, challenges]);

    // Derived generic filters
    const filters = ["All", "Easy", "Medium", "Hard", "Expert"];

    const getDifficultyLabel = (diff: number) => {
        if (diff <= 2) return "Easy";
        if (diff <= 4) return "Medium";
        if (diff <= 5) return "Hard";
        return "Expert";
    }

    const displayedChallenges = filteredChallenges.filter(c => {
        if (activeFilter === "All") return true;
        const diffLabel = getDifficultyLabel(c.difficulty || 3);
        return diffLabel === activeFilter;
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
                            Challenges
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            Complete, create and share challenges with the LoreCodex community.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pb-1">
                        {isAuthenticated && (
                            <Link to="/challenges/create">
                                <Button className="shadow-lg shadow-primary/20 font-semibold px-6 gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Challenge
                                </Button>
                            </Link>
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
                                placeholder="Search challenges..."
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
                                <span>Difficulty</span>
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
                        {loading && challenges.length === 0 ? (
                            /* Skeletons */
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-card/40 p-5 h-[360px] animate-pulse">
                                    <div className="h-40 w-full rounded-2xl bg-white/5" />
                                    <div className="h-6 w-3/4 rounded bg-white/5" />
                                    <div className="h-4 w-1/2 rounded bg-white/5" />
                                    <div className="mt-auto h-8 w-1/3 rounded bg-white/5" />
                                </div>
                            ))
                        ) : displayedChallenges.length === 0 ? (
                            /* Empty State */
                            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-card/30 py-24 text-center backdrop-blur-sm">
                                <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6 ring-8 ring-secondary/20">
                                    <Trophy className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">No challenges found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                    We couldn't find any challenges matching "{searchTerm}".
                                </p>
                                {isAuthenticated && (
                                    <Link to="/challenges/create">
                                        <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary gap-2">
                                            <Plus className="h-4 w-4" />
                                            Create Challenge
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            displayedChallenges.map(challenge => (
                                <Link
                                    to={`/challenges/${challenge.id}`}
                                    key={challenge.id}
                                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-card shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20"
                                >
                                    {/* Media Section */}
                                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                                        {challenge.mediaUrl ? (
                                            challenge.mediaType === 'video' ? (
                                                <video src={challenge.mediaUrl} className="h-full w-full object-cover opacity-80" muted loop />
                                            ) : (
                                                <img src={challenge.mediaUrl} alt={challenge.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
                                            )
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-muted-foreground">
                                                <Trophy className="h-12 w-12 opacity-10" />
                                            </div>
                                        )}

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-90" />

                                        {/* Badges */}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 rounded-full backdrop-blur-md px-3 py-1 text-xs font-bold border border-white/10 shadow-sm",
                                                getDifficultyLabel(challenge.difficulty || 3) === "Expert" ? "bg-red-500/80 text-white" :
                                                    getDifficultyLabel(challenge.difficulty || 3) === "Hard" ? "bg-orange-500/80 text-white" :
                                                        getDifficultyLabel(challenge.difficulty || 3) === "Medium" ? "bg-yellow-500/80 text-black" :
                                                            "bg-green-500/80 text-white"
                                            )}>
                                                <Target className="h-3 w-3" />
                                                {getDifficultyLabel(challenge.difficulty || 3)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-5 pt-2 relative z-10">
                                        <h2 className="text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                            {challenge.title}
                                        </h2>

                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed h-8">
                                            {challenge.description || "No description provided."}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-white/5 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center ring-1 ring-white/10">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {challenge.creatorUsername || 'Unknown'}
                                                </span>
                                            </div>

                                            <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1 bg-secondary/30 px-2 py-1 rounded-md">
                                                <Award className="h-3 w-3 text-primary" />
                                                {challenge.items?.length || 0} Tasks
                                            </div>
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

export default ChallengesPage;

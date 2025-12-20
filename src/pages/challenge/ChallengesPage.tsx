import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { Challenge } from '../../services/challengeService';
import ChallengeCard from '../../components/challenge/ChallengeCard';
import { Plus, Trophy, Search } from 'lucide-react';
import { useInfiniteScroll } from '../../hook/useInfiniteScroll';
import InfiniteScrollTrigger from '../../components/InfiniteScrollTrigger';
import Button from '../../components/Button';

const ChallengesPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);

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

    const displayedChallenges = filteredChallenges;


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
                            <>
                                <Link to="/challenges/me">
                                    <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary font-semibold px-6 gap-2">
                                        <Trophy className="h-4 w-4" />
                                        My Challenges
                                    </Button>
                                </Link>
                                <Link to="/challenges/create">
                                    <Button className="shadow-lg shadow-primary/20 font-semibold px-6 gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Challenge
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
                                placeholder="Search challenges..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 w-full rounded-lg border border-white/5 bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
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
                                <ChallengeCard key={challenge.id} challenge={challenge} />
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

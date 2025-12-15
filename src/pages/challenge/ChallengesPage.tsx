import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { Challenge } from '../../services/challengeService';
import { Plus, Trophy, Clock } from 'lucide-react';
import { useInfiniteScroll } from '../../hook/useInfiniteScroll';
import InfiniteScrollTrigger from '../../components/InfiniteScrollTrigger';
import Button from '../../components/Button';
import SearchBar from '../../components/ui/SearchBar';
import PageHero from '../../components/ui/PageHero';

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
    } = useInfiniteScroll({
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

    const handleSearch = () => {
        console.log('Searching for:', searchTerm);
    };

    return (
        <div className="min-h-screen py-12 bg-bg">
            <div className="mx-auto max-w-6xl space-y-8 px-4">
                <PageHero
                    title="Challenges"
                    description="Compete, create and share challenges with the LoreCodex community."
                    actions={
                        isAuthenticated ? (
                            <Link to="/challenges/create">
                                <Button variant="accent" type="button">
                                    <Plus size={16} />
                                    <span className="ml-1">Create Challenge</span>
                                </Button>
                            </Link>
                        ) : null
                    }
                >
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSubmit={handleSearch}
                        placeholder="Search challenges..."
                        className="w-full"
                    />
                </PageHero>

                <div className="rounded-3xl border border bg-surface px-8 py-10 shadow-sm space-y-6">
                    {error && (
                        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {filteredChallenges.length === 0 ? (
                        <div className="text-center space-y-4 rounded-2xl border border bg-surface px-4 py-10 text-text-muted">
                            <Trophy className="mx-auto h-12 w-12 text-text-muted" />
                            <h3 className="text-lg font-semibold text-text">
                                No challenges found
                            </h3>
                            <p className="text-sm">
                                {searchTerm
                                    ? 'Try with different search filters'
                                    : 'Be the first to create a challenge'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredChallenges.map((challenge) => (
                                    <div
                                        key={challenge.id}
                                        className="flex flex-col overflow-hidden rounded-2xl border border bg-surface shadow-sm transition hover:bg-[rgba(245,126,0,0.06)] hover:shadow-md"
                                    >
                                        {challenge.mediaUrl && (
                                            <div className="aspect-video overflow-hidden bg-muted/30">
                                                {challenge.mediaType === 'image' ? (
                                                    <img
                                                        src={challenge.mediaUrl}
                                                        alt={challenge.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : challenge.mediaType === 'video' ? (
                                                    <video
                                                        src={challenge.mediaUrl}
                                                        className="h-full w-full object-cover"
                                                        muted
                                                        loop
                                                        poster=""
                                                    />
                                                ) : null}
                                            </div>
                                        )}

                                        <div className="flex flex-1 flex-col gap-4 p-6">
                                            <div>
                                                <h3 className="text-2xl font-semibold text-text">
                                                    {challenge.title}
                                                </h3>
                                                <p className="text-sm text-text-muted line-clamp-3 mt-2">
                                                    {challenge.description}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between text-sm text-text-muted">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} />
                                                    <span>{challenge.items.length} tasks</span>
                                                </div>
                                                <span className="text-xs uppercase tracking-wide text-text-muted">
                                                    by {challenge.creatorUsername}
                                                </span>
                                            </div>
                                            <Link to={`/challenges/${challenge.id}`} className="mt-auto">
                                                <Button type="button" className="w-full">
                                                    View Challenge
                                                </Button>
                                            </Link>
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
            </div>
        </div>
    );
};

export default ChallengesPage;

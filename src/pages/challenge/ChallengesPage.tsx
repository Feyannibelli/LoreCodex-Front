import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import challengeService, { Challenge } from '../../services/challengeService';
import { Plus, Trophy, Clock } from 'lucide-react';
import { useInfiniteScroll } from '../../hook/useInfiniteScroll';
import InfiniteScrollTrigger from '../../components/InfiniteScrollTrigger';
import PrimaryButton from '../../components/ui/PrimaryButton';
import SearchInput from '../../components/ui/SearchInput';
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
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="mx-auto max-w-6xl space-y-8 px-4">
                <PageHero
                    title="Challenges"
                    description="Compite, crea y comparte desafíos con la comunidad de LoreCodex."
                    actions={
                        isAuthenticated ? (
                            <Link to="/challenges/create">
                                <PrimaryButton type="button">
                                    <Plus size={16} />
                                    <span className="ml-1">Create Challenge</span>
                                </PrimaryButton>
                            </Link>
                        ) : null
                    }
                >
                    <div className="space-y-3 md:space-y-0 md:flex md:gap-3">
                        <SearchInput
                            placeholder="Buscar challenges..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <PrimaryButton type="button" onClick={handleSearch}>
                            Buscar
                        </PrimaryButton>
                    </div>
                </PageHero>

                <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm space-y-6">
                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {filteredChallenges.length === 0 ? (
                        <div className="text-center space-y-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-slate-600">
                            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="text-lg font-semibold text-slate-900">
                                No se encontraron challenges
                            </h3>
                            <p className="text-sm">
                                {searchTerm
                                    ? 'Intenta con otros filtros de búsqueda'
                                    : 'Sé el primero en crear un challenge'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredChallenges.map((challenge) => (
                                    <div
                                        key={challenge.id}
                                        className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-indigo-200"
                                    >
                                        {challenge.mediaUrl && (
                                            <div className="aspect-video overflow-hidden bg-slate-100">
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
                                                <h3 className="text-2xl font-semibold text-slate-900">
                                                    {challenge.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 line-clamp-3 mt-2">
                                                    {challenge.description}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between text-sm text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} />
                                                    <span>{challenge.items.length} tareas</span>
                                                </div>
                                                <span className="text-xs uppercase tracking-wide text-slate-400">
                                                    por {challenge.creatorUsername}
                                                </span>
                                            </div>
                                            <Link to={`/challenges/${challenge.id}`} className="mt-auto">
                                                <PrimaryButton type="button" fullWidth>
                                                    Ver Challenge
                                                </PrimaryButton>
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

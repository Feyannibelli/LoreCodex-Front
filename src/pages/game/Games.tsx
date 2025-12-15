import React, { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Game } from "../../interfaces/Game.ts";
import gameService from "../../services/gameService.ts";
import searchService from "../../services/searchService.ts";
import GameFilters, { FiltersState } from "../../components/GameFilters.tsx";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import SearchInput from "../../components/ui/SearchInput";
import PageHero from "../../components/ui/PageHero";

const Games: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    const [activeFilters, setActiveFilters] = useState<FiltersState | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    const fetchGames = useCallback(async (page: number, pageSize: number): Promise<Game[]> => {
        const games = await gameService.getAllGamesPaginated(page, pageSize);
        if (page === 0) {
            const genres = searchService.getAvailableGenres(games);
            setAvailableGenres(genres);
        }
        return games;
    }, []);

    const {
        items: allGames,
        loading,
        hasMore,
        error,
        loadMore,
        refresh
    } = useInfiniteScroll({
        fetchFunction: fetchGames,
        pageSize: 12
    });

    const displayedGames = React.useMemo(() => {
        return searchService.filterGames(allGames, searchTerm, activeFilters || undefined);
    }, [allGames, searchTerm, activeFilters]);

    const handleSearch = async (e: React.FormEvent | null) => {
        if (e) e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/games?search=${encodeURIComponent(searchTerm)}`);
        } else {
            navigate('/games');
        }
    };

    const handleFilterChange = (filters: FiltersState) => {
        setActiveFilters(filters);
    };

    const resetFilters = () => {
        setActiveFilters(null);
        setSearchTerm("");
        refresh();
    };

    React.useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');
        if (searchQuery) {
            setSearchTerm(searchQuery);
        }
    }, [location.search]);

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="mx-auto max-w-6xl space-y-8 px-4">
                <PageHero
                    title="Games"
                    description="Explora y filtra tus títulos favoritos con la colección completa de LoreCodex."
                >
                    <form onSubmit={handleSearch} className="space-y-3 md:space-y-0 md:flex md:gap-3">
                        <SearchInput
                            placeholder="Search game titles or descriptions"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <PrimaryButton type="submit">
                            Search
                        </PrimaryButton>
                        <SecondaryButton type="button" onClick={resetFilters}>
                            Reset filters
                        </SecondaryButton>
                    </form>
                </PageHero>

                <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm space-y-6">
                    <GameFilters
                        availableGenres={availableGenres}
                        onFilterChange={handleFilterChange}
                        onReset={resetFilters}
                    />

                    <div className="text-sm text-slate-600">
                        Showing {displayedGames.length} games {hasMore && '(loading more...)'}
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {loading && allGames.length === 0 ? (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-slate-500">
                            Loading games...
                        </div>
                    ) : displayedGames.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {displayedGames.map((game) => (
                                    <Link
                                        to={`/games/${game.id}`}
                                        key={game.id}
                                        className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-indigo-200"
                                    >
                                        <div className="relative h-48 bg-slate-100">
                                            {game.imageUrl ? (
                                                <img
                                                    src={game.imageUrl}
                                                    alt={game.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-slate-400">
                                                    Game
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 p-5">
                                            <h3 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                                                {game.name}
                                            </h3>
                                            <p className="text-sm uppercase tracking-wide text-indigo-600">
                                                {game.genre || 'Genre TBD'}
                                            </p>
                                            <div className="flex items-center justify-between text-xs uppercase text-slate-500">
                                                <span>{new Date(game.releaseDate).getFullYear()}</span>
                                                {game.averageRating !== undefined && (
                                                    <span>★ {game.averageRating}</span>
                                                )}
                                            </div>
                                            {game.awards && (
                                                <div className="flex items-center gap-1 text-xs font-semibold text-orange-600">
                                                    <span>🏆</span>
                                                    <span>Awards listed</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <InfiniteScrollTrigger
                                onIntersect={loadMore}
                                loading={loading}
                                hasMore={hasMore && displayedGames.length === allGames.length}
                            />
                        </>
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600 space-y-3">
                            <p>No games found with the current search criteria.</p>
                            <SecondaryButton onClick={resetFilters} type="button">
                                Clear all filters
                            </SecondaryButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Games;

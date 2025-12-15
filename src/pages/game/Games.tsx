import React, { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Game } from "../../interfaces/Game.ts";
import gameService from "../../services/gameService.ts";
import searchService from "../../services/searchService.ts";
import GameFilters, { FiltersState } from "../../components/GameFilters.tsx";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import Button from "../../components/Button";
import SearchBar from "../../components/ui/SearchBar";
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
        <div className="min-h-screen py-12 bg-bg">
            <div className="mx-auto max-w-6xl space-y-8 px-4">
                <PageHero
                    title="Games"
                    description="Explore and filter your favorite titles with LoreCodex's complete collection."
                >
                    <div className="space-y-3 md:space-y-0 md:flex md:gap-3 md:items-center">
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSubmit={handleSearch}
                            placeholder="Search game titles or descriptions..."
                            className="flex-1"
                        />
                        <Button variant="outline" type="button" onClick={resetFilters}>
                            Clear filters
                        </Button>
                    </div>
                </PageHero>

                <div className="rounded-3xl border border bg-surface px-8 py-10 shadow-sm space-y-6">
                    <GameFilters
                        availableGenres={availableGenres}
                        onFilterChange={handleFilterChange}
                        onReset={resetFilters}
                    />

                    <div className="text-sm text-muted-foreground">
                        Showing {displayedGames.length} games {hasMore && '(loading more...)'}
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {loading && allGames.length === 0 ? (
                        <div className="rounded-2xl border border bg-surface px-4 py-6 text-center text-text-muted">
                            Loading games...
                        </div>
                    ) : displayedGames.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {displayedGames.map((game) => (
                                    <Link
                                        to={`/games/${game.id}`}
                                        key={game.id}
                                        className="group block overflow-hidden rounded-2xl border border bg-surface shadow-sm transition hover:bg-[rgba(245,126,0,0.06)] hover:shadow-md"
                                    >
                                        <div className="relative h-48 bg-muted/30">
                                            {game.imageUrl ? (
                                                <img
                                                    src={game.imageUrl}
                                                    alt={game.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-text-muted">
                                                    Game
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 p-5">
                                            <h3 className="text-xl font-semibold text-text group-hover:text-brand-500 transition">
                                                {game.name}
                                            </h3>
                                            <p className="text-sm uppercase tracking-wide text-brand-500">
                                                {game.genre || 'Genre TBD'}
                                            </p>
                                            <div className="flex items-center justify-between text-xs uppercase text-text-muted">
                                                <span>{new Date(game.releaseDate).getFullYear()}</span>
                                                {game.averageRating !== undefined && (
                                                    <span>★ {game.averageRating}</span>
                                                )}
                                            </div>
                                            {game.awards && (
                                                <div className="flex items-center gap-1 text-xs font-semibold text-accent">
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
                            <Button variant="outline" onClick={resetFilters} type="button">
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Games;

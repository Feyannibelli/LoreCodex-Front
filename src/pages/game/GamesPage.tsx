import React, { useCallback, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import { Search, Gamepad2, Star, Users } from "lucide-react";
import { cn } from "../../lib/utils.ts";
import gameService, { PagedResponse } from "../../services/gameService.ts";
import { Game } from "../../interfaces/Game.ts";
// import { useAuth } from "../../context/AuthContext.tsx"; // Unused
import { usePaginatedGames } from "../../hook/usePaginatedGames.ts";
import PaginationControls from "../../components/PaginationControls.tsx";

const GamesPage: React.FC = () => {
    // const { isAuthenticated } = useAuth(); // Unused
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get("search") || "";

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const [activeSort, setActiveSort] = useState("releaseDate,desc");

    // Sync URL search param with state (e.g. when navigating from Home)
    useEffect(() => {
        const querySearch = searchParams.get("search") || "";
        if (querySearch && querySearch !== searchTerm) {
            setSearchTerm(querySearch);
        }
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Define the fetch function to pass to the hook
    const fetchGames = useCallback(async (page: number, pageSize: number): Promise<PagedResponse<Game>> => {
        // Use the Unified Smart Flow from current service
        return await gameService.getGames({
            page,
            size: pageSize,
            sort: activeSort,
            search: debouncedSearch
        });
    }, [debouncedSearch, activeSort]);

    const {
        games,
        pagination,
        loadPage,
        page,
        loading,
        error
    } = usePaginatedGames(fetchGames, {
        search: debouncedSearch,
        sort: activeSort
    });

    // Sort options - mapped to backend sort parameters
    const sortOptions = [
        { label: "Newest", value: "releaseDate,desc" },
        { label: "Oldest", value: "releaseDate,asc" },
        { label: "Rating", value: "rating,desc" },
        { label: "Likes", value: "likes,desc" },
        { label: "A-Z", value: "title,asc" },
    ];

    return (
        <div className="min-h-screen bg-background py-8 md:py-12 mb-20 animate-fade-in">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* 1. Header Section */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
                    <div className="max-w-3xl space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            Game Library
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Explore our collection of games.
                        </p>
                    </div>
                </div>

                {/* 2. Toolbar Section */}
                <div className="sticky top-20 z-30 mb-8 rounded-2xl border border-white/5 bg-card/80 p-2 shadow-xl shadow-black/20 backdrop-blur-xl">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center p-2">

                        {/* Search Input */}
                        <div className="relative flex-1 group min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search games..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 w-full rounded-lg border border-white/5 bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>



                        {/* Sort Options */}
                        <div className="flex items-center gap-1.5 bg-secondary/20 p-1 rounded-lg border border-white/5 overflow-x-auto scrollbar-hide">
                            <span className="text-xs font-medium text-muted-foreground ml-2 mr-1">Sort by:</span>
                            {sortOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setActiveSort(option.value)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap",
                                        activeSort === option.value
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
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
                            <Button variant="ghost" size="sm" onClick={() => loadPage(0)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                Retry
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading && games.length === 0 ? (
                            /* Skeletons */
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-[3/4] rounded-3xl border border-white/5 bg-card/40 animate-pulse" />
                            ))
                        ) : games.length === 0 ? (
                            /* Empty State */
                            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-card/30 py-24 text-center backdrop-blur-sm">
                                <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6 ring-8 ring-secondary/20">
                                    <Gamepad2 className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">No games found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                    {debouncedSearch
                                        ? "We couldn't find any games matching your search."
                                        : "No games found."}
                                </p>
                            </div>
                        ) : (
                            games.map(game => (
                                <Link
                                    // Use local ID if available, otherwise assume it's an IGDB game and maybe route to /games/igdb/:id or just /games/:igdbId if backend handles it
                                    // Spec 3: GET /igdb/{igdbId} -> dedicated endpoint.
                                    // So if game.id is present, it's local -> /games/:id
                                    // If only game.igdbId -> /games/igdb/:igdbId (We need to handle this route or logic in Game.tsx)
                                    to={game.id ? `/games/${game.id}` : `/games/igdb/${game.igdbId}`}
                                    // Spec: Usa game.id ?? game.igdbId como key único
                                    key={game.id ?? game.igdbId ?? Math.random()}
                                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-card shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20"
                                >
                                    {/* Cover Image */}
                                    <div className="aspect-[3/4] w-full overflow-hidden bg-muted relative">
                                        {game.coverImage ? (
                                            <img
                                                src={game.coverImage}
                                                alt={game.title}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-muted-foreground">
                                                <Gamepad2 className="h-16 w-16 opacity-20" />
                                            </div>
                                        )}
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent opacity-90" />

                                        {/* TOP RIGHT BADGE - Rating */}
                                        {game.averageRating !== undefined && game.averageRating !== null && game.averageRating > 0 && (
                                            <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-yellow-400 border border-white/10 shadow-lg">
                                                    <Star className="h-3 w-3 fill-yellow-400" />
                                                    {game.averageRating.toFixed(1)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-card via-card/95 to-transparent">
                                        {/* Genres & Tags */}
                                        <div className="mb-2 flex flex-wrap gap-1.5 h-6 overflow-hidden">
                                            {/* Show Tags mainly as they are more specific now */}
                                            {game.tags?.slice(0, 3).map(t => (
                                                <span key={t} className="text-[10px] font-bold uppercase tracking-wider text-primary truncate bg-primary/10 px-1.5 py-0.5 rounded">
                                                    {t}
                                                </span>
                                            ))}
                                            {/* Fallback to Genres if no tags */}
                                            {(!game.tags || game.tags.length === 0) && game.genres?.slice(0, 2).map(g => (
                                                <span key={g} className="text-[10px] font-bold uppercase tracking-wider text-primary truncate bg-primary/10 px-1.5 py-0.5 rounded">
                                                    {g}
                                                </span>
                                            ))}
                                        </div>

                                        <h2 className="text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {game.title}
                                        </h2>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground/80 mt-2">
                                            {/* Rating instead of Likes */}
                                            {game.averageRating !== undefined && (
                                                <div className="flex items-center gap-1.5 ">
                                                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-xs font-medium text-white">{game.averageRating?.toFixed(1) || "0.0"}</span>
                                                </div>
                                            )}
                                            {game.playerCount && game.playerCount.toLowerCase() !== 'active' && (
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {game.playerCount}
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

                    {/* Pagination Controls */}
                    <div className="mt-12">
                        <PaginationControls
                            currentPage={page}
                            totalPages={pagination?.totalPages || 0}
                            hasNext={!pagination?.last}
                            hasPrevious={!pagination?.first}
                            onNext={() => loadPage(page + 1)}
                            onPrev={() => loadPage(page - 1)}
                            onPageChange={(p) => loadPage(p)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamesPage;

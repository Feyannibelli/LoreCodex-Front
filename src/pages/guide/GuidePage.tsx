import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import guideService from "../../services/guideService.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { Guide } from "../../interfaces/Guide.ts";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";
import Button from "../../components/Button";
import UnifiedContentRenderer from "../../components/UnifiedContentRenderer";
import { Search, FileText, Plus, AlertTriangle, User, Calendar } from "lucide-react";


const GuidePage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);

    const fetchGuides = useCallback(async (page: number, pageSize: number): Promise<Guide[]> => {
        return await guideService.getPublishedGuidesPaginated(page, pageSize);
    }, []);

    const {
        items: guides,
        loading,
        hasMore,
        error,
        loadMore
    } = useInfiniteScroll<Guide>({
        fetchFunction: fetchGuides,
        pageSize: 10
    });

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredGuides(guides);
        } else {
            const filtered = guides.filter(guide =>
                guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                guide.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredGuides(filtered);
        }
    }, [searchTerm, guides]);



    return (
        <div className="min-h-screen bg-background py-8 md:py-12 mb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* 1. Header Section - Aligned */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
                    <div className="max-w-3xl space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="h-0.5 w-8 bg-primary/60 rounded-full"></span>
                            <p className="text-sm font-bold uppercase tracking-widest text-primary">
                                GUIDES
                            </p>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                            Explore Community Guides
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            Discover strategies, walkthroughs, and deep lore analysis created by expert players.
                        </p>
                    </div>

                    {isAuthenticated && (
                        <div className="flex items-center gap-3 shrink-0 pb-1">
                            <Link to="/my-drafts">
                                <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary font-semibold px-6 gap-2">
                                    <FileText className="h-4 w-4" />
                                    My Drafts
                                </Button>
                            </Link>
                            <Link to="/guides/create">
                                <Button className="shadow-lg shadow-primary/20 font-semibold px-6 gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Guide
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* 2. Toolbar Section - Premium Surface */}
                <div className="sticky top-20 z-30 mb-10 rounded-2xl border border-white/5 bg-card/80 p-2 shadow-xl shadow-black/20 backdrop-blur-xl">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center p-2">

                        {/* Search Input - Compact & Local */}
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search guides..."
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
                                <AlertTriangle className="h-5 w-5" />
                                <p className="font-medium">{error}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                Retry
                            </Button>
                        </div>
                    )}

                    {loading && guides.length === 0 ? (
                        /* Skeleton State - Premium */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-card/40 p-5 h-[420px]">
                                    <div className="h-48 w-full rounded-2xl bg-white/5 animate-pulse" />
                                    <div className="space-y-3 px-1">
                                        <div className="h-6 w-3/4 rounded bg-white/5 animate-pulse" />
                                        <div className="h-4 w-1/2 rounded bg-white/5 animate-pulse" />
                                        <div className="h-20 w-full rounded bg-white/5 animate-pulse mt-4" />
                                    </div>
                                    <div className="mt-auto flex gap-3 pt-4 border-t border-white/5">
                                        <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
                                        <div className="h-8 w-24 rounded bg-white/5 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredGuides.length === 0 ? (
                        /* Empty State - Premium */
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-card/30 py-24 text-center backdrop-blur-sm">
                            <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6 ring-8 ring-secondary/20">
                                <Search className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No guides found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                We couldn't find any guides matching "{searchTerm}". Try adjusting your filters or search terms.
                            </p>
                            {isAuthenticated && (
                                <Link to="/guides/create">
                                    <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary">
                                        Create New Guide
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        /* Content Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredGuides.map(g => (
                                <Link
                                    to={`/guides/${g.id}`}
                                    key={g.id}
                                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-card shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20"
                                >
                                    {/* Image Section */}
                                    <div className="aspect-[16/9] w-full overflow-hidden bg-muted relative">
                                        {g.coverImageUrl ? (
                                            <img
                                                src={g.coverImageUrl}
                                                alt={g.title}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-muted-foreground">
                                                <FileText className="h-12 w-12 opacity-20" />
                                            </div>
                                        )}
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-90" />

                                        {/* Floating Badge */}
                                        <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground p-2 shadow-lg">
                                                <Plus className="h-4 w-4" />
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-6 pt-0 relative z-10">
                                        <div className="mb-4 flex flex-wrap gap-2 -mt-6">
                                            {g.tags && g.tags.length > 0 ? g.tags.slice(0, 3).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center rounded-md border border-white/10 bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-white shadow-sm"
                                                >
                                                    {tag}
                                                </span>
                                            )) : (
                                                <span className="inline-flex items-center rounded-md border border-white/10 bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                                                    Guide
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="text-2xl font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                            {g.title}
                                        </h2>

                                        <div className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1 leading-relaxed">
                                            <UnifiedContentRenderer
                                                content={g.content.substring(0, 200) + '...'}
                                                className="line-clamp-3 text-muted-foreground"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-white/10 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center ring-1 ring-white/10 overflow-hidden">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                {g.authorId ? (
                                                    <Link
                                                        to={`/profile/${g.authorId}`}
                                                        className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {g.authorUsername || "Unknown"}
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs font-medium text-muted-foreground">Community</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground/60 font-mono flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(g.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
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

export default GuidePage;

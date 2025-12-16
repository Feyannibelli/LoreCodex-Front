import { useCallback, useMemo, useState } from "react";
import newsService from "../../services/newsService.ts";
import { Link } from "react-router-dom";
import { News } from "../../interfaces/News.ts";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { Search, ArrowUpDown, Plus, Calendar, Newspaper } from "lucide-react";

const NewsPage: React.FC = () => {
    const { isAdmin } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter] = useState("All");

    const fetchNews = useCallback(async (page: number, pageSize: number): Promise<News[]> => {
        const response = await newsService.getAllPaginated(page, pageSize);
        return response.data;
    }, []);

    const {
        items: news,
        loading,
        hasMore,
        error,
        loadMore
    } = useInfiniteScroll<News>({
        fetchFunction: fetchNews,
        pageSize: 12
    });

    const filteredNews = useMemo(() => {
        if (!searchTerm.trim()) return news;
        const term = searchTerm.toLowerCase();
        return news.filter(item =>
            item.title.toLowerCase().includes(term) ||
            item.content.toLowerCase().includes(term)
        );
    }, [news, searchTerm]);

    const displayedNews = activeFilter === "All" ? filteredNews : filteredNews; // Placeholder for tag filtering if needed

    return (
        <div className="min-h-screen bg-background py-8 md:py-12 mb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* 1. Header Section - Aligned */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
                    <div className="max-w-3xl space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="h-0.5 w-8 bg-primary/60 rounded-full"></span>
                            <p className="text-sm font-bold uppercase tracking-widest text-primary">
                                Editorial
                            </p>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                            Latest News
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            Stay informed with the latest updates, patches, and announcements from the LoreCodex team.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pb-1">
                        {isAdmin && (
                            <Link to="/news/create">
                                <Button className="shadow-lg shadow-primary/20 font-semibold px-6 gap-2">
                                    <Plus className="h-4 w-4" />
                                    Write News
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
                                placeholder="Search news..."
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
                                <span>Recent</span>
                            </button>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading && news.length === 0 ? (
                            /* Skeletons */
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-card/40 p-5 h-[400px] animate-pulse">
                                    <div className="h-48 w-full rounded-2xl bg-white/5" />
                                    <div className="space-y-3 px-1">
                                        <div className="h-6 w-3/4 rounded bg-white/5" />
                                        <div className="h-4 w-full rounded bg-white/5" />
                                        <div className="h-4 w-2/3 rounded bg-white/5" />
                                    </div>
                                </div>
                            ))
                        ) : displayedNews.length === 0 ? (
                            /* Empty State */
                            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-card/30 py-24 text-center backdrop-blur-sm">
                                <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6 ring-8 ring-secondary/20">
                                    <Newspaper className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">No news found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                    We couldn't find any news articles matching "{searchTerm}".
                                </p>
                            </div>
                        ) : (
                            displayedNews.map(item => (
                                <Link
                                    to={`/news/${item.id}`}
                                    key={item.id}
                                    className="group flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-card shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 h-full"
                                >
                                    {/* Image Placeholder / Banner */}
                                    <div className="aspect-[16/9] w-full overflow-hidden bg-muted relative">
                                        {item.coverImage ? (
                                            <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary/30 to-background">
                                                <Newspaper className="h-12 w-12 opacity-10" />
                                            </div>
                                        )}

                                        {/* Date Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white border border-white/10 shadow-sm">
                                                <Calendar className="h-3 w-3 text-primary" />
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-6 relative">
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {item.tags?.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {item.title}
                                        </h2>

                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
                                            {item.content}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-white/5 mt-auto">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                By <span className="text-foreground font-medium">LoreCodex Team</span>
                                            </div>


                                        </div>
                                    </div>
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

export default NewsPage;

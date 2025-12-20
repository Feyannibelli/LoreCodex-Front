import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../components/ui/SearchBar";
import { Game } from "../interfaces/Game";
import gameService from "../services/gameService";
import newsService from "../services/newsService";
import { News } from "../interfaces/News";
import { Guide } from "../interfaces/Guide.ts";
import guideService from "../services/guideService.ts";
import { Calendar, ArrowRight } from "lucide-react";

const Home: React.FC = () => {
    const [popularGuides, setPopularGuides] = useState<Guide[]>([]);
    const [recentlyAdded, setRecentlyAdded] = useState<Game[]>([]);
    const [popularGames, setPopularGames] = useState<Game[]>([]);
    const [latestNews, setLatestNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        guideService.getPublishedGuides()
            .then((guides: Guide[]) => {
                const recent = guides
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 6);
                setPopularGuides(recent);
            })
            .catch(err => console.error("Error fetching guides:", err));
    }, []);

    useEffect(() => { loadGames(); }, []);

    useEffect(() => {
        newsService.getRecent(3)
            .then(res => setLatestNews(res.data))
            .catch(err => console.error("Error loading news:", err));
    }, []);

    const loadGames = async () => {
        try {
            setLoading(true);
            const recentResponse = await gameService.getLibraryGamesPaginated(0, 10, 'createdAt,desc');
            const popularResponse = await gameService.getLibraryGamesPaginated(0, 8, 'rating,desc');
            setRecentlyAdded(recentResponse.content);
            setPopularGames(popularResponse.content);
            setError(null);
        } catch (err) {
            console.error("Error loading games:", err);
            setError("Error loading games. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/games?search=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-background to-background"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] opacity-40 mix-blend-screen"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] opacity-30"></div>
                <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="relative pt-24 pb-20 overflow-hidden">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm animate-fade-in-up">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                            Welcome to LoreCodex
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight animate-fade-in-up delay-100">
                            Discover <span className="text-primary">Games</span>,<br />
                            Guides & More
                        </h1>

                        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
                            Your premium destination for gaming knowledge.
                            Explore our curated collection of guides, news, and game databases.
                        </p>

                        <div className="flex justify-center animate-fade-in-up delay-300">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onSubmit={handleSearch}
                                placeholder="Search everything..."
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>
                </section>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24 pb-24">
                    {/* Error Message */}
                    {error && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive font-medium shadow-sm max-w-3xl mx-auto">
                            {error}
                        </div>
                    )}

                    {/* Latest News - COMPACT VERSION */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">Latest News</h2>
                                <p className="text-muted-foreground mt-1 text-sm">Fresh from the editorial team</p>
                            </div>
                            <Link to="/news" className="group flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80">
                                View all
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        {latestNews.length === 0 ? (
                            <div className="rounded-2xl border border-white/5 bg-card/50 p-8 text-center text-muted-foreground shadow-sm">
                                <p>No news available at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {latestNews.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={`/news/${item.id}`}
                                        className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                                    >
                                        {/* Compact Image */}
                                        <div className="relative w-full h-40 overflow-hidden bg-muted">
                                            {item.coverImage ? (
                                                <img
                                                    src={item.coverImage}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-muted-foreground text-sm">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                                        </div>

                                        {/* Compact Content */}
                                        <div className="p-4 space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            </div>

                                            <h3 className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                {item.title}
                                            </h3>

                                            {item.tags && item.tags.length > 0 && (
                                                <div className="flex gap-1 flex-wrap">
                                                    {item.tags.slice(0, 2).map(tag => (
                                                        <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm font-medium">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 pointer-events-none"></div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Recently Added Games */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground tracking-tight">New Arrivals</h2>
                                <p className="text-muted-foreground mt-1">Review the latest titles added to our database.</p>
                            </div>
                            <Link to="/games" className="group flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80">
                                Browse catalog
                                <span className="block transition-transform group-hover:translate-x-1">→</span>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] rounded-2xl bg-muted/20 animate-pulse"></div>
                                ))}
                            </div>
                        ) : recentlyAdded.length === 0 ? (
                            <div className="rounded-2xl border border-white/5 bg-card/50 p-12 text-center text-muted-foreground">No games found</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {recentlyAdded.map(game => (
                                    <Link
                                        key={game.id ?? game.igdbId ?? Math.random()}
                                        to={`/games/${game.id}`}
                                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                                    >
                                        <div className="aspect-[3/4] w-full overflow-hidden bg-muted relative">
                                            {game.coverImage ? (
                                                <img src={game.coverImage} alt={game.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-muted-foreground">Game</div>
                                            )}
                                            <div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10"></div>
                                        </div>

                                        <div className="p-4 bg-card group-hover:bg-card/80 transition-colors">
                                            <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                                {game.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {game.createdAt
                                                    ? `Added ${new Date(game.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                                    : 'Recently added'}
                                            </p>
                                        </div>

                                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none"></div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Popular Games */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground tracking-tight">Trending Now</h2>
                                <p className="text-muted-foreground mt-1">Most popular games this week.</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-64 bg-muted/20 rounded-2xl animate-pulse"></div>
                        ) : popularGames.length === 0 ? (
                            <div className="rounded-2xl border border-white/5 bg-card/50 p-12 text-center text-muted-foreground">No games found</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {popularGames.map(game => (
                                    <Link
                                        key={game.id ?? game.igdbId ?? Math.random()}
                                        to={`/games/${game.id}`}
                                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                                    >
                                        <div className="aspect-[3/4] w-full overflow-hidden bg-muted relative">
                                            {game.coverImage ? (
                                                <img src={game.coverImage} alt={game.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-muted-foreground">Game</div>
                                            )}
                                        </div>
                                        <div className="p-4 bg-card border-t border-white/5">
                                            <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                                {game.title}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">{game.genres?.[0] || 'Game'}</span>
                                                {game.averageRating !== null && game.averageRating !== undefined && game.averageRating > 0 && (
                                                    <span className="text-xs font-semibold text-amber-400">★ {game.averageRating.toFixed(1)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none"></div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Popular Guides */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground tracking-tight">Community Guides</h2>
                                <p className="text-muted-foreground mt-1">Master your games with top-rated guides.</p>
                            </div>
                            <Link to="/guides" className="group flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80">
                                View all guides
                                <span className="block transition-transform group-hover:translate-x-1">→</span>
                            </Link>
                        </div>

                        {popularGuides.length === 0 ? (
                            <div className="rounded-2xl border border-white/5 bg-card/50 p-12 text-center text-muted-foreground">No published guides yet.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {popularGuides.map((guide) => (
                                    <Link
                                        key={guide.id}
                                        to={`/guides/${guide.id}`}
                                        className="group relative flex flex-col rounded-2xl border border-white/5 bg-card p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                                    >
                                        <div className="mb-4">
                                            <span className="inline-flex rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-white/5">
                                                Guide
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                            {guide.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                                            {guide.content.substring(0, 150)}...
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-secondary"></div>
                                                <span className="text-xs text-muted-foreground">Author</span>
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {new Date(guide.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none rounded-2xl"></div>
                                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none"></div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Home;

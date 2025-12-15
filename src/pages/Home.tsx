import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../components/ui/SearchBar";
import { Game } from "../interfaces/Game";
import gameService from "../services/gameService";
import newsService from "../services/newsService";
import { News } from "../interfaces/News";
import { Guide } from "../interfaces/Guide.ts";
import guideService from "../services/guideService.ts";

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
        newsService.getRecent(5)
            .then(res => setLatestNews(res.data))
            .catch(err => console.error("Error loading news:", err));
    }, []);

    const loadGames = async () => {
        try {
            setLoading(true);
            const allGames = await gameService.getAllGames();

            const recent = [...allGames]
                .sort((a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate))
                .slice(0, 10);

            const popular = [...allGames]
                .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                .slice(0, 8);

            setRecentlyAdded(recent);
            setPopularGames(popular);
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
        <div className="min-h-screen bg-bg py-12">
            <div className="mx-auto max-w-6xl px-4">
                {/* Hero Section with Search */}
                <div className="relative overflow-hidden rounded-3xl border border bg-surface shadow-sm mb-12">
                    <div className="relative px-8 py-10">
                        <div className="text-center mb-8">
                            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500 mb-2">
                                Welcome
                            </p>
                            <h1 className="text-4xl font-bold text-text mb-2">
                                Discover Games, Guides & More
                            </h1>
                            <p className="text-sm text-text-muted">
                                Explore the LoreCodex community
                            </p>
                        </div>

                        <div className="max-w-2xl mx-auto">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onSubmit={handleSearch}
                                placeholder="Search games, guides, news..."
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-8">
                        {error}
                    </div>
                )}

                <div className="space-y-12">
                    {/* Latest News Section */}
                    <div className="relative overflow-hidden rounded-3xl border border bg-surface shadow-sm">
                        <div className="px-8 py-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">Latest</p>
                                    <h2 className="text-3xl font-bold text-text mt-1">Latest News</h2>
                                </div>
                                <Link to="/news" className="text-brand-500 hover:text-brand-600 font-medium transition-colors">
                                    More +
                                </Link>
                            </div>

                            {latestNews.length === 0 ? (
                                <div className="text-center py-12 text-text-muted">
                                    No news yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {latestNews.map(item => (
                                        <Link
                                            key={item.id}
                                            to={`/news/${item.id}`}
                                            className="flex gap-4 p-4 rounded-2xl border border bg-surface-2 hover:bg-[rgba(245,126,0,0.06)] transition"
                                        >
                                            {item.coverImage && (
                                                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface-2">
                                                    <img
                                                        src={item.coverImage}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-text mb-1 line-clamp-2">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-text-muted">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recently Added Games */}
                    <div className="relative overflow-hidden rounded-3xl border border bg-surface shadow-sm">
                        <div className="px-8 py-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">Recent</p>
                                    <h2 className="text-3xl font-bold text-text mt-1">Recently Added</h2>
                                </div>
                                <Link to="/games" className="text-brand-500 hover:text-brand-600 font-medium transition-colors">
                                    More +
                                </Link>
                            </div>

                            {loading ? (
                                <div className="text-center py-12 text-text-muted">Loading...</div>
                            ) : recentlyAdded.length === 0 ? (
                                <div className="text-center py-12 text-text-muted">No games found</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {recentlyAdded.map(game => (
                                        <Link
                                            key={game.id}
                                            to={`/games/${game.id}`}
                                            className="group flex flex-col rounded-2xl border border bg-surface-2 overflow-hidden hover:bg-[rgba(245,126,0,0.06)] transition"
                                        >
                                            <div className="aspect-[3/4] bg-surface-2 flex items-center justify-center overflow-hidden">
                                                {game.imageUrl ? (
                                                    <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <span className="text-text-muted">Game</span>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h3 className="text-sm font-semibold text-text line-clamp-2 mb-1">
                                                    {game.name}
                                                </h3>
                                                <p className="text-xs text-text-muted">
                                                    {new Date(game.releaseDate).getFullYear()}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Popular Games */}
                    <div className="relative overflow-hidden rounded-3xl border border bg-surface shadow-sm">
                        <div className="px-8 py-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">Popular</p>
                                    <h2 className="text-3xl font-bold text-text mt-1">Popular Games</h2>
                                </div>
                                <Link to="/games" className="text-brand-500 hover:text-brand-600 font-medium transition-colors">
                                    More +
                                </Link>
                            </div>

                            {loading ? (
                                <div className="text-center py-12 text-text-muted">Loading...</div>
                            ) : popularGames.length === 0 ? (
                                <div className="text-center py-12 text-text-muted">No games found</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {popularGames.map(game => (
                                        <Link
                                            key={game.id}
                                            to={`/games/${game.id}`}
                                            className="group flex flex-col rounded-2xl border border bg-surface-2 overflow-hidden hover:bg-[rgba(245,126,0,0.06)] transition"
                                        >
                                            <div className="aspect-[3/4] bg-surface-2 flex items-center justify-center overflow-hidden">
                                                {game.imageUrl ? (
                                                    <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <span className="text-text-muted">Game</span>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h3 className="text-sm font-semibold text-text line-clamp-2 mb-1">
                                                    {game.name}
                                                </h3>
                                                <p className="text-xs text-text-muted">{game.genre}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Popular Guides */}
                    <div className="relative overflow-hidden rounded-3xl border border bg-surface shadow-sm">
                        <div className="px-8 py-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">Guides</p>
                                    <h2 className="text-3xl font-bold text-text mt-1">Recently Published Guides</h2>
                                </div>
                                <Link to="/guides" className="text-brand-500 hover:text-brand-600 font-medium transition-colors">
                                    More +
                                </Link>
                            </div>

                            {popularGuides.length === 0 ? (
                                <div className="text-center py-12 text-text-muted">No published guides yet.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {popularGuides.map((guide) => (
                                        <Link
                                            key={guide.id}
                                            to={`/guides/${guide.id}`}
                                            className="flex flex-col rounded-2xl border border bg-surface-2 p-6 hover:bg-[rgba(245,126,0,0.06)] transition"
                                        >
                                            <h3 className="text-xl font-semibold text-text mb-2 line-clamp-2">
                                                {guide.title}
                                            </h3>
                                            <p className="text-sm text-text-muted line-clamp-3 mb-4">
                                                {guide.content.substring(0, 150)}...
                                            </p>
                                            <div className="mt-auto pt-4 border-t border">
                                                <p className="text-xs text-text-muted">
                                                    {new Date(guide.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

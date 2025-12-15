import { useCallback, useMemo, useState } from "react";
import newsService from "../../services/newsService.ts";
import { Link } from "react-router-dom";
import { News } from "../../interfaces/News.ts";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";
import Button from "../../components/Button";
import SearchBar from "../../components/ui/SearchBar";
import PageHero from "../../components/ui/PageHero";
import { useAuth } from "../../context/AuthContext";

const NewsPage: React.FC = () => {
    const { isAdmin } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");

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
    } = useInfiniteScroll({
        fetchFunction: fetchNews,
        pageSize: 10
    });

    const filteredNews = useMemo(() => {
        if (!searchTerm.trim()) return news;
        const term = searchTerm.toLowerCase();
        return news.filter(item =>
            item.title.toLowerCase().includes(term) ||
            item.content.toLowerCase().includes(term)
        );
    }, [news, searchTerm]);

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="mx-auto max-w-6xl px-4">
                <PageHero
                    title="News"
                    subtitle="LoreCodex Updates"
                    description="Stay informed with the latest news and announcements from the community."
                    actions={
                        isAdmin && (
                            <Link to="/news/create">
                                <Button variant="default" type="button">
                                    Create News
                                </Button>
                            </Link>
                        )
                    }
                >
                    <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
                        <SearchBar
                            placeholder="Filter news by title or content"
                            value={searchTerm}
                            onChange={setSearchTerm}
                            className="w-full"
                        />
                    </div>
                </PageHero>

                <div className="mt-8 rounded-3xl border border-border bg-card shadow-sm">
                    <div className="px-8 py-10 space-y-6">
                        {error && (
                            <div className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {loading && news.length === 0 ? (
                            <div className="rounded-2xl border border-border bg-card px-4 py-6 text-center text-muted-foreground">
                                Loading news...
                            </div>
                        ) : filteredNews.length === 0 ? (
                            <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center">
                                <p className="text-lg font-semibold text-foreground mb-2">No news yet.</p>
                                <p className="text-sm text-muted-foreground">Check back later for updates.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-6">
                                    {filteredNews.map(item => (
                                        <article
                                            key={item.id}
                                            className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:bg-muted/50"
                                        >
                                            <header>
                                                <h2 className="text-2xl font-semibold text-foreground mb-1">
                                                    <Link to={`/news/${item.id}`} className="hover:text-primary transition-colors">
                                                        {item.title}
                                                    </Link>
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(item.createdAt).toLocaleDateString()} • {item.likes} likes
                                                </p>
                                            </header>
                                            <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                                                {item.content}
                                            </p>
                                            {item.tags?.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {item.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </article>
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
        </div>
    );
};

export default NewsPage;

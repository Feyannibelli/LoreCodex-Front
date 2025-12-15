import { useCallback, useMemo, useState } from "react";
import newsService from "../../services/newsService.ts";
import { Link } from "react-router-dom";
import { News } from "../../interfaces/News.ts";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SearchInput from "../../components/ui/SearchInput";
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
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="mx-auto max-w-6xl space-y-8 px-4">
                <PageHero
                    title="News"
                    subtitle="LoreCodex Updates"
                    description="Mantente informado con las últimas novedades y anuncios de la comunidad."
                    actions={
                        isAdmin ? (
                            <Link to="/news/create">
                                <PrimaryButton type="button">
                                    Create News
                                </PrimaryButton>
                            </Link>
                        ) : null
                    }
                >
                    <SearchInput
                        placeholder="Filter news by title or content"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </PageHero>

                <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm space-y-6">
                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {loading && news.length === 0 ? (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-slate-500">
                            Loading news...
                        </div>
                    ) : filteredNews.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-600">
                            No news yet.
                        </div>
                    ) : (
                        <>
                            <div className="space-y-6">
                                {filteredNews.map(item => (
                                    <article
                                        key={item.id}
                                        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-indigo-200"
                                    >
                                        <header>
                                            <h2 className="text-2xl font-semibold text-slate-900 mb-1">
                                                <Link to={`/news/${item.id}`} className="hover:text-indigo-600">
                                                    {item.title}
                                                </Link>
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                {new Date(item.createdAt).toLocaleDateString()} • {item.likes} likes
                                            </p>
                                        </header>
                                        <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                                            {item.content}
                                        </p>
                                        {item.tags?.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {item.tags.map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-full border border-slate-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600"
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
    );
};

export default NewsPage;

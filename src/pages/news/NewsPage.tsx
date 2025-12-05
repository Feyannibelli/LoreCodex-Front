import { useCallback } from "react";
import newsService from "../../services/newsService.ts";
import { Link } from "react-router-dom";
import { News } from "../../interfaces/News.ts";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";

const NewsPage: React.FC = () => {
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

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">News</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading && news.length === 0 ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : news.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No news yet.</p>
            ) : (
                <>
                    <ul className="space-y-4">
                        {news.map(item => (
                            <li key={item.id} className="border p-4 rounded-lg hover:shadow-lg transition-shadow">
                                <h2 className="text-xl font-semibold">
                                    <Link to={`/news/${item.id}`} className="hover:underline">
                                        {item.title}
                                    </Link>
                                </h2>
                                <p className="text-sm text-gray-500 mb-2">
                                    {new Date(item.createdAt).toLocaleDateString()} • {item.likes} likes
                                </p>
                                <p className="line-clamp-3">{item.content}</p>
                                {item.tags?.length > 0 && (
                                    <div className="mt-2 flex gap-2 flex-wrap">
                                        {item.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    <InfiniteScrollTrigger
                        onIntersect={loadMore}
                        loading={loading}
                        hasMore={hasMore}
                    />
                </>
            )}
        </div>
    );
};

export default NewsPage;

import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import newsService from "../../services/newsService.ts";
import { News } from "../../interfaces/News.ts";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";

const AdminNewsList: React.FC = () => {
    const navigate = useNavigate();

    const fetchNews = useCallback(async (page: number, pageSize: number): Promise<News[]> => {
        const response = await newsService.getAllPaginated(page, pageSize);
        return response.data;
    }, []);

    const {
        items: news,
        loading,
        hasMore,
        error,
        loadMore,
        refresh
    } = useInfiniteScroll({
        fetchFunction: fetchNews,
        pageSize: 15
    });

    const handleTogglePublish = async (item: News) => {
        try {
            if (item.published) {
                await newsService.unpublish(item.id);
            } else {
                await newsService.publish(item.id);
            }
            refresh();
        } catch (err) {
            console.error("Error toggling publish:", err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this news item?")) return;
        try {
            await newsService.delete(id);
            refresh();
        } catch (err) {
            console.error("Error deleting news:", err);
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Admin News</h1>
                <Link
                    to="/admin/news/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + New
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading && news.length === 0 ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border">
                            <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="p-2">ID</th>
                                <th className="p-2">Title</th>
                                <th className="p-2">Published</th>
                                <th className="p-2">Likes</th>
                                <th className="p-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {news.map(n => (
                                <tr key={n.id} className="border-t">
                                    <td className="p-2">{n.id}</td>
                                    <td className="p-2">
                                        <Link to={`/news/${n.id}`} className="hover:underline">
                                            {n.title}
                                        </Link>
                                    </td>
                                    <td className="p-2">{n.published ? "Yes" : "No"}</td>
                                    <td className="p-2">{n.likes}</td>
                                    <td className="p-2 space-x-2">
                                        <button
                                            onClick={() => handleTogglePublish(n)}
                                            className={`text-sm px-2 py-1 rounded ${
                                                n.published
                                                    ? "bg-yellow-500 text-white"
                                                    : "bg-green-600 text-white"
                                            }`}
                                        >
                                            {n.published ? "Unpublish" : "Publish"}
                                        </button>

                                        <button
                                            onClick={() => navigate(`/admin/news/edit/${n.id}`)}
                                            className="text-sm bg-gray-500 text-white px-2 py-1 rounded"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(n.id)}
                                            className="text-sm bg-red-600 text-white px-2 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

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

export default AdminNewsList;

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
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-foreground">Admin News</h1>
                    <Link
                        to="/admin/news/create"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        + New
                    </Link>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {loading && news.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <table className="min-w-full">
                                <thead className="bg-secondary/50 text-left">
                                    <tr>
                                        <th className="p-4 font-semibold text-foreground">ID</th>
                                        <th className="p-4 font-semibold text-foreground">Title</th>
                                        <th className="p-4 font-semibold text-foreground">Published</th>
                                        <th className="p-4 font-semibold text-foreground">Likes</th>
                                        <th className="p-4 font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {news.map(n => (
                                        <tr key={n.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="p-4 text-muted-foreground">{n.id}</td>
                                            <td className="p-4">
                                                <Link to={`/news/${n.id}`} className="text-foreground hover:text-primary font-medium hover:underline">
                                                    {n.title}
                                                </Link>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${n.published
                                                        ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                                                        : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20"
                                                    }`}>
                                                    {n.published ? "Published" : "Draft"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-muted-foreground">{n.likes}</td>
                                            <td className="p-4 space-x-2">
                                                <button
                                                    onClick={() => handleTogglePublish(n)}
                                                    className={`text-sm px-3 py-1.5 rounded-lg border transition-colors font-medium ${n.published
                                                            ? "border-yellow-500/50 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/10"
                                                            : "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent shadow-sm"
                                                        }`}
                                                >
                                                    {n.published ? "Unpublish" : "Publish"}
                                                </button>

                                                <button
                                                    onClick={() => navigate(`/admin/news/edit/${n.id}`)}
                                                    className="text-sm border border-input bg-background hover:bg-secondary text-foreground px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(n.id)}
                                                    className="text-sm border border-destructive/50 text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors"
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
        </div>
    );
};

export default AdminNewsList;

import { useCallback } from "react";
import guideService from "../../services/guideService";
import { Guide } from "../../interfaces/Guide";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger";

const MyDraftsPage: React.FC = () => {
    const { user } = useAuth();

    const fetchDrafts = useCallback(async (page: number, pageSize: number): Promise<Guide[]> => {
        if (!user) return [];
        // Nota: Si el backend no soporta paginación para drafts,
        // puedes usar slice manual: return drafts.slice(page * pageSize, (page + 1) * pageSize)
        return await guideService.getDraftsByUser(user.id);
    }, [user]);

    const {
        items: drafts,
        loading,
        hasMore,
        error,
        loadMore
    } = useInfiniteScroll({
        fetchFunction: fetchDrafts,
        pageSize: 10
    });

    if (!user) {
        return (
            <div className="p-4">
                <p className="text-center text-gray-500">Please log in to view your drafts.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">My Drafts</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading && drafts.length === 0 ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            ) : drafts.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No drafts yet.</p>
            ) : (
                <>
                    <ul className="space-y-4">
                        {drafts.map(d => (
                            <li key={d.id} className="border p-4 rounded-lg hover:shadow-lg transition-shadow">
                                <Link
                                    to={`/guides/edit/${d.id}`}
                                    className="text-lg font-semibold hover:underline text-blue-600"
                                >
                                    {d.title}
                                </Link>
                                <p className="text-sm text-gray-500 mt-1">
                                    Last edited: {new Date(d.updatedAt).toLocaleDateString()}
                                </p>
                                <div className="mt-2">
                                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                        Draft
                                    </span>
                                </div>
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

export default MyDraftsPage;

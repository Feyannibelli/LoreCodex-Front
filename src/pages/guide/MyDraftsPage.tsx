import { useCallback } from "react";
import guideService from "../../services/guideService";
import { Guide } from "../../interfaces/Guide";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger";
import { FileEdit, ArrowLeft } from "lucide-react";

const MyDraftsPage: React.FC = () => {
    const { user } = useAuth();

    const fetchDrafts = useCallback(async (_page: number, _pageSize: number): Promise<Guide[]> => {
        if (!user) return [];
        return await guideService.getDraftsByUser(user.id);
    }, [user]);

    const {
        items: drafts,
        loading,
        hasMore,
        error,
        loadMore
    } = useInfiniteScroll<Guide>({
        fetchFunction: fetchDrafts,
        pageSize: 10
    });

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-gray-500">Please log in to view your drafts.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    to="/guides"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft size={20} />
                    Back to Guides
                </Link>
                <h1 className="text-3xl font-bold text-foreground">My Drafts</h1>
                <p className="text-muted-foreground mt-2">
                    These are your unpublished guides. Edit and publish them when ready.
                </p>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading && drafts.length === 0 ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : drafts.length === 0 ? (
                <div className="text-center py-12">
                    <FileEdit className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg mb-4">No drafts yet.</p>
                    <Link
                        to="/guides/create"
                        className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Create Your First Guide
                    </Link>
                </div>
            ) : (
                <>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                        <p className="text-sm text-primary">
                            💡 <strong>Tip:</strong> Drafts are only visible to you. Publish them to share with others!
                        </p>
                    </div>

                    <ul className="space-y-4">
                        {drafts.map(d => (
                            <li key={d.id} className="bg-card border border-border p-6 rounded-xl hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/guides/edit/${d.id}`}
                                            className="block group"
                                        >
                                            <h2 className="text-xl font-semibold text-foreground group-hover:text-primary mb-2">
                                                {d.title}
                                            </h2>
                                        </Link>

                                        <p className="text-sm text-muted-foreground mb-3">
                                            Last edited: {new Date(d.updatedAt).toLocaleDateString()} at {new Date(d.updatedAt).toLocaleTimeString()}
                                        </p>

                                        {d.tags && d.tags.length > 0 && (
                                            <div className="flex gap-2 mb-3">
                                                {d.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-foreground line-clamp-2">
                                            {d.content.substring(0, 150)}...
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                            📝 Draft
                                        </span>
                                        <Link
                                            to={`/guides/edit/${d.id}`}
                                            className="inline-flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm font-medium transition-colors"
                                        >
                                            <FileEdit size={16} />
                                            Edit
                                        </Link>
                                    </div>
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

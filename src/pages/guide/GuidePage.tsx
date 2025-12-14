import { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import guideService from "../../services/guideService.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { Guide } from "../../interfaces/Guide.ts";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";
import { Search, BookOpen } from "lucide-react";

const GuidePage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);

    const fetchGuides = useCallback(async (page: number, pageSize: number): Promise<Guide[]> => {
        return await guideService.getPublishedGuidesPaginated(page, pageSize);
    }, []);

    const {
        items: guides,
        loading,
        hasMore,
        error,
        loadMore
    } = useInfiniteScroll({
        fetchFunction: fetchGuides,
        pageSize: 10
    });

    // Filtrar guías localmente basado en el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredGuides(guides);
        } else {
            const filtered = guides.filter(guide =>
                guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                guide.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredGuides(filtered);
        }
    }, [searchTerm, guides]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Published Guides
                </h1>
                {isAuthenticated && (
                    <div className="flex gap-3">
                        <Link
                            to="/my-drafts"
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors"
                        >
                            📝 My Drafts
                        </Link>
                        <Link
                            to="/guides/create"
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium transition-colors"
                        >
                            + New Guide
                        </Link>
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search guides by title or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading && guides.length === 0 ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            ) : filteredGuides.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                        {searchTerm ? "No guides found matching your search." : "No published guides yet."}
                    </p>
                    {isAuthenticated && !searchTerm && (
                        <Link
                            to="/guides/create"
                            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Create the first guide!
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <ul className="space-y-4">
                        {filteredGuides.map(g => (
                            <li key={g.id} className="bg-white dark:bg-[#313E3F] border border-gray-200 dark:border-gray-700 p-6 rounded-lg hover:shadow-lg transition-shadow">
                                <Link
                                    to={`/guides/${g.id}`}
                                    className="block"
                                >
                                    <div className="flex items-start gap-4">
                                        {g.coverImageUrl && (
                                            <img
                                                src={g.coverImageUrl}
                                                alt={g.title}
                                                className="w-32 h-24 object-cover rounded flex-shrink-0"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 mb-2">
                                                {g.title}
                                            </h2>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                                                {g.tags && g.tags.length > 0 && (
                                                    <div className="flex gap-2">
                                                        {g.tags.slice(0, 3).map(tag => (
                                                            <span key={tag} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                                                {g.content.substring(0, 150)}...
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {searchTerm === "" && (
                        <InfiniteScrollTrigger
                            onIntersect={loadMore}
                            loading={loading}
                            hasMore={hasMore}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default GuidePage;

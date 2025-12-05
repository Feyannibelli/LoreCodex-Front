import { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import guideService from "../../services/guideService.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { Guide } from "../../interfaces/Guide.ts";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";
import { Search } from "lucide-react";

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
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Guides</h1>
                {isAuthenticated && (
                    <Link
                        to="/guides/create"
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                    >
                        + New Guide
                    </Link>
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
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                <p className="text-center text-gray-500 py-12">
                    {searchTerm ? "No guides found matching your search." : "No guides yet."}
                </p>
            ) : (
                <>
                    <ul className="space-y-4">
                        {filteredGuides.map(g => (
                            <li key={g.id} className="border p-4 rounded-lg hover:shadow-lg transition-shadow">
                                <Link
                                    to={`/guides/${g.id}`}
                                    className="text-xl font-semibold hover:underline"
                                >
                                    {g.title}
                                </Link>
                                <p className="text-sm text-gray-500">
                                    {new Date(g.createdAt).toLocaleDateString()}
                                </p>
                                <p className="line-clamp-3 mt-2">{g.content}</p>
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

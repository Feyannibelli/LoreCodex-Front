import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import guideService from "../../services/guideService.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { Guide } from "../../interfaces/Guide.ts";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import SearchInput from "../../components/ui/SearchInput";
import PageHero from "../../components/ui/PageHero";

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
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="mx-auto max-w-6xl space-y-8 px-4">
                <PageHero
                    title="Published Guides"
                    subtitle="Guides"
                    description="Encuentra guías destacadas creadas por la comunidad y comparte tu propia sabiduría."
                    actions={
                        <>
                            {isAuthenticated && (
                                <>
                                    <Link to="/my-drafts">
                                        <SecondaryButton type="button">
                                            📝 My Drafts
                                        </SecondaryButton>
                                    </Link>
                                    <Link to="/guides/create">
                                        <PrimaryButton type="button">
                                            + New Guide
                                        </PrimaryButton>
                                    </Link>
                                </>
                            )}
                        </>
                    }
                >
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-3 md:space-y-0 md:flex md:gap-3">
                        <SearchInput
                            placeholder="Filter guides by title or content"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <PrimaryButton type="button">
                            Search
                        </PrimaryButton>
                    </form>
                </PageHero>

                <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm space-y-6">
                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {loading && guides.length === 0 ? (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-slate-500">
                            Loading guides...
                        </div>
                    ) : filteredGuides.length === 0 ? (
                        <div className="text-center space-y-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-slate-600">
                            <p className="text-lg font-semibold">No guides found.</p>
                            <p className="text-sm">Try another search or check back later.</p>
                            {isAuthenticated && (
                                <PrimaryButton type="button">
                                    Create the first guide!
                                </PrimaryButton>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6">
                                {filteredGuides.map(g => (
                                    <Link
                                        to={`/guides/${g.id}`}
                                        key={g.id}
                                        className="group flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-indigo-200"
                                    >
                                        {g.coverImageUrl && (
                                            <div className="h-64 w-full overflow-hidden rounded-t-2xl bg-slate-100">
                                                <img
                                                    src={g.coverImageUrl}
                                                    alt={g.title}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-col space-y-3 p-6">
                                            <div>
                                                <h2 className="text-2xl font-semibold text-slate-900 group-hover:text-indigo-600 mb-2">
                                                    {g.title}
                                                </h2>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                                    <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                                                    {g.tags && g.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {g.tags.slice(0, 3).map(tag => (
                                                                <span
                                                                    key={tag}
                                                                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 line-clamp-3">
                                                {g.content.substring(0, 180)}...
                                            </p>
                                        </div>
                                    </Link>
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

export default GuidePage;

import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import guideService from "../../services/guideService.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { Guide } from "../../interfaces/Guide.ts";
import { useInfiniteScroll } from "../../hook/useInfiniteScroll.ts";
import InfiniteScrollTrigger from "../../components/InfiniteScrollTrigger.tsx";
import Button from "../../components/Button";
import SearchBar from "../../components/ui/SearchBar";
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
        <div className="min-h-screen bg-bg py-12">
            <div className="mx-auto max-w-6xl px-4">
                <PageHero
                    title="Published Guides"
                    subtitle="Guides"
                    description="Find featured guides created by the community and share your own wisdom."
                    actions={
                        isAuthenticated && (
                            <>
                                <Link to="/my-drafts">
                                    <Button variant="outline" type="button">
                                        📝 My Drafts
                                    </Button>
                                </Link>
                                <Link to="/guides/create">
                                    <Button variant="default" type="button">
                                        + New Guide
                                    </Button>
                                </Link>
                            </>
                        )
                    }
                >
                    <div className="mt-6 rounded-2xl border border bg-surface-2 p-4 shadow-sm">
                        <SearchBar
                            placeholder="Filter guides by title or content"
                            value={searchTerm}
                            onChange={setSearchTerm}
                            className="w-full"
                        />
                    </div>
                </PageHero>

                <div className="mt-8 rounded-3xl border border bg-surface shadow-sm">
                    <div className="px-8 py-10 space-y-6">
                        {error && (
                            <div className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {loading && guides.length === 0 ? (
                            <div className="rounded-2xl border border bg-surface-2 px-4 py-6 text-center text-text-muted">
                                Loading guides...
                            </div>
                        ) : filteredGuides.length === 0 ? (
                            <div className="text-center space-y-4 rounded-2xl border border bg-surface-2 px-4 py-10">
                                <p className="text-lg font-semibold text-text">No guides found.</p>
                                <p className="text-sm text-text-muted">Try another search or check back later.</p>
                                {isAuthenticated && (
                                    <Link to="/guides/create" className="inline-block mt-4">
                                        <Button variant="default" type="button">
                                            Create the first guide!
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-6">
                                    {filteredGuides.map(g => (
                                        <Link
                                            to={`/guides/${g.id}`}
                                            key={g.id}
                                            className="group flex flex-col rounded-2xl border border bg-surface-2 shadow-sm transition hover:bg-[rgba(245,126,0,0.06)]"
                                        >
                                            {g.coverImageUrl && (
                                                <div className="h-64 w-full overflow-hidden rounded-t-2xl bg-surface">
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
                                                    <h2 className="text-2xl font-semibold text-text group-hover:text-brand-500 mb-2 transition-colors">
                                                        {g.title}
                                                    </h2>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                                                        <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                                                        {g.tags && g.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {g.tags.slice(0, 3).map(tag => (
                                                                    <span
                                                                        key={tag}
                                                                        className="rounded-full border border bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-500"
                                                                    >
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-text-muted line-clamp-3">
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
        </div>
    );
};

export default GuidePage;

import { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
    onIntersect: () => void;
    loading: boolean;
    hasMore: boolean;
}

const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({
                                                                         onIntersect,
                                                                         loading,
                                                                         hasMore
                                                                     }) => {
    const observerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!observerRef.current || loading || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore) {
                    onIntersect();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(observerRef.current);

        return () => observer.disconnect();
    }, [onIntersect, loading, hasMore]);

    if (!hasMore) return null;

    return (
        <div ref={observerRef} className="flex justify-center py-8">
            {loading && (
                <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span>Cargando más...</span>
                </div>
            )}
        </div>
    );
};

export default InfiniteScrollTrigger;

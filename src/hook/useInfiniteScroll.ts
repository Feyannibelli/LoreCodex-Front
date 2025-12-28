import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
    fetchFunction: (page: number, pageSize: number) => Promise<any>;
    pageSize?: number;
    initialPage?: number;
}

interface UseInfiniteScrollReturn<T> {
    items: T[];
    loading: boolean;
    hasMore: boolean;
    error: string | null;
    loadMore: () => void;
    refresh: () => void;
}

export function useInfiniteScroll<T>({
    fetchFunction,
    pageSize = 12,
    initialPage = 0
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn<T> {
    const [items, setItems] = useState<T[]>([]);
    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isFetching = useRef(false);

    const loadItems = useCallback(async (pageToLoad: number, append: boolean = true) => {
        if (isFetching.current) return;

        isFetching.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await fetchFunction(pageToLoad, pageSize);

            let newItems: T[] = [];
            let isLastPage = false;

            // Check if response is PagedResponse (duck typing)
            if (response && typeof response === 'object' && 'content' in response && Array.isArray((response as any).content)) {
                const paged = response as any;
                newItems = paged.content;
                isLastPage = paged.last;
            } else if (Array.isArray(response)) {
                // Legacy / Direct array
                newItems = response;
                isLastPage = newItems.length < pageSize;
            } else {
                console.error("useInfiniteScroll: Unexpected response format", response);
                newItems = [];
                isLastPage = true;
            }

            setItems(prev => append ? [...prev, ...newItems] : newItems);
            setHasMore(!isLastPage);

            if (append && !isLastPage) {
                setPage(pageToLoad + 1);
            }
        } catch (err) {
            console.error('Error loading items:', err);
            setError('Error al cargar los elementos. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [fetchFunction, pageSize]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore && !isFetching.current) {
            loadItems(page, true);
        }
    }, [page, loading, hasMore, loadItems]);

    const refresh = useCallback(() => {
        setPage(initialPage);
        setItems([]);
        setHasMore(true);
        loadItems(initialPage, false);
    }, [initialPage, loadItems]);

    useEffect(() => {
        loadItems(initialPage, false);
    }, []);

    return {
        items,
        loading,
        hasMore,
        error,
        loadMore,
        refresh
    };
}
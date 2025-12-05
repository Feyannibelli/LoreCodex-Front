import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions<T> {
    fetchFunction: (page: number, pageSize: number) => Promise<T[]>;
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
                                     }: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
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
            const newItems = await fetchFunction(pageToLoad, pageSize);

            setItems(prev => append ? [...prev, ...newItems] : newItems);
            setHasMore(newItems.length === pageSize);

            if (append && newItems.length === pageSize) {
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
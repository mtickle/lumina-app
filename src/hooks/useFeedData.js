import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

export function useFeedData(batchSize = 10) {
    const [masterIndex, setMasterIndex] = useState([]);
    const [feed, setFeed] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [fetchingBatch, setFetchingBatch] = useState(false);
    const [error, setError] = useState(null);

    const hasReachedEnd = feed.length >= masterIndex.length && masterIndex.length > 0;

    const fetchingRef = useRef(fetchingBatch);
    const endRef = useRef(hasReachedEnd);
    const observer = useRef(null);

    // Sync refs for the observer
    useEffect(() => {
        fetchingRef.current = fetchingBatch;
        endRef.current = hasReachedEnd;
    }, [fetchingBatch, hasReachedEnd]);

    // Intersection Observer Callback
    const observerTarget = useCallback((node) => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !fetchingRef.current && !endRef.current) {
                    setPage((p) => p + 1);
                }
            },
            { threshold: 0.1 }
        );
        if (node) observer.current.observe(node);
    }, []);

    // Initial Fetch & Real-time Subscription
    useEffect(() => {
        const fetchMasterIndex = async () => {
            try {
                const { data, error } = await supabase
                    .from("feed_cards")
                    .select("id, card_type")
                    .eq("active", true);

                if (error) throw error;
                setMasterIndex(shuffleArray(data));
            } catch (err) {
                console.error("Init Error:", err);
                setError("Failed to connect to database.");
            } finally {
                setLoading(false);
            }
        };

        fetchMasterIndex();

        const channel = supabase
            .channel("public:feed_cards")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "feed_cards" },
                (payload) => {
                    setFeed((current) => [payload.new, ...current]);
                    setMasterIndex((current) => [
                        { id: payload.new.id, card_type: payload.new.card_type },
                        ...current,
                    ]);
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    // Batch Loader
    useEffect(() => {
        const loadBatch = async () => {
            if (masterIndex.length === 0) return;

            const startIndex = page * batchSize;
            const currentBatch = masterIndex.slice(startIndex, startIndex + batchSize);

            if (currentBatch.length === 0) return;

            setFetchingBatch(true);
            const batchIds = currentBatch.map((c) => c.id);

            const { data, error } = await supabase
                .from("feed_cards")
                .select("*")
                .in("id", batchIds);

            if (data) {
                const orderedData = batchIds
                    .map((id) => data.find((d) => d.id === id))
                    .filter(Boolean);
                setFeed((prev) => (page === 0 ? orderedData : [...prev, ...orderedData]));
            }
            setFetchingBatch(false);
        };

        loadBatch();
    }, [page, masterIndex, batchSize]);

    return {
        feed,
        loading,
        fetchingBatch,
        error,
        hasReachedEnd,
        observerTarget,
    };
}
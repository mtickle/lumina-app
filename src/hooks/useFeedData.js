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

    useEffect(() => {
        fetchingRef.current = fetchingBatch;
        endRef.current = hasReachedEnd;
    }, [fetchingBatch, hasReachedEnd]);

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
                // Pointing at the base table instead of the view avoids the 400 error,
                // since feed_cards natively has the is_approved column.
                const { data, error } = await supabase
                    .from("feed_cards") // <-- Changed this from "unified_feed"
                    .select("id, card_type")
                    .eq("active", true)
                    .eq("is_approved", true);

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

        // Listen for approvals from the admin dashboard (UPDATE events)
        const channel = supabase
            .channel("public:feed_cards")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "feed_cards",
                    filter: "is_approved=eq.true"
                },
                (dbEvent) => {
                    const raw = dbEvent.new;

                    // Ignore if the card is soft-deleted
                    if (!raw.active) return;

                    // Use a functional update to safely check if we already have this card
                    setMasterIndex((currentIndex) => {
                        // If it's already in the feed (e.g., you edited a previously approved card), do nothing
                        if (currentIndex.some(item => item.id === raw.id)) return currentIndex;

                        // New approval! Format and inject at the top of the UI
                        const formattedInsert = {
                            id: raw.id,
                            card_type: raw.card_type,
                            active: raw.active,
                            payload: {
                                title: raw.card_type === 'PERSON' ? raw.metadata_anchor.split(':')[0] : (raw.payload?.locationName || raw.metadata_anchor),
                                locationName: raw.payload?.locationName || raw.metadata_anchor,
                                description: raw.card_type === 'PERSON' ? raw.payload?.hookText : raw.payload?.description,
                                imageUrl: raw.card_type === 'PERSON' ? raw.payload?.imageUrl : raw.payload?.bgUrl,
                                mapImageUrl: raw.payload?.mapImageUrl || raw.payload?.imageUrl,
                                imageKeyword: raw.payload?.imageKeyword,
                                hasDeepDive: !!raw.payload?.hasDeepDive
                            }
                        };

                        setFeed((currentFeed) => [formattedInsert, ...currentFeed]);
                        return [{ id: raw.id, card_type: raw.card_type }, ...currentIndex];
                    });
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    // Batch Loader (Unchanged)
    useEffect(() => {
        const loadBatch = async () => {
            if (masterIndex.length === 0) return;

            const startIndex = page * batchSize;
            const currentBatch = masterIndex.slice(startIndex, startIndex + batchSize);

            if (currentBatch.length === 0) return;

            setFetchingBatch(true);
            const batchIds = currentBatch.map((c) => c.id);

            const { data, error } = await supabase
                .from("unified_feed")
                .select("*")
                .in("id", batchIds);

            if (data) {
                const formattedData = data.map(row => ({
                    id: row.id,
                    card_type: row.card_type,
                    active: row.active,
                    payload: {
                        title: row.title,
                        description: row.description,
                        imageUrl: row.image_url,
                        imageKeyword: row.image_keyword,
                        hasDeepDive: row.has_deep_dive,
                        locationName: row.title,
                        name: row.title,
                        hookText: row.description,
                        mapImageUrl: row.image_url,
                        bgUrl: row.image_url
                    }
                }));

                const orderedData = batchIds
                    .map((id) => formattedData.find((d) => d.id === id))
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
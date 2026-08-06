import { createClient } from "@supabase/supabase-js";
import { BarChart2, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import StatsModal from "./components/StatsModal";

import DeepDiveDrawer from "./components/DeepDiveDrawer";
import FeedCard from "./components/FeedCard";

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const BATCH_SIZE = 10;

export default function App() {
  // --- STATE ---
  const [masterIndex, setMasterIndex] = useState([]);
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [fetchingBatch, setFetchingBatch] = useState(false);
  const [error, setError] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerCard, setActiveDrawerCard] = useState(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // --- REFS & DERIVED STATE ---
  const fetchingRef = useRef(fetchingBatch);
  const endRef = useRef(false);
  const observer = useRef(null);

  const hasReachedEnd =
    feed.length >= masterIndex.length && masterIndex.length > 0;

  // Keep refs synced for the observer callback
  useEffect(() => {
    fetchingRef.current = fetchingBatch;
    endRef.current = hasReachedEnd;
  }, [fetchingBatch, hasReachedEnd]);

  // --- INFINITE SCROLL CALLBACK REF ---
  const observerTarget = useCallback((node) => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !fetchingRef.current &&
          !endRef.current
        ) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (node) observer.current.observe(node);
  }, []);

  // --- EFFECTS ---
  // 1. Fetch only IDs on initial mount
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

    // Real-time subscription to Pi inserts
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

  // 2. Fetch the full payload for the current batch
  useEffect(() => {
    const loadBatch = async () => {
      if (masterIndex.length === 0) return;

      const startIndex = page * BATCH_SIZE;
      const currentBatch = masterIndex.slice(
        startIndex,
        startIndex + BATCH_SIZE
      );

      if (currentBatch.length === 0) return;

      setFetchingBatch(true);
      const batchIds = currentBatch.map((c) => c.id);

      const { data, error } = await supabase
        .from("feed_cards")
        .select("*")
        .in("id", batchIds);

      if (data) {
        // Remap to preserve shuffled order
        const orderedData = batchIds
          .map((id) => data.find((d) => d.id === id))
          .filter(Boolean);
        setFeed((prev) =>
          page === 0 ? orderedData : [...prev, ...orderedData]
        );
      }
      setFetchingBatch(false);
    };

    loadBatch();
  }, [page, masterIndex]);

  // --- RENDER ---
  return (
    <div className="bg-black w-full h-screen fixed inset-0 font-sans sm:flex sm:justify-center overflow-hidden">
      <div className="w-full h-full max-w-md bg-zinc-950 relative sm:border-x sm:border-zinc-800 shadow-2xl flex flex-col">
        {/* Top Nav */}
        <div className="absolute top-0 inset-x-0 z-30 p-6 pointer-events-none flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <h1
            onClick={() => window.location.reload(true)}
            className="text-white font-serif font-bold text-xl drop-shadow-lg tracking-wide"
          >
            Lumina
          </h1>

          <div className="flex items-center gap-4 pointer-events-auto">
            {/* Stats Button */}
            <button
              onClick={() => setIsStatsOpen(true)}
              className="p-2 bg-black/20 rounded-full hover:bg-black/40 backdrop-blur-md transition-colors border border-white/10 text-white/80"
            >
              <BarChart2 size={18} />
            </button>

            {/* Loading Indicator */}
            {loading || fetchingBatch ? (
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
            )}
          </div>
        </div>

        {/* Scroll Container */}
        <div
          className="flex-1 w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth hide-scrollbar flex flex-col"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {error ? (
            <div className="h-full w-full flex-none flex items-center justify-center p-8 text-center text-zinc-400">
              {error}
            </div>
          ) : feed.length === 0 && !loading && !fetchingBatch ? (
            <div className="h-full w-full flex-none flex items-center justify-center text-zinc-500">
              No cards available.
            </div>
          ) : (
            feed.map((item) => (
              <FeedCard
                key={item.id}
                data={item}
                onOpenDrawer={(card) => {
                  setActiveDrawerCard(card);
                  setIsDrawerOpen(true);
                }}
              />
            ))
          )}

          {/* The Tripwire */}
          {!loading && !hasReachedEnd && (
            <div
              ref={observerTarget}
              className="w-full h-32 flex-none flex items-center justify-center"
            >
              {fetchingBatch && (
                <div className="w-8 h-8 border-4 border-zinc-800 border-t-zinc-500 rounded-full animate-spin" />
              )}
            </div>
          )}

          {/* End of Feed Marker */}
          {hasReachedEnd && feed.length > 0 && (
            <div className="h-full w-full flex-none snap-start snap-always flex flex-col items-center justify-center text-zinc-500 text-sm pb-8 bg-zinc-950">
              <CheckCircle2 size={48} className="mb-4 text-zinc-800" />
              <p>You've reached the end for now.</p>
            </div>
          )}
        </div>

        <DeepDiveDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeCard={activeDrawerCard}
        />

        <StatsModal
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `.hide-scrollbar::-webkit-scrollbar { display: none; }`,
          }}
        />
      </div>
    </div>
  );
}

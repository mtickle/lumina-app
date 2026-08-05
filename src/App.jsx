import React, { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { CheckCircle2 } from "lucide-react";

import FeedCard from "./components/FeedCard";
import DeepDiveDrawer from "./components/DeepDiveDrawer";


const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
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
  // Master index of lightweight data: [{ id, card_type }]
  const [masterIndex, setMasterIndex] = useState([]);

  // The actual full data currently rendered on screen
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [fetchingBatch, setFetchingBatch] = useState(false);
  const [error, setError] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerCard, setActiveDrawerCard] = useState(null);

  const fetchingRef = useRef(fetchingBatch);
  const endRef = useRef(false);

  // Sentinel ref for the IntersectionObserver (Infinite Scroll)
  const observerTarget = useRef(null);

  // --- 1. Calculate the total count for the current filter ---
  const currentFilteredCount = activeFilter === "ALL"
    ? masterIndex.length
    : masterIndex.filter(c => c.card_type === activeFilter).length;

  // --- 2. Check if the feed length has met or exceeded that count ---
  const hasReachedEnd = feed.length >= currentFilteredCount && currentFilteredCount > 0;

  // --- 3. Now it is safe to sync the refs because everything above exists ---
  useEffect(() => {
    fetchingRef.current = fetchingBatch;
    endRef.current = hasReachedEnd;
  }, [fetchingBatch, hasReachedEnd]);


  // 1. Fetch only IDs and Types on initial mount
  useEffect(() => {
    const fetchMasterIndex = async () => {
      try {
        const { data, error } = await supabase
          .from('feed_cards')
          .select('id, card_type')
          .eq('active', true);

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

    // Subscribe to new cards from the Pi and push them to the top of the feed
    const channel = supabase
      .channel('public:feed_cards')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_cards' }, (payload) => {
        setFeed(current => [payload.new, ...current]);
        // Also update the master index so filters know about it
        setMasterIndex(current => [{ id: payload.new.id, card_type: payload.new.card_type }, ...current]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 2. Reset feed and page when filter changes
  useEffect(() => {
    setPage(0);
    setFeed([]);
  }, [activeFilter]);

  // 3. Fetch the full payload for the current batch of IDs
  useEffect(() => {
    const loadBatch = async () => {
      if (masterIndex.length === 0) return;

      // Filter the lightweight index locally
      const filteredIndex = activeFilter === "ALL"
        ? masterIndex
        : masterIndex.filter(c => c.card_type === activeFilter);

      // Slice the next 10 IDs based on our current page
      const startIndex = page * BATCH_SIZE;
      const currentBatch = filteredIndex.slice(startIndex, startIndex + BATCH_SIZE);

      if (currentBatch.length === 0) return; // Reached the end of this category

      setFetchingBatch(true);
      const batchIds = currentBatch.map(c => c.id);

      // Fetch ONLY the full rows we need right now
      const { data, error } = await supabase
        .from('feed_cards')
        .select('*')
        .in('id', batchIds);

      if (data) {
        // Supabase .in() doesn't preserve our shuffled order, so we remap it manually
        const orderedData = batchIds.map(id => data.find(d => d.id === id)).filter(Boolean);

        setFeed(prev => page === 0 ? orderedData : [...prev, ...orderedData]);
      }
      setFetchingBatch(false);
    };

    loadBatch();
  }, [page, activeFilter, masterIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchingRef.current && !endRef.current) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 } // Triggers as soon as 10% of the tripwire is visible
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, []); // <-- Empty dependency array stops the infinite loop!

  // THIS IS THE END OF ALL THE WORKING CODE. DO NOT DELETE OR CHANGE ANYTHING BELOW THIS LINE.




  return (
    <div className="bg-black w-full h-screen fixed inset-0 font-sans sm:flex sm:justify-center overflow-hidden">
      <div className="w-full h-full max-w-md bg-zinc-950 relative sm:border-x sm:border-zinc-800 shadow-2xl flex flex-col">

        {/* Top Nav */}
        <div className="absolute top-0 inset-x-0 z-30 p-6 pointer-events-none flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <h1 className="text-white font-serif font-bold text-xl drop-shadow-lg tracking-wide">
            Lumina
          </h1>
          {(loading || fetchingBatch) ? (
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
          )}
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
              No {activeFilter} cards available.
            </div>
          ) : (
            feed.map((item) => (
              <FeedCard
                key={item.id}
                data={item}
                onOpenDrawer={(card) => { setActiveDrawerCard(card); setIsDrawerOpen(true); }}
              />
            ))
          )}

          {/* --- FIX 2: The Tripwire --- */}
          {/* This small h-32 box triggers the next batch without trapping the scroll */}
          {!loading && !hasReachedEnd && (
            <div ref={observerTarget} className="w-full h-32 flex-none flex items-center justify-center">
              {fetchingBatch && (
                <div className="w-8 h-8 border-4 border-zinc-800 border-t-zinc-500 rounded-full animate-spin" />
              )}
            </div>
          )}

          {/* End of Feed Marker (Only shows when truly at the end) */}
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

        <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; }` }} />
      </div>
    </div>
  );
}
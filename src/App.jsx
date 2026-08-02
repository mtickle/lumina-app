import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { CheckCircle2 } from "lucide-react";

// Import our modularized components
import FeedCard from "./components/FeedCard";
import DeepDiveDrawer from "./components/DeepDiveDrawer";
import FeedFilter from "./components/FeedFilter";

// Safely load environment variables
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- HELPER: Fisher-Yates Shuffle ---
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerCard, setActiveDrawerCard] = useState(null);

  const handleOpenDrawer = (card) => {
    setActiveDrawerCard(card);
    setIsDrawerOpen(true);
  };

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const { data, error } = await supabase
          .from('feed_cards')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          setError("No content generated yet! Start your engine.");
        } else {
          // Shuffle the initial load so users don't see 4 people in a row!
          setFeed(shuffleArray(data));
        }
      } catch (err) {
        console.error("Error fetching from Supabase:", err);
        setError(err.message || "Failed to connect to Supabase.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();

    // Subscribe to real-time inserts from your Raspberry Pi engine
    const channel = supabase
      .channel('public:feed_cards')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_cards' }, (payload) => {
        // Insert new items at the top without shuffling, so users see fresh content
        setFeed(current => [payload.new, ...current]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-black w-full h-screen fixed inset-0 font-sans sm:flex sm:justify-center overflow-hidden">

      {/* 
        Main Wrapper
        Uses flex-col to perfectly bound the scroll container height.
      */}
      <div className="w-full h-full max-w-md bg-zinc-950 relative sm:border-x sm:border-zinc-800 shadow-2xl flex flex-col">

        {/* Top Navigation */}
        <div className="absolute top-0 inset-x-0 z-30 p-6 pointer-events-none flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <h1 className="text-white font-serif font-bold text-xl drop-shadow-lg tracking-wide">
            Lumina
          </h1>
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
          )}

        </div>


        {/* 
          Scroll Container 
          flex-1 allows it to take up the remaining height perfectly
        */}

        <div
          className="flex-1 w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth hide-scrollbar flex flex-col"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {error ? (
            <div className="h-full w-full flex-none flex items-center justify-center p-8 text-center text-zinc-400">
              {error}
            </div>
          ) : (
            feed.map((item) => (
              <FeedCard
                key={item.id}
                data={item}
                onOpenDrawer={handleOpenDrawer}
              />
            ))
          )}

          {/* End of Feed Marker */}
          {!loading && feed.length > 0 && (
            <div className="h-full w-full flex-none snap-start snap-always flex flex-col items-center justify-center text-zinc-500 text-sm pb-8 bg-zinc-950">
              <CheckCircle2 size={48} className="mb-4 text-zinc-800" />
              <p>You've reached the end for now.</p>
            </div>
          )}
        </div>

        {/* Drawer Overlay */}
        <DeepDiveDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeCard={activeDrawerCard}
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `,
          }}
        />
      </div>
    </div>
  );
}
import { useState } from "react";
import { BarChart2 } from "lucide-react";
import { useFeedData } from "./hooks/useFeedData";

import FeedList from "./components/FeedList";
import DeepDiveDrawer from "./components/DeepDiveDrawer";
import StatsModal from "./components/StatsModal";

export default function App() {
  const { feed, loading, fetchingBatch, error, hasReachedEnd, observerTarget } = useFeedData(10);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerCard, setActiveDrawerCard] = useState(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const handleOpenDrawer = (card) => {
    setActiveDrawerCard(card);
    setIsDrawerOpen(true);
  };

  return (
    <div className="bg-black w-full h-[100dvh] fixed inset-0 font-sans sm:flex sm:justify-center overflow-hidden">
      <div className="w-full h-full max-w-md md:max-w-2xl lg:max-w-4xl bg-zinc-950 relative sm:border-x sm:border-zinc-800 shadow-2xl flex flex-col">

        {/* Top Navigation Overlay */}
        <div className="absolute top-0 inset-x-0 z-30 p-6 pointer-events-none flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <h1
            onClick={() => window.location.reload(true)}
            className="text-white font-serif font-bold text-xl drop-shadow-lg tracking-wide pointer-events-auto cursor-pointer active:opacity-50"
          >
            Lumina
          </h1>

          <div className="flex items-center gap-4 pointer-events-auto">
            <button
              onClick={() => setIsStatsOpen(true)}
              className="p-2 bg-black/20 rounded-full hover:bg-black/40 backdrop-blur-md transition-colors border border-white/10 text-white/80"
            >
              <BarChart2 size={18} />
            </button>

            {loading || fetchingBatch ? (
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
            )}
          </div>
        </div>

        {/* Main Feed Content */}
        <FeedList
          feed={feed}
          error={error}
          loading={loading}
          fetchingBatch={fetchingBatch}
          hasReachedEnd={hasReachedEnd}
          observerTarget={observerTarget}
          onOpenDrawer={handleOpenDrawer}
        />

        {/* Modals & Overlays */}
        <DeepDiveDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeCard={activeDrawerCard}
        />

        <StatsModal
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
        />

      </div>
    </div>
  );
}
import { createClient } from "@supabase/supabase-js";
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Heart,
  Info,
  MapPin,
  Quote,
  Share2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// Safely load environment variables
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- HELPER: Unsplash Image Generator ---
// source.unsplash.com is deprecated. We use this fallback to generate valid image URLs based on keywords.
const getImageUrl = (keyword) => {
  if (!keyword)
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800&h=1200";
  // A small hash to ensure we get a random but consistent image per keyword
  const hash = Array.from(keyword).reduce(
    (s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0,
    0
  );
  return `https://images.unsplash.com/photo-1544822688-c5f41d2c1f71?auto=format&fit=crop&q=80&w=800&h=1200&sig=${hash}`;
};

// --- HELPER: Fisher-Yates Shuffle ---
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// 1. Archetype Components

const VerseContent = ({ payload }) => (
  <div
    className={`w-full h-full flex items-center justify-center p-8 ${
      payload.theme || "bg-gradient-to-br from-slate-900 to-slate-800"
    }`}
  >
    <h1
      className={`text-white text-5xl md:text-6xl text-center leading-tight drop-shadow-xl ${
        payload.fontStyle || "font-serif"
      }`}
    >
      "{payload.text}"
    </h1>
  </div>
);

const PersonContent = ({ payload, onOpenDeepDive }) => (
  <div className="w-full h-full relative bg-zinc-900">
    <img
      src={payload.imageUrl || getImageUrl(payload.imageKeyword || "desert")}
      alt="Person"
      className="absolute inset-0 w-full h-full object-cover opacity-80"
    />
    <div className="absolute inset-0 bg-black/40" />
    <div className="absolute bottom-32 left-6 right-20 z-0">
      <h2 className="text-white text-3xl font-bold leading-snug drop-shadow-lg">
        {payload.hookText}
      </h2>
      {payload.hasDeepDive && (
        <button
          onClick={onOpenDeepDive}
          className="mt-4 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors"
        >
          <BookOpen size={16} /> Read Biography
        </button>
      )}
    </div>
  </div>
);

const PlaceContent = ({ payload, onOpenDeepDive }) => (
  <div className="w-full h-full relative bg-amber-900/40">
    <img
      src={payload.mapImageUrl || getImageUrl(payload.imageKeyword || "ruins")}
      alt="Map"
      className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
    />
    <div className="absolute bottom-32 left-6 right-20 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-amber-500/20 rounded-full">
          <MapPin className="text-amber-400" size={24} />
        </div>
        <h3 className="text-white text-xl font-bold">{payload.locationName}</h3>
      </div>
      <p className="text-zinc-300 text-sm leading-relaxed mb-4 line-clamp-3">
        {payload.description}
      </p>
      {/* Places historically had full text dumps. We moved that to the deep dive drawer. */}
      <button
        onClick={onOpenDeepDive}
        className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors"
      >
        <BookOpen size={16} /> Explore Location
      </button>
    </div>
  </div>
);

const InspirationalContent = ({ payload, onOpenDeepDive }) => (
  <div className="w-full h-full relative flex items-center justify-center p-8">
    <img
      src={payload.bgUrl || getImageUrl("peace")}
      alt="Inspiring background"
      className="absolute inset-0 w-full h-full object-cover opacity-90"
    />
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
    <div className="relative z-10 flex flex-col items-center text-center">
      <Quote className="text-white/50 mb-6" size={48} />
      <h1 className="text-white text-4xl font-serif italic leading-relaxed drop-shadow-2xl">
        {payload.quote}
      </h1>
      {payload.hasDeepDive && (
        <button
          onClick={onOpenDeepDive}
          className="mt-8 flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors"
        >
          Read Reflection
        </button>
      )}
    </div>
  </div>
);

const DoctrineContent = ({ payload }) => (
  <div className="w-full h-full bg-slate-900 flex flex-col justify-center p-8 pt-20">
    <div className="mb-6 inline-flex items-center gap-2 text-blue-400 uppercase tracking-widest text-xs font-bold">
      <Info size={16} /> Core Concept
    </div>
    <h1 className="text-white text-5xl font-bold mb-6">{payload.concept}</h1>
    <p className="text-slate-300 text-lg leading-relaxed mb-8 border-l-2 border-blue-500 pl-4">
      {payload.definition}
    </p>
    {payload.points && payload.points.length > 0 && (
      <div className="space-y-4">
        {payload.points.map((point, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 bg-white/5 p-4 rounded-xl"
          >
            <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" size={20} />
            <span className="text-slate-200">{point}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const DevotionalContent = ({ payload }) => (
  <div className="w-full h-full bg-stone-900 flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-1 bg-stone-700 mb-8 rounded-full" />
    <h2 className="text-stone-400 uppercase tracking-widest text-sm font-semibold mb-4">
      Pause & Reflect
    </h2>
    <h1 className="text-white text-4xl font-serif mb-8 leading-tight">
      {payload.prompt}
    </h1>
    <p className="text-stone-300 text-lg mb-12 max-w-xs mx-auto">
      {payload.reflection}
    </p>
    <button className="bg-stone-100 text-stone-900 px-8 py-4 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
      {payload.action}
    </button>
  </div>
);

// 2. The Feed Card
const FeedCard = ({ data, onOpenDrawer }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleOpenDeepDive = () => {
    // If we have a deep dive reference ID, or if we are a Place falling back to the description
    if (data.payload.hasDeepDive || data.card_type === "PLACE") {
      onOpenDrawer(data);
    }
  };

  const renderContent = () => {
    switch (data.card_type) {
      case "VERSE":
        return <VerseContent payload={data.payload} />;
      case "PERSON":
        return (
          <PersonContent
            payload={data.payload}
            onOpenDeepDive={handleOpenDeepDive}
          />
        );
      case "PLACE":
        return (
          <PlaceContent
            payload={data.payload}
            onOpenDeepDive={handleOpenDeepDive}
          />
        );
      case "INSPIRATIONAL":
        return (
          <InspirationalContent
            payload={data.payload}
            onOpenDeepDive={handleOpenDeepDive}
          />
        );
      case "DOCTRINE":
        return <DoctrineContent payload={data.payload} />;
      case "DEVOTIONAL":
        return <DevotionalContent payload={data.payload} />;
      default:
        return (
          <div className="text-white p-8 flex items-center justify-center h-full">
            Unknown Content Type: {data.card_type}
          </div>
        );
    }
  };

  return (
    <div className="relative h-[100dvh] w-full snap-center snap-always overflow-hidden bg-black flex-shrink-0">
      <div className="absolute inset-0 z-0">{renderContent()}</div>
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none" />

      {/* Metadata Anchor */}
      <div className="absolute bottom-8 left-6 right-20 z-20 pointer-events-none">
        <h3 className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1 drop-shadow-md">
          {data.card_type}
        </h3>
        <h2 className="text-white text-lg font-medium drop-shadow-md truncate">
          {data.metadata_anchor}
        </h2>
      </div>

      {/* Action Column */}
      <div className="absolute bottom-8 right-4 z-20 flex flex-col gap-6 items-center">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="group flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <div className="p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 group-hover:bg-white/20">
            <Heart
              size={28}
              className={`transition-colors ${
                isLiked ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </div>
        </button>
        <button
          onClick={() => setIsSaved(!isSaved)}
          className="group flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <div className="p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 group-hover:bg-white/20">
            <Bookmark
              size={28}
              className={`transition-colors ${
                isSaved ? "fill-amber-400 text-amber-400" : "text-white"
              }`}
            />
          </div>
        </button>
        <button className="group flex flex-col items-center gap-1 transition-transform active:scale-90">
          <div className="p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 group-hover:bg-white/20">
            <Share2 size={28} className="text-white" />
          </div>
        </button>
      </div>
    </div>
  );
};

// 3. Deep Dive Drawer Component
const DeepDiveDrawer = ({ isOpen, onClose, activeCard }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDeepDive = async () => {
      if (!isOpen || !activeCard) return;

      // For PLACE, we currently just use the description if no formal deep dive exists
      if (activeCard.card_type === "PLACE" && !activeCard.payload.hasDeepDive) {
        setContent(activeCard.payload.description);
        return;
      }

      setLoading(true);
      try {
        // Fetch the relational deep_dive using the card's ID
        const { data, error } = await supabase
          .from("deep_dives")
          .select("content_markdown")
          .eq("card_id", activeCard.id)
          .single();

        if (error) throw error;
        setContent(data.content_markdown || "Content unavailable.");
      } catch (err) {
        console.error("Failed to load deep dive:", err);
        setContent("Failed to load full content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeepDive();
  }, [isOpen, activeCard]);

  return (
    <div
      className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sliding Drawer */}
      <div
        className={`absolute bottom-0 inset-x-0 h-[85dvh] bg-zinc-900 rounded-t-3xl shadow-2xl pointer-events-auto transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) flex flex-col ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag Handle & Header */}
        <div className="flex flex-col items-center p-4 border-b border-white/10 shrink-0">
          <div className="w-12 h-1.5 bg-white/20 rounded-full mb-4" />
          <div className="flex w-full justify-between items-center">
            <h2 className="text-white font-bold text-xl truncate pr-4">
              {activeCard?.metadata_anchor}
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 rounded-full text-white/70 hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p>Loading reflection...</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 leading-relaxed space-y-6">
              {/* Simple Markdown Parser Fallback */}
              {content.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Main App Component
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
          .from("feed_cards")
          .select("*")
          .eq("active", true)
          .order("created_at", { ascending: false });

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

    const channel = supabase
      .channel("public:feed_cards")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feed_cards" },
        (payload) => {
          // Insert new items at the top without shuffling, so users see fresh content
          setFeed((current) => [payload.new, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-black w-full h-screen fixed inset-0 font-sans sm:flex sm:justify-center overflow-hidden">
      <div className="w-full h-full max-w-md bg-zinc-950 relative sm:border-x sm:border-zinc-800 shadow-2xl">
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

        {/* Scroll Container */}
        <div
          className="h-[100dvh] w-full overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth hide-scrollbar relative"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {error ? (
            <div className="h-full flex items-center justify-center p-8 text-center text-zinc-400">
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

          {!loading && feed.length > 0 && (
            <div className="h-32 w-full snap-center flex items-center justify-center text-zinc-500 text-sm pb-8">
              You've reached the end for now.
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

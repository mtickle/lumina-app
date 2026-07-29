import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Heart,
  Info,
  MapPin,
  Quote,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";

// 1. The Polymorphic Data Model
// Each item has a strict base structure and a flexible 'payload'
const MOCK_FEED = [
  {
    id: "verse-1",
    type: "VERSE",
    metadataAnchor: "John 11:35",
    engagement: { favorites: "14.2k", shares: "3.1k" },
    payload: {
      text: "Jesus wept.",
      theme: "bg-gradient-to-br from-slate-900 to-slate-800",
      fontStyle: "font-serif",
    },
  },
  {
    id: "person-1",
    type: "PERSON",
    metadataAnchor: "Moses: The Exodus",
    engagement: { favorites: "8.9k", shares: "1.2k" },
    payload: {
      hookText: "The Prince who became a Shepherd to save a Nation.",
      // Using a placeholder image evocative of Moses/desert
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/4/4a/Rembrandt_Harmensz._van_Rijn_079.jpg",
      deepDive: "Read full biography",
    },
  },
  {
    id: "place-1",
    type: "PLACE",
    metadataAnchor: "Jerusalem (First Century)",
    engagement: { favorites: "5.4k", shares: "890" },
    payload: {
      // Placeholder for a map/ancient city vibe
      mapImageUrl:
        "https://www.seetheholyland.net/wp-content/uploads/Temple-Mount2.jpg",
      locationName: "The Temple Mount",
      description:
        "The religious and social epicenter of the Jewish world during the time of Christ.",
    },
  },
  {
    id: "inspirational-1",
    type: "INSPIRATIONAL",
    metadataAnchor: "Daily Encouragement",
    engagement: { favorites: "22.1k", shares: "5.5k" },
    payload: {
      quote:
        "God's grace is not the absence of the storm, but His presence within it.",
      bgUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800&h=1200",
    },
  },
  {
    id: "doctrine-1",
    type: "DOCTRINE",
    metadataAnchor: "Theology 101: Grace",
    engagement: { favorites: "3.2k", shares: "450" },
    payload: {
      concept: "What is Grace?",
      definition:
        "Unmerited favor and divine assistance given to humans for their regeneration or sanctification.",
      points: [
        "It cannot be earned through works.",
        "It is a free gift born of love.",
        "It empowers transformation.",
      ],
    },
  },
  {
    id: "devotional-1",
    type: "DEVOTIONAL",
    metadataAnchor: "Morning Reflection",
    engagement: { favorites: "11.5k", shares: "2.8k" },
    payload: {
      prompt: "Where are you rushing to today?",
      reflection:
        "Take 60 seconds before your next task. Ask God to align your pace with His peace.",
      action: "Pause & Pray",
    },
  },
];

// 2. Archetype Components
// These are simple and purely presentational. They sit z-index: 0.

const VerseContent = ({ payload }) => (
  <div
    className={`w-full h-full flex items-center justify-center p-8 ${payload.theme}`}
  >
    <h1
      className={`text-white text-5xl md:text-6xl text-center leading-tight drop-shadow-xl ${payload.fontStyle}`}
    >
      "{payload.text}"
    </h1>
  </div>
);

const PersonContent = ({ payload }) => (
  <div className="w-full h-full relative bg-zinc-900">
    <img
      src={payload.imageUrl}
      alt="Person"
      className="absolute inset-0 w-full h-full object-cover opacity-80"
    />
    <div className="absolute inset-0 bg-black/20" />
    <div className="absolute bottom-32 left-6 right-20 z-0">
      <h2 className="text-white text-3xl font-bold leading-snug drop-shadow-lg">
        {payload.hookText}
      </h2>
      <button className="mt-4 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium">
        <BookOpen size={16} /> {payload.deepDive}
      </button>
    </div>
  </div>
);

const PlaceContent = ({ payload }) => (
  <div className="w-full h-full relative bg-amber-900/40">
    <img
      src={payload.mapImageUrl}
      alt="Map"
      className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
    />
    {/* Floating Location Card */}
    <div className="absolute bottom-28 left-6 right-20 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-amber-500/20 rounded-full">
          <MapPin className="text-amber-400" size={24} />
        </div>
        <h3 className="text-white text-xl font-bold">{payload.locationName}</h3>
      </div>
      <p className="text-zinc-300 text-sm leading-relaxed">
        {payload.description}
      </p>
    </div>
  </div>
);

const InspirationalContent = ({ payload }) => (
  <div className="w-full h-full relative flex items-center justify-center p-8">
    <img
      src={payload.bgUrl}
      alt="Inspiring background"
      className="absolute inset-0 w-full h-full object-cover opacity-90"
    />
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
    <div className="relative z-10 flex flex-col items-center text-center">
      <Quote className="text-white/50 mb-6" size={48} />
      <h1 className="text-white text-4xl font-serif italic leading-relaxed drop-shadow-2xl">
        {payload.quote}
      </h1>
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

// 3. The Feed Card (Universal Overlay + Discriminator)
const FeedCard = ({ data }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Render the correct media layer based on the JSON type
  const renderContent = () => {
    switch (data.type) {
      case "VERSE":
        return <VerseContent payload={data.payload} />;
      case "PERSON":
        return <PersonContent payload={data.payload} />;
      case "PLACE":
        return <PlaceContent payload={data.payload} />;
      case "INSPIRATIONAL":
        return <InspirationalContent payload={data.payload} />;
      case "DOCTRINE":
        return <DoctrineContent payload={data.payload} />;
      case "DEVOTIONAL":
        return <DevotionalContent payload={data.payload} />;
      default:
        return <div className="text-white p-8">Unknown Content Type</div>;
    }
  };

  return (
    <div className="relative h-[100dvh] w-full snap-center snap-always overflow-hidden bg-black flex-shrink-0">
      {/* Base Layer: Dynamic Content */}
      <div className="absolute inset-0 z-0">{renderContent()}</div>

      {/* Protection Gradient (Ensures UI is always legible) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none" />

      {/* Universal Overlay: Metadata Anchor (Bottom Left) */}
      <div className="absolute bottom-8 left-6 right-20 z-20 pointer-events-none">
        <h3 className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1 drop-shadow-md">
          {data.type}
        </h3>
        <h2 className="text-white text-lg font-medium drop-shadow-md truncate">
          {data.metadataAnchor}
        </h2>
      </div>

      {/* Universal Overlay: Action Column (Right Edge) */}
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
          <span className="text-white text-xs font-medium drop-shadow-md">
            {data.engagement.favorites}
          </span>
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
          <span className="text-white text-xs font-medium drop-shadow-md">
            {data.engagement.shares}
          </span>
        </button>
      </div>
    </div>
  );
};

// 4. Main App Component (Scroll Logic)
export default function App() {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    // For this prototype, we will artificially duplicate the mock array
    // a few times to create a long enough feed to demonstrate scrolling.
    const longFeed = [...MOCK_FEED, ...MOCK_FEED, ...MOCK_FEED].map(
      (item, index) => ({
        ...item,
        id: `${item.id}-${index}`, // Ensure unique keys for React
      })
    );
    setFeed(longFeed);
  }, []);

  return (
    <div className="bg-black w-full h-screen fixed inset-0 font-sans sm:flex sm:justify-center">
      {/* Mobile Constraint Wrapper - Keeps UI looking like a phone even on desktop browsers */}
      <div className="w-full h-full max-w-md bg-zinc-950 relative sm:border-x sm:border-zinc-800 shadow-2xl">
        {/* Top Navigation / Branding */}
        <div className="absolute top-0 inset-x-0 z-30 p-6 pointer-events-none flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <h1 className="text-white font-serif font-bold text-xl drop-shadow-lg tracking-wide">
            Lumina
          </h1>
          <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
        </div>

        {/* The Snapping Scroll Container */}
        <div
          className="h-[100dvh] w-full overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {feed.map((item) => (
            <FeedCard key={item.id} data={item} />
          ))}

          {/* Loading Indicator at Bottom */}
          <div className="h-32 w-full snap-center flex items-center justify-center text-zinc-500 text-sm">
            Loading more...
          </div>
        </div>

        {/* Global CSS to hide the ugly scrollbar for Webkit */}
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

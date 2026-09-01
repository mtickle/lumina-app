import { BookOpen, MapPin } from "lucide-react";

// --- HELPER: Image Generator Fallback ---
const getImageUrl = (keyword) => {
  if (!keyword) return "https://picsum.photos/seed/lumina/800/1200";
  return `https://picsum.photos/seed/${encodeURIComponent(keyword)}/800/1200`;
};

const resolveImage = (savedUrl, keyword) => {
  if (savedUrl && !savedUrl.includes("source.unsplash.com")) return savedUrl;
  return getImageUrl(keyword);
};

const PlaceContent = ({ payload, onOpenDeepDive }) => {

  console.log("PlaceContent payload:", payload); // Debugging line
  return (
    // 1. Added flex, items-center, justify-center, and padding to protect screen edges
    <div className="w-full h-full relative flex items-center justify-center p-6 md:p-12 bg-amber-900/40">

      {/* Background Image */}
      <img
        src={resolveImage(
          payload?.mapImageUrl,
          payload?.imageKeyword || "ruins"
        )}
        alt="Map"
        // 2. Added z-0 to keep the absolute image strictly behind the flex content
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
      />

      {/* Centered Location Card */}
      {/* 3. Replaced absolute bottom/left/right with relative, z-10, and responsive widths */}
      <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-10 rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center gap-3 mb-3 md:mb-5">
          <div className="p-2 bg-amber-500/20 rounded-full">
            <MapPin className="text-amber-400 w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h3 className="text-white text-xl md:text-3xl font-bold">
            {payload?.locationName || "Unknown Location"}
          </h3>
        </div>

        <p className="text-zinc-300 text-sm md:text-lg leading-relaxed mb-6 line-clamp-4">
          {payload?.description || "Description unavailable."}
        </p>

        {/* Deep Dive Button */}
        <button
          onClick={onOpenDeepDive}
          className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm md:text-base font-medium hover:bg-white/30 transition-colors w-full md:w-auto self-start"
        >
          <BookOpen size={18} /> Explore Location
        </button>
      </div>
    </div>
  );
};

export default PlaceContent;
import { BookOpen, Landmark, Calendar } from "lucide-react";

// --- HELPER: Image Generator Fallback ---
const getImageUrl = (keyword) => {
    if (!keyword) return "https://picsum.photos/seed/lumina/800/1200";
    return `https://picsum.photos/seed/${encodeURIComponent(keyword)}/800/1200`;
};

const resolveImage = (savedUrl, keyword) => {
    if (savedUrl && !savedUrl.includes("source.unsplash.com")) return savedUrl;
    return getImageUrl(keyword);
};

const EventContent = ({ payload, onOpenDeepDive }) => {
    console.log("EventContent payload:", payload);

    return (
        <div className="w-full h-full relative flex items-center justify-center p-6 md:p-12 bg-indigo-900/40">

            {/* Background Image */}
            <img
                src={resolveImage(
                    payload?.imageUrl,
                    payload?.imageKeyword || "ancient history"
                )}
                alt="Event Background"
                className="absolute inset-0 z-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
            />

            {/* Centered Event Card */}
            <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-10 rounded-2xl shadow-2xl flex flex-col">

                {/* Header / Title */}
                <div className="flex items-center gap-3 mb-3 md:mb-5">
                    <div className="p-2 bg-indigo-500/20 rounded-full">
                        <Landmark className="text-indigo-400 w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-white text-xl md:text-3xl font-bold">
                        {payload?.title || "Unknown Event"}
                    </h3>
                </div>

                {/* Date Context Pill */}
                {payload?.dateContext && (
                    <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm md:text-base tracking-wider uppercase mb-5">
                        <Calendar size={16} />
                        <span>{payload.dateContext}</span>
                    </div>
                )}

                <p className="text-zinc-300 text-sm md:text-lg leading-relaxed mb-6 line-clamp-4">
                    {payload?.description || "Description unavailable."}
                </p>

                {/* Deep Dive Button */}
                {payload?.hasDeepDive && (
                    <button
                        onClick={onOpenDeepDive}
                        className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm md:text-base font-medium hover:bg-white/30 transition-colors w-full md:w-auto self-start"
                    >
                        <BookOpen size={18} /> Explore History
                    </button>
                )}
            </div>
        </div>
    );
};

export default EventContent;
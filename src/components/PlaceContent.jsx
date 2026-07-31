import React from 'react';
import { BookOpen, MapPin } from 'lucide-react';

// --- HELPER: Image Generator Fallback ---
// Unsplash Source is dead. Using Picsum Seed as a reliable frontend fallback 
// until we wire the real Unsplash API into the Node.js backend.
const getImageUrl = (keyword) => {
    if (!keyword) return "https://picsum.photos/seed/lumina/800/1200";
    return `https://picsum.photos/seed/${encodeURIComponent(keyword)}/800/1200`;
};

// Helper to bypass broken Unsplash URLs currently saved in the Supabase DB
const resolveImage = (savedUrl, keyword) => {
    if (savedUrl && !savedUrl.includes('source.unsplash.com')) return savedUrl;
    return getImageUrl(keyword);
};

/**
 * Renders a full-screen presentation of a biblical place.
 * 
 * @param {Object} props
 * @param {Object} props.payload - The data payload for the place card.
 * @param {string} props.payload.mapImageUrl - The background image URL.
 * @param {string} [props.payload.imageKeyword] - Keyword fallback for the image generator.
 * @param {string} props.payload.locationName - The specific name of the place.
 * @param {string} props.payload.description - A brief description of the place.
 * @param {Function} props.onOpenDeepDive - Callback to open the deep dive drawer.
 */
const PlaceContent = ({ payload, onOpenDeepDive }) => {
    return (
        <div className="w-full h-full relative bg-amber-900/40">

            {/* Background Image */}
            <img
                src={resolveImage(payload?.mapImageUrl, payload?.imageKeyword || 'ruins')}
                alt="Map"
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
            />

            {/* Floating Location Card */}
            <div className="absolute bottom-32 left-6 right-20 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500/20 rounded-full">
                        <MapPin className="text-amber-400" size={24} />
                    </div>
                    <h3 className="text-white text-xl font-bold">{payload?.locationName || 'Unknown Location'}</h3>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-4 line-clamp-3">
                    {payload?.description || 'Description unavailable.'}
                </p>

                {/* Deep Dive Button */}
                <button
                    onClick={onOpenDeepDive}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors"
                >
                    <BookOpen size={16} /> Explore Location
                </button>
            </div>

        </div>
    );
};

export default PlaceContent;
import React from 'react';
import { BookOpen } from 'lucide-react';

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
 * Renders a full-screen presentation of a biblical person.
 * 
 * @param {Object} props
 * @param {Object} props.payload - The data payload for the person card.
 * @param {string} props.payload.imageUrl - The background image URL.
 * @param {string} [props.payload.imageKeyword] - Keyword fallback for the image generator.
 * @param {string} props.payload.hookText - The main hook/title text.
 * @param {boolean} props.payload.hasDeepDive - Whether there is deeper content to read.
 * @param {Function} props.onOpenDeepDive - Callback to open the deep dive drawer.
 */
const PersonContent = ({ payload, onOpenDeepDive }) => {
    return (
        <div className="w-full h-full relative bg-zinc-900">

            {/* Background Image */}
            <img
                src={resolveImage(payload?.imageUrl, payload?.imageKeyword || 'desert')}
                alt="Person"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
            />

            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Foreground Content */}
            <div className="absolute bottom-32 left-6 right-20 z-0">
                <h2 className="text-white text-3xl font-bold leading-snug drop-shadow-lg">
                    {payload?.hookText || 'Biography unavailable.'}
                </h2>

                {/* Conditional Deep Dive Button */}
                {payload?.hasDeepDive && (
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
};

export default PersonContent;
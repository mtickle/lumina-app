import React from 'react';
import { Quote } from 'lucide-react';

// --- HELPER: Image Generator Fallback ---
const getImageUrl = (keyword) => {
    if (!keyword) return "https://picsum.photos/seed/lumina/800/1200";
    return `https://picsum.photos/seed/${encodeURIComponent(keyword)}/800/1200`;
};

const resolveImage = (savedUrl, keyword) => {
    if (savedUrl && !savedUrl.includes('source.unsplash.com')) return savedUrl;
    return getImageUrl(keyword);
};

/**
 * Renders a full-screen presentation of an inspirational quote.
 * 
 * @param {Object} props
 * @param {Object} props.payload - The data payload for the inspirational card.
 * @param {string} props.payload.bgUrl - The background image URL.
 * @param {string} props.payload.quote - The inspirational quote text.
 * @param {boolean} props.payload.hasDeepDive - Whether there is a reflection to read.
 * @param {Function} props.onOpenDeepDive - Callback to open the deep dive drawer.
 */
const InspirationalContent = ({ payload, onOpenDeepDive }) => {
    return (
        <div className="w-full h-full relative flex items-center justify-center p-8">
            {/* Background Image */}
            <img
                src={resolveImage(payload?.bgUrl, 'peace')}
                alt="Inspiring background"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
            />

            {/* Blur Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
                <Quote className="text-white/50 mb-6" size={48} />
                <h1 className="text-white text-4xl font-serif italic leading-relaxed drop-shadow-2xl">
                    {payload?.quote || 'Quote unavailable.'}
                </h1>

                {/* Conditional Deep Dive Button */}
                {payload?.hasDeepDive && (
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
};

export default InspirationalContent;
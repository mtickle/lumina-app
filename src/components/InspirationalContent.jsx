import React from 'react';
import { BookOpen, Quote } from 'lucide-react';

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
 * @param {string} props.payload.imageUrl - The normalized background image URL.
 * @param {string} props.payload.description - The normalized inspirational quote text.
 * @param {string} props.payload.imageKeyword - The fallback keyword for image generation.
 * @param {string} props.payload.title - The thematic title of the reflection.
 * @param {boolean} props.payload.hasDeepDive - Whether there is a reflection to read.
 * @param {Function} props.onOpenDeepDive - Callback to open the deep dive drawer.
 * @param {string} props.textSizeClass - The class for dynamically setting the text size.
 */
const InspirationalContent = ({ payload, onOpenDeepDive, textSizeClass = "text-xl md:text-2xl" }) => {
    return (
        <div className="w-full h-full relative flex items-center justify-center p-6 md:p-12 bg-zinc-900">

            {/* Background Image */}
            <img
                src={resolveImage(payload?.imageUrl, payload?.imageKeyword || 'peace')}
                alt={payload?.title || "Inspirational"}
                className="absolute inset-0 z-0 w-full h-full object-cover opacity-70"
            />

            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 z-0 bg-black/50" />

            {/* Centered Glassmorphic Card */}
            <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-10 rounded-2xl shadow-2xl flex flex-col">

                {/* Header: Icon + Theme */}
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="p-2 bg-emerald-500/20 rounded-full">
                        <Quote className="text-emerald-400 w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-white text-xl md:text-3xl font-bold uppercase tracking-wide">
                        {payload?.title || 'Devotional'}
                    </h3>
                </div>

                {/* Quote text */}
                <h1 className={`text-zinc-200 ${textSizeClass} font-serif italic leading-relaxed mb-6 md:mb-8`}>
                    "{payload?.description || 'Quote unavailable.'}"
                </h1>

                {/* Conditional Deep Dive Button */}
                {payload?.hasDeepDive && (
                    <button
                        onClick={onOpenDeepDive}
                        className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm md:text-base font-medium hover:bg-white/30 transition-colors w-full md:w-auto self-start"
                    >
                        <BookOpen size={18} /> Read Reflection
                    </button>
                )}
            </div>
        </div>
    );
};

export default InspirationalContent;
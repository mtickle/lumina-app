import React from 'react';

/**
 * Renders a full-screen devotional pause/reflection.
 * 
 * @param {Object} props
 * @param {Object} props.payload - The data payload for the devotional card.
 * @param {string} props.payload.prompt - The main thought-provoking question.
 * @param {string} props.payload.reflection - A brief paragraph of guidance.
 * @param {string} props.payload.action - Call to action button text.
 */
const DevotionalContent = ({ payload }) => {
    return (
        <div className="w-full h-full bg-stone-900 flex flex-col items-center justify-center p-8 text-center">

            {/* Minimalist Top Marker */}
            <div className="w-16 h-1 bg-stone-700 mb-8 rounded-full" />

            {/* Header Label */}
            <h2 className="text-stone-400 uppercase tracking-widest text-sm font-semibold mb-4">
                Pause & Reflect
            </h2>

            {/* Main Content */}
            <h1 className="text-white text-4xl font-serif mb-8 leading-tight">
                {payload?.prompt || 'Reflection unavailable.'}
            </h1>
            <p className="text-stone-300 text-lg mb-12 max-w-xs mx-auto">
                {payload?.reflection || 'Please try again later.'}
            </p>

            {/* Action Button */}
            <button className="bg-stone-100 text-stone-900 px-8 py-4 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
                {payload?.action || 'Continue'}
            </button>

        </div>
    );
};

export default DevotionalContent;
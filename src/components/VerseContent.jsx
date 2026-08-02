import React from 'react';

/**
 * Renders a full-screen, highly visual presentation of a biblical verse.
 * 
 * @param {Object} props
 * @param {Object} props.payload - The data payload for the verse card.
 * @param {string} props.payload.text - The verbatim scripture text.
 * @param {string} [props.payload.imageUrl] - The Pexels background image URL.
 * @param {string} props.textSizeClass - The dynamically calculated Tailwind text size class.
 */
const VerseContent = ({ payload, textSizeClass }) => {
    // Use a fallback to guarantee the UI never breaks if the AI payload is incomplete
    const verseText = payload?.text || 'Verse text unavailable.';

    return (
        <>
            {/* 1. Background Image Layer */}
            <div className="absolute inset-0 bg-zinc-900 z-0">
                {payload?.imageUrl && (
                    <img
                        src={payload.imageUrl}
                        alt="Verse Background"
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* 2. Text Safe Zone Layer */}
            <div className="absolute top-24 bottom-40 inset-x-6 z-10 flex flex-col justify-center pointer-events-none">
                <p className={`font-serif text-white bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl ${textSizeClass}`}>
                    "{verseText}"
                </p>
            </div>
        </>
    );
};

export default VerseContent;
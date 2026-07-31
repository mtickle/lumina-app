import React from 'react';

/**
 * Renders a full-screen, highly visual presentation of a biblical verse.
 * 
 * @param {Object} props
 * @param {Object} props.payload - The data payload for the verse card.
 * @param {string} props.payload.text - The verbatim scripture text.
 * @param {string} [props.payload.theme] - Optional Tailwind gradient classes for the background.
 * @param {string} [props.payload.fontStyle] - Optional Tailwind typography classes.
 */
const VerseContent = ({ payload }) => {
    // Use fallbacks to guarantee the UI never breaks if the AI payload is incomplete
    const themeClasses = payload?.theme || 'bg-gradient-to-br from-slate-900 to-slate-800';
    const fontClasses = payload?.fontStyle || 'font-serif';
    const verseText = payload?.text || 'Verse text unavailable.';

    return (
        <div
            className={`w-full h-full flex items-center justify-center p-8 ${themeClasses}`}
        >
            <h1
                className={`text-white text-5xl md:text-4xl text-center leading-tight drop-shadow-xl ${fontClasses}`}
            >
                "{verseText}"
            </h1>
        </div>
    );
};

export default VerseContent;
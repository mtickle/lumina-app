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
const VerseContent = ({ payload, textSizeClass }) => {
    // Use fallbacks to guarantee the UI never breaks if the AI payload is incomplete
    const themeClasses = payload?.theme || 'bg-gradient-to-br from-slate-900 to-slate-800';
    const verseText = payload?.text || 'Verse text unavailable.';

    return (
        // The "Safe Zone" bounding box
        <div className={`absolute top-24 bottom-40 inset-x-6 z-0 flex flex-col justify-center ${themeClasses}`}>

      // The actual text inside the bounding box
            <p className={` text-white ${textSizeClass} font-bold leading-snug drop-shadow-lg`}>
                "{payload.text}"
            </p>

        </div>
    );
};

export default VerseContent;
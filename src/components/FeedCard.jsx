import { Bookmark, Heart, Share2 } from "lucide-react";
import { useState } from "react";

// Import child archetype components
import DevotionalContent from "./DevotionalContent";
import DoctrineContent from "./DoctrineContent";
import InspirationalContent from "./InspirationalContent";
import PersonContent from "./PersonContent";
import PlaceContent from "./PlaceContent";
import VerseContent from "./VerseContent";

/**
 * Renders the main wrapper for a feed item, handling the overlay UI (likes, saves, metadata)
 * and dynamically rendering the correct child content component based on the card type.
 *
 * @param {Object} props
 * @param {Object} props.data - The complete data object for the feed card from Supabase.
 * @param {Function} props.onOpenDrawer - Callback function to trigger the deep dive drawer.
 */
const FeedCard = ({ data, onOpenDrawer }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleOpenDeepDive = () => {
        // If we have a deep dive reference ID, or if we are a Place falling back to the description
        if (data.payload.hasDeepDive || data.card_type === 'PLACE') {
            onOpenDrawer(data);
        }
    };

    function getDynamicTextSize(text) {
        if (!text) return 'text-2xl';
        const length = text.length;

        if (length < 80) return 'text-4xl leading-tight';       // Very short verse
        if (length < 150) return 'text-3xl leading-snug';       // Standard single verse
        if (length < 220) return 'text-2xl leading-normal';     // Two verses
        if (length < 320) return 'text-xl leading-relaxed';     // Three verses (like your Isaiah 40)
        return 'text-lg leading-relaxed';                       // Very long passages
    }
    // Grab whichever text string exists on this specific card type
    const contentString = data.payload?.text || data.payload?.quote || '';

    // Pass that string into your sizing function
    const dynamicTextClass = contentString ? getDynamicTextSize(contentString) : 'text-2xl';

    const renderContent = () => {
        switch (data.card_type) {
            case 'VERSE':
                return <VerseContent payload={data.payload} textSizeClass={dynamicTextClass} />;
            case 'PERSON':
                return <PersonContent payload={data.payload} onOpenDeepDive={handleOpenDeepDive} />;
            case 'PLACE':
                return <PlaceContent payload={data.payload} onOpenDeepDive={handleOpenDeepDive} />;
            case 'INSPIRATIONAL':
                return <InspirationalContent payload={data.payload} onOpenDeepDive={handleOpenDeepDive} textSizeClass={dynamicTextClass} />;
            case 'DOCTRINE':
                return <DoctrineContent payload={data.payload} />;
            case 'DEVOTIONAL':
                return <DevotionalContent payload={data.payload} />;
            default:
                return (
                    <div className="text-white p-8 flex items-center justify-center h-full">
                        Unknown Content Type: {data.card_type}
                    </div>
                );
        }
    };



    return (
        <div className="relative h-full w-full flex-none snap-start snap-always overflow-hidden bg-black">
            {/* Background Content Layer */}
            <div className="absolute inset-0 z-0">{renderContent()}</div>

            {/* Protection Gradient (Ensures UI is always legible) */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />

            {/* 
        Foreground UI Layer 
        Utilizes Safe Area Insets to prevent UI from hiding behind the notch or home bar on mobile devices.
      */}
            <div
                className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end"
                style={{
                    paddingTop: 'max(1rem, env(safe-area-inset-top))',
                    paddingBottom: 'max(2rem, env(safe-area-inset-bottom))'
                }}
            >
                <div className="flex justify-between items-end px-4 w-full">

                    {/* Metadata Anchor (Bottom Left) */}
                    <div className="flex-1 pr-16 mb-4">
                        <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1 drop-shadow-lg">
                            {data.card_type}
                        </h3>
                        <h2 className="text-white text-lg font-medium drop-shadow-lg truncate">
                            {data.metadata_anchor}
                        </h2>
                    </div>


                    {/* Action Column (Right Edge) */}
                    <div className="flex flex-col gap-6 items-center pointer-events-auto pb-4">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className="group flex flex-col items-center gap-1 transition-transform active:scale-90"
                            aria-label={isLiked ? "Unlike" : "Like"}
                        >
                            <div className="p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 group-hover:bg-white/20">
                                <Heart
                                    size={28}
                                    className={`transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-white"
                                        }`}
                                />
                            </div>
                        </button>

                        <button
                            onClick={() => setIsSaved(!isSaved)}
                            className="group flex flex-col items-center gap-1 transition-transform active:scale-90"
                            aria-label={isSaved ? "Unsave" : "Save"}
                        >
                            <div className="p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 group-hover:bg-white/20">
                                <Bookmark
                                    size={28}
                                    className={`transition-colors ${isSaved ? "fill-amber-400 text-amber-400" : "text-white"
                                        }`}
                                />
                            </div>
                        </button>

                        <button
                            className="group flex flex-col items-center gap-1 transition-transform active:scale-90"
                            aria-label="Share"
                        >
                            <div className="p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 group-hover:bg-white/20">
                                <Share2 size={28} className="text-white" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedCard;

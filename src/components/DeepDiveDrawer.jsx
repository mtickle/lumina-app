import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from "@supabase/supabase-js";

// Safely load environment variables for the drawer to fetch data
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Renders a sliding drawer that displays deeper, long-form markdown content
 * associated with a specific feed card.
 */
const DeepDiveDrawer = ({ isOpen, onClose, activeCard }) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDeepDive = async () => {
            if (!isOpen || !activeCard) return;

            // For PLACE, we currently just use the description if no formal deep dive exists
            if (activeCard.card_type === 'PLACE' && !activeCard.payload?.hasDeepDive) {
                setContent(activeCard.payload.description || "Description unavailable.");
                return;
            }

            setLoading(true);
            try {
                // Fetch the relational deep_dive using the card's ID
                const { data, error } = await supabase
                    .from('deep_dives')
                    .select('content_markdown')
                    .eq('card_id', activeCard.id)
                    .single();

                if (error) throw error;
                setContent(data.content_markdown || "Content unavailable.");
            } catch (err) {
                console.error("Failed to load deep dive:", err);
                setContent("Failed to load full content. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchDeepDive();
    }, [isOpen, activeCard]);

    return (
        <div
            className={`absolute inset-0 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sliding Drawer */}
            <div
                className={`absolute bottom-0 inset-x-0 h-[85dvh] bg-zinc-950 rounded-t-3xl shadow-2xl transition-transform duration-500 ease-out flex flex-col border-t border-zinc-800 ${isOpen ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                {/* Drag Handle & Header */}
                <div className="flex flex-col items-center p-4 md:p-6 border-b border-zinc-800/50 shrink-0">
                    <div className="w-12 h-1.5 bg-zinc-700 rounded-full mb-4" />

                    <div className="flex w-full justify-between items-start gap-4">
                        <h2 className="text-white font-bold text-2xl leading-tight">
                            {activeCard?.metadata_anchor || "Deep Dive"}
                        </h2>

                        <button
                            onClick={onClose}
                            className="flex-shrink-0 p-2 bg-white/10 rounded-full text-white/70 hover:bg-white/20 transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Area - flex-1 and overflow-y-auto create the locked scroll zone */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth hide-scrollbar">

                    {/* Extra padding on bottom prevents text from sitting under the home bar */}
                    <div className="pb-12 h-full">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500 pt-12">
                                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <p>Loading reflection...</p>
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 leading-relaxed space-y-6">
                                {/* Simple Markdown Parser with larger mobile typography */}
                                {content.split('\n\n').map((paragraph, i) => (
                                    <p key={i} className="text-lg md:text-xl">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DeepDiveDrawer;
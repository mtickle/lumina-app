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
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the visibility and translation of the drawer.
 * @param {Function} props.onClose - Callback function to close the drawer.
 * @param {Object} props.activeCard - The data object of the currently selected feed card.
 */
const DeepDiveDrawer = ({ isOpen, onClose, activeCard }) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDeepDive = async () => {
            if (!isOpen || !activeCard) return;

            // For PLACE, we currently just use the description if no formal deep dive exists
            if (activeCard.card_type === 'PLACE' && !activeCard.payload.hasDeepDive) {
                setContent(activeCard.payload.description);
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
                className={`absolute bottom-0 inset-x-0 h-[85dvh] bg-zinc-900 rounded-t-3xl shadow-2xl transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) flex flex-col ${isOpen ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                {/* Drag Handle & Header */}
                <div className="flex flex-col items-center p-4 border-b border-white/10 shrink-0">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mb-4" />

                    {/* UPDATED: flex container uses items-start and gap-4 */}
                    <div className="flex w-full justify-between items-start gap-4">

                        {/* UPDATED: removed truncate, added leading-tight */}
                        <h2 className="text-white font-bold text-xl leading-tight">
                            {activeCard?.metadata_anchor}
                        </h2>

                        {/* UPDATED: added flex-shrink-0 */}
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 p-2 bg-white/10 rounded-full text-white/70 hover:bg-white/20 transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <p>Loading reflection...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 leading-relaxed space-y-6">
                            {/* Simple Markdown Parser Fallback */}
                            {content.split('\n\n').map((paragraph, i) => (
                                <p key={i} className="text-base">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeepDiveDrawer;
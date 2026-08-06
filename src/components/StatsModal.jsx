import React, { useEffect, useState } from 'react';
import { X, BarChart2 } from 'lucide-react';
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function StatsModal({ isOpen, onClose }) {
    const [stats, setStats] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Only fetch data when the modal is actually opened
        if (!isOpen) return;

        const fetchStats = async () => {
            setLoading(true);
            try {
                // Query the new SQL View we created
                const { data, error } = await supabase
                    .from('feed_stats')
                    .select('*')
                    .order('card_count', { ascending: false });

                if (error) throw error;

                setStats(data);

                // Add up the counts for the total display
                const totalCount = data.reduce((sum, row) => sum + Number(row.card_count), 0);
                setTotal(totalCount);
            } catch (err) {
                console.error("Error fetching database stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
            {/* Background Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            {/* The Stats Card */}
            <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl pointer-events-auto flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3 text-white">
                        <BarChart2 size={24} className="text-zinc-400" />
                        <h2 className="text-xl font-bold font-serif">Database Stats</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 rounded-full text-white/70 hover:bg-white/20 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Loading State or Data */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                        <p>Querying database...</p>
                    </div>
                ) : (
                    <>
                        {/* Total Count */}
                        <div className="bg-zinc-900 rounded-2xl p-6 flex items-center justify-between mb-6 border border-zinc-800/80">
                            <span className="text-zinc-400 font-medium">Total Cards</span>
                            <span className="text-2xl font-bold text-white">{total}</span>
                        </div>

                        {/* Breakdown List */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 px-1">
                                By Category
                            </h3>

                            <div className="max-h-60 overflow-y-auto hide-scrollbar space-y-2">
                                {stats.map((row) => (
                                    <div key={row.card_type} className="flex justify-between items-center bg-zinc-900/50 p-2 rounded-xl border border-zinc-800/50">
                                        <span className="text-white/80 font-medium tracking-wide">
                                            {row.card_type || "UNKNOWN"}
                                        </span>
                                        <span className="text-white font-bold">{row.card_count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
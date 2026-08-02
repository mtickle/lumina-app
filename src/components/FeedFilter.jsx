import React from 'react';

export default function FeedFilter({ activeFilter, onFilterChange }) {
    const filters = ['ALL', 'VERSE', 'INSPIRATIONAL', 'PERSON', 'PLACE'];

    return (
        <div className="absolute top-12 inset-x-0 z-40 px-4 pointer-events-auto">
            {/* The scrollable container */}
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => onFilterChange(filter)}
                        className={`snap-start whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${activeFilter === filter
                            ? 'bg-white text-zinc-900 border-white shadow-lg'
                            : 'bg-black/40 text-white/70 border-white/20 backdrop-blur-md hover:bg-black/60'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
}
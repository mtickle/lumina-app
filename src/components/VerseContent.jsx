import React from 'react';
import { BookOpen, Quote } from 'lucide-react';

const getImageUrl = (keyword) => {
    if (!keyword) return "https://picsum.photos/seed/lumina/800/1200";
    return `https://picsum.photos/seed/${encodeURIComponent(keyword)}/800/1200`;
};

const resolveImage = (savedUrl, keyword) => {
    if (savedUrl && !savedUrl.includes('source.unsplash.com')) return savedUrl;
    return getImageUrl(keyword);
};

const VerseContent = ({ payload, onOpenDeepDive }) => {

    console.log(payload);

    return (
        <div className="w-full h-full relative flex items-center justify-center p-6 md:p-12 bg-zinc-900">
            <img
                src={resolveImage(payload?.imageUrl, payload?.imageKeyword || 'nature')}
                alt={payload?.title || "Verse"}
                className="absolute inset-0 z-0 w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 z-0 bg-black/50" />

            <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-10 rounded-2xl shadow-2xl flex flex-col">
                <div className="flex items-center gap-3 mb-3 md:mb-5">
                    <div className="p-2 bg-violet-500/20 rounded-full">
                        <Quote className="text-violet-400 w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-white text-xl md:text-3xl font-bold">
                        {payload?.title || 'Scripture Reference'}
                    </h3>
                </div>

                <p className="text-zinc-300 text-lg md:text-xl italic leading-relaxed mb-6">
                    "{payload?.description || 'Verse text unavailable.'}"
                </p>

                {payload?.hasDeepDive && (
                    <button
                        onClick={onOpenDeepDive}
                        className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm md:text-base font-medium hover:bg-white/30 transition-colors w-full md:w-auto self-start"
                    >
                        <BookOpen size={18} /> Read Context
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerseContent;
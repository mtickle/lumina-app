import React from 'react';
import { Info, CheckCircle2 } from 'lucide-react';

/**
 * Renders a full-screen presentation of a core doctrinal concept.
 * 
 * @param {Object} props
 * @param {Object} props.payload - The data payload for the doctrine card.
 * @param {string} props.payload.concept - The name of the theological concept.
 * @param {string} props.payload.definition - A brief definition of the concept.
 * @param {string[]} [props.payload.points] - An optional array of key points.
 */
const DoctrineContent = ({ payload }) => {
    return (
        <div className="w-full h-full bg-slate-900 flex flex-col justify-center p-8 pt-20">

            {/* Header Label */}
            <div className="mb-6 inline-flex items-center gap-2 text-blue-400 uppercase tracking-widest text-xs font-bold">
                <Info size={16} /> Core Concept
            </div>

            {/* Main Content */}
            <h1 className="text-white text-5xl font-bold mb-6">{payload?.concept || 'Concept unavailable'}</h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 border-l-2 border-blue-500 pl-4">
                {payload?.definition || 'Definition unavailable.'}
            </p>

            {/* Key Points List */}
            {payload?.points && payload.points.length > 0 && (
                <div className="space-y-4">
                    {payload.points.map((point, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-3 bg-white/5 p-4 rounded-xl"
                        >
                            <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" size={20} />
                            <span className="text-slate-200">{point}</span>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default DoctrineContent;
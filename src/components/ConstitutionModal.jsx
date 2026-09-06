import ReactMarkdown from 'react-markdown';
import { X } from 'lucide-react';

const constitutionText = `
## The Lumina Doctrinal and Algorithmic Constitution

This public document defines the rigid theological parameters and technical boundaries governing the artificial intelligence engine powering Lumina.

## I. Core Theological Baseline

* **The Sovereign Word:** Lumina treats the Bible as the closed, complete, and sovereign Word of God. The engine is strictly prohibited from generating extra-biblical revelations or treating apocryphal texts as canon.
* **Christological Centricity:** The engine operates under the explicit baseline that Jesus Christ is the one true Messiah, sent by the Father to absorb the weight and burden of sin.
* **Orthodox Interpretation:** All devotional and historical outputs must align with orthodox, conservative Baptist theology, focusing on historical accuracy and scriptural integrity.

## II. Algorithmic Guardrails and Exclusions

* **Fringe Theology Blocklist:** The generation engine is hard-coded to reject and exclude concepts tied to the New Apostolic Reformation, hyper-charismatic movements, and modern fringe interpretations.
* **Historical Factualism:** Biographical and geographical cards must rely exclusively on verified biblical history and standard orthodox scholarship, forbidding speculative or secularized revisions.
* **AI Subordination:** Lumina acknowledges that AI is a mathematical tool, not a spiritual authority. The engine does not possess faith; it is merely an indexing mechanism designed to surface the living wisdom of scripture.

## III. The Editorial Dashboard

* **Staged Generation:** The automated Node worker does not publish directly to the live production feed. All generated content is held in a staging queue.
* **Human Blessing:** A human editor must manually authenticate, review, and approve every card before it becomes visible to users.
* **Immutable Overrides:** Administrators retain absolute control to update, rewrite, or permanently delete any generated content, ensuring the final output is always guided by human faith and intent.
`;

export default function ConstitutionModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header with Close Icon */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-white font-bold tracking-wider text-sm uppercase">About Lumina</h2>
                <button
                    onClick={onClose}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 pb-24 text-white">
                <article className="prose prose-invert prose-sky max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-a:text-sky-400 prose-li:text-zinc-300 prose-p:text-zinc-300 leading-relaxed">
                    <ReactMarkdown>
                        {constitutionText}
                    </ReactMarkdown>
                </article>

                {/* Bottom Close Button */}
                <div className="mt-10 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white font-bold tracking-wide transition-colors w-full md:w-auto"
                    >
                        Close Document
                    </button>
                </div>
            </div>
        </div>
    );
}
import { createClient } from "@supabase/supabase-js";
import { X, Heart, Bookmark, Share2, Type } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DeepDiveDrawer = ({ isOpen, onClose, activeCard }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // New state for user-controlled font size
  const [isLargeText, setIsLargeText] = useState(false);

  useEffect(() => {
    const fetchDeepDive = async () => {
      if (!isOpen || !activeCard) return;

      if (activeCard.card_type === "PLACE" && !activeCard.payload?.hasDeepDive) {
        setContent(activeCard.payload.description || "Description unavailable.");
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("deep_dives")
          .select("content_markdown")
          .eq("card_id", activeCard.id)
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

  // Dynamic typography classes based on user toggle
  const textClass = isLargeText ? "text-xl md:text-2xl" : "text-lg";
  const h1Class = isLargeText ? "text-3xl md:text-4xl" : "text-2xl";
  const h2Class = isLargeText ? "text-2xl md:text-3xl" : "text-xl";
  const h3Class = isLargeText ? "text-xl md:text-2xl" : "text-lg";

  return (
    <div
      className={`absolute inset-0 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`absolute bottom-0 inset-x-0 h-[85dvh] bg-zinc-950 rounded-t-3xl shadow-2xl transition-transform duration-500 ease-out flex flex-col border-t border-zinc-800 ${isOpen ? "translate-y-0" : "translate-y-full"
          }`}
      >
        <div className="flex flex-col p-4 md:p-6 border-b border-zinc-800/50 shrink-0 bg-zinc-950/90 backdrop-blur-md rounded-t-3xl">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full mb-4 self-center" />

          <div className="flex w-full justify-between items-start gap-4">
            <div className="flex flex-col">
              <h2 className={`text-white font-bold leading-tight ${h1Class}`}>
                {activeCard?.payload?.title || activeCard?.metadata_anchor || "Deep Dive"}
              </h2>
              {activeCard?.payload?.dateContext && (
                <p className="text-sky-400 text-xs font-mono mt-2 uppercase tracking-wider">
                  {activeCard.payload.dateContext}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex gap-4 text-zinc-400 mr-2">
                <button title="Favorite" className="hover:text-rose-500 transition-colors">
                  <Heart size={22} />
                </button>
                <button title="Save" className="hover:text-sky-400 transition-colors">
                  <Bookmark size={22} />
                </button>
                <button title="Share" className="hover:text-emerald-400 transition-colors">
                  <Share2 size={22} />
                </button>
              </div>

              {/* Text Size Toggle Button */}
              <button
                onClick={() => setIsLargeText(!isLargeText)}
                className="flex-shrink-0 p-2 bg-white/10 rounded-full text-white/70 hover:bg-white/20 transition-colors"
                aria-label="Toggle text size"
                title="Toggle Text Size"
              >
                <Type size={20} />
              </button>

              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 bg-white/10 rounded-full text-white/70 hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth hide-scrollbar">
          <div className="pb-12 h-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500 pt-12">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p>Loading reflection...</p>
              </div>
            ) : (
              <div className="max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className={`font-bold text-white mt-8 mb-4 ${h1Class}`} {...props} />,
                    h2: ({ node, ...props }) => <h2 className={`font-bold text-sky-400 mt-8 mb-4 uppercase tracking-wide ${h2Class}`} {...props} />,
                    h3: ({ node, ...props }) => <h3 className={`font-bold text-sky-400 mt-8 mb-3 uppercase tracking-wide ${h3Class}`} {...props} />,
                    h4: ({ node, ...props }) => <h4 className={`font-bold text-zinc-100 mt-6 mb-2 ${textClass}`} {...props} />,
                    p: ({ node, ...props }) => <p className={`text-zinc-300 leading-relaxed mb-5 ${textClass}`} {...props} />,
                    ul: ({ node, ...props }) => <ul className={`list-disc list-outside ml-5 mb-6 text-zinc-300 space-y-2 ${textClass}`} {...props} />,
                    li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                    strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepDiveDrawer;
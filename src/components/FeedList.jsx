import { CheckCircle2 } from "lucide-react";
import FeedCard from "./FeedCard";

export default function FeedList({
    feed,
    error,
    loading,
    fetchingBatch,
    hasReachedEnd,
    observerTarget,
    onOpenDrawer,
}) {
    return (
        <>
            <div
                className="flex-1 w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth flex flex-col hide-scrollbar"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {/* Error State */}
                {error && (
                    <div className="h-full w-full flex-none flex items-center justify-center p-8 text-center text-zinc-400">
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {!error && feed.length === 0 && !loading && !fetchingBatch && (
                    <div className="h-full w-full flex-none flex items-center justify-center text-zinc-500">
                        No cards available.
                    </div>
                )}

                {/* The Feed */}
                {feed.map((item) => (
                    <FeedCard
                        key={item.id}
                        data={item}
                        onOpenDrawer={onOpenDrawer}
                    />
                ))}

                {/* The Tripwire for Infinite Scroll */}
                {!loading && !hasReachedEnd && (
                    <div
                        ref={observerTarget}
                        className="w-full h-32 flex-none flex items-center justify-center"
                    >
                        {fetchingBatch && (
                            <div className="w-8 h-8 border-4 border-zinc-800 border-t-zinc-500 rounded-full animate-spin" />
                        )}
                    </div>
                )}

                {/* End of Feed Marker */}
                {hasReachedEnd && feed.length > 0 && (
                    <div className="h-full w-full flex-none snap-start snap-always flex flex-col items-center justify-center text-zinc-500 text-sm pb-8 bg-zinc-950">
                        <CheckCircle2 size={48} className="mb-4 text-zinc-800" />
                        <p>You have reached the end for now.</p>
                    </div>
                )}
            </div>

            {/* Scrollbar Hiding Style */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `.hide-scrollbar::-webkit-scrollbar { display: none; }`,
                }}
            />
        </>
    );
}
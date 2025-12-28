export const ProductSkeleton = () => (
    <div className="rounded-[2rem] border border-white/5 bg-white/5 p-3 h-[400px] animate-pulse">
        <div className="aspect-square w-full rounded-[1.5rem] bg-white/10 mb-4" />
        <div className="px-2 space-y-3">
            <div className="h-3 w-1/3 bg-white/10 rounded-full" />
            <div className="h-6 w-3/4 bg-white/10 rounded-full" />
            <div className="h-6 w-1/2 bg-white/10 rounded-full mt-4" />
        </div>
    </div>
);

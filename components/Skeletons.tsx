export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-lg bg-white/[0.04] ${className}`}
        />
    );
}

export function SignalSkeleton() {
    return (
        <div className="border-b border-white/[0.04] px-4 py-4">
            <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3.5 w-14 rounded-full" />
                        <Skeleton className="h-3 w-8" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-14 rounded-md" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-3.5 w-full max-w-sm" />
                    <Skeleton className="h-3 w-3/4 max-w-xs" />
                    <div className="flex items-center gap-8 pt-1">
                        <Skeleton className="h-3.5 w-10" />
                        <Skeleton className="h-3.5 w-10" />
                        <Skeleton className="h-3.5 w-10" />
                        <Skeleton className="h-3.5 w-6" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AgentCardSkeleton() {
    return (
        <div className="glass-card rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
        </div>
    );
}

export function TrendingSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2.5 w-14" />
                    </div>
                    <Skeleton className="h-6 w-14 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

import { cn } from "@/lib/utils/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="skeleton"
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    );
}

/**
 * Placeholder for a list of cards.
 *
 * Every loading state in the app was the literal string "Loading...", which
 * gives no sense of what is arriving or how much. The wrapper carries the
 * live-region attributes so screen readers are told something is happening —
 * the old text was silent to assistive technology.
 */
function SkeletonList({
    count = 3,
    className,
}: {
    count?: number;
    className?: string;
}) {
    return (
        <div
            role="status"
            aria-busy="true"
            aria-live="polite"
            className={cn("space-y-3", className)}
        >
            <span className="sr-only">Memuat…</span>
            {Array.from({ length: count }, (_, i) => (
                <Skeleton key={i} className="h-20 w-full" aria-hidden="true" />
            ))}
        </div>
    );
}

/** Placeholder matching the stat-card grid. */
function SkeletonStats({ count = 4 }: { count?: number }) {
    return (
        <div
            role="status"
            aria-busy="true"
            aria-live="polite"
            className="contents"
        >
            <span className="sr-only">Memuat ringkasan…</span>
            {Array.from({ length: count }, (_, i) => (
                <Skeleton key={i} className="h-28 w-full" aria-hidden="true" />
            ))}
        </div>
    );
}

export { Skeleton, SkeletonList, SkeletonStats };

import { cn } from "@/lib/utils/cn";

type LogoProps = {
    className?: string;
    /** Render the tagline underneath. */
    withTagline?: boolean;
};

/**
 * The wordmark. Previously this was a blue→purple gradient hardcoded inline in
 * four places — and on the login screen the gradient sat on a wrapper while
 * `bg-clip-text text-transparent` sat on the heading, so the word rendered
 * invisible. Here the gradient and the clip are on the same element.
 */
export function Logo({ className, withTagline = false }: LogoProps) {
    return (
        <div>
            <span
                className={cn(
                    "inline-block font-bold tracking-tight",
                    "bg-linear-to-r from-brand to-brand-accent",
                    "bg-clip-text text-transparent",
                    className
                )}
            >
                BONKU
            </span>
            {withTagline && (
                <p className="text-xs text-muted-foreground mt-1">
                    Catat pengeluaran, pahami kebiasaanmu
                </p>
            )}
        </div>
    );
}

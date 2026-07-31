import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Styled native `<select>`.
 *
 * The same hand-written class string was duplicated across five call sites
 * while the Radix `Select` wrapper sat unused. Native is the deliberate choice
 * here: on mobile it opens the OS picker, which is faster to operate and more
 * accessible than a custom listbox — and this app's audience is mobile-first.
 */
function NativeSelect({
    className,
    children,
    ...props
}: React.ComponentProps<"select">) {
    return (
        <div className="relative">
            <select
                data-slot="native-select"
                className={cn(
                    "w-full appearance-none rounded-md border border-input bg-background",
                    // min-h-11 ≈ 44px, the minimum comfortable touch target.
                    "px-3 pr-9 min-h-11 text-sm",
                    "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            >
                {children}
            </select>
            <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
            />
        </div>
    );
}

export { NativeSelect };

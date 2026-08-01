"use client";

import { getCategoryById } from "@/config/categories";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import type { CategorySummary } from "@/types/models";

type CategoryBarsProps = {
    categories: CategorySummary[];
    className?: string;
};

/**
 * Where this month's spending went.
 *
 * Horizontal bars rather than a donut: the categories have long Indonesian
 * names that fit beside a bar and not inside a slice, and bar length is far
 * easier to compare than arc angle. At 390px a donut with five slices and a
 * legend is unreadable.
 *
 * Every bar takes the same hue. These are nominal categories, so shading them
 * by value would spend the identity channel re-encoding what bar length
 * already says.
 */
export function CategoryBars({ categories, className }: CategoryBarsProps) {
    if (categories.length === 0) return null;

    const largest = Math.max(...categories.map((c) => c.amount));

    return (
        <ul className={cn("space-y-3", className)}>
            {categories.map((c) => {
                const label = getCategoryById(c.category, "expense")?.label ?? c.category;
                const width = largest > 0 ? (c.amount / largest) * 100 : 0;

                return (
                    <li key={c.category} className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="truncate">{label}</span>
                            <span className="shrink-0 tabular-nums font-medium">
                                {formatCurrency(c.amount)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div
                                className="h-2 flex-1 rounded-full bg-muted overflow-hidden"
                                role="img"
                                aria-label={`${label}: ${formatCurrency(c.amount)}, ${c.percentage.toFixed(0)} persen dari pengeluaran`}
                            >
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${width}%`,
                                        background: "var(--series-1)",
                                    }}
                                />
                            </div>
                            <span className="w-10 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                                {c.percentage.toFixed(0)}%
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

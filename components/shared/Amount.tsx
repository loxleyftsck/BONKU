"use client";

import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/currency";
import { useProfile } from "@/hooks/useProfile";

type AmountProps = {
    value: number;
    /** Prefix with + / − to convey direction without relying on colour alone. */
    sign?: "positive" | "negative";
    className?: string;
};

/**
 * Renders a monetary value, honouring the user's "hide balances" preference.
 *
 * Amounts are masked rather than merely blurred so the figure is genuinely not
 * present in the DOM text when hidden — a blur filter is trivially defeated by
 * a screenshot or by reading the page source.
 */
export function Amount({ value, sign, className }: AmountProps) {
    const { data: profile } = useProfile();
    const hidden = profile?.settings?.hide_balances ?? false;

    const prefix = sign === "positive" ? "+" : sign === "negative" ? "−" : "";

    if (hidden) {
        return (
            <span className={className} aria-label="Nominal disembunyikan">
                {prefix}Rp ••••••
            </span>
        );
    }

    return (
        <span className={cn(className)}>
            {prefix}
            {formatCurrency(value)}
        </span>
    );
}

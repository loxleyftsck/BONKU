import { addMonths, format, parseISO } from "date-fns";

export const MONTH_RE = /^\d{4}-\d{2}$/;

export function isValidMonth(month: string): boolean {
    if (!MONTH_RE.test(month)) return false;
    const monthNumber = Number(month.slice(5, 7));
    return monthNumber >= 1 && monthNumber <= 12;
}

export type MonthRange = {
    /** Inclusive lower bound, YYYY-MM-DD. */
    start: string;
    /** Exclusive upper bound, YYYY-MM-DD. */
    endExclusive: string;
};

/**
 * Half-open date range covering a calendar month.
 *
 * The upper bound is exclusive and computed as the first of the next month.
 * Building it as `${month}-31` produced invalid literals such as 2026-02-31,
 * which Postgres rejects — the dashboard summary returned 500 for every month
 * shorter than 31 days.
 *
 * @param month YYYY-MM
 */
export function monthRange(month: string): MonthRange {
    if (!isValidMonth(month)) {
        throw new RangeError(`Invalid month: ${month}. Expected YYYY-MM.`);
    }

    const start = `${month}-01`;

    return {
        start,
        endExclusive: format(addMonths(parseISO(start), 1), "yyyy-MM-dd"),
    };
}

/** The current month as YYYY-MM, in UTC. */
export function currentMonth(now: Date = new Date()): string {
    return now.toISOString().slice(0, 7);
}

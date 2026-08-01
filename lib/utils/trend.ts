import type { Transaction } from "@/types/models";
import { monthRange, previousMonth } from "./date";

export type MonthPoint = {
    /** YYYY-MM */
    month: string;
    income: number;
    expenses: number;
};

type Row = Pick<Transaction, "type" | "amount" | "date">;

/**
 * Income and expense totals for the `count` months ending at `endMonth`,
 * oldest first.
 *
 * Months with no activity are emitted as zeroes rather than omitted, so the
 * x-axis stays evenly spaced — dropping empty months would compress the gap
 * and make a quiet period look like continuous activity.
 */
export function monthlyTrend(
    rows: readonly Row[],
    endMonth: string,
    count = 12,
): MonthPoint[] {
    const months: string[] = [];
    let cursor = endMonth;

    for (let i = 0; i < count; i++) {
        months.unshift(cursor);
        cursor = previousMonth(cursor);
    }

    return months.map((month) => {
        const { start, endExclusive } = monthRange(month);
        let income = 0;
        let expenses = 0;

        for (const row of rows) {
            if (row.date < start || row.date >= endExclusive) continue;
            if (row.type === "income") income += row.amount;
            else expenses += row.amount;
        }

        return { month, income, expenses };
    });
}

import { describe, expect, it } from "vitest";
import {
    compareMonths,
    percentChange,
    summariseTotals,
    topCategories,
} from "./summary";

const tx = (type: "income" | "expense", amount: number, category = "misc") => ({
    type,
    amount,
    category,
});

describe("summariseTotals", () => {
    it("separates income from expenses", () => {
        const result = summariseTotals([
            tx("income", 5_000_000),
            tx("expense", 1_500_000),
            tx("expense", 500_000),
        ]);

        expect(result.income).toBe(5_000_000);
        expect(result.expenses).toBe(2_000_000);
        expect(result.netSavings).toBe(3_000_000);
        expect(result.savingsRate).toBeCloseTo(60);
    });

    it("returns zeroes for an empty month rather than NaN", () => {
        expect(summariseTotals([])).toEqual({
            income: 0,
            expenses: 0,
            netSavings: 0,
            savingsRate: 0,
        });
    });

    it("does not divide by zero when there is no income", () => {
        const result = summariseTotals([tx("expense", 100_000)]);

        expect(result.savingsRate).toBe(0);
        expect(Number.isNaN(result.savingsRate)).toBe(false);
    });

    it("reports a negative net when spending exceeds income", () => {
        const result = summariseTotals([
            tx("income", 1_000_000),
            tx("expense", 1_500_000),
        ]);

        expect(result.netSavings).toBe(-500_000);
        expect(result.savingsRate).toBeCloseTo(-50);
    });
});

describe("topCategories", () => {
    it("aggregates expenses by category, largest first", () => {
        const result = topCategories([
            tx("expense", 300_000, "food"),
            tx("expense", 200_000, "food"),
            tx("expense", 400_000, "transport"),
        ]);

        expect(result.map((c) => c.category)).toEqual(["food", "transport"]);
        expect(result[0]).toMatchObject({ amount: 500_000, count: 2 });
    });

    it("ignores income", () => {
        const result = topCategories([
            tx("income", 9_000_000, "salary"),
            tx("expense", 100_000, "food"),
        ]);

        expect(result.map((c) => c.category)).toEqual(["food"]);
    });

    it("computes percentages against total expenses only", () => {
        const result = topCategories([
            tx("income", 5_000_000, "salary"),
            tx("expense", 750_000, "food"),
            tx("expense", 250_000, "transport"),
        ]);

        expect(result[0].percentage).toBeCloseTo(75);
        expect(result[1].percentage).toBeCloseTo(25);
    });

    it("honours the limit", () => {
        const many = Array.from({ length: 9 }, (_, i) =>
            tx("expense", (i + 1) * 1000, `cat-${i}`),
        );

        expect(topCategories(many)).toHaveLength(5);
        expect(topCategories(many, 3)).toHaveLength(3);
    });

    it("returns an empty list for a month with no expenses", () => {
        expect(topCategories([tx("income", 1_000_000)])).toEqual([]);
    });
});

describe("percentChange", () => {
    /*
     * Regression: month_over_month shipped hardcoded as { 0, 0, 0 }, so the
     * dashboard rendered a green "no change" arrow regardless of what actually
     * happened — fabricated financial data.
     */
    it("computes a rise", () => {
        expect(percentChange(150, 100)).toBeCloseTo(50);
    });

    it("computes a fall", () => {
        expect(percentChange(50, 100)).toBeCloseTo(-50);
    });

    it("reports exactly zero when nothing changed", () => {
        expect(percentChange(100, 100)).toBe(0);
    });

    it("returns null rather than inventing growth from a zero baseline", () => {
        expect(percentChange(100, 0)).toBeNull();
    });

    it("treats zero-to-zero as no change, not as missing", () => {
        expect(percentChange(0, 0)).toBe(0);
    });

    it("handles a negative baseline by magnitude", () => {
        // Net savings can be negative; a move from -100 to -50 is an improvement.
        expect(percentChange(-50, -100)).toBeCloseTo(50);
    });

    it("never returns NaN or Infinity", () => {
        for (const [a, b] of [
            [0, 0],
            [1, 0],
            [-1, 0],
            [0, 1],
        ]) {
            const result = percentChange(a, b);
            if (result !== null) {
                expect(Number.isFinite(result)).toBe(true);
            }
        }
    });
});

describe("compareMonths", () => {
    const totals = (income: number, expenses: number) => ({
        income,
        expenses,
        netSavings: income - expenses,
        savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    });

    it("compares each dimension independently", () => {
        const result = compareMonths(
            totals(6_000_000, 3_000_000),
            totals(5_000_000, 4_000_000),
        );

        expect(result.income_change).toBeCloseTo(20);
        expect(result.expense_change).toBeCloseTo(-25);
        expect(result.savings_change).toBeCloseTo(200);
    });

    it("returns nulls for a first month with no prior data", () => {
        const result = compareMonths(totals(5_000_000, 1_000_000), totals(0, 0));

        expect(result).toEqual({
            income_change: null,
            expense_change: null,
            savings_change: null,
        });
    });

    it("never reports a change of exactly zero across the board unless nothing moved", () => {
        const same = totals(5_000_000, 2_000_000);

        expect(compareMonths(same, same)).toEqual({
            income_change: 0,
            expense_change: 0,
            savings_change: 0,
        });
    });
});

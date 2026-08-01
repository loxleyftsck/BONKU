import { describe, expect, it } from "vitest";
import { monthlyTrend } from "./trend";

const row = (type: "income" | "expense", amount: number, date: string) => ({
    type, amount, date,
});

describe("monthlyTrend", () => {
    it("returns exactly the requested number of months, oldest first", () => {
        const out = monthlyTrend([], "2026-06", 12);

        expect(out).toHaveLength(12);
        expect(out[0].month).toBe("2025-07");
        expect(out[11].month).toBe("2026-06");
    });

    /*
     * Empty months must stay in the series. Dropping them would compress the
     * x-axis and make a quiet period look like continuous activity.
     */
    it("emits zero months rather than omitting them", () => {
        const out = monthlyTrend([row("income", 500, "2026-06-10")], "2026-06", 3);

        expect(out.map((p) => p.month)).toEqual(["2026-04", "2026-05", "2026-06"]);
        expect(out[0]).toMatchObject({ income: 0, expenses: 0 });
        expect(out[2]).toMatchObject({ income: 500, expenses: 0 });
    });

    it("separates income from expenses per month", () => {
        const out = monthlyTrend(
            [
                row("income", 6_000_000, "2026-05-25"),
                row("expense", 2_000_000, "2026-05-02"),
                row("expense", 500_000, "2026-05-19"),
                row("income", 7_000_000, "2026-06-25"),
            ],
            "2026-06",
            2,
        );

        expect(out[0]).toMatchObject({ month: "2026-05", income: 6_000_000, expenses: 2_500_000 });
        expect(out[1]).toMatchObject({ month: "2026-06", income: 7_000_000, expenses: 0 });
    });

    it("excludes rows outside the window", () => {
        const out = monthlyTrend(
            [row("income", 999, "2025-01-15"), row("income", 100, "2026-06-01")],
            "2026-06",
            2,
        );

        expect(out.reduce((n, p) => n + p.income, 0)).toBe(100);
    });

    // February is where the old `${month}-31` bound produced invalid dates.
    it("handles February and the year boundary", () => {
        const out = monthlyTrend(
            [row("expense", 100, "2026-02-28"), row("expense", 200, "2026-01-31")],
            "2026-02",
            3,
        );

        expect(out.map((p) => p.month)).toEqual(["2025-12", "2026-01", "2026-02"]);
        expect(out[1].expenses).toBe(200);
        expect(out[2].expenses).toBe(100);
    });

    it("never counts a transaction into two months", () => {
        const out = monthlyTrend([row("expense", 50, "2026-03-01")], "2026-03", 4);
        expect(out.reduce((n, p) => n + p.expenses, 0)).toBe(50);
    });
});

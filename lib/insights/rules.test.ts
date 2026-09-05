import { describe, expect, it } from "vitest";
import { deriveInsights, type InsightContext } from "./rules";
import type { Transaction } from "@/types/models";

let seq = 0;

function tx(
    partial: Partial<Transaction> & Pick<Transaction, "type" | "amount">,
): Transaction {
    seq += 1;
    return {
        id: `t-${seq}`,
        user_id: "u-1",
        category: "food",
        description: null,
        date: "2026-06-10",
        is_recurring: false,
        behavior_tag: null,
        created_at: "2026-06-10T00:00:00Z",
        updated_at: "2026-06-10T00:00:00Z",
        ...partial,
    };
}

const ctx = (current: Transaction[], prior: Transaction[] = []): InsightContext => ({
    current,
    prior,
    month: "2026-06",
});

const titles = (c: InsightContext) => deriveInsights(c).map((i) => i.title);

describe("deriveInsights", () => {
    /*
     * The engine replaced a stub that returned "not yet implemented", so the
     * screen was always empty. The opposite failure — inventing observations
     * from thin data — would be worse in a finance app, and these cases pin it.
     */
    describe("says nothing when the data cannot support it", () => {
        it("returns nothing for an empty month", () => {
            expect(deriveInsights(ctx([]))).toEqual([]);
        });

        it("does not compare against a month with too few transactions", () => {
            const current = [
                tx({ type: "income", amount: 5_000_000 }),
                tx({ type: "expense", amount: 3_000_000 }),
                tx({ type: "expense", amount: 500_000 }),
            ];
            // One prior transaction is not a baseline.
            const prior = [tx({ type: "expense", amount: 10_000 })];

            // Plain string check: `toContain` does not evaluate asymmetric
            // matchers, so `not.toContain(expect.stringContaining(...))` would
            // pass no matter what the engine produced.
            expect(titles(ctx(current, prior)).join(" ")).not.toMatch(
                /dari bulan lalu/,
            );
        });

        it("does not claim a category spike without a prior baseline", () => {
            const prior = [
                tx({ type: "expense", amount: 100_000, category: "food" }),
                tx({ type: "expense", amount: 100_000, category: "food" }),
                tx({ type: "expense", amount: 100_000, category: "food" }),
            ];
            // "transportation" is brand new; growth from zero is not a trend.
            const current = [tx({ type: "expense", amount: 900_000, category: "transportation" })];

            expect(titles(ctx(current, prior)).join(" ")).not.toMatch(/Transportasi/);
        });

        it("ignores impulsive share when the user barely tags", () => {
            const current = [
                tx({ type: "income", amount: 5_000_000 }),
                tx({ type: "expense", amount: 900_000, behavior_tag: "impulsive" }),
                tx({ type: "expense", amount: 100_000 }),
                tx({ type: "expense", amount: 100_000 }),
                tx({ type: "expense", amount: 100_000 }),
                tx({ type: "expense", amount: 100_000 }),
            ];

            expect(titles(ctx(current)).join(" ")).not.toMatch(/impulsif/);
        });
    });

    describe("overspending", () => {
        it("is critical when spending exceeds income", () => {
            const out = deriveInsights(
                ctx([
                    tx({ type: "income", amount: 3_000_000 }),
                    tx({ type: "expense", amount: 4_000_000 }),
                ]),
            );

            expect(out[0]).toMatchObject({
                severity: "critical",
                title: "Pengeluaran melebihi pemasukan",
            });
            // The figures it was derived from are shown, so the reader can check.
            expect(out[0].message).toContain("Rp");
        });

        it("does not fire when there is no income recorded", () => {
            const out = deriveInsights(ctx([tx({ type: "expense", amount: 100_000 })]));
            expect(out.map((i) => i.title)).not.toContain("Pengeluaran melebihi pemasukan");
        });

        it("does not fire when net is positive", () => {
            const out = deriveInsights(
                ctx([
                    tx({ type: "income", amount: 5_000_000 }),
                    tx({ type: "expense", amount: 1_000_000 }),
                ]),
            );
            expect(out.map((i) => i.title)).not.toContain("Pengeluaran melebihi pemasukan");
        });
    });

    describe("spending up vs last month", () => {
        const prior = [
            tx({ type: "expense", amount: 400_000 }),
            tx({ type: "expense", amount: 300_000 }),
            tx({ type: "expense", amount: 300_000 }),
        ];

        it("fires past the 20% threshold", () => {
            const current = [
                tx({ type: "income", amount: 9_000_000 }),
                tx({ type: "expense", amount: 1_500_000 }),
            ];
            expect(titles(ctx(current, prior)).join(" ")).toMatch(/Pengeluaran naik/);
        });

        it("stays quiet below the threshold", () => {
            const current = [
                tx({ type: "income", amount: 9_000_000 }),
                tx({ type: "expense", amount: 1_050_000 }),
            ];
            expect(titles(ctx(current, prior)).join(" ")).not.toMatch(/Pengeluaran naik/);
        });

        it("escalates to warning at a large jump", () => {
            const current = [
                tx({ type: "income", amount: 9_000_000 }),
                tx({ type: "expense", amount: 2_000_000 }),
            ];
            const found = deriveInsights(ctx(current, prior)).find((i) =>
                i.title.startsWith("Pengeluaran naik"),
            );
            expect(found?.severity).toBe("warning");
        });
    });

    describe("category spike", () => {
        it("names the category with the largest rise", () => {
            const prior = [
                tx({ type: "expense", amount: 500_000, category: "food" }),
                tx({ type: "expense", amount: 500_000, category: "transportation" }),
                tx({ type: "expense", amount: 500_000, category: "shopping" }),
            ];
            const current = [
                tx({ type: "income", amount: 9_000_000 }),
                tx({ type: "expense", amount: 550_000, category: "food" }),
                tx({ type: "expense", amount: 1_500_000, category: "transportation" }),
            ];

            const found = deriveInsights(ctx(current, prior)).find((i) =>
                /naik \d+%$/.test(i.title) && !i.title.startsWith("Pengeluaran"),
            );

            expect(found?.title).toMatch(/Transportasi/);
        });
    });

    describe("savings rate", () => {
        it("congratulates at or above target", () => {
            const out = deriveInsights(
                ctx([
                    tx({ type: "income", amount: 10_000_000 }),
                    tx({ type: "expense", amount: 5_000_000 }),
                ]),
            );
            expect(out.map((i) => i.title)).toContain("Rasio menabungmu di atas target");
        });

        it("states the shortfall in rupiah below target", () => {
            const out = deriveInsights(
                ctx([
                    tx({ type: "income", amount: 10_000_000 }),
                    tx({ type: "expense", amount: 9_000_000 }),
                    tx({ type: "expense", amount: 100_000 }),
                ]),
            );
            const found = out.find((i) => i.title.includes("Rasio menabung"));
            expect(found?.message).toMatch(/Rp/);
        });
    });

    describe("ordering and shape", () => {
        it("puts the most severe first", () => {
            const prior = [
                tx({ type: "expense", amount: 300_000 }),
                tx({ type: "expense", amount: 300_000 }),
                tx({ type: "expense", amount: 300_000 }),
            ];
            const current = [
                tx({ type: "income", amount: 1_000_000 }),
                tx({ type: "expense", amount: 2_000_000 }),
            ];

            const severities = deriveInsights(ctx(current, prior)).map((i) => i.severity);
            const rank = { critical: 0, warning: 1, info: 2 } as const;

            expect(severities).toEqual([...severities].sort((a, b) => rank[a] - rank[b]));
        });

        it("is deterministic", () => {
            const current = [
                tx({ type: "income", amount: 5_000_000 }),
                tx({ type: "expense", amount: 6_000_000 }),
            ];
            const a = deriveInsights(ctx(current));
            const b = deriveInsights(ctx(current));

            expect(a).toEqual(b);
        });

        it("only emits known severities and types", () => {
            const current = [
                tx({ type: "income", amount: 5_000_000 }),
                tx({ type: "expense", amount: 6_000_000, behavior_tag: "impulsive" }),
                tx({ type: "expense", amount: 200_000, behavior_tag: "planned" }),
                tx({ type: "expense", amount: 200_000, behavior_tag: "essential" }),
            ];

            for (const i of deriveInsights(ctx(current))) {
                expect(["info", "warning", "critical"]).toContain(i.severity);
                expect([
                    "spending_alert",
                    "saving_opportunity",
                    "inflation_impact",
                    "behavior_pattern",
                ]).toContain(i.type);
                expect(i.title.length).toBeGreaterThan(0);
                expect(i.message.length).toBeGreaterThan(0);
            }
        });
    });
});

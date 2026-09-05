import type { AIInsight, Transaction } from "@/types/models";
import { getCategoryById } from "@/config/categories";
import { formatCurrency } from "@/lib/utils/currency";
import { percentChange, summariseTotals, topCategories } from "@/lib/utils/summary";

/**
 * Rule-based insight engine.
 *
 * There is no model here and the copy never claims one. Every insight is a
 * arithmetic statement about the user's own transactions, and each carries the
 * figures it was derived from so the reader can check it. For an audience that
 * has never used a budgeting app, an explainable "you spent 40% more on food
 * than last month" is worth more than an opaque recommendation.
 *
 * Rules are pure and ordered by severity, so the same data always produces the
 * same insights. Nothing is emitted when the data cannot support it — an empty
 * list is the correct output for a first week, and is far better than
 * inventing an observation.
 */

export type InsightContext = {
    /** Transactions in the month being analysed. */
    current: Transaction[];
    /** Transactions in the month before it. */
    prior: Transaction[];
    /** YYYY-MM being analysed. */
    month: string;
    /** Target savings rate, in percent. */
    savingsTarget?: number;
};

/** An insight before it is given an id and a user. */
export type DerivedInsight = Omit<
    AIInsight,
    "id" | "user_id" | "created_at" | "dismissed" | "expires_at"
>;

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 } as const;

/** Too little data to say anything honest about a pattern. */
const MIN_TRANSACTIONS = 3;

function categoryLabel(id: string) {
    return getCategoryById(id, "expense")?.label ?? id;
}

function pct(value: number) {
    return `${Math.abs(value).toFixed(0)}%`;
}

// ---------------------------------------------------------------- rules

/** Spending exceeds income this month. */
function overspending(ctx: InsightContext): DerivedInsight | null {
    const totals = summariseTotals(ctx.current);

    if (totals.income === 0 || totals.netSavings >= 0) return null;

    return {
        type: "spending_alert",
        severity: "critical",
        title: "Pengeluaran melebihi pemasukan",
        message:
            `Bulan ini kamu membelanjakan ${formatCurrency(totals.expenses)} ` +
            `dari pemasukan ${formatCurrency(totals.income)} — selisihnya ` +
            `${formatCurrency(Math.abs(totals.netSavings))}.`,
        actionable: true,
        actions: ["Lihat pengeluaran terbesar"],
    };
}

/** Total spending rose materially against last month. */
function spendingUp(ctx: InsightContext): DerivedInsight | null {
    if (ctx.prior.length < MIN_TRANSACTIONS) return null;

    const now = summariseTotals(ctx.current);
    const before = summariseTotals(ctx.prior);
    const change = percentChange(now.expenses, before.expenses);

    if (change === null || change < 20) return null;

    return {
        type: "spending_alert",
        severity: change >= 50 ? "warning" : "info",
        title: `Pengeluaran naik ${pct(change)} dari bulan lalu`,
        message:
            `${formatCurrency(now.expenses)} bulan ini, dibanding ` +
            `${formatCurrency(before.expenses)} bulan lalu.`,
        actionable: true,
        actions: ["Bandingkan per kategori"],
    };
}

/** One category grew far faster than spending as a whole. */
function categorySpike(ctx: InsightContext): DerivedInsight | null {
    if (ctx.prior.length < MIN_TRANSACTIONS) return null;

    const nowByCategory = topCategories(ctx.current, 99);
    const beforeByCategory = new Map(
        topCategories(ctx.prior, 99).map((c) => [c.category, c.amount]),
    );

    let worst: { category: string; change: number; from: number; to: number } | null =
        null;

    for (const c of nowByCategory) {
        const before = beforeByCategory.get(c.category);
        // A category with no prior spend has no baseline to grow from; saying
        // "up 100%" there would be inventing a trend.
        if (!before) continue;

        const change = percentChange(c.amount, before);
        if (change === null || change < 40) continue;

        if (!worst || change > worst.change) {
            worst = { category: c.category, change, from: before, to: c.amount };
        }
    }

    if (!worst) return null;

    const label = categoryLabel(worst.category);

    return {
        type: "behavior_pattern",
        severity: "warning",
        title: `${label} naik ${pct(worst.change)}`,
        message:
            `Dari ${formatCurrency(worst.from)} bulan lalu menjadi ` +
            `${formatCurrency(worst.to)} bulan ini.`,
        actionable: true,
        actions: [`Lihat transaksi ${label}`],
    };
}

/** How much of this month's spending was tagged impulsive. */
function impulsiveShare(ctx: InsightContext): DerivedInsight | null {
    const expenses = ctx.current.filter((t) => t.type === "expense");
    const tagged = expenses.filter((t) => t.behavior_tag !== null);

    // Only meaningful if the user actually tags, and tags most of their spend.
    if (tagged.length < MIN_TRANSACTIONS) return null;
    if (tagged.length / expenses.length < 0.5) return null;

    const total = expenses.reduce((n, t) => n + t.amount, 0);
    const impulsive = expenses
        .filter((t) => t.behavior_tag === "impulsive")
        .reduce((n, t) => n + t.amount, 0);

    if (total === 0 || impulsive === 0) return null;

    const share = (impulsive / total) * 100;
    if (share < 15) return null;

    return {
        type: "behavior_pattern",
        severity: share >= 30 ? "warning" : "info",
        title: `${pct(share)} pengeluaranmu impulsif`,
        message:
            `${formatCurrency(impulsive)} dari ${formatCurrency(total)} kamu tandai ` +
            `sebagai pembelian impulsif. Coba aturan 24 jam untuk pembelian yang ` +
            `tidak mendesak.`,
        actionable: false,
        actions: null,
    };
}

/** Savings rate against the target. */
function savingsRate(ctx: InsightContext): DerivedInsight | null {
    const totals = summariseTotals(ctx.current);
    const target = ctx.savingsTarget ?? 30;

    if (totals.income === 0 || totals.netSavings <= 0) return null;

    const rate = totals.savingsRate;

    if (rate >= target) {
        return {
            type: "saving_opportunity",
            severity: "info",
            title: "Rasio menabungmu di atas target",
            message:
                `Kamu menyisihkan ${rate.toFixed(0)}% dari pemasukan bulan ini, ` +
                `di atas target ${target}%. Pertahankan.`,
            actionable: false,
            actions: null,
        };
    }

    // Only worth raising once there is enough of a month to judge.
    if (ctx.current.length < MIN_TRANSACTIONS) return null;

    return {
        type: "saving_opportunity",
        severity: "info",
        title: `Rasio menabung ${rate.toFixed(0)}%, target ${target}%`,
        message:
            `Untuk mencapai target, sisakan sekitar ` +
            `${formatCurrency((totals.income * target) / 100)} bulan ini. ` +
            `Sekarang tersisa ${formatCurrency(totals.netSavings)}.`,
        actionable: true,
        actions: ["Lihat pengeluaran terbesar"],
    };
}

/** Recurring commitments as a share of income. */
function recurringLoad(ctx: InsightContext): DerivedInsight | null {
    const recurring = ctx.current.filter(
        (t) => t.type === "expense" && t.is_recurring,
    );

    if (recurring.length === 0) return null;

    const totals = summariseTotals(ctx.current);
    if (totals.income === 0) return null;

    const committed = recurring.reduce((n, t) => n + t.amount, 0);
    const share = (committed / totals.income) * 100;

    if (share < 40) return null;

    return {
        type: "spending_alert",
        severity: share >= 60 ? "warning" : "info",
        title: `${pct(share)} pemasukanmu sudah terikat`,
        message:
            `${formatCurrency(committed)} dari ${recurring.length} transaksi berulang ` +
            `setiap bulan. Sisanya yang bisa kamu atur bebas.`,
        actionable: false,
        actions: null,
    };
}

const RULES = [
    overspending,
    spendingUp,
    categorySpike,
    impulsiveShare,
    savingsRate,
    recurringLoad,
];

/**
 * Runs every rule and returns what fired, most severe first.
 *
 * Returns an empty array when there is nothing honest to say.
 */
export function deriveInsights(ctx: InsightContext): DerivedInsight[] {
    if (ctx.current.length === 0) return [];

    return RULES.map((rule) => rule(ctx))
        .filter((i): i is DerivedInsight => i !== null)
        .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

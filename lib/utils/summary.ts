import type { Transaction } from "@/types/models";

export type Totals = {
    income: number;
    expenses: number;
    netSavings: number;
    savingsRate: number;
};

export type CategoryTotal = {
    category: string;
    amount: number;
    count: number;
    percentage: number;
};

/** Income, expenses and derived rates for a set of transactions. */
export function summariseTotals(
    transactions: readonly Pick<Transaction, "type" | "amount">[],
): Totals {
    let income = 0;
    let expenses = 0;

    for (const t of transactions) {
        if (t.type === "income") {
            income += t.amount;
        } else {
            expenses += t.amount;
        }
    }

    const netSavings = income - expenses;

    return {
        income,
        expenses,
        netSavings,
        savingsRate: income > 0 ? (netSavings / income) * 100 : 0,
    };
}

/** Expense totals per category, largest first. */
export function topCategories(
    transactions: readonly Pick<Transaction, "type" | "amount" | "category">[],
    limit = 5,
): CategoryTotal[] {
    const byCategory = new Map<string, { amount: number; count: number }>();
    let totalExpenses = 0;

    for (const t of transactions) {
        if (t.type !== "expense") continue;

        const entry = byCategory.get(t.category) ?? { amount: 0, count: 0 };
        entry.amount += t.amount;
        entry.count += 1;
        byCategory.set(t.category, entry);
        totalExpenses += t.amount;
    }

    return [...byCategory.entries()]
        .map(([category, { amount, count }]) => ({
            category,
            amount,
            count,
            percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, limit);
}

/**
 * Percentage change from `previous` to `current`.
 *
 * Returns null when there is no meaningful baseline — a first month, or any
 * month following a zero. Reporting "+100%" against a zero baseline would be
 * inventing a trend, and this replaces a hardcoded 0 that rendered as a green
 * "no change" arrow regardless of what actually happened.
 */
export function percentChange(
    current: number,
    previous: number,
): number | null {
    if (previous === 0) {
        return current === 0 ? 0 : null;
    }

    return ((current - previous) / Math.abs(previous)) * 100;
}

export type MonthOverMonth = {
    income_change: number | null;
    expense_change: number | null;
    savings_change: number | null;
};

export function compareMonths(
    current: Totals,
    previous: Totals,
): MonthOverMonth {
    return {
        income_change: percentChange(current.income, previous.income),
        expense_change: percentChange(current.expenses, previous.expenses),
        savings_change: percentChange(current.netSavings, previous.netSavings),
    };
}

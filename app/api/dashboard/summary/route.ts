import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  currentMonth,
  isValidMonth,
  monthRange,
  previousMonth,
} from "@/lib/utils/date";
import {
  compareMonths,
  summariseTotals,
  topCategories,
} from "@/lib/utils/summary";
import type { Transaction } from "@/types/models";

type MonthTransaction = Pick<Transaction, "type" | "amount" | "category">;

// GET /api/dashboard/summary - Get monthly financial summary
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM format

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const targetMonth = month || currentMonth();

    if (!isValidMonth(targetMonth)) {
      return NextResponse.json(
        { error: "Invalid month. Expected YYYY-MM." },
        { status: 400 }
      );
    }

    const current = monthRange(targetMonth);
    const prior = monthRange(previousMonth(targetMonth));

    const monthQuery = (from: string, toExclusive: string) =>
      supabase
        .from("transactions")
        .select("type, amount, category")
        .eq("user_id", user.id)
        .gte("date", from)
        .lt("date", toExclusive);

    // Both months are needed for the month-over-month comparison, which
    // previously shipped as a hardcoded { 0, 0, 0 } and rendered as a green
    // "no change" arrow no matter what actually happened.
    const [currentResult, priorResult] = await Promise.all([
      monthQuery(current.start, current.endExclusive),
      monthQuery(prior.start, prior.endExclusive),
    ]);

    if (currentResult.error) {
      throw currentResult.error;
    }

    if (priorResult.error) {
      throw priorResult.error;
    }

    const currentTransactions = (currentResult.data ?? []) as MonthTransaction[];
    const priorTransactions = (priorResult.data ?? []) as MonthTransaction[];

    const totals = summariseTotals(currentTransactions);
    const priorTotals = summariseTotals(priorTransactions);

    return NextResponse.json({
      data: {
        month: targetMonth,
        total_income: totals.income,
        total_expenses: totals.expenses,
        net_savings: totals.netSavings,
        savings_rate: totals.savingsRate,
        top_categories: topCategories(currentTransactions),
        month_over_month: compareMonths(totals, priorTotals),
        transaction_count: currentTransactions.length,
        /** False for a user's first month, so the UI can omit the comparison. */
        has_prior_month: priorTransactions.length > 0,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}

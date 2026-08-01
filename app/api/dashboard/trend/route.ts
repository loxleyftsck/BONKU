import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { currentMonth, isValidMonth, monthRange, previousMonth } from "@/lib/utils/date";
import { monthlyTrend } from "@/lib/utils/trend";
import { isDemoMode } from "@/lib/demo/config";
import { listTransactions } from "@/lib/demo/store";
import type { Transaction } from "@/types/models";

type Row = Pick<Transaction, "type" | "amount" | "date">;

const MAX_MONTHS = 24;

// GET /api/dashboard/trend?months=12 - Monthly income vs expense series
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const requested = Number(searchParams.get("months"));
    const months =
      Number.isInteger(requested) && requested >= 2 && requested <= MAX_MONTHS
        ? requested
        : 12;

    const endMonth = searchParams.get("month") || currentMonth();

    if (!isValidMonth(endMonth)) {
      return NextResponse.json(
        { error: "Invalid month. Expected YYYY-MM." },
        { status: 400 }
      );
    }

    // Lower bound of the window, so the query fetches only what it plots.
    let firstMonth = endMonth;
    for (let i = 1; i < months; i++) firstMonth = previousMonth(firstMonth);

    const windowStart = monthRange(firstMonth).start;
    const windowEnd = monthRange(endMonth).endExclusive;

    let rows: Row[];

    if (isDemoMode()) {
      rows = listTransactions({}).filter(
        (t) => t.date >= windowStart && t.date < windowEnd
      );
    } else {
      const supabase = await createClient();

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("type, amount, date")
        .eq("user_id", user.id)
        .gte("date", windowStart)
        .lt("date", windowEnd);

      if (error) throw error;

      rows = (data ?? []) as Row[];
    }

    return NextResponse.json({
      data: monthlyTrend(rows, endMonth, months),
    });
  } catch (error) {
    console.error("Error fetching trend:", error);
    return NextResponse.json(
      { error: "Failed to fetch trend" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode, DEMO_USER } from "@/lib/demo/config";
import { listTransactions } from "@/lib/demo/store";
import { currentMonth, isValidMonth, monthRange, previousMonth } from "@/lib/utils/date";
import { deriveInsights } from "@/lib/insights/rules";
import type { AIInsight, Transaction } from "@/types/models";

/*
 * Insights are derived on read rather than generated into the ai_insights
 * table.
 *
 * They are a pure function of the user's transactions, so storing them creates
 * a second copy that goes stale the moment a transaction is edited — and this
 * app now supports editing. Recomputing is cheap: it is two indexed month
 * queries and some arithmetic.
 *
 * The table remains for a future engine that produces something not derivable
 * on demand. The `dismissed` column is unused for now; the dismiss control was
 * never wired to anything.
 */

type Row = Transaction;

/** Stable id, so React keys do not change between identical responses. */
function insightId(userId: string, month: string, index: number, title: string) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    return `${userId}:${month}:${index}:${slug}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const month = searchParams.get("month") || currentMonth();

    if (!isValidMonth(month)) {
      return NextResponse.json(
        { error: "Invalid month. Expected YYYY-MM." },
        { status: 400 }
      );
    }

    const thisMonth = monthRange(month);
    const lastMonth = monthRange(previousMonth(month));

    let userId: string;
    let current: Row[];
    let prior: Row[];

    if (isDemoMode()) {
      userId = DEMO_USER.id;
      const inRange = (from: string, toExclusive: string) =>
        listTransactions({}).filter((t) => t.date >= from && t.date < toExclusive);
      current = inRange(thisMonth.start, thisMonth.endExclusive);
      prior = inRange(lastMonth.start, lastMonth.endExclusive);
    } else {
      const supabase = await createClient();

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      userId = user.id;

      const monthQuery = (from: string, toExclusive: string) =>
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", from)
          .lt("date", toExclusive);

      const [currentResult, priorResult] = await Promise.all([
        monthQuery(thisMonth.start, thisMonth.endExclusive),
        monthQuery(lastMonth.start, lastMonth.endExclusive),
      ]);

      if (currentResult.error) throw currentResult.error;
      if (priorResult.error) throw priorResult.error;

      current = (currentResult.data ?? []) as Row[];
      prior = (priorResult.data ?? []) as Row[];
    }

    const derived = deriveInsights({ current, prior, month });
    const now = new Date().toISOString();

    const insights: AIInsight[] = derived
      .filter((i) => !type || i.type === type)
      .map((i, index) => ({
        ...i,
        id: insightId(userId, month, index, i.title),
        user_id: userId,
        dismissed: false,
        created_at: now,
        expires_at: null,
      }));

    return NextResponse.json({
      data: insights,
      total: insights.length,
    });
  } catch (error) {
    console.error("Error deriving insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

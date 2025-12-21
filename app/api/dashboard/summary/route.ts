import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    
    // If no month specified, use current month
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    
    // Fetch transactions for the target month
    const { data: monthTransactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", `${targetMonth}-01`)
      .lte("date", `${targetMonth}-31`);
    
    if (error) {
      throw error;
    }
    
    // Calculate totals
    const totals = (monthTransactions || []).reduce(
      (acc, t) => {
        if (t.type === "income") {
          acc.income += t.amount;
        } else {
          acc.expenses += t.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );
    
    const netSavings = totals.income - totals.expenses;
    const savingsRate = totals.income > 0 
      ? ((netSavings / totals.income) * 100) 
      : 0;
    
    // Calculate category breakdown
    const categoryBreakdown = (monthTransactions || [])
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { amount: 0, count: 0 };
        }
        acc[t.category].amount += t.amount;
        acc[t.category].count += 1;
        return acc;
      }, {} as Record<string, { amount: number; count: number }>);
    
    const topCategories = Object.entries(categoryBreakdown)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totals.expenses > 0 ? (data.amount / totals.expenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // TODO: Calculate month-over-month changes from previous month data
    const monthOverMonth = {
      income_change: 0,
      expense_change: 0,
      savings_change: 0,
    };
    
    return NextResponse.json({
      data: {
        total_income: totals.income,
        total_expenses: totals.expenses,
        net_savings: netSavings,
        savings_rate: savingsRate,
        top_categories: topCategories,
        month_over_month: monthOverMonth,
        transaction_count: monthTransactions?.length || 0,
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

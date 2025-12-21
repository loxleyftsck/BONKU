import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/inflation/historical - Get historical inflation data
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get("months") || "6");
    
    const { data: historicalData, error } = await supabase
      .from("inflation_data")
      .select("*")
      .order("month", { ascending: false })
      .limit(months);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      data: historicalData || [],
      total: historicalData?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching historical inflation:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical inflation data" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/inflation/current - Get current month inflation data
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: currentInflation, error } = await supabase
      .from("inflation_data")
      .select("*")
      .order("month", { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      data: currentInflation,
    });
  } catch (error) {
    console.error("Error fetching current inflation:", error);
    return NextResponse.json(
      { error: "Failed to fetch inflation data" },
      { status: 500 }
    );
  }
}

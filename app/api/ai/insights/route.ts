import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/ai/insights - Get AI insights for user
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const activeOnly = searchParams.get("active_only") === "true";
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Build query
    let query = supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    // Filter by type
    if (type) {
      query = query.eq("type", type);
    }
    
    // Filter active only (not dismissed)
    if (activeOnly) {
      query = query.eq("dismissed", false);
    }
    
    const { data: insights, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      data: insights || [],
      total: insights?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

// POST /api/ai/insights - Generate new insights (placeholder for AI engine)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // TODO: Implement rule-based AI insight engine
    // 1. Fetch user's recent transactions
    // 2. Analyze patterns
    // 3. Generate insights
    // 4. Insert to database
    
    return NextResponse.json({
      message: "AI insight generation not yet implemented",
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}

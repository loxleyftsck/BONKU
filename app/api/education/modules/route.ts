import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/education/modules - List all education modules
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");
    
    // Get specific module by slug
    if (slug) {
      const { data: module, error } = await supabase
        .from("education_modules")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) {
        return NextResponse.json(
          { error: "Module not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ data: module });
    }
    
    // Build query
    let query = supabase
      .from("education_modules")
      .select("*")
      .order("order", { ascending: true });
    
    // Filter by category if specified
    if (category) {
      query = query.eq("category", category);
    }
    
    const { data: modules, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      data: modules || [],
      total: modules?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching education modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch education modules" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo/config";
import { demoState } from "@/lib/demo/store";

// GET /api/education/modules - List all education modules
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");

    if (isDemoMode()) {
      const all = demoState().modules;
      if (slug) {
        const found = all.find((m) => m.slug === slug);
        return found
          ? NextResponse.json({ data: found })
          : NextResponse.json({ error: "Module not found" }, { status: 404 });
      }
      const rows = category ? all.filter((m) => m.category === category) : all;
      return NextResponse.json({ data: rows, total: rows.length });
    }

    const supabase = await createClient();
    
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

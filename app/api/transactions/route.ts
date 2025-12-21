import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/utils/validators";

// GET /api/transactions - List transactions with optional filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const category = searchParams.get("category");
    const type = searchParams.get("type") as "income" | "expense" | null;
    
    // Build query
    let query = supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    
    // Apply filters
    if (dateFrom && dateTo) {
      query = query.gte("date", dateFrom).lte("date", dateTo);
    }
    
    if (type) {
      query = query.eq("type", type);
    }
    
    if (category) {
      query = query.eq("category", category);
    }
    
    const { data: transactions, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      data: transactions || [],
      total: transactions?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // ✅ FIX: Validate input with Zod BEFORE processing
    const validationResult = transactionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    
    // Get current user (requires authentication)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const newTransaction = {
      user_id: user.id,
      ...validatedData,
    };
    
    const { data, error } = await supabase
      .from("transactions")
      .insert([newTransaction])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      data,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" }, // ✅ FIX: Generic error message
      { status: 500 }
    );
  }
}

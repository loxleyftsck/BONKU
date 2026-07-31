import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/utils/validators";
import { parsePagination } from "@/lib/utils/pagination";

// GET /api/transactions - List transactions with optional filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Authenticate. RLS also scopes these rows, but the API must not depend on
    // a single database policy to keep one user's finances from another's.
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const category = searchParams.get("category");
    const type = searchParams.get("type") as "income" | "expense" | null;

    // The list was previously unbounded: a long-running account pulled every
    // row it had ever created and rendered one card each.
    const { page, perPage, from, to } = parsePagination(searchParams);

    // Build query
    let query = supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .range(from, to);

    // Apply each date bound independently — requiring both silently dropped
    // the filter when only one end of the range was supplied.
    if (dateFrom) {
      query = query.gte("date", dateFrom);
    }

    if (dateTo) {
      query = query.lte("date", dateTo);
    }

    if (type) {
      query = query.eq("type", type);
    }
    
    if (category) {
      query = query.eq("category", category);
    }
    
    const { data: transactions, error, count } = await query;

    if (error) {
      throw error;
    }

    const rows = transactions ?? [];
    const total = count ?? rows.length;

    return NextResponse.json({
      data: rows,
      total,
      page,
      per_page: perPage,
      has_more: from + rows.length < total,
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

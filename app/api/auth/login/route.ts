import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/utils/rateLimit";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Keyed by IP, not by the submitted email — see lib/utils/rateLimit.
    const limit = rateLimit(`login:${clientIp(request)}`, 5, 60_000);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan masuk. Coba lagi sebentar lagi." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const supabase = await createClient();

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // ✅ FIX: Generic error message (don't reveal if email exists or password wrong)
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 },
    );
  }
}

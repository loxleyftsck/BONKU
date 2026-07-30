import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/utils/validators";

// Simple in-memory rate limiter (production should use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function rateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 60000,
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ✅ FIX: Rate limiting (5 attempts per minute per email)
    const identifier = body.email || "anonymous";
    if (!rateLimit(identifier, 5, 60000)) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 },
      );
    }

    // ✅ FIX: Validate input with Zod
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { email, password, name } = validationResult.data;

    const supabase = await createClient();

    // Create user account with Supabase Auth.
    // `name` travels in user metadata so the on_auth_user_created trigger
    // (migration 003) can write the profile row with it.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      console.error("Supabase auth error:", error);
      return NextResponse.json(
        { error: "Authentication error occurred" },
        { status: 400 },
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Authentication error occurred" },
        { status: 400 },
      );
    }

    // The profile row is created by the on_auth_user_created trigger
    // (SECURITY DEFINER, migration 003). When signUp returned a session we can
    // read it back under RLS and fail loudly rather than returning success for
    // an account that would be unable to create transactions. With email
    // confirmation enabled there is no session yet, so auth.uid() is null and
    // RLS would hide the row — skip the check instead of reporting a false
    // failure.
    if (data.session) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error("Profile was not created for user", data.user.id, profileError);
        return NextResponse.json(
          { error: "Account setup incomplete. Please contact support." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      message: "Registration successful!",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 },
    );
  }
}

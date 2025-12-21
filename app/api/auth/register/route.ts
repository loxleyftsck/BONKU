import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/utils/validators";

// Simple in-memory rate limiter (production should use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function rateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
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
        { status: 429 }
      );
    }
    
    // ✅ FIX: Validate input with Zod
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    const { email, password, name } = validationResult.data;
    
    const supabase = createClient();

    // Sign up with email and password
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      // ✅ FIX: Generic error message (don't reveal if email exists)
      return NextResponse.json(
        { error: "Registration failed. Please try again." },
        { status: 400 }
      );
    }

    // Create profile in public.profiles table
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: name || null,
          },
        ]);

      if (profileError) {
        console.error("Error creating profile:", profileError);
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
      { status: 500 }
    );
  }
}

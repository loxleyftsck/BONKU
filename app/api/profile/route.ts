import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// GET /api/profile - The signed-in user's profile
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, name, settings")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50).optional(),
  settings: z
    .object({
      currency: z.literal("IDR").optional(),
      theme: z.enum(["light", "dark", "system"]).optional(),
      notifications_enabled: z.boolean().optional(),
      hide_balances: z.boolean().optional(),
    })
    .optional(),
});

// PATCH /api/profile - Update name and/or settings
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Merge settings rather than replacing, so updating one toggle does not
    // silently reset the others.
    const { data: existing } = await supabase
      .from("profiles")
      .select("settings")
      .eq("id", user.id)
      .maybeSingle();

    const update: Record<string, unknown> = {};

    if (parsed.data.name !== undefined) {
      update.name = parsed.data.name;
    }

    if (parsed.data.settings) {
      update.settings = {
        ...(existing?.settings ?? {}),
        ...parsed.data.settings,
      };
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", user.id)
      .select("id, email, name, settings")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

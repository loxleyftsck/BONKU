/**
 * Demo (guest) mode.
 *
 * Lets the app be exercised end to end with no Supabase project and no
 * account, backed by seeded in-memory data.
 *
 * SAFETY: this bypasses authentication, so it is hard-gated to non-production
 * builds. A single env var must never be able to turn a finance app's auth off
 * in production — that is how auth bypasses ship by accident. `NODE_ENV` is
 * fixed at build time by Next, so a production bundle cannot be flipped into
 * demo mode at runtime.
 *
 * If you later want a PUBLIC demo, do not relax this flag. Deploy a separate
 * instance with real Supabase anonymous auth, so demo users are genuine rows
 * subject to RLS rather than an auth bypass.
 */
export function isDemoMode(): boolean {
    return (
        process.env.NEXT_PUBLIC_DEMO_MODE === "true" &&
        process.env.NODE_ENV !== "production"
    );
}

/** Identity used for every demo request. */
export const DEMO_USER = {
    id: "00000000-0000-4000-8000-000000000001",
    email: "tamu@bonku.demo",
    name: "Pengguna Tamu",
} as const;

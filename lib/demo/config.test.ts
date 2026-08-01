import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Demo mode bypasses authentication entirely. The single thing that must never
 * regress is that a production build cannot be talked into enabling it — that
 * is how an auth bypass reaches real users' financial data.
 *
 * The module is re-imported per case because it reads process.env at call time
 * and vi.resetModules clears the cache between them.
 */
async function loadIsDemoMode() {
    vi.resetModules();
    const mod = await import("./config");
    return mod.isDemoMode;
}

const ORIGINAL = { ...process.env };

beforeEach(() => {
    vi.resetModules();
});

afterEach(() => {
    process.env = { ...ORIGINAL };
});

describe("isDemoMode", () => {
    it("is on when explicitly enabled outside production", async () => {
        vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
        vi.stubEnv("NODE_ENV", "development");

        expect((await loadIsDemoMode())()).toBe(true);
        vi.unstubAllEnvs();
    });

    it("is on in test builds when enabled", async () => {
        vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
        vi.stubEnv("NODE_ENV", "test");

        expect((await loadIsDemoMode())()).toBe(true);
        vi.unstubAllEnvs();
    });

    // The one that matters.
    it("is OFF in production even when explicitly enabled", async () => {
        vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
        vi.stubEnv("NODE_ENV", "production");

        expect((await loadIsDemoMode())()).toBe(false);
        vi.unstubAllEnvs();
    });

    it("is off by default", async () => {
        vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "");
        vi.stubEnv("NODE_ENV", "development");

        expect((await loadIsDemoMode())()).toBe(false);
        vi.unstubAllEnvs();
    });

    it.each(["1", "yes", "TRUE", "True", "on", " true "])(
        "requires the exact string \"true\", not %s",
        async (value) => {
            vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", value);
            vi.stubEnv("NODE_ENV", "development");

            expect((await loadIsDemoMode())()).toBe(false);
            vi.unstubAllEnvs();
        },
    );
});

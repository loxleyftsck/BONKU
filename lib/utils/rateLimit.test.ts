import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientIp, rateLimit } from "./rateLimit";

// Keys are namespaced per test so the module-level map does not leak between
// cases without needing a reset hook.
let n = 0;
const key = () => `test-${n++}`;

describe("rateLimit", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("allows up to the limit then blocks", () => {
        const k = key();
        for (let i = 0; i < 5; i++) {
            expect(rateLimit(k, 5, 60_000).allowed).toBe(true);
        }
        expect(rateLimit(k, 5, 60_000).allowed).toBe(false);
    });

    it("reports seconds until the window resets", () => {
        const k = key();
        for (let i = 0; i < 5; i++) rateLimit(k, 5, 60_000);

        vi.advanceTimersByTime(10_000);

        const blocked = rateLimit(k, 5, 60_000);
        expect(blocked.allowed).toBe(false);
        expect(blocked.retryAfter).toBeGreaterThan(0);
        expect(blocked.retryAfter).toBeLessThanOrEqual(50);
    });

    it("allows again once the window has passed", () => {
        const k = key();
        for (let i = 0; i < 5; i++) rateLimit(k, 5, 60_000);
        expect(rateLimit(k, 5, 60_000).allowed).toBe(false);

        vi.advanceTimersByTime(60_001);

        expect(rateLimit(k, 5, 60_000).allowed).toBe(true);
    });

    it("keeps separate keys independent", () => {
        const a = key();
        const b = key();
        for (let i = 0; i < 5; i++) rateLimit(a, 5, 60_000);

        expect(rateLimit(a, 5, 60_000).allowed).toBe(false);
        expect(rateLimit(b, 5, 60_000).allowed).toBe(true);
    });

    /*
     * Regression: the limiter used to be keyed by the submitted email, so
     * rotating the email field bypassed it entirely. Callers now key by IP,
     * which means attempts share a bucket regardless of the payload.
     */
    it("blocks a single key even when callers vary other inputs", () => {
        const ip = key();
        const emails = ["a@x.com", "b@x.com", "c@x.com", "d@x.com", "e@x.com", "f@x.com"];

        const results = emails.map(() => rateLimit(`login:${ip}`, 5, 60_000).allowed);

        expect(results.slice(0, 5).every(Boolean)).toBe(true);
        expect(results[5]).toBe(false);
    });
});

describe("clientIp", () => {
    const req = (headers: Record<string, string>) =>
        new Request("https://example.test/api", { headers });

    it("takes the first entry of x-forwarded-for", () => {
        expect(clientIp(req({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe(
            "203.0.113.9",
        );
    });

    it("trims whitespace", () => {
        expect(clientIp(req({ "x-forwarded-for": "  203.0.113.9 " }))).toBe(
            "203.0.113.9",
        );
    });

    it("falls back to x-real-ip", () => {
        expect(clientIp(req({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
    });

    it("fails closed to a shared bucket when no header is present", () => {
        expect(clientIp(req({}))).toBe("unknown");
    });
});

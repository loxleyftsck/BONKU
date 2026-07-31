import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    createSupabaseMock,
    hasFilter,
    type RecordedCall,
} from "@/lib/test/supabaseMock";

const createClient = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { GET, POST } from "./route";

const url = (qs = "") => `https://bonku.test/api/transactions${qs}`;

beforeEach(() => {
    vi.clearAllMocks();
});

describe("GET /api/transactions", () => {
    /*
     * Regression: this handler previously had no auth check and no user_id
     * filter — a bare select("*"). Only a single RLS policy stood between one
     * user's financial history and another's.
     */
    it("returns 401 for an anonymous caller", async () => {
        createClient.mockResolvedValue(createSupabaseMock({ user: null }));

        const res = await GET(new Request(url()));

        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
    });

    it("returns 401 when auth errors", async () => {
        createClient.mockResolvedValue(
            createSupabaseMock({ user: null, authError: new Error("boom") }),
        );

        const res = await GET(new Request(url()));

        expect(res.status).toBe(401);
    });

    it("scopes the query to the signed-in user", async () => {
        const supabase = createSupabaseMock({ user: { id: "user-42" } });
        createClient.mockResolvedValue(supabase);

        const res = await GET(new Request(url()));

        expect(res.status).toBe(200);
        expect(hasFilter(supabase.callsFor("transactions"), "eq", "user_id", "user-42")).toBe(
            true,
        );
    });

    it("never queries a table other than transactions", async () => {
        const supabase = createSupabaseMock();
        createClient.mockResolvedValue(supabase);

        await GET(new Request(url()));

        expect(supabase.from).toHaveBeenCalledWith("transactions");
        expect(supabase.from).toHaveBeenCalledTimes(1);
    });

    describe("date filters", () => {
        /*
         * Regression: filters were applied only when BOTH ends were supplied,
         * so a one-sided range was silently ignored while the UI displayed it
         * as active.
         */
        const filtersFor = async (qs: string): Promise<RecordedCall[]> => {
            const supabase = createSupabaseMock();
            createClient.mockResolvedValue(supabase);
            await GET(new Request(url(qs)));
            return supabase.callsFor("transactions");
        };

        it("applies date_from on its own", async () => {
            const calls = await filtersFor("?date_from=2026-01-01");
            expect(hasFilter(calls, "gte", "date", "2026-01-01")).toBe(true);
        });

        it("applies date_to on its own", async () => {
            const calls = await filtersFor("?date_to=2026-01-31");
            expect(hasFilter(calls, "lte", "date", "2026-01-31")).toBe(true);
        });

        it("applies both when both are supplied", async () => {
            const calls = await filtersFor(
                "?date_from=2026-01-01&date_to=2026-01-31",
            );
            expect(hasFilter(calls, "gte", "date", "2026-01-01")).toBe(true);
            expect(hasFilter(calls, "lte", "date", "2026-01-31")).toBe(true);
        });

        it("applies neither when neither is supplied", async () => {
            const calls = await filtersFor("");
            expect(hasFilter(calls, "gte", "date")).toBe(false);
            expect(hasFilter(calls, "lte", "date")).toBe(false);
        });
    });

    describe("pagination", () => {
        it("bounds the query with an explicit range", async () => {
            const supabase = createSupabaseMock();
            createClient.mockResolvedValue(supabase);

            await GET(new Request(url()));

            const range = supabase
                .callsFor("transactions")
                .find(([method]) => method === "range");

            expect(range).toBeDefined();
            expect(range?.slice(1)).toEqual([0, 49]);
        });

        it("offsets later pages", async () => {
            const supabase = createSupabaseMock();
            createClient.mockResolvedValue(supabase);

            await GET(new Request(url("?page=3&per_page=10")));

            const range = supabase
                .callsFor("transactions")
                .find(([method]) => method === "range");

            expect(range?.slice(1)).toEqual([20, 29]);
        });

        it("reports has_more from the total count, not the page size", async () => {
            createClient.mockResolvedValue(
                createSupabaseMock({
                    result: { data: [{ id: "t-1" }], error: null, count: 120 },
                }),
            );

            const res = await GET(new Request(url("?page=1")));
            const body = await res.json();

            expect(body.total).toBe(120);
            expect(body.has_more).toBe(true);
        });

        it("reports has_more false on the last page", async () => {
            createClient.mockResolvedValue(
                createSupabaseMock({
                    result: { data: [{ id: "t-1" }], error: null, count: 1 },
                }),
            );

            const res = await GET(new Request(url("?page=1")));
            const body = await res.json();

            expect(body.has_more).toBe(false);
        });
    });

    it("passes through type and category filters", async () => {
        const supabase = createSupabaseMock();
        createClient.mockResolvedValue(supabase);

        await GET(new Request(url("?type=expense&category=food")));

        const calls = supabase.callsFor("transactions");
        expect(hasFilter(calls, "eq", "type", "expense")).toBe(true);
        expect(hasFilter(calls, "eq", "category", "food")).toBe(true);
    });
});

describe("POST /api/transactions", () => {
    const body = (payload: unknown) =>
        new Request(url(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

    const valid = {
        type: "expense",
        amount: 150_000,
        category: "food",
        date: "2020-01-15",
        is_recurring: false,
    };

    it("rejects an invalid payload with 400 before touching auth", async () => {
        const supabase = createSupabaseMock();
        createClient.mockResolvedValue(supabase);

        const res = await POST(body({ ...valid, amount: -1 }));

        expect(res.status).toBe(400);
        expect(supabase.auth.getUser).not.toHaveBeenCalled();
    });

    it("returns 401 for an anonymous caller", async () => {
        createClient.mockResolvedValue(createSupabaseMock({ user: null }));

        const res = await POST(body(valid));

        expect(res.status).toBe(401);
    });

    it("stamps the row with the caller's id, not a client-supplied one", async () => {
        const supabase = createSupabaseMock({
            user: { id: "user-42" },
            result: { data: { id: "t-1" }, error: null },
        });
        createClient.mockResolvedValue(supabase);

        await POST(body({ ...valid, user_id: "someone-else" }));

        const insert = supabase
            .callsFor("transactions")
            .find(([method]) => method === "insert");

        expect(insert).toBeDefined();
        const [, rows] = insert as RecordedCall;
        expect((rows as Array<{ user_id: string }>)[0].user_id).toBe("user-42");
    });
});

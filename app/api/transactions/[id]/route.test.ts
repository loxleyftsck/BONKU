import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseMock, hasFilter } from "@/lib/test/supabaseMock";

const createClient = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { DELETE, GET, PATCH } from "./route";

const ID = "123e4567-e89b-12d3-a456-426614174000";
const url = (id: string) => `https://bonku.test/api/transactions/${id}`;
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

const validBody = {
    type: "expense",
    amount: 150_000,
    category: "food",
    date: "2020-01-15",
    is_recurring: false,
};

const patchRequest = (payload: unknown = validBody) =>
    new Request(url(ID), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

beforeEach(() => {
    vi.clearAllMocks();
});

describe.each([
    ["GET", (id: string) => GET(new Request(url(id)), ctx(id))],
    ["PATCH", (id: string) => PATCH(patchRequest(), ctx(id))],
    ["DELETE", (id: string) => DELETE(new Request(url(id)), ctx(id))],
])("%s /api/transactions/[id]", (_method, call) => {
    it.each(["not-a-uuid", "123", "", "../../etc/passwd"])(
        "rejects a malformed id (%s) with 400",
        async (bad) => {
            createClient.mockResolvedValue(createSupabaseMock());

            const res = await call(bad);

            expect(res.status).toBe(400);
        },
    );

    it("returns 401 for an anonymous caller", async () => {
        createClient.mockResolvedValue(createSupabaseMock({ user: null }));

        const res = await call(ID);

        expect(res.status).toBe(401);
    });

    /*
     * The row must be scoped by user_id as well as id, so a guessed UUID
     * cannot reach another account's data even if RLS were relaxed.
     */
    it("scopes the row to the signed-in user", async () => {
        const supabase = createSupabaseMock({
            user: { id: "user-42" },
            result: { data: { id: ID }, error: null },
        });
        createClient.mockResolvedValue(supabase);

        await call(ID);

        const calls = supabase.callsFor("transactions");
        expect(hasFilter(calls, "eq", "id", ID)).toBe(true);
        expect(hasFilter(calls, "eq", "user_id", "user-42")).toBe(true);
    });

    it("returns 404 when the row does not belong to the caller", async () => {
        createClient.mockResolvedValue(
            createSupabaseMock({
                user: { id: "user-42" },
                result: { data: null, error: null },
            }),
        );

        const res = await call(ID);

        expect(res.status).toBe(404);
    });
});

describe("PATCH validation", () => {
    it("rejects an invalid payload with 400", async () => {
        createClient.mockResolvedValue(createSupabaseMock());

        const res = await PATCH(
            patchRequest({ ...validBody, amount: -1 }),
            ctx(ID),
        );

        expect(res.status).toBe(400);
    });

    it("rejects a future-dated transaction", async () => {
        createClient.mockResolvedValue(createSupabaseMock());

        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);

        const res = await PATCH(
            patchRequest({ ...validBody, date: future.toISOString().slice(0, 10) }),
            ctx(ID),
        );

        expect(res.status).toBe(400);
    });
});

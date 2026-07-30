import { vi } from "vitest";

export type RecordedCall = [method: string, ...args: unknown[]];

export type QueryResult = { data: unknown; error: unknown };

/**
 * A chainable stand-in for the Supabase PostgREST query builder.
 *
 * Every filter method records its arguments and returns the builder, and the
 * builder is thenable so `await query` resolves to the configured result. This
 * lets tests assert on the filters a route applied — which is how the
 * "GET /api/transactions is scoped to the caller" guarantee is verified.
 */
export function createQueryBuilder(result: QueryResult) {
    const calls: RecordedCall[] = [];

    const record =
        (method: string) =>
        (...args: unknown[]) => {
            calls.push([method, ...args]);
            return builder;
        };

    const builder = {
        calls,
        select: record("select"),
        insert: record("insert"),
        update: record("update"),
        delete: record("delete"),
        eq: record("eq"),
        gte: record("gte"),
        lte: record("lte"),
        lt: record("lt"),
        order: record("order"),
        limit: record("limit"),
        single: record("single"),
        maybeSingle: record("maybeSingle"),
        then<TResult1 = QueryResult, TResult2 = never>(
            onFulfilled?:
                | ((value: QueryResult) => TResult1 | PromiseLike<TResult1>)
                | null,
            onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
        ) {
            return Promise.resolve(result).then(onFulfilled, onRejected);
        },
    };

    return builder;
}

export type QueryBuilder = ReturnType<typeof createQueryBuilder>;

type ClientOptions = {
    /** The signed-in user, or null for an anonymous caller. */
    user?: { id: string } | null;
    authError?: unknown;
    /** Result each `from()` query resolves to. */
    result?: QueryResult;
};

export function createSupabaseMock({
    user = { id: "user-1" },
    authError = null,
    result = { data: [], error: null },
}: ClientOptions = {}) {
    const builders: Record<string, QueryBuilder> = {};

    const from = vi.fn((table: string) => {
        builders[table] ??= createQueryBuilder(result);
        return builders[table];
    });

    const client = {
        from,
        auth: {
            getUser: vi.fn(async () => ({
                data: { user },
                error: authError,
            })),
            signOut: vi.fn(async () => ({ error: null })),
        },
        /** Filters recorded against a given table. */
        callsFor: (table: string) => builders[table]?.calls ?? [],
    };

    return client;
}

/** Assert a builder recorded `.eq(column, value)`. */
export function hasFilter(
    calls: RecordedCall[],
    method: string,
    column: string,
    value?: unknown,
) {
    return calls.some(
        ([m, col, val]) =>
            m === method &&
            col === column &&
            (value === undefined || val === value),
    );
}

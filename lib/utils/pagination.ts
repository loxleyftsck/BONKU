export const DEFAULT_PER_PAGE = 50;
export const MAX_PER_PAGE = 100;

export type Pagination = {
    /** 1-based. */
    page: number;
    perPage: number;
    /** Inclusive row offsets, as PostgREST `.range()` expects. */
    from: number;
    to: number;
};

function toPositiveInt(raw: string | null, fallback: number): number {
    if (raw === null) return fallback;

    const parsed = Number(raw);

    if (!Number.isInteger(parsed) || parsed < 1) {
        return fallback;
    }

    return parsed;
}

/**
 * Reads `page` and `per_page` from a query string.
 *
 * Invalid input falls back to the default rather than erroring — a bad page
 * number should not break someone's transaction list. `per_page` is capped so
 * a caller cannot request the entire table in one request.
 */
export function parsePagination(params: URLSearchParams): Pagination {
    const page = toPositiveInt(params.get("page"), 1);
    const perPage = Math.min(
        toPositiveInt(params.get("per_page"), DEFAULT_PER_PAGE),
        MAX_PER_PAGE,
    );

    const from = (page - 1) * perPage;

    return { page, perPage, from, to: from + perPage - 1 };
}

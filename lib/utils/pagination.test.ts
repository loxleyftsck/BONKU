import { describe, expect, it } from "vitest";
import {
    DEFAULT_PER_PAGE,
    MAX_PER_PAGE,
    parsePagination,
} from "./pagination";

const parse = (qs: string) => parsePagination(new URLSearchParams(qs));

describe("parsePagination", () => {
    it("defaults to the first page", () => {
        expect(parse("")).toEqual({
            page: 1,
            perPage: DEFAULT_PER_PAGE,
            from: 0,
            to: DEFAULT_PER_PAGE - 1,
        });
    });

    it("computes inclusive offsets for later pages", () => {
        expect(parse("page=3&per_page=10")).toEqual({
            page: 3,
            perPage: 10,
            from: 20,
            to: 29,
        });
    });

    it("produces contiguous, non-overlapping ranges", () => {
        const first = parse("page=1&per_page=25");
        const second = parse("page=2&per_page=25");

        expect(second.from).toBe(first.to + 1);
    });

    /*
     * The list was previously unbounded, so the cap is the actual protection
     * here — a caller must not be able to request the whole table.
     */
    it("caps per_page", () => {
        expect(parse(`per_page=${MAX_PER_PAGE * 10}`).perPage).toBe(MAX_PER_PAGE);
    });

    it("never returns a window larger than the cap", () => {
        for (const qs of ["per_page=1000", "per_page=101", "page=5&per_page=999"]) {
            const { from, to } = parse(qs);
            expect(to - from + 1).toBeLessThanOrEqual(MAX_PER_PAGE);
        }
    });

    it.each([
        ["page=0", "zero"],
        ["page=-2", "negative"],
        ["page=abc", "non-numeric"],
        ["page=1.5", "fractional"],
        ["page=", "empty"],
    ])("falls back to page 1 for %s (%s)", (qs) => {
        expect(parse(qs).page).toBe(1);
    });

    it.each(["per_page=0", "per_page=-5", "per_page=abc", "per_page=2.5"])(
        "falls back to the default for invalid %s",
        (qs) => {
            expect(parse(qs).perPage).toBe(DEFAULT_PER_PAGE);
        },
    );

    it("never produces a negative offset", () => {
        for (const qs of ["page=0", "page=-99", "page=abc"]) {
            expect(parse(qs).from).toBeGreaterThanOrEqual(0);
        }
    });
});

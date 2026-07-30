import { describe, expect, it } from "vitest";
import { currentMonth, isValidMonth, monthRange } from "./date";

describe("monthRange", () => {
    // The original bug: the upper bound was built as `${month}-31`, so any
    // month shorter than 31 days produced a literal Postgres rejects.
    it.each([
        ["2026-01", "2026-01-01", "2026-02-01"],
        ["2026-02", "2026-02-01", "2026-03-01"], // 28 days
        ["2024-02", "2024-02-01", "2024-03-01"], // leap year, 29 days
        ["2026-04", "2026-04-01", "2026-05-01"], // 30 days
        ["2026-06", "2026-06-01", "2026-07-01"],
        ["2026-09", "2026-09-01", "2026-10-01"],
        ["2026-11", "2026-11-01", "2026-12-01"],
    ])("covers %s without producing an invalid date", (month, start, end) => {
        expect(monthRange(month)).toEqual({ start, endExclusive: end });
    });

    it("rolls over the year in December", () => {
        expect(monthRange("2026-12")).toEqual({
            start: "2026-12-01",
            endExclusive: "2027-01-01",
        });
    });

    it("never emits a day-of-month above 28 as a bound", () => {
        for (let m = 1; m <= 12; m++) {
            const month = `2026-${String(m).padStart(2, "0")}`;
            const { start, endExclusive } = monthRange(month);
            expect(start.slice(8)).toBe("01");
            expect(endExclusive.slice(8)).toBe("01");
        }
    });

    it("produces bounds that Date can parse", () => {
        for (let m = 1; m <= 12; m++) {
            const month = `2026-${String(m).padStart(2, "0")}`;
            const { endExclusive } = monthRange(month);
            expect(Number.isNaN(new Date(endExclusive).getTime())).toBe(false);
        }
    });

    it.each(["bogus", "2026-13", "2026-00", "2026", "2026-1", ""])(
        "rejects %s",
        (bad) => {
            expect(() => monthRange(bad)).toThrow(RangeError);
        },
    );
});

describe("isValidMonth", () => {
    it("accepts well-formed months", () => {
        expect(isValidMonth("2026-01")).toBe(true);
        expect(isValidMonth("2026-12")).toBe(true);
    });

    it("rejects out-of-range and malformed months", () => {
        expect(isValidMonth("2026-13")).toBe(false);
        expect(isValidMonth("2026-00")).toBe(false);
        expect(isValidMonth("2026-1")).toBe(false);
        expect(isValidMonth("not-a-month")).toBe(false);
    });
});

describe("currentMonth", () => {
    it("formats as YYYY-MM", () => {
        expect(currentMonth(new Date("2026-02-15T00:00:00Z"))).toBe("2026-02");
    });

    it("always returns a month monthRange accepts", () => {
        expect(() => monthRange(currentMonth())).not.toThrow();
    });
});

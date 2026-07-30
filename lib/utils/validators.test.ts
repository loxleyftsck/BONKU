import { describe, expect, it } from "vitest";
import { registerSchema, transactionSchema } from "./validators";

const validTransaction = {
    type: "expense" as const,
    amount: 150_000,
    category: "food",
    date: "2020-01-15",
    is_recurring: false,
};

describe("transactionSchema", () => {
    it("accepts a well-formed expense", () => {
        expect(transactionSchema.safeParse(validTransaction).success).toBe(true);
    });

    describe("amount", () => {
        it.each([
            ["zero", 0],
            ["negative", -5000],
            ["below the Rp 100 floor", 50],
            ["above the overflow ceiling", 1_000_000_000],
            ["fractional", 1500.5],
        ])("rejects %s", (_label, amount) => {
            const result = transactionSchema.safeParse({ ...validTransaction, amount });
            expect(result.success).toBe(false);
        });

        it("accepts the boundary values", () => {
            expect(
                transactionSchema.safeParse({ ...validTransaction, amount: 100 }).success,
            ).toBe(true);
            expect(
                transactionSchema.safeParse({ ...validTransaction, amount: 999_999_999 })
                    .success,
            ).toBe(true);
        });
    });

    describe("date", () => {
        it("rejects future dates", () => {
            const future = new Date();
            future.setFullYear(future.getFullYear() + 1);
            const date = future.toISOString().slice(0, 10);

            expect(
                transactionSchema.safeParse({ ...validTransaction, date }).success,
            ).toBe(false);
        });

        it("accepts today", () => {
            const today = new Date().toISOString().slice(0, 10);
            expect(
                transactionSchema.safeParse({ ...validTransaction, date: today }).success,
            ).toBe(true);
        });

        it.each(["15-01-2026", "2026/01/15", "2026-1-5", "yesterday", ""])(
            "rejects malformed date %s",
            (date) => {
                expect(
                    transactionSchema.safeParse({ ...validTransaction, date }).success,
                ).toBe(false);
            },
        );
    });

    it("requires a category", () => {
        expect(
            transactionSchema.safeParse({ ...validTransaction, category: "" }).success,
        ).toBe(false);
    });

    it("rejects an unknown behavior tag", () => {
        expect(
            transactionSchema.safeParse({ ...validTransaction, behavior_tag: "random" })
                .success,
        ).toBe(false);
    });

    it("caps description length", () => {
        expect(
            transactionSchema.safeParse({
                ...validTransaction,
                description: "x".repeat(501),
            }).success,
        ).toBe(false);
    });

    it("rejects an unknown transaction type", () => {
        expect(
            transactionSchema.safeParse({ ...validTransaction, type: "transfer" }).success,
        ).toBe(false);
    });
});

describe("registerSchema", () => {
    const valid = {
        name: "Sari",
        email: "sari@example.com",
        password: "Password1",
    };

    it("accepts a valid registration", () => {
        expect(registerSchema.safeParse(valid).success).toBe(true);
    });

    it.each([
        ["too short", "Pass1"],
        ["no uppercase", "password1"],
        ["no lowercase", "PASSWORD1"],
        ["no digit", "PasswordOnly"],
    ])("rejects a password that is %s", (_label, password) => {
        expect(registerSchema.safeParse({ ...valid, password }).success).toBe(false);
    });

    it("rejects a malformed email", () => {
        expect(
            registerSchema.safeParse({ ...valid, email: "not-an-email" }).success,
        ).toBe(false);
    });

    it("requires a name of at least two characters", () => {
        expect(registerSchema.safeParse({ ...valid, name: "S" }).success).toBe(false);
    });
});

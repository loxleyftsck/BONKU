// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "./ErrorState";

/*
 * The original failure mode: a failed fetch rendered the empty state, so
 * "Belum ada transaksi" was shown when the server was down. In a finance app
 * an outage was indistinguishable from data loss. These assertions pin the
 * distinction.
 */
describe("ErrorState", () => {
    it("announces itself to assistive technology", () => {
        render(<ErrorState subject="transaksi" />);

        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("names what failed", () => {
        render(<ErrorState subject="transaksi" />);

        expect(screen.getByText(/gagal memuat transaksi/i)).toBeInTheDocument();
    });

    it("reassures that data is not lost", () => {
        render(<ErrorState subject="transaksi" />);

        expect(screen.getByText(/datamu aman/i)).toBeInTheDocument();
    });

    it("never reads as an empty state", () => {
        render(<ErrorState subject="transaksi" />);

        expect(screen.queryByText(/belum ada/i)).not.toBeInTheDocument();
    });

    it("offers a retry when a handler is supplied", async () => {
        const onRetry = vi.fn();
        render(<ErrorState subject="transaksi" onRetry={onRetry} />);

        await userEvent.click(screen.getByRole("button", { name: /coba lagi/i }));

        expect(onRetry).toHaveBeenCalledOnce();
    });

    it("omits the retry button when no handler is supplied", () => {
        render(<ErrorState subject="transaksi" />);

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});

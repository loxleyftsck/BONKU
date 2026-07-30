import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@/types/models";
import { CreateTransactionRequest, TransactionListParams } from "@/types/api";

// Fetch transactions list
export function useTransactions(params?: TransactionListParams) {
    return useQuery({
        queryKey: ["transactions", params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params?.date_from) searchParams.set("date_from", params.date_from);
            if (params?.date_to) searchParams.set("date_to", params.date_to);
            if (params?.category) searchParams.set("category", params.category);
            if (params?.type) searchParams.set("type", params.type);

            const res = await fetch(`/api/transactions?${searchParams}`);
            if (!res.ok) throw new Error("Failed to fetch transactions");
            const data = await res.json();
            return data.data as Transaction[];
        },
    });
}

// Create transaction
export function useCreateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transaction: CreateTransactionRequest) => {
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transaction),
            });

            if (!res.ok) {
                // Surface the server's reason so the form can show something
                // more useful than a generic failure.
                const body = await res.json().catch(() => null);
                throw new Error(body?.error || "Gagal menyimpan transaksi");
            }

            return res.json();
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
        },
    });
}

// Fetch a single transaction (used by the edit screen)
export function useTransaction(id: string | undefined) {
    return useQuery({
        queryKey: ["transaction", id],
        enabled: Boolean(id),
        queryFn: async () => {
            const res = await fetch(`/api/transactions/${id}`);
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error || "Gagal memuat transaksi");
            }
            const body = await res.json();
            return body.data as Transaction;
        },
    });
}

// Update transaction
export function useUpdateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ...transaction
        }: CreateTransactionRequest & { id: string }) => {
            const res = await fetch(`/api/transactions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transaction),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error || "Gagal memperbarui transaksi");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["transaction"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
        },
    });
}

// Delete transaction
export function useDeleteTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error || "Gagal menghapus transaksi");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
        },
    });
}

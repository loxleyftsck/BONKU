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
            if (!res.ok) throw new Error("Failed to create transaction");
            return res.json();
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
        },
    });
}

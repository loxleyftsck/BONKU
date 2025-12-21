import { useQuery } from "@tanstack/react-query";
import { MonthlySummary } from "@/types/models";

export function useDashboardSummary(month?: string) {
    return useQuery({
        queryKey: ["dashboard-summary", month],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (month) searchParams.set("month", month);

            const res = await fetch(`/api/dashboard/summary?${searchParams}`);
            if (!res.ok) throw new Error("Failed to fetch dashboard summary");
            const data = await res.json();
            return data.data as MonthlySummary;
        },
    });
}

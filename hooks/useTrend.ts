import { useQuery } from "@tanstack/react-query";
import type { MonthPoint } from "@/lib/utils/trend";

export function useTrend(months = 12) {
    return useQuery({
        queryKey: ["dashboard-trend", months],
        queryFn: async () => {
            const res = await fetch(`/api/dashboard/trend?months=${months}`);
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error || "Gagal memuat grafik");
            }
            const body = await res.json();
            return body.data as MonthPoint[];
        },
    });
}
